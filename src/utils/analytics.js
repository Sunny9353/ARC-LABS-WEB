import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

const SESSION_KEY = "arc_analytics_session";
const TELEMETRY_KEY = "arc_telemetry_captured";
const MAX_TEXT = 58;
let installed = false;
let sectionObserver = null;
let formObserver = null;

const PAGE_NAMES = {
  "/": "Home",
  "/about-us": "About Us",
  "/industrial-iot-solutions": "IIoT Solutions",
  "/programs": "Programs",
  "/products": "Products",
  "/lab-packages": "Lab Packages",
  "/csr-partners": "CSR Partners",
  "/verify": "Certificate Verification",
  "/checkout": "Checkout",
  "/privacy": "Privacy Policy",
  "/terms": "Terms",
  "/refunds": "Refunds",
};

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return `sess_${Date.now()}`;
  }
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

function pageName(path = window.location.pathname) {
  return PAGE_NAMES[path] || cleanText(document.title.replace("ARC LABS", "")) || "Website";
}

function isAdminPath() {
  return window.location.pathname.startsWith("/admin");
}

function nearestSectionName(element) {
  const section = element?.closest?.("section, .section, [data-analytics-section], main, form");
  const explicit = section?.getAttribute?.("data-analytics-section");
  const heading = section?.querySelector?.("h1, h2, h3, .section-heading, .vcard-title");
  return cleanText(explicit || heading?.textContent || pageName());
}

function elementLabel(element) {
  if (!element) return "";
  return cleanText(
    element.getAttribute("data-analytics-label") ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.value ||
      element.innerText?.split("\n")?.[0] ||
      element.textContent ||
      element.name ||
      element.id ||
      element.className
  );
}

function pathMeta() {
  return {
    path: window.location.pathname,
    pageName: pageName(),
    search: window.location.search,
    title: document.title,
    referrer: document.referrer || "",
  };
}

export async function trackEvent(type, payload = {}) {
  if (typeof window === "undefined") return;
  if (isAdminPath()) return;

  const event = {
    type,
    ...pathMeta(),
    ...payload,
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    createdAt: serverTimestamp(),
    clientCreatedAt: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, "analyticsEvents"), event);
  } catch {
    // Analytics must never break the public website.
  }
}

async function captureTelemetryLocation() {
  if (typeof window === "undefined" || isAdminPath()) return;
  try {
    const alreadyCaptured = window.sessionStorage.getItem(TELEMETRY_KEY);
    if (alreadyCaptured) return;
    window.sessionStorage.setItem(TELEMETRY_KEY, "pending");
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) throw new Error("Telemetry lookup failed");
    const geo = await response.json();
    const latitude = Number(geo.latitude);
    const longitude = Number(geo.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Telemetry coordinates unavailable");
    await addDoc(collection(db, "telemetry_data"), {
      city: cleanText(geo.city),
      region: cleanText(geo.region),
      country: cleanText(geo.country_name || geo.country),
      latitude,
      longitude,
      pagePath: window.location.pathname,
      pageName: pageName(),
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      clientCreatedAt: new Date().toISOString(),
    });
    window.sessionStorage.setItem(TELEMETRY_KEY, "done");
  } catch {
    try {
      window.sessionStorage.setItem(TELEMETRY_KEY, "failed");
    } catch {
      // Telemetry must never affect the website.
    }
  }
}

function attachSectionObservers() {
  sectionObserver?.disconnect();
  formObserver?.disconnect();

  const visibleOnce = new WeakSet();
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || visibleOnce.has(entry.target)) return;
        visibleOnce.add(entry.target);
        const sectionName = nearestSectionName(entry.target);
        trackEvent("section_view", {
          target: entry.target.id || entry.target.className || entry.target.tagName,
          label: `${sectionName} (${pageName()} page)`,
          sectionName,
          location: pageName(),
        });
      });
    },
    { threshold: 0.35 }
  );

  document
    .querySelectorAll("section, .section, [data-analytics-section]")
    .forEach((element) => sectionObserver.observe(element));

  const formsSeen = new WeakSet();
  formObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || formsSeen.has(entry.target)) return;
        formsSeen.add(entry.target);
        const sectionName = nearestSectionName(entry.target);
        trackEvent("form_view", {
          target: entry.target.id || entry.target.className || "form",
          label: `${sectionName} form (${pageName()} page)`,
          sectionName,
          location: pageName(),
        });
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll("form").forEach((form) => formObserver.observe(form));
}

export function trackPageView() {
  trackEvent("page_view");
  captureTelemetryLocation();
  window.setTimeout(attachSectionObservers, 240);
}

export function installAnalyticsTracker() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  document.addEventListener(
    "click",
    (event) => {
      if (isAdminPath()) return;
      const target = event.target?.closest?.("button, a, [role='button'], input[type='submit']");
      if (!target) return;

      const label = elementLabel(target) || "Button";
      const sectionName = nearestSectionName(target);
      trackEvent("click", {
        tag: target.tagName,
        href: target.getAttribute("href") || "",
        target: target.id || target.name || target.className || "",
        label: `${label} (${sectionName}, ${pageName()} page)`,
        actionName: label,
        sectionName,
        location: pageName(),
      });
    },
    { capture: true }
  );

  document.addEventListener(
    "submit",
    (event) => {
      if (isAdminPath()) return;
      const form = event.target;
      const sectionName = nearestSectionName(form);
      trackEvent("form_submit", {
        target: form.id || form.name || form.className || "form",
        label: `${sectionName} submit (${pageName()} page)`,
        sectionName,
        location: pageName(),
      });
    },
    { capture: true }
  );
}
