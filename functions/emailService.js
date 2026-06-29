/**
 * ARC LABS — Invoice Email Service
 *
 * Sends GST invoice PDF as email attachment to customers
 * after successful Razorpay payment.
 *
 * Uses Nodemailer with SMTP (Gmail App Password or any SMTP provider).
 *
 * Configure via Firebase Functions config:
 *   firebase functions:config:set email.host="smtp.gmail.com" email.port="587"
 *     email.user="hello@arclabs.in" email.pass="your-app-password"
 */

const nodemailer = require("nodemailer");

/**
 * Send invoice email with PDF attachment
 *
 * @param {Object} opts
 * @param {string} opts.to              Recipient email
 * @param {string} opts.customerName    Customer name
 * @param {string} opts.invoiceNumber   Invoice number (e.g., ARCLABS/2025-26/0001)
 * @param {number} opts.amount          Total amount paid
 * @param {string} opts.productName     Product/service purchased
 * @param {Buffer} opts.pdfBuffer       Invoice PDF as Buffer
 * @param {Object} opts.emailConfig     { host, port, user, pass }
 */
async function sendInvoiceEmail(opts) {
  const { to, customerName, invoiceNumber, amount, productName, pdfBuffer, emailConfig } = opts;

  if (!emailConfig?.user || !emailConfig?.pass) {
    throw new Error("Email not configured. Set firebase functions:config email.user and email.pass");
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host || "smtp.gmail.com",
    port: parseInt(emailConfig.port) || 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });

  const formattedAmount = Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const safeInvoiceFilename = `Invoice_${invoiceNumber.replace(/\//g, "_")}.pdf`;

  const mailOptions = {
    from: `"ARC LABS" <${emailConfig.user}>`,
    to,
    subject: `Payment Confirmation & Invoice ${invoiceNumber} — ARC LABS`,
    html: buildEmailHtml({
      customerName,
      invoiceNumber,
      amount: formattedAmount,
      productName,
    }),
    text: buildEmailText({
      customerName,
      invoiceNumber,
      amount: formattedAmount,
      productName,
    }),
    attachments: [
      {
        filename: safeInvoiceFilename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Invoice email sent to ${to}: ${info.messageId}`);
  return info;
}

/**
 * Build HTML email body
 */
function buildEmailHtml({ customerName, invoiceNumber, amount, productName }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff;">

    <!-- Header -->
    <tr>
      <td style="background:#09090b; padding:28px 32px; text-align:center;">
        <h1 style="margin:0; color:#00d4aa; font-size:22px; font-weight:800; letter-spacing:-0.02em;">
          ARC LABS
        </h1>
        <p style="margin:4px 0 0; color:#71717a; font-size:11px; letter-spacing:0.08em; text-transform:uppercase;">
          AI, IoT & Robotics Labs for Education
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:18px; font-weight:700;">
          Payment Confirmed
        </h2>
        <p style="margin:0 0 20px; color:#52525b; font-size:14px; line-height:1.6;">
          Hi ${customerName || "there"},<br><br>
          Thank you for your purchase. Your payment of
          <strong style="color:#00d4aa;">INR ${amount}</strong>
          has been received successfully.
        </p>

        <!-- Order Summary Card -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:24px;">
          <tr>
            <td style="padding:20px;">
              <p style="margin:0 0 12px; color:#71717a; font-size:11px; text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">
                Order Summary
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0; color:#52525b; font-size:13px;">Product</td>
                  <td style="padding:4px 0; color:#1a1a1a; font-size:13px; text-align:right; font-weight:600;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#52525b; font-size:13px;">Invoice No.</td>
                  <td style="padding:4px 0; color:#1a1a1a; font-size:13px; text-align:right; font-family:sans-serif;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#52525b; font-size:13px;">Amount Paid</td>
                  <td style="padding:4px 0; color:#00d4aa; font-size:15px; text-align:right; font-weight:700;">INR ${amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 20px; color:#52525b; font-size:13px; line-height:1.6;">
          Your GST-compliant tax invoice is attached as a PDF. Please keep it for your records.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:#00d4aa; border-radius:6px; padding:12px 28px;">
              <a href="https://arclabs.in/products"
                 style="color:#09090b; text-decoration:none; font-size:13px; font-weight:700;">
                Browse More Products
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#09090b; padding:24px 32px; text-align:center;">
        <p style="margin:0 0 6px; color:#a1a1aa; font-size:11px;">
          ARC LABS | 4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad 500007
        </p>
        <p style="margin:0; color:#71717a; font-size:10px;">
          hello@arclabs.in | +91-7815809412
        </p>
        <p style="margin:8px 0 0; color:#52525b; font-size:9px;">
          This is an automated email. Please do not reply directly.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

/**
 * Build plain-text email fallback
 */
function buildEmailText({ customerName, invoiceNumber, amount, productName }) {
  return `
ARC LABS — Payment Confirmed

Hi ${customerName || "there"},

Thank you for your purchase. Your payment of INR ${amount} has been received successfully.

Order Summary:
  Product:    ${productName}
  Invoice:    ${invoiceNumber}
  Amount:     INR ${amount}

Your GST-compliant tax invoice is attached as a PDF.

---
ARC LABS
4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad 500007
hello@arclabs.in | +91-7815809412
`.trim();
}

module.exports = { sendInvoiceEmail };
