import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import "../styles/Checkout.css";
import { PRODUCTS } from "../data/products";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import { useBodyScrollLock, validateRequiredFields } from "../utils/ui";

const ESSENTIAL_KIT = {
  id: "essential",
  name: "ARC LABS IoT Essential Kit",
  image: "/images/products/essential-kit.jpg",
};

function CheckoutDialog({ type = "info", title, message, children, onClose }) {
  useBodyScrollLock(true);
  const icon = type === "danger" ? "x" : type === "success" ? "OK" : "!";

  const dialog = (
    <div className="co-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`co-dialog co-dialog-${type}`}>
        <div className="co-dialog-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="co-dialog-actions">
          {children || (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
}

function downloadReceipt(receipt) {
  const doc = new jsPDF();
  const rows = [
    ["Receipt No.", receipt.receiptNo],
    ["Payment ID", receipt.paymentId],
    ["Status", "Paid"],
    ["Product", receipt.productName],
    ["Amount", `INR ${receipt.amount}`],
    ["Customer", receipt.customerName],
    ["Email", receipt.customerEmail],
    ["Phone", receipt.customerPhone],
    ["Shipping", receipt.shipping],
    ["Date", receipt.date],
  ];

  doc.setFillColor(0, 220, 130);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(9, 9, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ARC LABS PAYMENT RECEIPT", 18, 23);

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your purchase. Keep this receipt for your records.", 18, 50);

  let y = 68;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 18, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value || "-"), 72, y, { maxWidth: 112 });
    y += label === "Shipping" ? 18 : 10;
  });

  doc.setDrawColor(0, 220, 130);
  doc.roundedRect(18, y + 8, 174, 28, 3, 3);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 140, 95);
  doc.text("Payment completed successfully", 28, y + 25);
  doc.save(`${receipt.productName}-receipt.pdf`);
}

