import { jsPDF } from "jspdf";
import { getTech, fmtDate } from "./certificationHelpers.js";
import { isInternshipSessionCode } from "../data/sessionCodes.js";

const TEMPLATE_URL = "/images/certificates/mit-pune-certificate-template.png";
const INK = [12, 12, 12];
const NAME_NAVY = [18, 34, 74];

const imageCache = new Map();

export async function downloadCertificatePdf(cert) {
  const doc = await buildCertificateDoc(cert);
  if (!doc) return;

  const name = cert.fullName || cert.rollNo || "certificate";
  const safe = name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  doc.save(`arc-labs-certificate-${safe || "student"}.pdf`);
}

export async function buildCertificateDoc(cert) {
  if (!cert) return null;

  const template = await loadImageDataUrl(TEMPLATE_URL);
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const cx = W / 2;

  doc.addImage(template, "PNG", 0, 0, W, H);

  const data = normalizeCertificateData(cert);

  // Clean only the variable workshop placeholder lines. The name line is kept
  // from the template so the certificate spacing stays exactly like the design.
  cover(doc, 128, 318, 590, 88);

  drawParticipantName(doc, data.fullName, cx, 292);

  drawCertificateBody(doc, data);

  return doc;
}

function normalizeCertificateData(cert) {
  const tech = getTech(cert.technology || "");
  const durationDays = cleanDays(cert.durationDays);
  const isInternship =
    String(cert.certificateType || "").trim().toLowerCase() === "internship" ||
    String(cert.durationDays || "").trim().toLowerCase() === "internship" ||
    isInternshipSessionCode(cert.workshopCode || cert.workshopKey);
  const programName =
    clean(cert.programName) ||
    clean(cert.workshopName) ||
    clean(tech?.label) ||
    clean(cert.technology) ||
    "Internet of Robotic Things";

  const departmentName = clean(cert.departmentName) || clean(cert.department) || "the concerned department";
  const collegeName = clean(cert.collegeName) || clean(cert.institution) || "the institution";
  const location = clean(cert.location) || clean(cert.city) || clean(cert.state) || "the venue";

  return {
    certId: clean(cert.certId),
    rollNo: clean(cert.rollNo) || clean(cert.rollKey) || "-",
    fullName: clean(cert.fullName) || "Participant Name",
    durationDays,
    programPrefix: isInternship ? "Internship Program on " : `${durationDays}-Day Hands-on Workshop on `,
    programName,
    departmentName,
    collegeName,
    location,
    dateRange: formatCertificateDateRange(cert),
  };
}

function drawParticipantName(doc, name, x, y) {
  const fontSize = fitFontSize(doc, name, 410, 22, 13);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(fontSize);
  doc.setTextColor(...NAME_NAVY);
  doc.text(name, x, y, { align: "center" });
}

function drawCertificateBody(doc, data) {
  const fontSize = 14;
  const lineHeight = 15.6;
  const maxWidth = 690;
  const cx = doc.internal.pageSize.getWidth() / 2;
  let y = 338;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...INK);

  doc.text("has successfully participated in the", cx, y, { align: "center" });
  y += lineHeight;

  drawRichCenteredLine(doc, cx, y, [
    { text: data.programPrefix },
    { text: data.programName, bold: true },
  ], maxWidth, fontSize);
  y += lineHeight;

  y = drawWrappedCenteredText(
    doc,
    `organized by the Department of ${data.departmentName}, ${data.collegeName}, held at ${data.location} on ${data.dateRange}`,
    cx,
    y,
    maxWidth,
    lineHeight,
    fontSize
  );

  drawRichCenteredLine(doc, cx, y, [
    { text: "with sponsorship support from " },
    { text: "E-Cell, IIT Hyderabad.", bold: true },
  ], maxWidth, fontSize);
}

function drawWrappedCenteredText(doc, text, x, y, maxWidth, lineHeight, fontSize) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth).slice(0, 2);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineHeight, { align: "center" });
  });
  return y + lines.length * lineHeight;
}

function drawRichCenteredLine(doc, x, y, segments, maxWidth, fontSize) {
  let size = fontSize;
  while (size > 10 && richLineWidth(doc, segments, size) > maxWidth) {
    size -= 0.5;
  }

  const totalWidth = richLineWidth(doc, segments, size);
  let cursor = x - totalWidth / 2;

  segments.forEach((segment) => {
    doc.setFont("helvetica", segment.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    doc.text(segment.text, cursor, y);
    cursor += doc.getTextWidth(segment.text);
  });
}

function richLineWidth(doc, segments, fontSize) {
  return segments.reduce((width, segment) => {
    doc.setFont("helvetica", segment.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    return width + doc.getTextWidth(segment.text);
  }, 0);
}

function cover(doc, x, y, w, h) {
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, w, h, "F");
}

function fitFontSize(doc, text, maxWidth, startSize, minSize) {
  for (let size = startSize; size >= minSize; size -= 1) {
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(size);
    if (doc.getTextWidth(text) <= maxWidth) return size;
  }
  return minSize;
}

function formatCertificateDateRange(cert) {
  const start = parseDate(cert.startDate || cert.trainingDate);
  const end = parseDate(cert.endDate || cert.trainingEndDate);

  if (start && end) {
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (sameMonth) {
      return `${ordinal(start.getDate())} to ${ordinal(end.getDate())} ${monthName(end)} ${end.getFullYear()}`;
    }
    if (start.getFullYear() === end.getFullYear()) {
      return `${ordinal(start.getDate())} ${monthName(start)} to ${ordinal(end.getDate())} ${monthName(end)} ${end.getFullYear()}`;
    }
    return `${ordinal(start.getDate())} ${monthName(start)} ${start.getFullYear()} to ${ordinal(end.getDate())} ${monthName(end)} ${end.getFullYear()}`;
  }

  if (start) return `${ordinal(start.getDate())} ${monthName(start)} ${start.getFullYear()}`;

  const month = clean(cert.month);
  const year = clean(cert.year);
  if (month && year) return `${month} ${year}`;
  if (month) return month;
  if (cert.trainingDate) return fmtDate(cert.trainingDate);
  return "the scheduled dates";
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const text = String(value).trim();
  if (!text) return null;

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ordinal(day) {
  const n = Number(day);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function monthName(date) {
  return date.toLocaleString("en-IN", { month: "long" });
}

function clean(value) {
  return String(value || "").trim();
}

function cleanDays(value) {
  const days = String(value || "").replace(/\D/g, "");
  return days || "3";
}

async function loadImageDataUrl(url) {
  if (imageCache.has(url)) return imageCache.get(url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load certificate template: ${url}`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  imageCache.set(url, dataUrl);
  return dataUrl;
}
