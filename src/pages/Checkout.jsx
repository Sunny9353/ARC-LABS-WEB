import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import "../styles/Checkout.css";
import { PRODUCTS } from "../data/products";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import { useBodyScrollLock, validateRequiredFields } from "../utils/ui";
import { normalizeProduct, subscribeProducts } from "../services/productsData";

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

async function createRazorpayOrder({ amount, product, form, deliveryOption, productPrice }) {
  const apiBaseUrl = checkoutApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/create-razorpay-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(amount),
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
        product_price: String(productPrice),
        delivery_charge: String(deliveryOption?.price || 0),
        delivery_partner: deliveryOption?.courierName || "",
        delivery_days: String(deliveryOption?.deliveryDays || ""),
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

async function fetchDeliveryOptions({ zip, product }) {
  const apiBaseUrl = checkoutApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/shiprocket-rates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deliveryPostcode: zip,
      pickupPostcode: product?.shipping?.pickupPincode,
      pickupAddress: product?.shipping?.pickupAddress,
      weight: product?.shipping?.applicableWeightKg || product?.shipping?.actualWeightKg || 1,
      length: product?.shipping?.lengthCm,
      breadth: product?.shipping?.breadthCm,
      height: product?.shipping?.heightCm,
      cod: product?.shipping?.paymentType === "cod" ? 1 : 0,
      declaredValue: product?.shipping?.shipmentValue || product?.price || 0,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not fetch delivery options.");
  return payload;
}

async function fetchIndianPincodeDetails(pin, signal) {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal });
  const payload = await response.json().catch(() => []);
  const result = Array.isArray(payload) ? payload[0] : null;
  const postOffice = result?.PostOffice?.[0];
  if (!response.ok || result?.Status !== "Success" || !postOffice) {
    throw new Error("Could not find this Indian pincode.");
  }
  return {
    city: postOffice.District || postOffice.Block || postOffice.Name || "",
    region: postOffice.State || "",
  };
}

