import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";

export const PRODUCT_PREFIX = "ARC LABS";
export const DEFAULT_PRODUCT_COLOR = "var(--accent)";
export const DEFAULT_PRODUCT_GLOW = "0,220,130";
export const DEFAULT_BADGE_BG = "var(--accent-dim)";
export const DEFAULT_BADGE_COLOR = "var(--accent)";
export const DEFAULT_BEST_SELLER_COLOR = "#f59e0b";

export const INCLUDE_CATEGORIES = [
  { id: "hardware", label: "HW", title: "Hardware" },
  { id: "power", label: "PW", title: "Power" },
  { id: "codes", label: "CD", title: "Codes" },
  { id: "cloud", label: "CL", title: "Cloud" },
  { id: "support", label: "SP", title: "Support" },
];

export const COMPARE_TEMPLATE = [
  { section: "Controllers" },
  { label: "Arduino UNO" },
  { label: "ESP32" },
  { label: "STM32" },
  { label: "Raspberry Pi Pico/W" },
  { label: "Raspberry Pi 4/5" },
  { section: "Sensors & Outputs" },
  { label: "DHT Sensor" },
  { label: "Ultrasonic Sensor" },
  { label: "LDR Sensor" },
  { label: "OLED / TFT Display" },
  { label: "Relay Outputs" },
  { section: "Connectivity" },
  { label: "Wi-Fi / Bluetooth" },
  { label: "LoRa" },
  { label: "GSM / 4G" },
  { label: "RS485" },
  { label: "Cloud Integration" },
  { section: "Positioning" },
  { label: "Best For" },
  { label: "Difficulty" },
  { label: "Price", priceRow: true },
];

export const DEFAULT_SHIPPING = {
  shipmentType: "forward",
  pickupAddress: "Plot No : 1EP, Brindavan Meadows, Sahebnagar Kalan, Hyderabad - 501510",
  pickupPincode: "501510",
  actualWeightKg: 1.328,
  lengthCm: 27.5,
  breadthCm: 19,
  heightCm: 5.5,
  paymentType: "prepaid",
  shipmentValue: 18000,
  dangerousGoods: false,
  secureShipment: true,
};

export function productDisplayName(name = "") {
  const clean = String(name || "").trim().replace(/^ARC\s+LABS\s+/i, "");
  return clean ? `${PRODUCT_PREFIX} ${clean}` : "";
}

export function productInputName(name = "") {
  return String(name || "").trim().replace(/^ARC\s+LABS\s+/i, "");
}

export function formatTier(tier = "") {
  const text = String(tier || "").trim();
  const number = text.match(/\d+/)?.[0] || text;
  if (!number) return "";
  return `TIER ${String(number).padStart(2, "0")}`;
}

function normalizeGalleryImage(item, fallbackName = "") {
  if (typeof item === "string") return { src: item, alt: fallbackName };
  return {
    src: item?.src || item?.url || "",
    alt: item?.alt || fallbackName,
  };
}

export function defaultBadgeForTier(tier = "", fallback = "") {
  const number = String(tier).match(/\d+/)?.[0];
  const labels = {
    1: "ESSENTIAL",
    2: "BEGINNER",
    3: "INTERMEDIATE",
    4: "ADVANCED",
  };
  return labels[Number(number)] || fallback || "NEW";
}

export function defaultCompareValues(product = {}) {
  const text = [
    ...(product.controllers || []),
    ...(product.sensors || []),
    ...(product.display || []),
    ...(product.actuators || []),
    ...(product.connectivity || []),
  ].join(" ").toLowerCase();
  const has = (...terms) => terms.some((term) => text.includes(term.toLowerCase()));
  const values = {
    "Arduino UNO": has("arduino"),
    ESP32: has("esp32"),
    STM32: has("stm32"),
    "Raspberry Pi Pico/W": has("pico"),
    "Raspberry Pi 4/5": has("raspberry pi 4", "raspberry pi 5"),
    "DHT Sensor": has("dht"),
    "Ultrasonic Sensor": has("ultrasonic", "hc-sr04"),
    "LDR Sensor": has("ldr"),
    "OLED / TFT Display": has("oled", "tft", "display"),
    "Relay Outputs": has("relay"),
    "Wi-Fi / Bluetooth": has("wi-fi", "wifi", "bluetooth"),
    LoRa: has("lora"),
    "GSM / 4G": has("gsm", "4g"),
    RS485: has("rs485"),
    "Cloud Integration": has("cloud", "mqtt", "blynk"),
    "Best For": (product.forTags || [])[0] || "",
    Difficulty: product.badge || defaultBadgeForTier(product.tier),
    Price: product.price ? `₹${Number(product.price).toLocaleString("en-IN")}` : "",
  };
  return values;
}

