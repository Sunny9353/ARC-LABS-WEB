// ─────────────────────────────────────────────────────────────────────────────
// ARC LABS Certificate generator
// Produces a landscape A4 PDF that replicates the ARC LABS x D.Y. Patil
// "Certificate of Completion" design, with the participant name, workshop title,
// institution and dates filled dynamically from the verified certificate record.
// ─────────────────────────────────────────────────────────────────────────────
import { jsPDF } from "jspdf";
import {
  logoArclabs,
  logoDypatil,
  logoMsme,
  sealArclabs,
  signHod,
  signRegistrar,
  signVc,
} from "../data/certificateAssets.js";
import { getTech, getDurationLabel, fmtDate } from "./certificationHelpers.js";

const NAVY = [11, 43, 92];
const BLUE = [27, 79, 160];
const CYAN = [54, 207, 224];
const INK = [33, 37, 41];
const GREY = [90, 99, 112];

const NUM_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];

const durationWord = (days) =>
  days > 0 && days <= 20 ? NUM_WORDS[days] : String(days || "");

const SIGNATORIES = [
  { img: sealArclabs, name: "Vamshidar Reddy", title: "Founder", isSeal: true },
  { img: signHod, name: "Mr. Naresh Kamble", title: "HoD CSE" },
  { img: signRegistrar, name: "Prof. Dr. Jayendra Khot", title: "Registrar" },
  { img: signVc, name: "Prof. Dr. Anilkumar S Gupta", title: "Vice Chancellor" },
];

export function downloadCertificatePdf(cert) {
  const doc = buildCertificateDoc(cert);
  if (!doc) return;
  const name = cert.fullName || "certificate";
  const safe = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`arc-labs-certificate-${safe}.pdf`);
}

export function buildCertificateDoc(cert) {
  if (!cert) return null;

  const tech = getTech(cert.technology || "");
  const days = parseInt(String(cert.durationDays || "0").replace(/\D/g, ""), 10) || 0;
  const name = cert.fullName || "Participant";
  const institution =
    cert.institution ||
    "D.Y. Patil Agriculture and Technical University, Talsande";
  const workshopTitle = tech.label || cert.technology || "IoT & Robotics";
  const dateText = cert.trainingDate ? fmtDate(cert.trainingDate) : "";

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();   // 842
  const H = doc.internal.pageSize.getHeight();  // 595
  const cx = W / 2;

  // ── Background & frame ──────────────────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Decorative corner triangles (subtle grey)
  doc.setFillColor(232, 236, 242);
  doc.triangle(0, 0, 150, 0, 0, 95, "F");
  doc.setFillColor(241, 244, 248);
  doc.triangle(0, 0, 95, 0, 0, 150, "F");
  doc.setFillColor(232, 236, 242);
  doc.triangle(W, H, W - 150, H, W, H - 95, "F");
  doc.setFillColor(241, 244, 248);
  doc.triangle(W, H, W - 95, H, W, H - 150, "F");

  // Left accent bar (navy + cyan)
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 10, H, "F");
  doc.setFillColor(...CYAN);
  doc.rect(14, 0, 5, H, "F");

  // ── Logos ───────────────────────────────────────────────────────────────────
  const logoH = 52;
  drawImage(doc, logoArclabs, 60, 20, logoH, "left");
  drawImage(doc, logoDypatil, cx, 22, logoH - 4, "center");
  drawImage(doc, logoMsme, W - 60, 18, logoH, "right");

  // ── Title ─────────────────────────────────────────────────────────────────--
  doc.setFont("times", "bold");
  doc.setFontSize(42);
  doc.setTextColor(...BLUE);
  doc.text("CERTIFICATE OF COMPLETION", cx, 150, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text("This is to certify that", cx, 182, { align: "center" });

  // ── Participant name ─────────────────────────────────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(30);
  doc.setTextColor(...NAVY);
  doc.text(name, cx, 228, { align: "center" });
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.8);
  doc.line(cx - 250, 242, cx + 250, 242);

  // ── Body ─────────────────────────────────────────────────────────────────────
  let y = 272;
  const line = (text, { size = 12.5, style = "normal", color = INK, gap = 19, font = "helvetica" } = {}) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, cx, y, { align: "center" });
    y += gap;
  };

  line("has successfully participated in the");
  line(`${durationWord(days) || "Hands-on"}-Day Hands-on Workshop on ${workshopTitle}`, {
    style: "bold",
    size: 14,
    color: NAVY,
    gap: 22,
  });
  line(`Organised at ${institution},`, { style: "bold", size: 12.5, gap: 19 });
  line("in collaboration with ARC LABS" + (dateText ? "," : "."), { gap: dateText ? 19 : 24 });
  if (dateText) line(`held on ${dateText}.`, { style: "bold", gap: 26 });

  line(
    "In recognition of their dedication to learning and commitment to advancing their",
    { size: 11.5, color: GREY, gap: 16 }
  );
  line(
    `technical knowledge in ${workshopTitle}, the participant demonstrated active`,
    { size: 11.5, color: GREY, gap: 16 }
  );
  line(
    "engagement in hands-on sessions, practical assignments, and a real-world project.",
    { size: 11.5, color: GREY, gap: 22 }
  );
  line("We appreciate their enthusiasm and participation in this workshop.", {
    size: 11.5,
    color: GREY,
  });

  // ── Certificate ID (small, bottom-left above bar) ────────────────────────────
  if (cert.certId) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GREY);
    doc.text(`Certificate ID: ${cert.certId}  •  Verify at arclabs.in/verify`, 40, H - 18);
  }

  // ── Signatures ───────────────────────────────────────────────────────────────
  const colCx = [165, 370, 575, 765];
  const lineY = H - 78;
  SIGNATORIES.forEach((s, i) => {
    const x = colCx[i];
    const imgH = s.isSeal ? 44 : 34;
    const imgY = s.isSeal ? lineY - imgH - 14 : lineY - imgH - 4;
    drawImage(doc, s.img, x, imgY, imgH, "center");
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.line(x - 78, lineY, x + 78, lineY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(s.name, x, lineY + 16, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.text(s.title, x, lineY + 30, { align: "center" });
  });

  return doc;
}

// Draw a PNG asset scaled to a target height, anchored left / center / right at x.
function drawImage(doc, asset, x, y, targetH, anchor = "left") {
  if (!asset || !asset.data) return;
  const ratio = asset.w / asset.h;
  const w = targetH * ratio;
  let drawX = x;
  if (anchor === "center") drawX = x - w / 2;
  else if (anchor === "right") drawX = x - w;
  try {
    doc.addImage(asset.data, "PNG", drawX, y, w, targetH);
  } catch (_) {
    /* ignore a malformed asset rather than break the whole certificate */
  }
}
