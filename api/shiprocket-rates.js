const https = require("https");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function firstEnvValue(names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function cleanPincode(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

const DEFAULT_PICKUP_ADDRESS = "Plot No : 1EP, Brindavan Meadows, Sahebnagar Kalan, Hyderabad - 501510";
const DEFAULT_PICKUP_POSTCODE = "501510";

function shiprocketRequest(path, method, payload, token = "") {
  const body = payload ? JSON.stringify(payload) : "";
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "apiv2.shiprocket.in",
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
        },
      },
      (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => {
          data += chunk;
        });
        apiRes.on("end", () => {
          let parsed = {};
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (err) {
            reject(new Error("Shiprocket returned an invalid response."));
            return;
          }
          if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
            resolve(parsed);
            return;
          }
          reject(new Error(parsed.message || parsed.error || "Shiprocket request failed."));
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function parseDeliveryDays(raw) {
  const directDays =
    raw.estimated_delivery_days ??
    raw.delivery_days ??
    raw.delivery_days_count ??
    raw.estimated_delivery ??
    raw.edd_days ??
    raw.edd_day;
  if (directDays !== undefined && directDays !== null && directDays !== "") {
    return Number.parseInt(String(directDays).match(/\d+/)?.[0] || "0", 10);
  }
  const hours = parseDeliveryHours(raw, false);
  if (hours !== null) {
    return Math.max(0, Math.ceil(hours / 24));
  }
  return Number.parseInt(String(raw.etd ?? "0").match(/\d+/)?.[0] || "0", 10);
}

function minutesFromText(value) {
  const text = String(value || "").toLowerCase();
  if (!text) return null;
  const minuteMatch = text.match(/(\d+(?:\.\d+)?)\s*(min|mins|minute|minutes)\b/);
  if (minuteMatch) return Number(minuteMatch[1]);
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(hr|hrs|hour|hours)\b/);
  if (hourMatch) return Number(hourMatch[1]) * 60;
  if (/\bsame\s*day\b|\btoday\b|\b0\s*day\b/.test(text)) return 0;
  return null;
}

function parseDeliveryHours(raw, allowDaysFallback = true) {
  const minuteFields = [
    raw.etd_minutes,
    raw.edd_minutes,
    raw.delivery_minutes,
    raw.estimated_delivery_minutes,
    raw.delivery_time_minutes,
  ];
  for (const value of minuteFields) {
    if (value !== undefined && value !== null && value !== "") {
      const minutes = Number(value);
      if (Number.isFinite(minutes)) return Math.max(0, minutes / 60);
    }
  }

  const hourFields = [
    raw.etd_hours,
    raw.edd_hours,
    raw.delivery_hours,
    raw.estimated_delivery_hours,
    raw.delivery_time_hours,
  ];
  for (const value of hourFields) {
    if (value !== undefined && value !== null && value !== "") {
      const hours = Number(value);
      if (Number.isFinite(hours)) return Math.max(0, hours);
    }
  }

  const textFields = [
    raw.etd,
    raw.edd,
    raw.estimated_delivery,
    raw.estimated_delivery_time,
    raw.delivery_time,
    raw.delivery_speed,
    raw.description,
    raw.courier_name,
  ];
  for (const value of textFields) {
    const minutes = minutesFromText(value);
    if (minutes !== null && Number.isFinite(minutes)) return Math.max(0, minutes / 60);
  }
  if (!allowDaysFallback) return null;
  const days = parseDeliveryDays(raw);
  return Number.isFinite(days) ? days * 24 : null;
}

function normalizeCourier(raw, type) {
  const freight = Number(raw.freight_charge ?? raw.rate ?? raw.shipping_amount ?? raw.rto_charges ?? 0);
  const cod = Number(raw.cod_charges ?? 0);
  const etd = parseDeliveryDays(raw);
  const deliveryHours = parseDeliveryHours(raw);
  const rating = Number(raw.rating ?? raw.courier_rating ?? raw.delivery_performance ?? 0);
  const price = Math.max(0, Math.round((freight + cod) * 100) / 100);
  return {
    id: `${type}-${raw.courier_company_id || raw.courier_name || raw.courier || raw.courier_code || Math.random().toString(36).slice(2)}`,
    type,
    courierCompanyId: raw.courier_company_id || "",
    courierCode: raw.courier_code || "",
    courierName: raw.courier_name || raw.courier || "Shiprocket courier",
    deliveryDays: Number.isFinite(etd) ? etd : null,
    deliveryHours,
    rating: Number.isFinite(rating) ? rating : 0,
    price,
    chargeableWeight: raw.charge_weight || raw.applied_weight || raw.weight || "",
    mode: raw.mode || raw.transportation_mode || "",
    raw,
  };
}

function customerCourier(item) {
  const { raw, ...safeItem } = item;
  return safeItem;
}

function dedupeCouriers(couriers) {
  const seen = new Set();
  return couriers.filter((item) => {
    const key = [
      item.courierCompanyId || item.courierCode || item.courierName.toLowerCase(),
      item.price,
      item.deliveryHours ?? item.deliveryDays ?? "eta",
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByPriceThenDays(a, b) {
  return a.price - b.price || (a.deliveryHours ?? 99999) - (b.deliveryHours ?? 99999) || (b.rating || 0) - (a.rating || 0);
}

function sortByDaysThenPrice(a, b) {
  return (a.deliveryHours ?? 99999) - (b.deliveryHours ?? 99999) || a.price - b.price || (b.rating || 0) - (a.rating || 0);
}

function distinctPush(options, picked, label, labelId) {
  if (!picked) return;
  const exists = options.some((item) => {
    const sameCourier = item.courierCompanyId && picked.courierCompanyId
      ? item.courierCompanyId === picked.courierCompanyId
      : item.courierName === picked.courierName;
    return sameCourier && item.price === picked.price && item.deliveryHours === picked.deliveryHours;
  });
  if (!exists) {
    options.push({ ...customerCourier(picked), id: `${labelId}-${picked.id}`, label });
  }
}

function pickOptions(couriers) {
  const usable = dedupeCouriers(couriers.filter((item) => item.price >= 0));
  if (!usable.length) return [];
  const lowestPrice = [...usable].sort(sortByPriceThenDays)[0];
  const fastest = [...usable].sort(sortByDaysThenPrice)[0];
  const cheaperSlower = [...usable]
    .filter((item) => item.deliveryHours !== null && fastest.deliveryHours !== null && item.deliveryHours > fastest.deliveryHours && item.price < fastest.price)
    .sort((a, b) => a.price - b.price || (b.deliveryHours ?? 0) - (a.deliveryHours ?? 0))[0];
  const longestDeliveryTime = [...usable].sort((a, b) => (b.deliveryHours ?? 0) - (a.deliveryHours ?? 0) || a.price - b.price)[0];
  const economy = cheaperSlower || longestDeliveryTime;
  const maxPrice = Math.max(...usable.map((item) => item.price), 1);
  const maxHours = Math.max(...usable.map((item) => item.deliveryHours ?? 24), 1);
  const recommended = [...usable].sort((a, b) => {
    const score = (item) =>
      (item.price / maxPrice) * 0.38 +
      ((item.deliveryHours ?? maxHours) / maxHours) * 0.42 -
      ((item.rating || 0) / 5) * 0.2;
    return score(a) - score(b);
  })[0];

  const options = [];
  distinctPush(options, economy, "Economy Option", "economy");
  distinctPush(options, recommended, "Recommended", "recommended");
  distinctPush(options, fastest, "Fastest Delivery", "fastest");

  const rankedFallbacks = [...usable].sort((a, b) => {
    const aScore = a.price * 0.45 + ((a.deliveryHours ?? maxHours) / 24) * 18 - (a.rating || 0) * 35;
    const bScore = b.price * 0.45 + ((b.deliveryHours ?? maxHours) / 24) * 18 - (b.rating || 0) * 35;
    return aScore - bScore;
  });
  for (const fallback of rankedFallbacks) {
    if (options.length >= 3) break;
    distinctPush(options, fallback, options.length === 1 ? "Recommended" : "Delivery Option", `option-${options.length + 1}`);
  }

  return options.slice(0, 3);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const email = firstEnvValue(["SHIPROCKET_EMAIL", "SHIPROCKET_API_EMAIL", "SHIPROCKET_API_USER", "SHIPROCKET_USER_EMAIL", "SHIPTROCKET_KEY_EMAIL"]);
  const password = firstEnvValue(["SHIPROCKET_PASSWORD", "SHIPROCKET_API_PASSWORD", "SHIPROCKET_API_PASS", "SHIPROCKET_USER_PASSWORD", "SHIPTROCKET_KEY_SECRET"]);

  if (!email || !password) {
    json(res, 500, { error: "Shiprocket API email/password are not configured on the server." });
    return;
  }

  const {
    deliveryPostcode,
    pickupPostcode: requestPickupPostcode,
    pickupAddress: requestPickupAddress,
    weight = 1,
    cod = 0,
    length,
    breadth,
    height,
    declaredValue,
  } = req.body || {};
  const pickupAddress =
    requestPickupAddress ||
    firstEnvValue(["SHIPROCKET_PICKUP_ADDRESS", "INVENTORY_ADDRESS", "REACT_APP_INVENTORY_ADDRESS"]) ||
    DEFAULT_PICKUP_ADDRESS;
  const pickupPostcode =
    cleanPincode(requestPickupPostcode) ||
    cleanPincode(firstEnvValue(["SHIPROCKET_PICKUP_PINCODE", "SHIPROCKET_PICKUP_POSTCODE", "INVENTORY_PINCODE", "REACT_APP_INVENTORY_PINCODE"])) ||
    DEFAULT_PICKUP_POSTCODE;
  const delivery = cleanPincode(deliveryPostcode);
  if (pickupPostcode.length !== 6) {
    json(res, 400, { error: "Inventory pickup pincode is not valid." });
    return;
  }
  if (delivery.length !== 6) {
    json(res, 400, { error: "Enter a valid 6-digit delivery pincode." });
    return;
  }

  try {
    const auth = await shiprocketRequest("/v1/external/auth/login", "POST", { email, password });
    const token = auth.token;
    if (!token) throw new Error("Shiprocket did not return an auth token.");

    const query = new URLSearchParams({
      pickup_postcode: pickupPostcode,
      delivery_postcode: delivery,
      cod: String(cod),
      weight: String(weight),
      rate_calculator: "1",
      ...(length ? { length: String(length) } : {}),
      ...(breadth ? { breadth: String(breadth) } : {}),
      ...(height ? { height: String(height) } : {}),
      ...(declaredValue ? { declared_value: String(declaredValue) } : {}),
    }).toString();
    const serviceability = await shiprocketRequest(`/v1/external/courier/serviceability/?${query}`, "GET", null, token);
    const rawCouriers = serviceability.data?.available_courier_companies || serviceability.available_courier_companies || [];
    const options = pickOptions(rawCouriers.map((item) => normalizeCourier(item, "shiprocket")));

    json(res, 200, {
      pickupAddress,
      pickupPostcode,
      deliveryPostcode: delivery,
      options,
      allCouriersCount: rawCouriers.length,
      uniqueCouriersCount: dedupeCouriers(rawCouriers.map((item) => normalizeCourier(item, "shiprocket"))).length,
      source: "shiprocket",
    });
  } catch (err) {
    json(res, 502, { error: err.message || "Unable to fetch Shiprocket delivery options." });
  }
};
