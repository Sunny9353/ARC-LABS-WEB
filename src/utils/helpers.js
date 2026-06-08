// ═══════════════════════════════════════════════════════
//  ARC LABS — Utility Helpers
//  src/utils/helpers.js
// ═══════════════════════════════════════════════════════

import {
  PINCODE_MAP,
  SKILLS_MAP,
  PERFORMANCE_GRADES,
  TECHNOLOGIES,
} from "../data/constants.js";

/**
 * Generate a unique 7-char certificate ID: ARC + 4 random chars
 * Avoids ambiguous chars (0,O,1,I)
 */
export function generateCertId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return "ARC" + suffix;
}

/**
 * Look up city/state from first 3 digits of pincode (local fallback)
 */
export function localPincodeLookup(pin) {
  if (!pin || pin.length < 3) return null;
  return PINCODE_MAP[pin.slice(0, 3)] || null;
}

/**
 * Fetch city & state from India Post API, fallback to local map
 */
export async function fetchPincode(pin) {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      return { city: po.District || po.Block || po.Name, state: po.State };
    }
  } catch (_) {
    /* fallback */
  }
  return localPincodeLookup(pin);
}

/**
 * Get skills array based on technology and training days
 */
export function getSkillsForCert(technology, days) {
  const all = SKILLS_MAP[technology] || [
    "IoT Fundamentals",
    "Sensor Programming",
    "Cloud Integration",
  ];
  if (days >= 5) return all;
  if (days === 3) return all.slice(0, 4);
  return all.slice(0, 3);
}

/**
 * Get grade from performance rating
 */
export function getGrade(performance) {
  return PERFORMANCE_GRADES[performance] || "B";
}

/**
 * Format a date string to Indian locale display
 */
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Get a Technology object by ID
 */
export function getTech(id) {
  return TECHNOLOGIES.find((t) => t.id === id) || { id, label: id, icon: "🔧" };
}

/**
 * Get human-readable duration label
 */
export function getDurationLabel(days) {
  const n = parseInt(days);
  if (n === 2) return "2-Day Workshop";
  if (n === 3) return "3-Day Intensive";
  return "5-Day Bootcamp";
}

/**
 * Get total training hours for a given duration
 */
export function getTrainingHours(days) {
  const map = { 2: 14, 3: 21, 5: 35 };
  return (map[parseInt(days)] || parseInt(days) * 7) + " Hours";
}

/**
 * Copy text to clipboard, returns true on success
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Load certificates from localStorage (merges with seed data)
 */
export function loadCertificates(seedData) {
  try {
    const saved = localStorage.getItem("arclabs_certs");
    return saved ? { ...seedData, ...JSON.parse(saved) } : { ...seedData };
  } catch (_) {
    return { ...seedData };
  }
}

/**
 * Save certificates to localStorage
 */
export function saveCertificates(certMap) {
  try {
    localStorage.setItem("arclabs_certs", JSON.stringify(certMap));
  } catch (_) {
    /* ignore quota errors */
  }
}
