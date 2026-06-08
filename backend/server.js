const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID", // Use env var
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_SECRET_KEY",
});

// 👉 API 1: Create Order
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const order = await razorpay.orders.create({
    amount: amount * 100, // paisa
    currency: "INR",
  });

  res.json(order);
});

// 👉 API 2: Send Email
app.post("/send-mail", async (req, res) => {
  const { name, email, phone, city, product, price, paymentId } = req.body;

  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "your@gmail.com",
      pass: process.env.EMAIL_PASS || "your_app_password",
    },
  });

  const message = `
New Order

Name: ${name}
Email: ${email}
Phone: ${phone}
City: ${city}

Product: ${product}
Amount: ₹${price}
Payment ID: ${paymentId}
`;

  // Company mail
  await transporter.sendMail({
    from: process.env.EMAIL_USER || "your@gmail.com",
    to: "hello@arclabs.in",
    subject: "New Order",
    text: message,
  });

  // Buyer mail
  await transporter.sendMail({
    from: process.env.EMAIL_USER || "your@gmail.com",
    to: email,
    subject: "Payment Successful",
    text: `Hi ${name}, your payment was successful.\n\n${message}`,
  });

  res.send("Mail sent");
});

// Run server
app.listen(5000, () => console.log("Server running on port 5000"));