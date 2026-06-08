/**
 * ARC LABS — GST-Compliant Invoice PDF Generator
 *
 * Generates a professional tax invoice compliant with Indian GST rules:
 *   - Sequential invoice number (ARCLABS/FY/NNNN)
 *   - Seller GSTIN, PAN, address
 *   - Buyer details
 *   - HSN/SAC code
 *   - CGST/SGST (intra-state) or IGST (inter-state) breakup
 *   - Amount in words
 *   - Place of supply
 *
 * Uses PDFKit for PDF generation — no external APIs needed.
 */

const PDFDocument = require("pdfkit");

/**
 * Convert number to Indian currency words
 */
function amountInWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero Rupees Only";

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  function toWords(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + toWords(n % 100) : "");
    if (n < 100000) return toWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + toWords(n % 100000) : "");
    return toWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + toWords(n % 10000000) : "");
  }

  let result = "Rupees " + toWords(rupees);
  if (paise > 0) {
    result += " and " + toWords(paise) + " Paise";
  }
  return result + " Only";
}

/**
 * Get state name from state code
 */
function getStateName(code) {
  const states = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
    "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
    "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
    "35": "Andaman & Nicobar", "36": "Telangana", "37": "Andhra Pradesh (New)",
    "38": "Ladakh",
  };
  return states[code] || "Unknown";
}

/**
 * Draw a horizontal line
 */
function drawLine(doc, y, opts = {}) {
  const left = opts.left || 40;
  const right = opts.right || 555;
  doc.strokeColor(opts.color || "#d0d0d0")
    .lineWidth(opts.width || 0.5)
    .moveTo(left, y)
    .lineTo(right, y)
    .stroke();
}

/**
 * Generate the invoice PDF as a Buffer
 *
 * @param {Object} data
 * @param {string} data.invoiceNumber
 * @param {string} data.invoiceDate
 * @param {Object} data.customer { name, email, phone, city, stateCode }
 * @param {Object} data.product  { id, name, hsn, sacCode }
 * @param {number} data.amount
 * @param {Object} data.gst { type, cgst, sgst, igst, totalTax, taxableAmount, totalWithTax }
 * @param {string} data.paymentId
 * @param {string} data.paymentMethod
 * @param {Object} data.company { name, address, gstin, pan, stateCode, email, phone }
 * @returns {Promise<Buffer>}
 */