function ReceiptDialog({ receipt, onClose }) {
  return (
    <CheckoutDialog
      type="success"
      title="Payment successful"
      message="Your order is confirmed. The receipt is ready whenever you want to download it."
      onClose={onClose}
    >
      <div className="co-receipt">
        <div className="co-receipt-top">
          <span>Paid</span>
          <strong>Rs. {Number(receipt.amount).toLocaleString("en-IN")}</strong>
        </div>
        {[
          ["Receipt", receipt.receiptNo],
          ["Payment ID", receipt.paymentId],
          ["Product", receipt.productName],
          ["Customer", receipt.customerName],
          ["Shipping", receipt.shipping],
        ].map(([label, value]) => (
          <div className="co-receipt-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Close
      </button>
      <button type="button" className="btn btn-primary" onClick={() => downloadReceipt(receipt)}>
        Download
      </button>
    </CheckoutDialog>
  );
}

function checkoutApiBaseUrl() {
  const isLocalhost =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const defaultApiBaseUrl = isLocalhost ? "http://localhost:3001" : "";
  return (process.env.REACT_APP_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, "");
}

async function createRazorpayOrder({ price, product, form }) {
  const apiBaseUrl = checkoutApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/create-razorpay-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(price),
      currency: "INR",
      receipt: `arc_${Date.now()}`,
      notes: {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_country: form.country,
        customer_address: form.address,
        customer_city: form.city,
        customer_region: form.region,
        customer_zip: form.zip,
        product_id: product.id,
        product_name: product.name,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not create Razorpay order.");
  }
  if (!payload.id) {
    throw new Error("Razorpay order was created without an order ID.");
  }
  return payload;
}

async function verifyRazorpayPayment(response) {
  const apiBaseUrl = checkoutApiBaseUrl();
  const verifyResponse = await fetch(`${apiBaseUrl}/api/verify-razorpay-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });

  const payload = await verifyResponse.json().catch(() => ({}));
  if (!verifyResponse.ok || !payload.verified) {
    throw new Error(payload.error || "Payment verification failed.");
  }
}

export default function Checkout() {
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const productId = query.get("product");
  const price = query.get("price");

  const product =
    PRODUCTS.find((p) => p.id === productId) ||
    (productId === ESSENTIAL_KIT.id ? ESSENTIAL_KIT : undefined);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "India",
    address: "",
    city: "",
    region: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmBack, setConfirmBack] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setRazorpayLoaded(false);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePayment = async () => {
    if (!formRef.current || !validateRequiredFields(formRef.current)) return;
    if (!price || !product) {
      setNotice({ type: "danger", title: "Kit unavailable", message: "Please go back and choose a valid product again." });
      return;
    }
    if (!razorpayLoaded || !window.Razorpay) {
      setNotice({ type: "info", title: "Payment is loading", message: "The secure payment system is still getting ready. Try again in a moment." });
      return;
    }
    setLoading(true);

    try {
      const razorpayOrder = await createRazorpayOrder({ price, product, form });
      const razorpayKeyId = razorpayOrder.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error("Razorpay key ID is missing.");
      }
      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        order_id: razorpayOrder.id,
        name: "ARC LABS",
        description: `Purchase: ${product.name}`,
        notes: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_country: form.country,
          customer_address: form.address,
          customer_city: form.city,
          customer_region: form.region,
          customer_zip: form.zip,
          product_id: productId,
          product_name: product.name,
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#00DC82" },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment(response);
            const paymentId = response.razorpay_payment_id;
            await setDoc(doc(db, "orders", paymentId), {
              customerName: form.name,
              customerEmail: form.email,
              customerPhone: form.phone,
              customerCountry: form.country,
              customerAddress: form.address,
              customerCity: form.city,
              customerRegion: form.region,
              customerZip: form.zip,
              productId: product.id,
              productName: product.name,
              productPrice: price,
              paymentId,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              razorpaySignature: response.razorpay_signature || "",
              createdAt: new Date(),
              status: "Paid",
            }, { merge: true });

            setReceipt({
              receiptNo: `ARC-${Date.now().toString().slice(-8)}`,
              paymentId,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              productName: product.name,
              amount: price,
              customerName: form.name,
              customerEmail: form.email,
              customerPhone: form.phone,
              shipping: `${form.address}, ${form.city}, ${form.region} - ${form.zip}, ${form.country}`,
              date: new Date().toLocaleString("en-IN"),
            });
            setLoading(false);
          } catch (err) {
            setLoading(false);
            setNotice({
              type: "danger",
              title: "Receipt sync failed",
              message: "Payment completed, but saving the order failed. Please contact ARC LABS with your payment ID.",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setNotice({
              type: "danger",
              title: "Payment cancelled",
              message: "No amount was captured. You can review your details and start the payment again.",
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        setLoading(false);
        const error = response?.error || {};
        setNotice({
          type: "danger",
          title: "Payment failed",
          message: error.description || error.reason || "The payment provider could not complete this transaction.",
        });
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      setNotice({ type: "danger", title: "Payment setup failed", message: err.message });
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - ARC LABS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="co-page">
        <div className="co-card">
          <button type="button" className="co-back-btn" onClick={() => setConfirmBack(true)}>
            Back
          </button>

          <div className="co-left">
            <img src={product?.image} alt={product?.name} className="co-product-img" />
            <h2>{product?.name || "ARC LABS Kit"}</h2>
            <div className="co-price">Rs. {Number(price || 0).toLocaleString("en-IN")}</div>
          </div>

          <form className="co-right" ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <h3>Enter Your Details</h3>

            <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => updateField("name", e.target.value)} disabled={loading} required />
            <input type="email" placeholder="Email Address *" value={form.email} onChange={(e) => updateField("email", e.target.value)} disabled={loading} required />
            <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} disabled={loading} required pattern="[0-9]{10}" />

            <h4 className="co-section-heading">Shipping / Delivery Address</h4>

            <select value={form.country} onChange={(e) => updateField("country", e.target.value)} disabled={loading} required className="co-select">
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Singapore">Singapore</option>
              <option value="Australia">Australia</option>
              <option value="Canada">Canada</option>
              <option value="Other">Other</option>
            </select>

            <input type="text" placeholder="Street Address (House No., Street, Area) *" value={form.address} onChange={(e) => updateField("address", e.target.value)} disabled={loading} required />
            <input type="text" placeholder="City *" value={form.city} onChange={(e) => updateField("city", e.target.value)} disabled={loading} required />
            <input type="text" placeholder="State / Region *" value={form.region} onChange={(e) => updateField("region", e.target.value)} disabled={loading} required />
            <input type="text" placeholder="ZIP / Postal Code *" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} disabled={loading} required />

            <button className="btn btn-primary co-pay-btn" type="button" onClick={handlePayment} disabled={loading || !razorpayLoaded}>
              {loading ? "Processing..." : "Make Payment"}
            </button>

            <p className="co-note">Your payment information is secure and encrypted</p>
          </form>
        </div>
      </div>

      {notice && (
        <CheckoutDialog
          type={notice.type}
          title={notice.title}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}

      {confirmBack && (
        <CheckoutDialog
          type="info"
          title="Leave checkout?"
          message="Your kit is almost ready to order. Going back will keep you in control, but this checkout will close."
          onClose={() => setConfirmBack(false)}
        >
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmBack(false)}>
            No
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
            Yes
          </button>
        </CheckoutDialog>
      )}

      {receipt && <ReceiptDialog receipt={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}
