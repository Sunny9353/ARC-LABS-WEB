const https = require("https");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function createRazorpayOrder({ keyId, keySecret, amount, currency, receipt, notes }) {
  const payload = JSON.stringify({
    amount,
    currency,
    receipt,
    notes,
    payment_capture: 1,
  });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.razorpay.com",
        path: "/v1/orders",
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (razorpayRes) => {
        let data = "";
        razorpayRes.on("data", (chunk) => {
          data += chunk;
        });
        razorpayRes.on("end", () => {
          let parsed = {};
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (err) {
            reject(new Error("Razorpay returned an invalid response."));
            return;
          }

          if (razorpayRes.statusCode >= 200 && razorpayRes.statusCode < 300) {
            resolve(parsed);
            return;
          }

          reject(new Error(parsed.error?.description || parsed.error?.reason || "Razorpay order creation failed."));
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

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    json(res, 500, { error: "Razorpay keys are not configured on the server." });
    return;
  }

  const { amount, currency = "INR", receipt, notes = {} } = req.body || {};
  const amountInPaisa = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountInPaisa) || amountInPaisa < 100) {
    json(res, 400, { error: "Invalid payment amount." });
    return;
  }

  try {
    const order = await createRazorpayOrder({
      keyId,
      keySecret,
      amount: amountInPaisa,
      currency,
      receipt: receipt || `arc_${Date.now()}`,
      notes,
    });

    json(res, 200, {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      keyId,
    });
  } catch (err) {
    json(res, 502, { error: err.message || "Unable to create Razorpay order." });
  }
};
