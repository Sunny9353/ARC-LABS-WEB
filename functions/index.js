/**
 * ARC LABS — Firebase Cloud Functions
 *
 * Endpoints:
 *   POST /razorpayWebhook  — Razorpay payment.captured webhook
 *   GET  /invoice/:orderId  — Download invoice PDF
 *
 * Firestore collections:
 *   orders/      — payment + customer data from Razorpay
 *   invoices/    — GST invoice metadata, linked to order
 *   counters/    — sequential invoice numbering
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

const { generateInvoicePdf } = require("./invoiceGenerator");
const { sendInvoiceEmail } = require("./emailService");
const PROGRAM_LEAD_EMAIL = "techarclabs@gmail.com";

exports.programCurriculumLeadEmail = functions.firestore
  .document("programCurriculumLeads/{leadId}")
  .onCreate(async (snap, context) => {
    const lead = snap.data() || {};
    const config = functions.config();
    const emailConfig = config.email || {};

    if (!emailConfig.user || !emailConfig.pass) {
      console.warn("Program lead email skipped: email.user/email.pass not configured");
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host || "smtp.gmail.com",
      port: parseInt(emailConfig.port, 10) || 587,
      secure: false,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    const lines = [
      "New program curriculum download lead",
      "",
      `Lead ID: ${context.params.leadId}`,
      `Name: ${lead.name || "N/A"}`,
      `Phone: ${lead.phone || "N/A"}`,
      `Email: ${lead.email || "N/A"}`,
      `Organization: ${lead.org || "N/A"}`,
      `Role: ${lead.role || "N/A"}`,
      `City: ${lead.city || "N/A"}`,
      `Program: ${lead.programName || "N/A"} (${lead.programAbbr || "N/A"})`,
      `Duration: ${lead.duration || "N/A"}-Day ${lead.durationLabel || ""}`.trim(),
      `Workshop: ${lead.workshopTitle || "N/A"}`,
      `Total Hours: ${lead.totalHours || "N/A"}`,
      `Message: ${lead.message || "N/A"}`,
      `Created At: ${lead.createdAt || "N/A"}`,
    ];

    await transporter.sendMail({
      from: `"ARC LABS Website" <${emailConfig.user}>`,
      to: PROGRAM_LEAD_EMAIL,
      replyTo: lead.email || emailConfig.user,
      subject: `Program curriculum lead - ${lead.programName || "ARC LABS"}`,
      text: lines.join("\n"),
    });

    console.log(`Program curriculum lead emailed to ${PROGRAM_LEAD_EMAIL}: ${context.params.leadId}`);
    return null;
  });

/* ────────────────────────────────────────────────────────
   CONFIGURATION — set via:
   firebase functions:config:set
     razorpay.webhook_secret="whsec_..."
     razorpay.key_id="rzp_live_..."
     email.host="smtp.gmail.com"
     email.port="587"
     email.user="hello@arclabs.in"
     email.pass="app-password-here"
     company.gstin="36XXXXXXXXXXXZX"
     company.pan="XXXXX0000X"
     company.state_code="36"
──────────────────────────────────────────────────────── */

/**
 * Verify Razorpay webhook signature (HMAC SHA256)
 */
