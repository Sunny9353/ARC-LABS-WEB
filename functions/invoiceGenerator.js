const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function amountInWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function toWords(n) {
    if (!n) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` and ${toWords(n % 100)}` : ""}`;
    if (n < 100000) return `${toWords(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${toWords(n % 1000)}` : ""}`;
    if (n < 10000000) return `${toWords(Math.floor(n / 100000))} Lakh${n % 100000 ? ` ${toWords(n % 100000)}` : ""}`;
    return `${toWords(Math.floor(n / 10000000))} Crore${n % 10000000 ? ` ${toWords(n % 10000000)}` : ""}`;
  }

  return `INR ${toWords(Math.round(Number(num || 0)))} Only`;
}

function formatCurrency(num) {
  return Number(num || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getStateName(code) {
  const states = {
    "09": "UTTAR PRADESH",
    "27": "MAHARASHTRA",
    "29": "KARNATAKA",
    "33": "TAMIL NADU",
    "36": "TELANGANA",
  };
  return states[code] || code || "N/A";
}

function textBlock(doc, label, lines, x, y, width) {
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text(label, x, y);
  doc.font("Helvetica").fontSize(8).fillColor("#374151");
  let nextY = y + 13;
  lines.filter(Boolean).forEach((line) => {
    doc.text(String(line), x, nextY, { width, lineGap: 1.5 });
    nextY += doc.heightOfString(String(line), { width, lineGap: 1.5 }) + 2;
  });
  return nextY;
}

function drawLine(doc, y, color = "#1f5f9f") {
  doc.strokeColor(color).lineWidth(1).moveTo(54, y).lineTo(541, y).stroke();
}

async function generateInvoicePdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 36, bottom: 36, left: 54, right: 54 } });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const logoPath = path.resolve(__dirname, "../public/images/brand/arc-labs-logo.png");
    const company = data.company || {};
    const customer = data.customer || {};
    const product = data.product || {};
    const gst = data.gst || {};
    const deliveryCharge = Number(data.deliveryCharge || data.shippingCharge || data.delivery?.price || 0);
    const total = Number(gst.totalWithTax || data.amount || 0);
    const productTotal = Math.max(0, total - deliveryCharge);
    const taxable = Number(gst.taxableAmount || productTotal / 1.18);
    const tax = Number(gst.totalTax || productTotal - taxable);
    const shipDate = data.shipDate ? formatDate(data.shipDate) : "Pending ShipRocket API";
    const stateLine = customer.stateCode ? `${customer.stateCode}-${getStateName(customer.stateCode)}` : "N/A";
    const shipping = [
      customer.name,
      customer.address || customer.customerAddress,
      [customer.city, customer.region || customer.state, customer.zip, customer.country].filter(Boolean).join(", "),
      customer.phone ? `Ph: ${customer.phone}` : "",
    ];

    doc.roundedRect(30, 24, 535, 760, 12).lineWidth(10).strokeColor("#18181b").stroke();

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#1f5f9f").text("TAX INVOICE", 54, 58, { characterSpacing: 2 });
    doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(company.name || "ARC LABS", 54, 80);
    doc.font("Helvetica").fontSize(8).fillColor("#374151")
      .text(`GSTIN ${company.gstin || "NOT_CONFIGURED"}`, 54, 101)
      .text(company.address || "4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad, Telangana 500007", 54, 113, { width: 255 })
      .text(`Mobile ${company.phone || "+91-7815809412"}   Email ${company.email || "hello@arclabs.in"}`, 54, 143, { width: 270 });

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 414, 70, { fit: [105, 60], align: "right" });
    } else {
      doc.font("Helvetica-Bold").fontSize(32).fillColor("#111827").text("ARC LABS", 370, 78, { width: 150, align: "right" });
    }
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#4b5563").text("ORIGINAL FOR RECIPIENT", 408, 58, { width: 125, align: "right" });

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827")
      .text(`Invoice #: ${data.invoiceNumber}`, 54, 168)
      .text(`Invoice Date: ${formatDate(data.invoiceDate)}`, 200, 168)
      .text(`Ship Date: ${shipDate}`, 365, 168);

    textBlock(doc, "Customer Details:", [
      customer.name || "Customer",
      customer.phone ? `Ph: ${customer.phone}` : "",
      customer.email ? `Email: ${customer.email}` : "",
    ], 54, 196, 150);
    textBlock(doc, "Billing address:", shipping, 200, 196, 145);
    textBlock(doc, "Shipping address:", shipping, 365, 196, 155);

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827")
      .text(`Place of Supply: ${stateLine}`, 54, 264);

    drawLine(doc, 286);
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#111827");
    const yHead = 294;
    const cols = [
      ["#", 54, 24, "left"],
      ["Item", 80, 185, "left"],
      ["Rate/Item", 278, 70, "right"],
      ["Qty", 361, 28, "right"],
      ["Taxable Value", 402, 68, "right"],
      ["Tax Amount", 482, 59, "right"],
    ];
    cols.forEach(([label, x, width, align]) => doc.text(label, x, yHead, { width, align }));
    drawLine(doc, 310);

    doc.font("Helvetica").fontSize(8).fillColor("#111827");
    doc.text("1", 54, 323, { width: 24 });
    doc.font("Helvetica-Bold").text(`${product.name || "ARC LABS Product"} (inclusive of all taxes and GST)`, 80, 323, { width: 185 });
    doc.font("Helvetica").text(formatCurrency(productTotal), 278, 323, { width: 70, align: "right" });
    doc.text("1", 361, 323, { width: 28, align: "right" });
    doc.text(formatCurrency(productTotal), 402, 323, { width: 68, align: "right" });
    doc.text("Included", 482, 323, { width: 59, align: "right" });

    if (deliveryCharge > 0) {
      doc.text("2", 54, 343, { width: 24 });
      doc.font("Helvetica-Bold").text("Delivery charges", 80, 343, { width: 185 });
      doc.font("Helvetica").text(formatCurrency(deliveryCharge), 278, 343, { width: 70, align: "right" });
      doc.text("1", 361, 343, { width: 28, align: "right" });
      doc.text(formatCurrency(deliveryCharge), 402, 343, { width: 68, align: "right" });
      doc.text("-", 482, 343, { width: 59, align: "right" });
    }

    drawLine(doc, 365, "#9ca3af");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827")
      .text("Product subtotal", 382, 377, { width: 80, align: "right" })
      .text(`Rs.${formatCurrency(productTotal)}`, 466, 377, { width: 75, align: "right" })
      .text("Delivery charges", 382, 392, { width: 80, align: "right" })
      .text(`Rs.${formatCurrency(deliveryCharge)}`, 466, 392, { width: 75, align: "right" });

    doc.fontSize(14).text("Total", 382, 414, { width: 80, align: "right" })
      .text(`Rs.${formatCurrency(total)}`, 452, 414, { width: 89, align: "right" });
    drawLine(doc, 438);
    doc.font("Helvetica").fontSize(7).fillColor("#374151")
      .text("Total Items / Qty : 1 / 1", 54, 448)
      .text(`Total amount (in words): ${amountInWords(total)}`, 190, 448, { width: 250 })
      .font("Helvetica-Bold").text(`Amount Payable: Rs.${formatCurrency(total)}`, 383, 462, { width: 158, align: "right" });

    drawLine(doc, 480);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("Notes:", 54, 502);
    doc.font("Helvetica").fontSize(7).fillColor("#374151")
      .text("Thank you for your Business.", 54, 516)
      .font("Helvetica-Bold").text("Terms and Conditions:", 54, 540)
      .font("Helvetica")
      .text("1. Goods once sold cannot be taken back or exchanged.", 54, 554)
      .text("2. We are not the manufacturers. Warranty is subject to manufacturer terms.", 54, 566)
      .text("3. Subject to Hyderabad jurisdiction.", 54, 578);

    doc.font("Helvetica").fontSize(7).fillColor("#374151").text("For ARC LABS", 430, 520, { width: 100, align: "center" });
    doc.rect(420, 544, 120, 70).strokeColor("#e5e7eb").lineWidth(0.6).stroke();
    doc.fontSize(7).fillColor("#6b7280").text("Authorized Signatory", 418, 628, { width: 125, align: "center" });

    doc.font("Helvetica-Bold").fontSize(6).fillColor("#111827")
      .text("Page 1/1", 54, 744)
      .text("This is a digitally generated document.", 108, 744);

    doc.end();
  });
}

module.exports = { generateInvoicePdf };
