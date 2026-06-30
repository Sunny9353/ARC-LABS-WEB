const http = require("http");
const fs = require("fs");
const path = require("path");
const createRazorpayOrder = require("../api/create-razorpay-order");
const verifyRazorpayPayment = require("../api/verify-razorpay-payment");
const reportPaymentFailure = require("../api/report-payment-failure");

function loadEnvFile(fileName) {
  const envPath = path.resolve(__dirname, "..", fileName);
  if (!fs.existsSync(envPath)) return;

  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

loadEnvFile(".env");
loadEnvFile(".env.local");

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": process.env.LOCAL_WEB_ORIGIN || "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const routes = {
    "/api/create-razorpay-order": createRazorpayOrder,
    "/api/verify-razorpay-payment": verifyRazorpayPayment,
    "/api/report-payment-failure": reportPaymentFailure,
  };
  const handler = routes[req.url];

  if (!handler || req.method !== "POST") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (err) {
      sendJson(res, 400, { error: "Invalid JSON body." });
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", process.env.LOCAL_WEB_ORIGIN || "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    await handler(req, res);
  });
});

const port = Number(process.env.LOCAL_API_PORT || 3001);
server.listen(port, () => {
  console.log(`Local API server running on http://localhost:${port}`);
});