function formatDeliveryEta(option = {}) {
  if (option.deliveryHours !== undefined && option.deliveryHours !== null && Number(option.deliveryHours) < 24) {
    const hours = Number(option.deliveryHours);
    if (hours === 0) return "Same day";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} mins`;
    return `${Math.ceil(hours)} hours`;
  }
  if (option.deliveryDays !== undefined && option.deliveryDays !== null) {
    return Number(option.deliveryDays) === 0 ? "Same day" : `${option.deliveryDays} days`;
  }
  return "ETA pending";
}

function paymentAttemptPayload({ form, product, productId, amount, productPrice, deliveryOption, razorpayOrderId = "" }) {
  return {
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone,
    customerCountry: form.country,
    customerAddress: form.address,
    customerCity: form.city,
    customerRegion: form.region,
    customerZip: form.zip,
    productId: product.id || productId,
    productName: product.name,
    productPrice,
    deliveryCharge: deliveryOption?.price || 0,
    deliveryOption: deliveryOption || null,
    amount,
    razorpayOrderId,
    createdAt: new Date(),
  };
}

async function recordFailedPayment({ form, product, productId, amount, productPrice, deliveryOption, error }) {
  await addDoc(collection(db, "paymentEvents"), {
    ...paymentAttemptPayload({ form, product, productId, amount, productPrice, deliveryOption, razorpayOrderId: error.metadata?.order_id || "" }),
    type: "payment_failed",
    status: "Failed",
    paymentId: error.metadata?.payment_id || "",
    paymentError: {
      code: error.code || "",
      description: error.description || "",
      source: error.source || "",
      step: error.step || "",
      reason: error.reason || "",
      metadata: error.metadata || {},
    },
  });
}

async function recordCancelledPayment({ form, product, productId, amount, productPrice, deliveryOption, razorpayOrderId, reason = "cancelled" }) {
  await addDoc(collection(db, "cancelledPayments"), {
    ...paymentAttemptPayload({ form, product, productId, amount, productPrice, deliveryOption, razorpayOrderId }),
    reason,
    status: "Cancelled",
  });
}

export default function Checkout() {
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const checkoutOutcomeRef = useRef(null);
  const checkoutSessionRef = useRef(`checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const paymentStartedRef = useRef(false);
  const paymentTimeoutRef = useRef(null);
  const formSnapshotRef = useRef({});
  const productSnapshotRef = useRef({});

  const productId = query.get("product");
  const price = query.get("price");
  const [products, setProducts] = useState(() => PRODUCTS.map(normalizeProduct));

  const product =
    products.find((p) => p.id === productId) ||
    (productId === ESSENTIAL_KIT.id ? ESSENTIAL_KIT : undefined);
  const productPrice = Number(price || product?.price || 0);

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
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [deliveryMeta, setDeliveryMeta] = useState({ allCouriersCount: 0, uniqueCouriersCount: 0 });
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("");
  const [pincodeError, setPincodeError] = useState("");

  const selectedDelivery = deliveryOptions.find((option) => option.id === selectedDeliveryId);
  const deliveryCharge = Number(selectedDelivery?.price || 0);
  const payableAmount = productPrice + deliveryCharge;

  useEffect(() => {
    productSnapshotRef.current = {
      productId: productId || "",
      productName: product?.name || "",
      productPrice,
    };
  }, [productId, product?.name, productPrice]);

  useEffect(() => {
    return subscribeProducts(setProducts, PRODUCTS);
  }, []);

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

  useEffect(() => {
    const sessionId = checkoutSessionRef.current;
    setDoc(doc(db, "checkoutSessions", sessionId), {
      ...productSnapshotRef.current,
      status: "opened",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true }).catch(() => {});

    return () => {
      if (checkoutOutcomeRef.current || paymentStartedRef.current) return;
      setDoc(doc(db, "checkoutSessions", sessionId), {
        status: "Abandoned",
        normalizedStatus: "abandoned",
        ...productSnapshotRef.current,
        formSnapshot: formSnapshotRef.current || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    formSnapshotRef.current = form;
    setDoc(doc(db, "checkoutSessions", checkoutSessionRef.current), {
      formSnapshot: form,
      updatedAt: new Date(),
    }, { merge: true }).catch(() => {});
  }, [form]);

  useEffect(() => {
    const pin = form.zip.replace(/[^\d]/g, "");
    setPincodeError("");
    if (form.country !== "India" || pin.length !== 6) {
      setPincodeStatus("");
      return undefined;
    }

    const controller = new AbortController();
    setPincodeStatus("Finding city and state...");
    const timer = setTimeout(async () => {
      try {
        const details = await fetchIndianPincodeDetails(pin, controller.signal);
        setForm((prev) => {
          if (prev.zip.replace(/[^\d]/g, "") !== pin) return prev;
          return {
            ...prev,
            city: details.city || prev.city,
            region: details.region || prev.region,
          };
        });
        setPincodeStatus("City and state filled from pincode.");
      } catch (err) {
        if (controller.signal.aborted) return;
        setPincodeStatus("");
        setPincodeError(err.message || "Could not auto-fill city and state. You can enter them manually.");
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [form.zip, form.country]);

  useEffect(() => {
    const pin = form.zip.replace(/[^\d]/g, "");
    const addressReady = form.country === "India" && form.city.trim() && form.region.trim() && pin.length === 6 && product;
    setSelectedDeliveryId("");
    setDeliveryOptions([]);
    setDeliveryMeta({ allCouriersCount: 0, uniqueCouriersCount: 0 });
    setDeliveryError("");
    if (!addressReady) {
      setDeliveryStatus("");
      return undefined;
    }

    let cancelled = false;
    setDeliveryStatus("Checking delivery partners...");
    const timer = setTimeout(async () => {
      try {
        const deliveryPayload = await fetchDeliveryOptions({ zip: pin, product });
        if (cancelled) return;
        const options = deliveryPayload.options || [];
        setDeliveryOptions(options);
        setDeliveryMeta({
          allCouriersCount: Number(deliveryPayload.allCouriersCount || 0),
          uniqueCouriersCount: Number(deliveryPayload.uniqueCouriersCount || options.length || 0),
        });
        setSelectedDeliveryId(options[1]?.id || options[0]?.id || "");
        setDeliveryStatus(options.length ? "Choose a delivery option" : "No delivery partners returned for this pincode.");
      } catch (err) {
        if (cancelled) return;
        setDeliveryStatus("");
        setDeliveryError(err.message || "Delivery options could not be loaded.");
      }
    }, 650);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.city, form.region, form.zip, form.country, product]);

  const updateField = (key, value) => {
    const nextValue = key === "zip" ? value.replace(/[^\d]/g, "").slice(0, 6) : value;
    setForm((prev) => ({ ...prev, [key]: nextValue }));
  };

  const handlePayment = async () => {
    if (!formRef.current || !validateRequiredFields(formRef.current)) return;
    if (!productPrice || !product) {
      setNotice({ type: "danger", title: "Kit unavailable", message: "Please go back and choose a valid product again." });
      return;
    }
    if (form.country === "India" && !selectedDelivery) {
      setNotice({ type: "info", title: "Select delivery", message: "Choose one Shiprocket delivery option so the final amount includes delivery charges." });
      return;
    }
    if (!razorpayLoaded || !window.Razorpay) {
      setNotice({ type: "info", title: "Payment is loading", message: "The secure payment system is still getting ready. Try again in a moment." });
      return;
    }
    setLoading(true);
    paymentStartedRef.current = true;
    checkoutOutcomeRef.current = null;
    setDoc(doc(db, "checkoutSessions", checkoutSessionRef.current), {
      status: "Payment Started",
      normalizedStatus: "payment_started",
      productId: productId || "",
      productName: product?.name || "",
      productPrice,
      amount: payableAmount,
      deliveryCharge,
      deliveryOption: selectedDelivery || null,
      formSnapshot: form,
      updatedAt: new Date(),
    }, { merge: true }).catch(() => {});
    if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);

    try {
      const razorpayOrder = await createRazorpayOrder({ amount: payableAmount, product, form, deliveryOption: selectedDelivery, productPrice });
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
          product_price: String(productPrice),
          delivery_charge: String(deliveryCharge),
          delivery_partner: selectedDelivery?.courierName || "",
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#00DC82" },
        timeout: 900,
        handler: async (response) => {
          checkoutOutcomeRef.current = "success";
          if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
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
              productPrice,
              deliveryCharge,
              deliveryOption: selectedDelivery || null,
              amount: payableAmount,
              paymentId,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              razorpaySignature: response.razorpay_signature || "",
              createdAt: new Date(),
              status: "Paid",
            }, { merge: true });
            await setDoc(doc(db, "checkoutSessions", checkoutSessionRef.current), {
              status: "Paid",
              normalizedStatus: "paid",
              paymentId,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              updatedAt: new Date(),
            }, { merge: true });

            setReceipt({
              receiptNo: `ARC-${Date.now().toString().slice(-8)}`,
              paymentId,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              productName: product.name,
              amount: payableAmount,
              productPrice,
              deliveryCharge,
              deliveryPartner: selectedDelivery?.courierName || "",
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
            if (checkoutOutcomeRef.current) return;
            if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
            setLoading(false);
            recordCancelledPayment({
              form,
              product,
              productId,
              amount: payableAmount,
              productPrice,
              deliveryOption: selectedDelivery,
              razorpayOrderId: razorpayOrder.id,
              reason: "cancelled",
            }).catch(() => {});
            setDoc(doc(db, "checkoutSessions", checkoutSessionRef.current), {
              status: "Cancelled",
              normalizedStatus: "cancelled",
              razorpayOrderId: razorpayOrder.id,
              updatedAt: new Date(),
            }, { merge: true }).catch(() => {});
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
        checkoutOutcomeRef.current = "failed";
        if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
        setLoading(false);
        const error = response?.error || {};
        recordFailedPayment({ form, product, productId, amount: payableAmount, productPrice, deliveryOption: selectedDelivery, error }).catch(() => {});
        setDoc(doc(db, "checkoutSessions", checkoutSessionRef.current), {
          status: "Failed",
          normalizedStatus: "failed",
          paymentId: error.metadata?.payment_id || "",
          razorpayOrderId: error.metadata?.order_id || razorpayOrder.id,
          paymentError: error,
          updatedAt: new Date(),
        }, { merge: true }).catch(() => {});
        setNotice({
          type: "danger",
          title: error.reason === "timeout" ? "Payment timed out" : "Payment failed",
          message: error.description || error.reason || "The payment provider could not complete this transaction.",
        });
      });
      rzp.open();
      paymentTimeoutRef.current = setTimeout(() => {
        if (checkoutOutcomeRef.current) return;
        checkoutOutcomeRef.current = "timeout";
        setLoading(false);
        setNotice({
          type: "info",
          title: "Payment timed out",
          message: "The secure payment window expired before completion. No amount is confirmed from this attempt, and you can safely try again.",
        });
      }, 900000);
    } catch (err) {
      if (paymentTimeoutRef.current) clearTimeout(paymentTimeoutRef.current);
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
            <div className="co-price">Rs. {productPrice.toLocaleString("en-IN")}</div>
            <div className="co-total-card">
              <span>Product price <b>Rs. {productPrice.toLocaleString("en-IN")}</b></span>
              <span>Delivery charges <b>Rs. {deliveryCharge.toLocaleString("en-IN")}</b></span>
              <strong>Total payable <b>Rs. {payableAmount.toLocaleString("en-IN")}</b></strong>
              <small>Product price is inclusive of all taxes and GST.</small>
            </div>
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

            <input type="text" placeholder="Pincode *" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} disabled={loading} required inputMode="numeric" pattern="[0-9]{6}" />
            {(pincodeStatus || pincodeError) && (
              <div className={`co-field-note ${pincodeError ? "error" : ""}`}>
                {pincodeError || pincodeStatus}
              </div>
            )}
            <input type="text" placeholder="City / District *" value={form.city} onChange={(e) => updateField("city", e.target.value)} disabled={loading} required />
            <input type="text" placeholder="State *" value={form.region} onChange={(e) => updateField("region", e.target.value)} disabled={loading} required />
            <textarea
              placeholder="House / Plot No., Building, Area, Street, Landmark *"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              disabled={loading}
              required
              rows={3}
            />

            {(deliveryStatus || deliveryError || deliveryOptions.length > 0) && (
              <div className="co-delivery-panel">
                <div className="co-delivery-head">
                  <strong>Delivery Options</strong>
                  <span>
                    {deliveryError || deliveryStatus}
                    {!deliveryError && deliveryOptions.length > 0 && deliveryMeta.allCouriersCount > deliveryOptions.length
                      ? ` (${deliveryOptions.length} best choices from ${deliveryMeta.allCouriersCount} couriers)`
                      : ""}
                  </span>
                </div>
                <div className="co-delivery-options">
                  {deliveryOptions.map((option) => (
                    <label className={`co-delivery-option ${selectedDeliveryId === option.id ? "active" : ""}`} key={`${option.id}-${option.label}`}>
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={selectedDeliveryId === option.id}
                        onChange={() => setSelectedDeliveryId(option.id)}
                        disabled={loading}
                      />
                      <span>
                        <b>{option.label}</b>
                        <strong>{option.courierName}</strong>
                      </span>
                      <em>{formatDeliveryEta(option)}</em>
                      <em>Rating {option.rating || "N/A"}</em>
                      <em>Rs. {Number(option.price || 0).toLocaleString("en-IN")}</em>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