export function volumetricWeightKg(shipping = {}) {
  const length = Number(shipping.lengthCm || 0);
  const breadth = Number(shipping.breadthCm || 0);
  const height = Number(shipping.heightCm || 0);
  return Number(((length * breadth * height) / 5000).toFixed(2));
}

export function applicableWeightKg(shipping = {}) {
  return Math.max(Number(shipping.actualWeightKg || 0), volumetricWeightKg(shipping), 0.5);
}

export function normalizeProduct(product = {}) {
  const shipping = {
    ...DEFAULT_SHIPPING,
    ...(product.shipping || {}),
    shipmentType: "forward",
    paymentType: "prepaid",
  };
  const tier = formatTier(product.tier);
  const displayName = productDisplayName(product.name);
  const galleryImages = Array.isArray(product.galleryImages)
    ? product.galleryImages.map((item) => normalizeGalleryImage(item, displayName)).filter((item) => item.src)
    : [];
  const normalizedBase = {
    id: product.id || "",
    tier,
    name: displayName,
    short: product.short || productInputName(product.name),
    tagline: product.tagline || "",
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || product.price || 0),
    color: product.color || DEFAULT_PRODUCT_COLOR,
    glow: product.glow || DEFAULT_PRODUCT_GLOW,
    image: product.image || galleryImages[0]?.src || "",
    galleryImages,
    badge: product.badge || defaultBadgeForTier(tier),
    badgeBg: product.badgeBg || DEFAULT_BADGE_BG,
    badgeColor: product.badgeColor || DEFAULT_BADGE_COLOR,
    isBest: Boolean(product.isBest),
    bestSellerColor: product.bestSellerColor || DEFAULT_BEST_SELLER_COLOR,
    overview: product.overview || "",
    controllers: Array.isArray(product.controllers) ? product.controllers : [],
    sensors: Array.isArray(product.sensors) ? product.sensors : [],
    display: Array.isArray(product.display) ? product.display : [],
    actuators: Array.isArray(product.actuators) ? product.actuators : [],
    connectivity: Array.isArray(product.connectivity) ? product.connectivity : [],
    includes: Array.isArray(product.includes) ? product.includes : [],
    useCases: Array.isArray(product.useCases) ? product.useCases : [],
    forTags: Array.isArray(product.forTags) ? product.forTags : Array.isArray(product.for) ? product.for : [],
    compare: product.compare && typeof product.compare === "object" ? product.compare : null,
    shipping: {
      ...shipping,
      volumetricWeightKg: volumetricWeightKg(shipping),
      applicableWeightKg: applicableWeightKg(shipping),
    },
    updatedAt: product.updatedAt || null,
  };
  if (!normalizedBase.compare) normalizedBase.compare = defaultCompareValues(normalizedBase);
  return {
    ...normalizedBase,
  };
}

export function subscribeProducts(callback, fallbackProducts = []) {
  const q = query(collection(db, "products"));
  return onSnapshot(
    q,
    (snapshot) => {
      const remote = snapshot.docs
        .map((item) => normalizeProduct({ id: item.id, ...item.data() }))
        .filter((item) => item.id && item.name);
      callback(remote.length ? remote : fallbackProducts.map(normalizeProduct));
    },
    () => callback(fallbackProducts.map(normalizeProduct))
  );
}

export async function saveProduct(product, adminEmail) {
  const normalized = normalizeProduct(product);
  if (!normalized.id) throw new Error("Product ID is required.");
  if (!normalized.name) throw new Error("Product name is required.");
  const snapshot = await getDocs(collection(db, "products"));
  const batch = writeBatch(db);
  if (normalized.isBest) {
    snapshot.docs.forEach((item) => {
      if (item.id !== normalized.id && item.data()?.isBest) {
        batch.set(doc(db, "products", item.id), { isBest: false, updatedAt: serverTimestamp(), updatedBy: adminEmail || "admin" }, { merge: true });
      }
    });
  }
  batch.set(
    doc(db, "products", normalized.id),
    {
      ...normalized,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail || "admin",
    },
    { merge: true }
  );
  await batch.commit();
}
