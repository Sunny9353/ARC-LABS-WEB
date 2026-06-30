import {
  TECHNOLOGIES,
  SKILLS_MAP,
  PIN_MAP,
  PERFORMANCE_GRADES,
} from "../data/certificationConstants.js";
import { isInternshipSessionCode } from "../data/sessionCodes.js";

/* ═══════════════════════════════════════ HELPERS ═══════════════════════════════════════ */

// ✅ UPDATED CERTIFICATE ID GENERATOR
export function genCertId() {
  // Get last 2 digits of current year
  const year = new Date().getFullYear().toString().slice(-2);

  // Generate 4 random characters
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";

  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `ARC${year}${randomPart}`;
}

// 🔍 PIN LOOKUP (LOCAL)
export function lookupPin(pin) {
  const p = parseInt(pin.substring(0, 3));
  return PIN_MAP[p] || null;
}

// 📅 FORMAT DATE
export function fmtDate(d) {
  if (!d) return "—";
  const [y, m, dy] = d.split("-");
  const date = new Date(y, m - 1, dy);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// 🧠 SKILLS BASED ON TECH & DAYS
export function getSkills(tech, days) {
  const base = SKILLS_MAP[tech] || [];
  const count = Number(days);
  return count >= 5 ? base : base.slice(0, (count || 0) + 2);
}

// 🧩 GET TECHNOLOGY OBJECT
export function getTechObj(id) {
  return TECHNOLOGIES.find((t) => t.id === id) || TECHNOLOGIES[0];
}

// 📘 DURATION LABEL
export function getDurLabel(days) {
  if (isInternshipDuration(days)) return "Internship";
  const count = Number(days);
  if (count === 2) return "2-Day Workshop";
  if (count === 3) return "3-Day Intensive";
  if (count === 5) return "5-Day Bootcamp";
  return `${count || days}-Day Program`;
}

// ⏱ HOURS CALCULATION
export function getHours(days) {
  if (isInternshipDuration(days)) return "Internship";
  const count = Number(days);
  if (count === 2) return "14 hrs";
  if (count === 3) return "21 hrs";
  if (count === 5) return "35 hrs";
  return `${(count || 0) * 7} hrs`;
}

export function isInternshipCertificate(cert) {
  return (
    isInternshipDuration(cert?.durationDays) ||
    String(cert?.certificateType || "").trim().toLowerCase() === "internship" ||
    isInternshipSessionCode(cert?.workshopCode || cert?.workshopKey)
  );
}

export function getCertificateDurationText(cert) {
  if (isInternshipCertificate(cert)) return "Internship";
  return `${cert?.durationDays || 0} Days (${getHours(cert?.durationDays || 0)})`;
}

function isInternshipDuration(value) {
  return String(value || "").trim().toLowerCase() === "internship";
}

/**
 * 🌐 Fetch city & state from API + fallback
 */
export async function fetchPincode(pin) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return {
        city: po.District || po.Block || po.Name,
        state: po.State,
      };
    }
  } catch (_) {
    // fallback
  }

  // fallback local
  const p = parseInt(pin.substring(0, 3));
  const entry = PIN_MAP[p];
  return entry ? { city: entry.c, state: entry.s } : null;
}

// 🏆 GRADE FROM PERFORMANCE
export function getGrade(performance) {
  return PERFORMANCE_GRADES[performance] || "B";
}

// 📋 COPY TO CLIPBOARD
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
}

/* ═══════════════════════════════════════ FUNCTION ALIASES ═══════════════════════════════════════ */

export const generateCertId = genCertId;
export const localPincodeLookup = lookupPin;
export const getSkillsForCert = getSkills;
export const formatDate = fmtDate;
export const getTech = getTechObj;
export const getDurationLabel = getDurLabel;
export const getTrainingHours = getHours;