function verifyWebhookSignature(body, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Generate next sequential invoice number: ARCLABS/FY/NNNN
 * Uses Firestore transaction for atomicity.
 */
async function getNextInvoiceNumber() {
  const counterRef = db.collection("counters").doc("invoices");

  const invoiceNum = await db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    let current = 0;
    let fy = getCurrentFY();

    if (snap.exists) {
      const data = snap.data();
      // Reset counter if new financial year
      if (data.fy === fy) {
        current = data.seq || 0;
      }
    }

    const next = current + 1;
    tx.set(counterRef, { seq: next, fy, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return next;
  });

  const fy = getCurrentFY();
  const padded = String(invoiceNum).padStart(4, "0");
  return `ARCLABS/${fy}/${padded}`;
}

/**
 * Get Indian financial year string: "2025-26"
 */
function getCurrentFY() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(2)}`;
  }
  return `${year - 1}-${String(year).slice(2)}`;
}

/**
 * Determine tax split: CGST+SGST (intra-state) or IGST (inter-state)
 * Based on buyer state vs ARC LABS state (Telangana = 36)
 */
function calculateGST(amount, buyerStateCode, companyStateCode) {
  const taxableAmount = amount; // Price is inclusive or exclusive depends on your model
  const gstRate = 0.18; // 18% GST for education services (SAC 999293)
  const taxAmount = Math.round(taxableAmount * gstRate * 100) / 100;

  if (buyerStateCode === companyStateCode) {
    // Intra-state: CGST 9% + SGST 9%
    return {
      type: "intra",
      cgst: Math.round(taxAmount / 2 * 100) / 100,
      sgst: Math.round(taxAmount / 2 * 100) / 100,
      igst: 0,
      totalTax: taxAmount,
      taxableAmount,
      totalWithTax: Math.round((taxableAmount + taxAmount) * 100) / 100,
    };
  }
  // Inter-state: IGST 18%
  return {
    type: "inter",
    cgst: 0,
    sgst: 0,
    igst: taxAmount,
    totalTax: taxAmount,
    taxableAmount,
    totalWithTax: Math.round((taxableAmount + taxAmount) * 100) / 100,
  };
}

/* ════════════════════════════════════════════════════════
   ENDPOINT: Razorpay Webhook
════════════════════════════════════════════════════════ */
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const config = functions.config();
  const webhookSecret = config.razorpay?.webhook_secret;
  if (!webhookSecret) {
    console.error("Missing razorpay.webhook_secret in config");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // Verify signature
  const signature = req.headers["x-razorpay-signature"];
  if (!signature) {
    return res.status(400).json({ error: "Missing signature" });
  }

  const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body);

  try {
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.warn("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Signature verification error:", err.message);
    return res.status(401).json({ error: "Signature verification failed" });
  }

  const event = req.body;
  const eventType = event.event;

  // We only process payment.captured
  if (eventType !== "payment.captured") {
    return res.status(200).json({ status: "ignored", event: eventType });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment) {
    return res.status(400).json({ error: "No payment entity in payload" });
  }

  const paymentId = payment.id;
  const notes = payment.notes || {};

  try {
    // Idempotency: check if order already processed
    const existingOrder = await db.collection("orders").doc(paymentId).get();
    if (existingOrder.exists) {
      console.log(`Order ${paymentId} already processed, skipping`);
      return res.status(200).json({ status: "already_processed" });
    }

    // Build order document
    const amountInRupees = payment.amount / 100;
    const companyStateCode = config.company?.state_code || "36";

    // Try to determine buyer state from notes or default
    const buyerStateCode = notes.customer_state_code || companyStateCode;

    const gst = calculateGST(amountInRupees, buyerStateCode, companyStateCode);
    const invoiceNumber = await getNextInvoiceNumber();

    const order = {
      paymentId,
      razorpayOrderId: payment.order_id || null,
      invoiceNumber,
      status: "paid",
      amount: amountInRupees,
      currency: payment.currency || "INR",
      method: payment.method,

      // Customer
      customer: {
        name: notes.customer_name || payment.email || "Customer",
        email: notes.customer_email || payment.email,
        phone: notes.customer_phone || payment.contact,
        city: notes.customer_city || "",
        stateCode: buyerStateCode,
      },

      // Product
      product: {
        id: notes.product_id || "unknown",
        name: notes.product_name || `Purchase (${paymentId})`,
        hsn: "9992",           // SAC for education services
        sacCode: "999293",     // Other education and training services
      },

      // GST
      gst,

      // Timestamps
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),

      // Invoice
      invoiceGenerated: false,
      invoiceEmailSent: false,
    };

    // Save order
    await db.collection("orders").doc(paymentId).set(order);

    // Generate invoice PDF and store in Firebase Storage
    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date().toISOString().split("T")[0],
      customer: order.customer,
      product: order.product,
      amount: order.amount,
      gst: order.gst,
      paymentId,
      paymentMethod: order.method,
      company: {
        name: "ARC LABS",
        address: "4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad, Telangana 500007",
        gstin: config.company?.gstin || "NOT_CONFIGURED",
        pan: config.company?.pan || "NOT_CONFIGURED",
        stateCode: companyStateCode,
        email: "hello@arclabs.in",
        phone: "+91-7815809412",
      },
    };

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePdf(invoiceData);

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const pdfPath = `invoices/${invoiceNumber.replace(/\//g, "_")}.pdf`;
    const file = bucket.file(pdfPath);
    await file.save(pdfBuffer, {
      metadata: { contentType: "application/pdf" },
    });

    // Get signed URL (valid 7 days)
    const [downloadUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Update order with invoice info
    await db.collection("orders").doc(paymentId).update({
      invoiceGenerated: true,
      invoicePath: pdfPath,
      invoiceUrl: downloadUrl,
    });

    // Save invoice metadata
    await db.collection("invoices").doc(invoiceNumber.replace(/\//g, "_")).set({
      invoiceNumber,
      orderId: paymentId,
      ...invoiceData,
      pdfPath,
      downloadUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email
    if (order.customer.email) {
      try {
        await sendInvoiceEmail({
          to: order.customer.email,
          customerName: order.customer.name,
          invoiceNumber,
          amount: order.amount,
          productName: order.product.name,
          pdfBuffer,
          emailConfig: config.email,
        });

        await db.collection("orders").doc(paymentId).update({
          invoiceEmailSent: true,
          invoiceEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
        // Don't fail the webhook — email can be retried
      }
    }

    console.log(`Order ${paymentId} processed. Invoice: ${invoiceNumber}`);
    return res.status(200).json({
      status: "success",
      paymentId,
      invoiceNumber,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

/* ════════════════════════════════════════════════════════
   ENDPOINT: Download Invoice PDF
════════════════════════════════════════════════════════ */
exports.downloadInvoice = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const orderId = req.query.orderId || req.path.split("/").pop();
    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    try {
      const orderSnap = await db.collection("orders").doc(orderId).get();
      if (!orderSnap.exists) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orderSnap.data();
      if (!order.invoicePath) {
        return res.status(404).json({ error: "Invoice not generated yet" });
      }

      const bucket = admin.storage().bucket();
      const file = bucket.file(order.invoicePath);
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: "Invoice file not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Invoice_${order.invoiceNumber.replace(/\//g, "_")}.pdf"`
      );

      file.createReadStream().pipe(res);
    } catch (err) {
      console.error("Download error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
  });
});
