import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../styles/Checkout.css";
import { PRODUCTS } from "../data/products";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "emailjs-com";
import jsPDF from "jspdf";

const ESSENTIAL_KIT = {
  id: "essential",
  name: "ARC LABS IoT Essential Kit",
  image: "/images/products/essential-kit.jpg",
};

export default function Checkout() {
  const query = new URLSearchParams(useLocation().search);
  const navigate = useNavigate();

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

  const [paymentMethod, setPaymentMethod] = useState("upi_manual");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay SDK
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

  const handlePayment = () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.region || !form.zip) {
      alert("Please fill all delivery address details");
      return;
    }
    if (!price || !product) {
      alert("Invalid product or price");
      return;
    }
    if (paymentMethod === "upi_manual" && !upiId.trim()) {
      alert("Please enter your UPI ID (e.g., user@okhdfcbank)");
      return;
    }
    if (!razorpayLoaded || !window.Razorpay) {
      alert("Payment system loading...");
      return;
    }

    setLoading(true);

    try {
      const amountInPaisa = Math.round(Number(price) * 100);
      const options = {
        key: "rzp_live_RpqmHVVJcg5JMQ",
        amount: amountInPaisa,
        currency: "INR",
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
          customer_state_code: "36",
          product_id: productId,
          product_name: product.name,
          payment_method: paymentMethod,
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#00DC82" },
      };

      if (paymentMethod === "upi_manual") {
        options.method = { upi: true };
        options.upi = { flow: "collect" };
        options.prefill.vpa = upiId;
      } else if (paymentMethod === "upi_qr") {
        options.method = { upi: true };
        options.upi = { flow: "qr" };
      } else if (paymentMethod === "card") {
        options.method = { card: true };
      } else if (paymentMethod === "netbanking") {
        options.method = { netbanking: true };
      }

options.handler = async function (response) {

  try {

    // SAVE ORDER TO FIREBASE
    await addDoc(collection(db, "orders"), {

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

      paymentId: response.razorpay_payment_id,

      paymentMethod: paymentMethod,

      createdAt: new Date(),

      status: "Paid"
    });

    // GENERATE PDF INVOICE
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("ARC LABS INVOICE", 20, 20);

    doc.setFontSize(12);

    doc.text(`Customer Name: ${form.name}`, 20, 40);
    doc.text(`Email: ${form.email}`, 20, 50);
    doc.text(`Phone: ${form.phone}`, 20, 60);
    doc.text(`Country: ${form.country}`, 20, 70);
    doc.text(`Address: ${form.address}`, 20, 80);
    doc.text(`City: ${form.city}`, 20, 90);
    doc.text(`Region/State: ${form.region}`, 20, 100);
    doc.text(`ZIP Code: ${form.zip}`, 20, 110);

    doc.text(`Product: ${product.name}`, 20, 130);
    doc.text(`Price: ₹${price} + GST`, 20, 140);

    doc.text(
      `Payment ID: ${response.razorpay_payment_id}`,
      20,
      160
    );

    doc.text(
      `Status: PAID`,
      20,
      170
    );

    doc.save(
      `${product.name}-Invoice.pdf`
    );

    // SEND EMAIL TO CLIENT
    await emailjs.send(

      "YOUR_SERVICE_ID",

      "YOUR_TEMPLATE_ID",

      {

        customer_name: form.name,

        customer_email: form.email,

        customer_phone: form.phone,

        product_name: product.name,

        product_price: price,

        payment_id:
          response.razorpay_payment_id,

      },

      "YOUR_PUBLIC_KEY"
    );

    // SEND EMAIL TO COMPANY
    await emailjs.send(

      "YOUR_SERVICE_ID",

      "YOUR_TEMPLATE_ID",

      {

        customer_name: form.name,

        customer_email:
          "hello@arclabs.in",

        customer_phone: form.phone,

        product_name: product.name,

        product_price: price,

        payment_id:
          response.razorpay_payment_id,

      },

      "YOUR_PUBLIC_KEY"
    );

    setLoading(false);

    alert(
      `Payment Successful!\n\nInvoice Generated & Email Sent`
    );

    setForm({
      name: "",
      email: "",
      phone: "",
      country: "India",
      address: "",
      city: "",
      region: "",
      zip: "",
    });

    setUpiId("");

    setTimeout(() => {

      navigate(
        "/products",
        { replace: true }
      );

    }, 2000);

  } catch (err) {

    setLoading(false);

    console.log(err);

    alert(
      "Payment completed but invoice/email failed"
    );
  }
};

      options.modal = {
        ondismiss: function () {
          setLoading(false);
          alert("Payment cancelled");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setLoading(false);
        alert("Payment failed: " + response.error.reason);
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      alert("Payment Error: " + err.message);
    }
  };

  const METHODS = [
    { id: "upi_manual", label: "UPI (ID)" },
    { id: "upi_qr", label: "UPI (QR)" },
    { id: "card", label: "Card" },
    { id: "netbanking", label: "Netbanking" },
  ];

  return (
    <>
    <Helmet>
      <title>Checkout — ARC LABS</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className="co-page">
      <div className="co-card">
        {/* LEFT: PRODUCT */}
        <div className="co-left">
<img
  src={product?.image}
  alt={product?.name}
  className="co-product-img"
/>
</div>

        {/* RIGHT: FORM */}
        <div className="co-right">
          <h3>Enter Your Details</h3>

          <input
            type="text"
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={loading}
            required
          />

          <input
            type="email"
            placeholder="Email Address *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            required
          />

          <input
            type="tel"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={loading}
            required
            pattern="[0-9]{10}"
          />

          <h4 className="co-section-heading" style={{ marginTop: "1rem", marginBottom: "0.4rem", fontSize: "0.95rem", fontWeight: 600 }}>
            Shipping / Delivery Address
          </h4>

          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            disabled={loading}
            required
            className="co-select"
            style={{ width: "100%", padding: "12px 14px", marginBottom: "10px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)", color: "inherit", fontSize: "0.9rem" }}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Singapore">Singapore</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Street Address (House No., Street, Area) *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={loading}
            required
          />

          <input
            type="text"
            placeholder="City *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            disabled={loading}
            required
          />

          <input
            type="text"
            placeholder="State / Region *"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            disabled={loading}
            required
          />

          <input
            type="text"
            placeholder="ZIP / Postal Code *"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            disabled={loading}
            required
          />

          {/* PAYMENT METHOD SELECTION */}
          <div className="co-methods-section">
            <label className="co-methods-label">Select Payment Method:</label>
            <div className="co-method-grid">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`co-method-btn${paymentMethod === m.id ? " active" : ""}`}
                  onClick={() => setPaymentMethod(m.id)}
                  disabled={loading}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* UPI ID INPUT */}
          {paymentMethod === "upi_manual" && (
            <input
              type="text"
              placeholder="Enter UPI ID (e.g., user@okhdfcbank)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={loading}
              className="co-upi-input"
            />
          )}

          {/* PAYMENT BUTTON */}
          <button
            className="btn btn-primary co-pay-btn"
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
          >
            {loading ? "Processing..." : `Pay ₹${price}`}
          </button>

          <p className="co-note">Your payment information is secure and encrypted</p>
        </div>
      </div>
    </div>
    </>
  );
}
