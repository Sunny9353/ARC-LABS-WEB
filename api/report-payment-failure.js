const https = require("https");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "arclabs-478f1";
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDyXaKIqmMoO-GAZoG3E6teQ--G5gH0wmw";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function firestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, nestedValue]) => [key, firestoreValue(nestedValue)])
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",").map((item) => item.trim()).filter(Boolean);
  return (
    req.headers["x-real-ip"] ||
    req.headers["x-vercel-forwarded-for"] ||
    forwarded[0] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isSyntheticCheckoutIdentity(form = {}) {
  const name = String(form.name || "").trim().toLowerCase();
  const email = String(form.email || "").trim().toLowerCase();
  const phone = String(form.phone || "").replace(/[^\d]/g, "");
  const emailDomain = email.split("@")[1] || "";

  return (
    /\b(test|demo|sample|dummy)\b/.test(name) ||
    /^(test|demo|sample|dummy)([.+_-]|$)/.test(email) ||
    ["example.com", "example.in", "mailinator.com"].includes(emailDomain) ||
    /^(0{10}|1{10}|9{10}|1234567890)$/.test(phone)
  );
}

function createFirestoreDocument(fields) {
  const payload = JSON.stringify({
    fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValue(value)])),
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "firestore.googleapis.com",
        path: `/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/paymentFailureDebug?key=${FIREBASE_API_KEY}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (firestoreRes) => {
        let data = "";
        firestoreRes.on("data", (chunk) => {
          data += chunk;
        });
        firestoreRes.on("end", () => {
          if (firestoreRes.statusCode >= 200 && firestoreRes.statusCode < 300) {
            resolve(data ? JSON.parse(data) : {});
            return;
          }
          reject(new Error(`Firestore debug write failed with status ${firestoreRes.statusCode}`));
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const { form = {}, product = {}, price, error = {}, razorpayOrderId = "" } = req.body || {};
  const sourceIp = getClientIp(req);
  const syntheticIdentity = isSyntheticCheckoutIdentity(form);

  try {
    const record = await createFirestoreDocument({
      createdAt: new Date(),
      sourceIp,
      forwardedFor: req.headers["x-forwarded-for"] || "",
      realIp: req.headers["x-real-ip"] || "",
      userAgent: req.headers["user-agent"] || "",
      referer: req.headers.referer || req.headers.referrer || "",
      host: req.headers.host || "",
      syntheticIdentity,
      customerName: form.name || "",
      customerEmail: form.email || "",
      customerPhone: form.phone || "",
      productId: product.id || "",
      productName: product.name || "",
      productPrice: price || "",
      paymentId: error.metadata?.payment_id || "",
      razorpayOrderId: error.metadata?.order_id || razorpayOrderId || "",
      razorpayError: {
        code: error.code || "",
        description: error.description || "",
        source: error.source || "",
        step: error.step || "",
        reason: error.reason || "",
      },
    });

    json(res, 200, { recorded: true, syntheticIdentity, sourceIp, debugDocument: record.name || "" });
  } catch (err) {
    json(res, 502, { error: err.message || "Could not record failed payment debug event." });
  }
};