async function generateInvoicePdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = 595.28;
    const contentWidth = pageWidth - 80; // 40px margins each side
    const leftCol = 40;
    const rightCol = 320;

    // ─── HEADER ───────────────────────────────────────
    // Company name
    doc.font("Helvetica-Bold").fontSize(20).fillColor("#00d4aa")
      .text("ARC LABS", leftCol, 40);

    doc.font("Helvetica").fontSize(8).fillColor("#666")
      .text("AI, IoT & Robotics Labs for Education", leftCol, 63);

    // TAX INVOICE label
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#1a1a1a")
      .text("TAX INVOICE", 0, 42, { align: "right", width: pageWidth - 40 });

    doc.font("Helvetica").fontSize(8).fillColor("#666")
      .text("(Original for Recipient)", 0, 60, { align: "right", width: pageWidth - 40 });

    drawLine(doc, 80, { color: "#00d4aa", width: 1.5 });

    // ─── INVOICE DETAILS ──────────────────────────────
    let y = 92;

    // Left: Invoice info
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("Invoice No:", leftCol, y);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text(data.invoiceNumber, leftCol + 60, y);

    y += 14;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("Invoice Date:", leftCol, y);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text(data.invoiceDate, leftCol + 60, y);

    y += 14;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("Payment ID:", leftCol, y);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text(data.paymentId, leftCol + 60, y);

    y += 14;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("Payment Mode:", leftCol, y);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text((data.paymentMethod || "Online").toUpperCase(), leftCol + 70, y);

    // Right: Place of supply
    let ry = 92;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("Place of Supply:", rightCol, ry);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text(`${data.customer.stateCode} - ${getStateName(data.customer.stateCode)}`, rightCol + 80, ry);

    ry += 14;
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("State Code:", rightCol, ry);
    doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
      .text(data.customer.stateCode, rightCol + 80, ry);

    y = Math.max(y, ry) + 20;
    drawLine(doc, y);
    y += 10;

    // ─── SELLER / BUYER ───────────────────────────────
    // Seller (left)
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#00d4aa")
      .text("SELLER DETAILS", leftCol, y);
    y += 14;

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1a1a1a")
      .text(data.company.name, leftCol, y);
    y += 12;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(data.company.address, leftCol, y, { width: 240 });
    y += 22;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`GSTIN: ${data.company.gstin}`, leftCol, y);
    y += 11;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`PAN: ${data.company.pan}`, leftCol, y);
    y += 11;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`State: ${data.company.stateCode} - ${getStateName(data.company.stateCode)}`, leftCol, y);

    // Buyer (right, same starting y)
    let by = y - 14 - 12 - 22 - 11 - 11;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#00d4aa")
      .text("BUYER DETAILS", rightCol, by - 14);
    by += 0;

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1a1a1a")
      .text(data.customer.name, rightCol, by);
    by += 12;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`City: ${data.customer.city || "N/A"}`, rightCol, by);
    by += 11;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`State: ${data.customer.stateCode} - ${getStateName(data.customer.stateCode)}`, rightCol, by);
    by += 11;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`Email: ${data.customer.email || "N/A"}`, rightCol, by);
    by += 11;
    doc.font("Helvetica").fontSize(7.5).fillColor("#444")
      .text(`Phone: ${data.customer.phone || "N/A"}`, rightCol, by);

    y += 20;
    drawLine(doc, y);
    y += 10;

    // ─── ITEM TABLE ───────────────────────────────────
    // Table header
    const cols = {
      sno: { x: leftCol, w: 30, label: "S.No" },
      desc: { x: leftCol + 35, w: 200, label: "Description" },
      sac: { x: leftCol + 240, w: 60, label: "SAC Code" },
      qty: { x: leftCol + 305, w: 30, label: "Qty" },
      rate: { x: leftCol + 340, w: 75, label: "Rate (INR)" },
      amount: { x: leftCol + 420, w: 95, label: "Amount (INR)" },
    };

    // Header bg
    doc.rect(leftCol, y, contentWidth, 18).fill("#f5f5f5");

    doc.font("Helvetica-Bold").fontSize(7).fillColor("#333");
    Object.values(cols).forEach((col) => {
      doc.text(col.label, col.x + 3, y + 5, { width: col.w - 6 });
    });

    y += 22;

    // Item row
    doc.font("Helvetica").fontSize(7.5).fillColor("#1a1a1a");
    doc.text("1", cols.sno.x + 3, y, { width: cols.sno.w });
    doc.text(data.product.name, cols.desc.x + 3, y, { width: cols.desc.w - 6 });
    doc.text(data.product.sacCode || data.product.hsn, cols.sac.x + 3, y, { width: cols.sac.w });
    doc.text("1", cols.qty.x + 3, y, { width: cols.qty.w });
    doc.text(formatCurrency(data.gst.taxableAmount), cols.rate.x + 3, y, { width: cols.rate.w });
    doc.text(formatCurrency(data.gst.taxableAmount), cols.amount.x + 3, y, { width: cols.amount.w });

    y += 20;
    drawLine(doc, y);
    y += 10;

    // ─── TAX BREAKUP ──────────────────────────────────
    const taxStartX = 340;
    const valX = 460;

    doc.font("Helvetica").fontSize(8).fillColor("#444")
      .text("Taxable Amount:", taxStartX, y);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1a1a1a")
      .text(formatCurrency(data.gst.taxableAmount), valX, y, { width: 95, align: "right" });
    y += 14;

    if (data.gst.type === "intra") {
      doc.font("Helvetica").fontSize(8).fillColor("#444")
        .text("CGST @ 9%:", taxStartX, y);
      doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
        .text(formatCurrency(data.gst.cgst), valX, y, { width: 95, align: "right" });
      y += 13;

      doc.font("Helvetica").fontSize(8).fillColor("#444")
        .text("SGST @ 9%:", taxStartX, y);
      doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
        .text(formatCurrency(data.gst.sgst), valX, y, { width: 95, align: "right" });
      y += 13;
    } else {
      doc.font("Helvetica").fontSize(8).fillColor("#444")
        .text("IGST @ 18%:", taxStartX, y);
      doc.font("Helvetica").fontSize(8).fillColor("#1a1a1a")
        .text(formatCurrency(data.gst.igst), valX, y, { width: 95, align: "right" });
      y += 13;
    }

    drawLine(doc, y, { left: taxStartX });
    y += 8;

    // Total
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#1a1a1a")
      .text("TOTAL:", taxStartX, y);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#00d4aa")
      .text(`INR ${formatCurrency(data.gst.totalWithTax)}`, valX, y, { width: 95, align: "right" });

    y += 20;

    // Amount in words
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#333")
      .text("Amount in Words:", leftCol, y);
    doc.font("Helvetica").fontSize(7).fillColor("#444")
      .text(amountInWords(data.gst.totalWithTax), leftCol + 80, y, { width: 400 });

    y += 25;
    drawLine(doc, y, { color: "#00d4aa", width: 1 });
    y += 15;

    // ─── NOTES / TERMS ────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#333")
      .text("Terms & Conditions:", leftCol, y);
    y += 12;

    const terms = [
      "1. This is a computer-generated invoice and does not require a physical signature.",
      "2. Payment has been received via Razorpay payment gateway.",
      "3. Subject to Hyderabad jurisdiction.",
      "4. E&OE — Errors and Omissions Excepted.",
    ];

    doc.font("Helvetica").fontSize(6.5).fillColor("#666");
    terms.forEach((t) => {
      doc.text(t, leftCol, y, { width: contentWidth });
      y += 10;
    });

    y += 10;

    // Authorized signatory (right side)
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#333")
      .text("For ARC LABS", 0, y, { align: "right", width: pageWidth - 40 });
    y += 25;
    doc.font("Helvetica").fontSize(7).fillColor("#666")
      .text("Authorized Signatory", 0, y, { align: "right", width: pageWidth - 40 });

    // ─── FOOTER ───────────────────────────────────────
    const footerY = 770;
    drawLine(doc, footerY, { color: "#e0e0e0" });
    doc.font("Helvetica").fontSize(6).fillColor("#999")
      .text(
        `${data.company.name} | ${data.company.email} | ${data.company.phone} | GSTIN: ${data.company.gstin}`,
        0, footerY + 6, { align: "center", width: pageWidth }
      );

    doc.end();
  });
}

function formatCurrency(num) {
  return Number(num).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

module.exports = { generateInvoicePdf };
