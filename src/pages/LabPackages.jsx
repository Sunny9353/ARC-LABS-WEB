import React, { useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Helmet } from "react-helmet-async";

/* ═══════════════════════════════════════════════════════════════════
   SCOPED STYLES — uses global design tokens from global.css
═══════════════════════════════════════════════════════════════════ */
const pageStyles = `
/* Hero */
.lp-hero { padding: 100px 5vw 60px; position: relative; overflow: hidden; }
.lp-hero-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 65%),
    radial-gradient(ellipse 40% 40% at 20% 80%, rgba(59,130,246,0.04) 0%, transparent 60%);
}
.lp-hero-inner {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4rem; align-items: center;
}
@media(max-width:900px) { .lp-hero-inner { grid-template-columns: 1fr; gap: 2.5rem; } }

.lp-hero h1 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: 1.06; letter-spacing: -.035em; margin-bottom: 1.2rem;
  color: var(--text-1);
}
.lp-hero h1 em { font-style: normal; color: var(--accent); }
.lp-hero p {
  color: var(--text-3); font-size: .97rem;
  max-width: 480px; line-height: 1.8; margin-bottom: 2rem;
}

/* Stat cards */
.lp-stats { display: flex; flex-direction: column; gap: 1rem; }
.lp-stat {
  background: var(--surface-2); border: 1px solid var(--border-1);
  border-radius: 14px; padding: 18px 20px; position: relative; overflow: hidden;
  transition: transform .3s;
}
.lp-stat:hover { transform: translateX(4px); }
.lp-stat::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 3px; height: 100%; background: var(--stat-color, var(--accent));
}
.lp-stat-row { display: flex; align-items: center; justify-content: space-between; }
.lp-stat-num {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: 1.7rem; line-height: 1; color: var(--stat-color, var(--accent));
}
.lp-stat-badge {
  font-size: .65rem; font-family: 'JetBrains Mono', monospace;
  padding: 3px 8px; border-radius: 4px; letter-spacing: .06em;
  background: rgba(255,255,255,0.06); color: var(--stat-color, var(--accent));
}
.lp-stat-label { font-size: .78rem; color: var(--text-3); margin-top: 4px; }
.lp-stat-bar { height: 3px; background: var(--border-1); border-radius: 2px; margin-top: 10px; overflow: hidden; }
.lp-stat-fill { height: 100%; border-radius: 2px; animation: lpFill 2s ease-out; }
@keyframes lpFill { from { width: 0; } }

/* Audience switcher */
.lp-audience-bar { display: flex; justify-content: center; gap: .5rem; padding: 0 5vw 52px; }
.lp-aud-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; border-radius: 9px;
  border: 1px solid var(--border-2); background: var(--surface);
  color: var(--text-3); font-size: .85rem; font-weight: 500;
  cursor: pointer; transition: all .25s; font-family: inherit;
}
.lp-aud-btn.active {
  background: rgba(0,212,170,0.09); border-color: var(--accent); color: var(--accent);
}

/* Packages grid */
.lp-pkg-section { padding: 0 5vw 80px; }
.lp-pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: start; }
@media(max-width:900px) { .lp-pkg-grid { grid-template-columns: 1fr; } }
@media(min-width:901px) and (max-width:1100px) { .lp-pkg-grid { grid-template-columns: 1fr 1fr; } }

/* Package card */
.lp-card {
  border-radius: 20px; overflow: hidden; border: 1px solid var(--border-1);
  background: var(--surface-2); position: relative;
  transition: all .35s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column;
}
.lp-card:hover { transform: translateY(-6px); box-shadow: 0 28px 70px rgba(0,0,0,.5); }
.lp-card.featured {
  border-color: var(--accent);
  background: linear-gradient(160deg, rgba(0,212,170,0.05) 0%, var(--surface-2) 50%);
  box-shadow: 0 0 0 1px var(--accent), 0 20px 60px rgba(0,212,170,0.1);
}
.lp-card-bar { height: 4px; }
.lp-popular {
  position: absolute; top: 20px; right: 16px;
  background: var(--accent); color: var(--bg);
  font-family: 'JetBrains Mono', monospace; font-size: .58rem; font-weight: 700;
  padding: 4px 10px; border-radius: 5px; letter-spacing: .07em;
}
.lp-card-head { padding: 26px 26px 0; }
.lp-card-tier {
  font-family: 'JetBrains Mono', monospace; font-size: .62rem;
  letter-spacing: .1em; text-transform: uppercase; margin-bottom: .5rem;
}
.lp-card-name {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.35rem;
  letter-spacing: -.025em; margin-bottom: .3rem; color: var(--text-1);
}
.lp-card-tagline { font-size: .8rem; color: var(--text-3); line-height: 1.55; margin-bottom: 1.2rem; }

/* Price block */
.lp-price-block {
  background: var(--surface-3); border-radius: 12px; padding: 16px 18px;
  margin: 0 0 1.4rem; border: 1px solid var(--border-1);
}
.lp-price {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.2rem;
  letter-spacing: -.03em; line-height: 1;
}
.lp-price span { font-size: .9rem; font-weight: 400; color: var(--text-3); }
.lp-price-sub { font-size: .72rem; color: var(--text-3); margin-top: 5px; }
.lp-price-note {
  display: inline-flex; align-items: center; gap: 5px; margin-top: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: .6rem;
  color: var(--accent); background: rgba(0,212,170,0.08);
  padding: 3px 10px; border-radius: 4px;
}

/* Features list */
.lp-includes { padding: 0 26px; flex: 1; }
.lp-includes h4 {
  font-family: 'JetBrains Mono', monospace; font-size: .62rem;
  color: var(--text-3); letter-spacing: .1em; text-transform: uppercase; margin-bottom: .9rem;
}
.lp-feat-list { list-style: none; margin-bottom: 1.2rem; padding: 0; }
.lp-feat-list li {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: .82rem; color: var(--text-2); padding: 7px 0 7px 18px;
  border-bottom: 1px solid var(--border-1); line-height: 1.5; position: relative;
}
.lp-feat-list li::before {
  content: '+'; position: absolute; left: 0;
  color: var(--accent); font-weight: 700; font-size: .85rem;
  font-family: 'JetBrains Mono', monospace;
}
.lp-feat-list li:last-child { border-bottom: none; }
.lp-feat-list b { color: var(--text-1); font-weight: 600; display: block; margin-bottom: 1px; }
.lp-feat-list span { font-size: .75rem; }

/* Audience tags */
.lp-aud-tags { padding: 0 26px; margin-bottom: 1.2rem; display: flex; gap: 5px; flex-wrap: wrap; }
.lp-aud-tag {
  font-size: .68rem; padding: 3px 9px; border-radius: 4px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border-1); color: var(--text-3);
}

/* Specs strip */
.lp-specs { display: flex; gap: .5rem; flex-wrap: wrap; padding: 0 26px; margin: 4px 0 10px; }
.lp-spec {
  background: var(--surface-3); border-radius: 7px; padding: 6px 10px; font-size: .68rem;
}
.lp-spec span { color: var(--text-3); text-transform: capitalize; }

/* Card footer */
.lp-card-foot { padding: 16px 26px 22px; display: flex; flex-direction: column; gap: .6rem; }

/* Inside section tabs */
.lp-inside { padding: 0 5vw 80px; }
.lp-tabs { display: flex; gap: .5rem; margin-bottom: 2rem; flex-wrap: wrap; }
.lp-tab {
  padding: 9px 20px; border-radius: 8px;
  border: 1px solid var(--border-2); background: transparent;
  color: var(--text-3); font-size: .8rem; font-weight: 500;
  cursor: pointer; transition: all .22s; font-family: inherit;
}
.lp-tab.active { background: var(--surface-3); border-color: var(--border-2); color: var(--text-1); }

.lp-inside-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem;
}
.lp-inside-item {
  background: var(--surface-2); border: 1px solid var(--border-1); border-radius: 12px;
  padding: 18px; display: flex; gap: 13px; align-items: flex-start; transition: border-color .2s;
}
.lp-inside-item:hover { border-color: var(--border-2); }
.lp-ins-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; font-family: 'JetBrains Mono', monospace;
}
.lp-ins-name { font-family: 'Syne', sans-serif; font-size: .85rem; font-weight: 700; margin-bottom: 3px; color: var(--text-1); }
.lp-ins-desc { font-size: .75rem; color: var(--text-3); line-height: 1.55; }
.lp-ins-tag {
  display: inline-block; margin-top: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: .58rem;
  padding: 2px 8px; border-radius: 3px; letter-spacing: .05em;
}

/* Process timeline */
.lp-process {
  padding: 80px 5vw; background: var(--surface);
  border-top: 1px solid var(--border-1); border-bottom: 1px solid var(--border-1);
}
.lp-proc-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0; position: relative; margin-top: 3rem;
}
.lp-proc-grid::before {
  content: ''; position: absolute; top: 28px; left: 5%; right: 5%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--blue), var(--amber), transparent);
  opacity: .3;
}
.lp-proc-step {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 0 12px; position: relative;
}
.lp-proc-num {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem;
  margin-bottom: 1rem; position: relative; z-index: 1;
  border: 2px solid var(--ps-color, var(--accent));
  background: var(--bg); color: var(--ps-color, var(--accent));
}
.lp-proc-title { font-family: 'Syne', sans-serif; font-size: .9rem; font-weight: 700; margin-bottom: .3rem; color: var(--text-1); }
.lp-proc-desc { font-size: .77rem; color: var(--text-3); line-height: 1.6; max-width: 160px; }
.lp-proc-time {
  margin-top: .6rem;
  font-family: 'JetBrains Mono', monospace; font-size: .6rem;
  color: var(--ps-color, var(--accent)); letter-spacing: .08em;
  background: rgba(0,212,170,0.07); padding: 3px 10px; border-radius: 4px;
}

/* ROI Calculator */
.lp-roi { padding: 80px 5vw; }
.lp-roi-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
@media(max-width:768px) { .lp-roi-inner { grid-template-columns: 1fr; gap: 2rem; } }
.lp-roi-form {
  background: var(--surface-2); border: 1px solid var(--border-2); border-radius: 20px; padding: 32px;
}
.lp-roi-form h3 {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem;
  letter-spacing: -.02em; margin-bottom: 1.5rem; color: var(--text-1);
}
.lp-roi-row { margin-bottom: 1.2rem; }
.lp-roi-row label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .78rem; font-weight: 600; color: var(--text-2); margin-bottom: 7px;
}
.lp-roi-row label span {
  font-family: 'JetBrains Mono', monospace; font-size: .72rem;
  color: var(--accent); background: rgba(0,212,170,0.1);
  padding: 2px 9px; border-radius: 4px;
}
.lp-slider {
  width: 100%; -webkit-appearance: none; appearance: none;
  height: 4px; border-radius: 2px; outline: none; cursor: pointer;
  background: var(--border-2);
}
.lp-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px;
  background: var(--accent); border-radius: 50%; cursor: pointer;
  box-shadow: 0 0 10px rgba(0,212,170,0.4);
}
.lp-roi-metric {
  background: var(--surface-2); border: 1px solid var(--border-1); border-radius: 14px;
  padding: 20px; position: relative; overflow: hidden;
}
.lp-roi-metric::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--rm-color, var(--accent)), transparent);
}
.lp-roi-metric-label {
  font-size: .72rem; color: var(--text-3); text-transform: uppercase;
  letter-spacing: .07em; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace;
}
.lp-roi-metric-val {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem;
  letter-spacing: -.025em; color: var(--rm-color, var(--accent));
}
.lp-roi-metric-sub { font-size: .75rem; color: var(--text-3); margin-top: 3px; }
.lp-metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

/* CSR callout */
.lp-csr-callout {
  margin: 0 5vw 80px; padding: 40px;
  background: linear-gradient(135deg, rgba(0,212,170,0.05), rgba(59,130,246,0.05));
  border: 1px solid rgba(0,212,170,0.2); border-radius: 20px;
  position: relative; overflow: hidden;
}
.lp-csr-callout::before {
  content: 'CSR'; position: absolute; right: -10px; top: -20px;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 8rem;
  opacity: .03; letter-spacing: -.05em; color: var(--accent); pointer-events: none;
}
.lp-csr-inner { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: center; }
@media(max-width:640px) { .lp-csr-inner { grid-template-columns: 1fr; } }

/* FAQ */
.lp-faq { padding: 80px 5vw; background: var(--surface); border-top: 1px solid var(--border-1); }
.lp-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2.8rem; }
@media(max-width:768px) { .lp-faq-grid { grid-template-columns: 1fr; } }
.lp-faq-item {
  background: var(--surface-2); border: 1px solid var(--border-1); border-radius: 12px;
  overflow: hidden; cursor: pointer; transition: border-color .2s;
}
.lp-faq-item:hover { border-color: var(--border-2); }
.lp-faq-item.open { border-color: rgba(0,212,170,0.25); }
.lp-faq-q {
  padding: 18px 20px; display: flex; justify-content: space-between;
  align-items: center; gap: 1rem;
}
.lp-faq-q span:first-child { font-size: .87rem; font-weight: 600; line-height: 1.45; color: var(--text-1); }
.lp-faq-toggle {
  width: 26px; height: 26px; border-radius: 6px; flex-shrink: 0;
  background: var(--surface-3); display: flex; align-items: center; justify-content: center;
  font-size: .75rem; color: var(--text-3); transition: all .2s;
}
.lp-faq-item.open .lp-faq-toggle { background: rgba(0,212,170,0.1); color: var(--accent); }
.lp-faq-a {
  padding: 0 20px 18px; font-size: .83rem; color: var(--text-3); line-height: 1.7;
  border-top: 1px solid var(--border-1); animation: lpFadeIn .25s ease;
}
@keyframes lpFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

/* Bottom CTA */
.lp-bottom-cta {
  padding: 100px 5vw; text-align: center;
  border-top: 1px solid var(--border-1); position: relative; overflow: hidden;
}
.lp-bottom-cta::before {
  content: ''; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%); width: 700px; height: 500px;
  background: radial-gradient(ellipse, rgba(0,212,170,0.06) 0%, transparent 65%);
  pointer-events: none;
}
.lp-bottom-cta h2 {
  font-family: 'Syne', sans-serif; font-weight: 800;
  font-size: clamp(2rem, 4.5vw, 3.2rem); letter-spacing: -.03em; line-height: 1.08;
  margin-bottom: .8rem; position: relative; color: var(--text-1);
}
.lp-bottom-cta h2 em { font-style: normal; color: var(--accent); }
.lp-bottom-cta p { color: var(--text-3); font-size: .95rem; margin-bottom: 2.2rem; position: relative; }

/* Modal */
.lp-modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(9,9,11,.9); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
  animation: lpFadeIn .2s ease;
}
.lp-modal {
  background: var(--surface-3); border: 1px solid var(--border-2);
  border-radius: 22px; width: 100%; max-width: 560px;
  max-height: 92vh; overflow-y: auto; position: relative;
  animation: lpModalIn .32s cubic-bezier(.34,1.56,.64,1);
}
@keyframes lpModalIn { from{opacity:0;transform:scale(.91)} to{opacity:1;transform:scale(1)} }
.lp-modal-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(255,255,255,.07); border: none; color: var(--text-3);
  width: 30px; height: 30px; border-radius: 7px; font-size: .9rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.lp-modal-close:hover { background: rgba(255,255,255,.13); color: var(--text-1); }
.lp-modal-head { padding: 30px 30px 20px; border-bottom: 1px solid var(--border-1); }
.lp-modal-head h3 {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.25rem;
  margin-bottom: .3rem; letter-spacing: -.02em; color: var(--text-1);
}
.lp-modal-head p { font-size: .82rem; color: var(--text-3); line-height: 1.6; }
.lp-modal-pkg {
  margin-top: 1rem; padding: 14px 16px; background: var(--surface-2);
  border: 1px solid var(--border-2); border-radius: 10px;
  display: flex; align-items: center; gap: 12px;
}
.lp-modal-body { padding: 22px 30px 30px; }
.lp-form-row { margin-bottom: .9rem; }
.lp-form-row label {
  display: block; font-size: .74rem; font-weight: 600;
  color: var(--text-2); margin-bottom: 5px; letter-spacing: .03em;
}
.lp-form-row input, .lp-form-row select, .lp-form-row textarea {
  width: 100%; background: var(--surface-2); border: 1px solid var(--border-2);
  border-radius: 8px; color: var(--text-1); font-family: inherit;
  font-size: .86rem; padding: 10px 13px; outline: none; transition: border-color .2s;
}
.lp-form-row input:focus, .lp-form-row select:focus, .lp-form-row textarea:focus {
  border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,212,170,.07);
}
.lp-form-row select option { background: var(--surface-3); }
.lp-form-row textarea { resize: vertical; min-height: 74px; }
.lp-form-2 { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
@media(max-width:460px) { .lp-form-2 { grid-template-columns: 1fr; } }
.lp-form-note { font-size: .7rem; color: var(--text-3); text-align: center; margin-top: .8rem; }
.lp-modal-success { padding: 48px 30px; text-align: center; }
.lp-modal-success h3 {
  font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800;
  color: var(--accent); margin-bottom: .5rem;
}
.lp-modal-success p { color: var(--text-3); font-size: .86rem; line-height: 1.75; }
`;

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
const PACKAGES = {
  school: [
    {
      id: "school-starter", tier: "PACKAGE 01", name: "Starter Lab",
      tagline: "Launch a functional IoT classroom with minimal investment. Perfect for schools beginning their STEM journey.",
      price: "₹2.5L", priceNum: 250000, priceNote: "CSR funding eligible",
      color: "var(--amber)", colorHex: "#f59e0b", featured: false, badge: "SCH",
      audience: ["Primary & Middle School", "Classes 6–9", "50–100 Students/Year"],
      features: [
        { title: "ARC Lab's IoT Lite Kit x 10 units", detail: "Arduino + ESP32, sensors, relay — all essentials" },
        { title: "NEP 2020 Curriculum — Level 1", detail: "30 sessions mapped to CBSE skill subjects" },
        { title: "Teacher Training — 2 Days", detail: "Onsite certification for 2 faculty members" },
        { title: "Lab Branding & Installation", detail: "ARC LABS co-branded lab setup" },
        { title: "6-Month Support Contract", detail: "Remote + 2 onsite visits included" },
        { title: "Digital Student Workbooks", detail: "30 project-based worksheets" },
        {title: "Basic STEM Activity Modules",detail: "Hands-on beginner experiments for IoT and electronics learning"},
        {title: "Plug & Play Lab Setup",detail: "Ready-to-use hardware installation with quick classroom deployment"},
        {title: "Mini Project Demonstrations",detail: "Guided practical projects for real-time application understanding"},
      ],
      specs: { students: "50–100/yr", space: "20x15 ft min", setup: "1–2 days", warranty: "1 year" },
    },
    {
      id: "school-standard", tier: "PACKAGE 02", name: "Standard Lab",
      tagline: "The complete school IoT + Robotics lab. Most popular package for CBSE schools seeking full STEM capability.",
      price: "₹5L", priceNum: 500000, priceNote: "ATL-compatible · CSR eligible",
      color: "var(--accent)", colorHex: "#00d4aa", featured: true, badge: "STD",
      audience: ["High School", "Classes 8–12", "100–200 Students/Year"],
      features: [
        { title: "ARC Lab's IoT Pro Kit x 15 units", detail: "Raspberry Pi + ESP32, full sensor suite" },
        { title: "Robotics Starter Kit x 10 units", detail: "Wheeled robots with obstacle avoidance" },
        { title: "Full Curriculum — Levels 1 & 2", detail: "60 sessions, IoT + Robotics tracks" },
        { title: "Teacher Certification — 3 Days", detail: "Level 1 + Level 2 for up to 4 faculty" },
        { title: "Complete Lab Installation", detail: "Co-branded, furniture layout, signage" },
        { title: "Annual Support + Updates", detail: "Quarterly curriculum refresh included" },
        { title: "Student Assessment Portal", detail: "Digital grading, progress tracking" },
        { title: "Cloud Platform Access", detail: "Arc Lab Cloud for all student projects" },
        {title: "Industry Project Showcase Access",detail: "Students can publish and present real-world IoT & Robotics projects"},
      ],
      specs: { students: "100–200/yr", space: "25x20 ft min", setup: "2–3 days", warranty: "2 years" },
    },
    {
      id: "school-premier", tier: "PACKAGE 03", name: "Premier IoT & Robotics Lab",
      tagline: "ARC LABS' flagship school lab. Full IoT, Robotics + AI stack — the most advanced school STEM lab in India.",
      price: "₹10L+", priceNum: 1000000, priceNote: "Custom quote · CSR/Govt eligible",
      color: "var(--blue)", colorHex: "#3b82f6", featured: false, badge: "PRO",
      audience: ["Senior Secondary", "Classes 9–12", "200+ Students/Year"],
      features: [
        { title: "Full IoT, Robotics + AI Lab — Custom Design", detail: "IoT Pro + Experience kits, AI modules" },
        { title: "Advanced Robotics Stack", detail: "Autonomous bots, robotic arms, ROS intro" },
        { title: "AI/ML Starter Modules", detail: "TinyML, Edge AI, image classification" },
        { title: "Complete Curriculum — All Levels", detail: "IoT + Robotics + AI, 90 sessions" },
        { title: "Faculty Cert — Both Levels", detail: "5-day intensive for up to 6 faculty" },
        { title: "Priority Installation & Branding", detail: "Dedicated project manager assigned" },
        { title: "3-Year Support SLA", detail: "Monthly visits + 24hr remote support" },
        { title: "CSR Impact Documentation", detail: "Full reporting for annual CSR reports" },
        { title: "Competition Prep Program", detail: "Smart India Hackathon, ATL Marathon" },
      ],
      specs: { students: "200+/yr", space: "30x25 ft min", setup: "3–5 days", warranty: "3 years" },
    },
  ],
  college: [
    {
      id: "college-essential", tier: "PACKAGE 01", name: "Essential IoT Lab",
      tagline: "Department-level IoT lab for Diploma and B.Tech Year 1–2. Get students building from day one.",
      price: "₹4L", priceNum: 400000, priceNote: "Institutional pricing available",
      color: "var(--amber)", colorHex: "#f59e0b", featured: false, badge: "ESS",
      audience: ["Diploma Programs", "B.Tech Year 1–2", "30–40 Students/Batch"],
      features: [
        { title: "ARC Lab's IoT Experience Kit x 20 units", detail: "5 MCU platforms, full sensor suite" },
        { title: "Lab Manual — IoT Fundamentals", detail: "20 experiments mapped to KTU/JNTU/Anna syllabus" },
        { title: "Faculty Training — 2 Days", detail: "Hands-on certification for 2 faculty" },
        { title: "1-Year Technical Support", detail: "Remote support + annual review visit" },
        { title: "Experiment Manuals", detail: "Step-by-step printed + digital lab manuals" },
      ],
      specs: { students: "30–40/batch", space: "20x15 ft min", setup: "1–2 days", warranty: "1 year" },
    },
    {
      id: "college-advanced", tier: "PACKAGE 02", name: "Advanced IoT & Embedded Lab",
      tagline: "Complete lab for ECE/EEE departments. IoT, Embedded Systems, and IIoT under one roof.",
      price: "₹8L", priceNum: 800000, priceNote: "NBA/NAAC accreditation ready",
      color: "var(--accent)", colorHex: "#00d4aa", featured: true, badge: "ADV",
      audience: ["B.Tech ECE/EEE/CSE", "Year 2–4", "60–80 Students/Batch"],
      features: [
        { title: "IoT Pro Kit x 20 + Experience Kit x 20", detail: "Dual kit setup for parallel experiment tracks" },
        { title: "Complete Lab Manual — 3 Courses", detail: "IoT, Embedded Systems, IIoT — 60 experiments" },
        { title: "Faculty Training — 5 Days", detail: "Level 1 + Level 2 cert for 4 faculty" },
        { title: "Online Student Portal Access", detail: "Recorded sessions + assignments + assessments" },
        { title: "2-Year Support Contract", detail: "Quarterly visits + remote helpdesk" },
        { title: "NBA/NAAC Lab Documentation", detail: "CO-PO mapping, outcome reports" },
        { title: "Cloud Platform License", detail: "50-seat Arc Lab Cloud access" },
      ],
      specs: { students: "60–80/batch", space: "30x20 ft min", setup: "3–4 days", warranty: "2 years" },
    },
    {
      id: "college-research", tier: "PACKAGE 03", name: "R&D Innovation Lab",
      tagline: "For departments with active research, startup incubation, or Centre of Excellence ambitions.",
      price: "₹15L+", priceNum: 1500000, priceNote: "RUSA / DST / AICTE funding eligible",
      color: "var(--violet)", colorHex: "#8b5cf6", featured: false, badge: "R&D",
      audience: ["M.Tech / Ph.D.", "Research Centers", "CoE / Incubation Labs"],
      features: [
        { title: "Complete Hardware Stack — All 3 Kits", detail: "IoT Lite + Experience + Pro, custom quantities" },
        { title: "Advanced Robotics + ROS Setup", detail: "ROS2 workstations, LIDAR, robotic arms" },
        { title: "AIoT Research Platform", detail: "Edge AI modules, GPU server integration" },
        { title: "Research-Grade Lab Manuals", detail: "Customized to dept. syllabus + research needs" },
        { title: "Expert Faculty Training — 5 Days", detail: "All tracks, all levels, up to 8 faculty" },
        { title: "3-Year Premium SLA", detail: "Dedicated account manager, 24hr support" },
        { title: "AICTE/RUSA Grant Documentation", detail: "Full grant application support" },
        { title: "Industry Connect Program", detail: "Internship pipeline, R&D collaboration" },
        { title: "Student Project Mentoring", detail: "6 mentoring sessions per year included" },
      ],
      specs: { students: "Research batches", space: "40x30 ft min", setup: "5–7 days", warranty: "3 years" },
    },
  ],
};

const INSIDE_TABS = [
  { id: "hardware", label: "Hardware", abbr: "HW", color: "var(--accent)" },
  { id: "curriculum", label: "Curriculum", abbr: "CR", color: "var(--blue)" },
  { id: "training", label: "Training", abbr: "TR", color: "var(--amber)" },
  { id: "support", label: "Support", abbr: "SP", color: "var(--violet)" },
];

const INSIDE_ITEMS = {
  hardware: [
    { abbr: "MCU", bg: "rgba(0,212,170,0.12)", color: "#00d4aa", name: "ARC Lab's Development Boards", desc: "Made-in-India boards supporting Arduino, ESP32, STM32, Raspberry Pi — depending on package tier.", tag: "MADE IN INDIA", tagBg: "rgba(0,212,170,0.1)", tagColor: "#00d4aa" },
    { abbr: "SNS", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", name: "Sensor & Module Set", desc: "DHT11, BMP180, Ultrasonic, IR, LDR, Touch, MQ gas, potentiometer — all onboard.", tag: "PRE-INSTALLED", tagBg: "rgba(59,130,246,0.1)", tagColor: "#3b82f6" },
    { abbr: "DSP", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", name: "Display & Output Devices", desc: "TFT/OLED displays, RGB LEDs, buzzers, 7-segment display — visual feedback for all projects.", tag: "PLUG & PLAY", tagBg: "rgba(245,158,11,0.1)", tagColor: "#f59e0b" },
    { abbr: "RLY", bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", name: "Relay & Actuator Modules", desc: "Dual relay for AC/DC load switching, servo ports, digital output headers for external devices.", tag: "INDUSTRIAL GRADE", tagBg: "rgba(139,92,246,0.1)", tagColor: "#8b5cf6" },
    { abbr: "COM", bg: "rgba(244,63,94,0.1)", color: "#f43f5e", name: "Communication Interfaces", desc: "LoRa, GSM/4G (SIMCOM), RS485, Wi-Fi, BLE — available depending on package tier.", tag: "MULTI-PROTOCOL", tagBg: "rgba(244,63,94,0.1)", tagColor: "#f43f5e" },
    { abbr: "BOT", bg: "rgba(0,212,170,0.12)", color: "#00d4aa", name: "Robotics Kit (Standard+)", desc: "Wheeled robot chassis, motor driver, sensors — for autonomous bot experiments.", tag: "STANDARD & ABOVE", tagBg: "rgba(0,212,170,0.08)", tagColor: "#00d4aa" },
  ],
  curriculum: [
    { abbr: "NEP", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", name: "NEP 2020 Aligned Content", desc: "All school curriculum mapped to National Education Policy 2020 skill subject requirements.", tag: "NEP ALIGNED", tagBg: "rgba(59,130,246,0.1)", tagColor: "#3b82f6" },
    { abbr: "PRJ", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", name: "Project-Based Sessions", desc: "Every session is built around a working project — not theory slides. Students build, test, debug.", tag: "HANDS-ON", tagBg: "rgba(245,158,11,0.1)", tagColor: "#f59e0b" },
    { abbr: "DIG", bg: "rgba(0,212,170,0.12)", color: "#00d4aa", name: "Digital Student Workbooks", desc: "Interactive PDFs with circuit diagrams, code templates, and experiment sheets per session.", tag: "DIGITAL + PRINT", tagBg: "rgba(0,212,170,0.1)", tagColor: "#00d4aa" },
    { abbr: "ASM", bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", name: "Assessment Framework", desc: "Rubric-based evaluation for each session. Student progress tracked across the year.", tag: "OUTCOME BASED", tagBg: "rgba(139,92,246,0.1)", tagColor: "#8b5cf6" },
    { abbr: "UPD", bg: "rgba(244,63,94,0.1)", color: "#f43f5e", name: "Quarterly Curriculum Updates", desc: "New projects and content added every quarter. Standard and Premier packages get auto-updates.", tag: "ALWAYS CURRENT", tagBg: "rgba(244,63,94,0.1)", tagColor: "#f43f5e" },
    { abbr: "MAP", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", name: "Syllabus Mapping (College)", desc: "College packages include CO-PO mapping and experiment lists aligned to your university syllabus.", tag: "COLLEGE ONLY", tagBg: "rgba(59,130,246,0.1)", tagColor: "#3b82f6" },
  ],
  training: [
    { abbr: "FTR", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", name: "Onsite Faculty Training", desc: "ARC LABS certified trainer comes to your campus. Hands-on, not classroom slides.", tag: "ONSITE", tagBg: "rgba(245,158,11,0.1)", tagColor: "#f59e0b" },
    { abbr: "CRT", bg: "rgba(0,212,170,0.12)", color: "#00d4aa", name: "ARC LABS Certification", desc: "Teachers receive Level 1 or Level 2 certification. Nationally recognized, shareable credential.", tag: "CERTIFIED", tagBg: "rgba(0,212,170,0.1)", tagColor: "#00d4aa" },
    { abbr: "LIB", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", name: "Online Resource Library", desc: "Recorded sessions, how-to videos, project demos — accessible on Arc Lab Learning Portal.", tag: "LIFETIME ACCESS", tagBg: "rgba(59,130,246,0.1)", tagColor: "#3b82f6" },
    { abbr: "NET", bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", name: "Faculty Community Access", desc: "Join ARC LABS' network of 1,000+ certified teachers. Exchange projects, get help, share resources.", tag: "COMMUNITY", tagBg: "rgba(139,92,246,0.1)", tagColor: "#8b5cf6" },
  ],
  support: [
    { abbr: "SUP", bg: "rgba(0,212,170,0.12)", color: "#00d4aa", name: "Dedicated Support Line", desc: "Direct access to ARC LABS' technical team via WhatsApp, phone, and email.", tag: "PRIORITY SUPPORT", tagBg: "rgba(0,212,170,0.1)", tagColor: "#00d4aa" },
    { abbr: "VIS", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", name: "Onsite Visit Program", desc: "Scheduled physical visits by our team for maintenance, refresher training, and hardware checks.", tag: "PHYSICAL VISITS", tagBg: "rgba(245,158,11,0.1)", tagColor: "#f59e0b" },
    { abbr: "WAR", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", name: "Hardware Replacement Warranty", desc: "Faulty components replaced without questions within warranty period. Zero downtime labs.", tag: "WARRANTY BACKED", tagBg: "rgba(59,130,246,0.1)", tagColor: "#3b82f6" },
    { abbr: "RPT", bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", name: "Annual Impact Report", desc: "Students trained, sessions completed, certification rates — delivered annually for admin and CSR reporting.", tag: "DOCUMENTATION", tagBg: "rgba(139,92,246,0.1)", tagColor: "#8b5cf6" },
  ],
};

const PROCESS_STEPS = [
  { num: "01", title: "Initial Call", desc: "30-min call with our team to understand your institution's needs and budget.", time: "Day 1", color: "var(--accent)" },
  { num: "02", title: "Proposal", desc: "Customised proposal with package recommendation, layout plan, and pricing sent within 48 hrs.", time: "Day 2–3", color: "var(--blue)" },
  { num: "03", title: "Agreement", desc: "MoU / Purchase Order signed. CSR or government documentation handled if applicable.", time: "Day 5–7", color: "var(--amber)" },
  { num: "04", title: "Installation", desc: "ARC LABS team arrives for full lab setup. Hardware installed, tested, and commissioned.", time: "Week 2–3", color: "var(--violet)" },
  { num: "05", title: "Training", desc: "Onsite teacher training and certification program conducted immediately after installation.", time: "Week 3", color: "var(--rose)" },
  { num: "06", title: "Go Live", desc: "Lab is operational. First batch of students starts learning. Support contract begins.", time: "Week 4", color: "var(--accent)" },
];

const FAQS = [
  { q: "Do you provide installation support at our school/college campus?", a: "Yes. Every package includes onsite installation by the ARC LABS team. We come to your campus, set up the entire lab, test every unit, and don't leave until everything is working." },
  { q: "Can the lab be funded through CSR contributions?", a: "Yes. All packages are eligible for CSR funding under Schedule VII of the Companies Act — specifically the Education clause. We provide complete documentation including cost per beneficiary, impact metrics, and outcome reports." },
  { q: "Is the curriculum aligned to CBSE / state board requirements?", a: "Our school curriculum is mapped to NEP 2020 skill education requirements and is compatible with CBSE skill subjects. For college packages, we provide CO-PO mapping aligned to your affiliated university (KTU, JNTU, Anna, VTU, etc.)." },
  { q: "What happens if hardware breaks during use?", a: "All packages include a warranty period (1–3 years depending on tier) with full hardware replacement. We also have a dedicated support line for quick diagnosis. Faulty components are replaced, not repaired." },
  { q: "Can teachers with no electronics background handle this lab?", a: "Yes — that is specifically why our teacher training program exists. After the 2 or 3-day certification, teachers can independently conduct all sessions without needing ARC LABS present. The curriculum is designed for non-specialists." },
  { q: "Do you offer government or volume pricing for multiple schools?", a: "Yes. Government school chains, trust-run school groups, and multi-campus colleges get volume pricing. Contact us for a custom quote. We also support TSSC, Samagra Shiksha, and other state-level procurement frameworks." },
  { q: "Can this be used for Atal Tinkering Lab (ATL) requirements?", a: "Our Standard and Premier packages are designed to be ATL-compatible. The hardware, curriculum, and lab layout meet AIM's ATL requirements. We can help with the ATL application documentation as well." },
  { q: "What is the minimum space required for a lab?", a: "Starter lab requires a minimum 20x15 ft space. Standard labs need 25x20 ft, and Premier/R&D labs need 30x25 ft or larger. We provide a detailed layout plan as part of the proposal — including furniture arrangement and power point requirements." },
];

/* ═══════════════════════════════════════════════════════════════════
   ROI CALCULATOR
═══════════════════════════════════════════════════════════════════ */
function ROICalculator({ onOpenModal }) {
  const [students, setStudents] = useState(100);
  const [pkg, setPkg] = useState(500000);
  const [years, setYears] = useState(3);

  const costPerStudent = Math.round(pkg / (students * years));
  const sessionsPerYear = Math.round(students * 0.6 * 30);
  const annualValue = Math.round(students * 2400);
  const roi = Math.round(((annualValue * years - pkg) / pkg) * 100);

  return (
    <div className="lp-roi">
      <div className="section-label" style={{ justifyContent: "center" }}>Impact Calculator</div>
      <h2 className="section-heading" style={{ textAlign: "center" }}>Measure your lab's return.</h2>
      <p className="section-desc" style={{ textAlign: "center", margin: "0 auto 2.5rem" }}>
        Estimate the cost-per-student and 3-year ROI for your institution before you decide.
      </p>
      <div className="lp-roi-inner">
        <div className="lp-roi-form">
          <h3>Configure Your Lab</h3>
          <div className="lp-roi-row">
            <label>Students per year <span>{students}</span></label>
            <input type="range" className="lp-slider" min="30" max="500" step="10" value={students} onChange={(e) => setStudents(+e.target.value)} />
          </div>
          <div className="lp-roi-row">
            <label>Lab package budget <span>{"₹"}{(pkg / 100000).toFixed(1)}L</span></label>
            <input type="range" className="lp-slider" min="250000" max="1500000" step="50000" value={pkg} onChange={(e) => setPkg(+e.target.value)} />
          </div>
          <div className="lp-roi-row">
            <label>Years of operation <span>{years} yrs</span></label>
            <input type="range" className="lp-slider" min="1" max="5" step="1" value={years} onChange={(e) => setYears(+e.target.value)} />
          </div>
          <div style={{ padding: "14px", background: "var(--surface-3)", borderRadius: "10px", marginTop: "1rem", fontSize: ".78rem", color: "var(--text-3)", lineHeight: 1.7 }}>
            Based on {"₹"}2,400/student/year value (NEP skill subject credit value estimate). Actual returns vary by institution.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-.02em", color: "var(--text-1)" }}>Your Impact Metrics</h3>
          <div className="lp-metric-grid">
            <div className="lp-roi-metric" style={{ "--rm-color": "var(--accent)" }}>
              <div className="lp-roi-metric-label">Cost Per Student</div>
              <div className="lp-roi-metric-val">{"₹"}{costPerStudent.toLocaleString("en-IN")}</div>
              <div className="lp-roi-metric-sub">Over {years} year{years > 1 ? "s" : ""}</div>
            </div>
            <div className="lp-roi-metric" style={{ "--rm-color": "var(--blue)" }}>
              <div className="lp-roi-metric-label">Students Impacted</div>
              <div className="lp-roi-metric-val">{(students * years).toLocaleString()}</div>
              <div className="lp-roi-metric-sub">Over {years} year{years > 1 ? "s" : ""}</div>
            </div>
            <div className="lp-roi-metric" style={{ "--rm-color": "var(--amber)" }}>
              <div className="lp-roi-metric-label">Annual Lab Sessions</div>
              <div className="lp-roi-metric-val">{sessionsPerYear.toLocaleString()}</div>
              <div className="lp-roi-metric-sub">Estimated practical sessions</div>
            </div>
            <div className="lp-roi-metric" style={{ "--rm-color": roi >= 0 ? "var(--accent)" : "var(--rose)" }}>
              <div className="lp-roi-metric-label">Estimated ROI</div>
              <div className="lp-roi-metric-val">{roi > 0 ? "+" : ""}{roi}%</div>
              <div className="lp-roi-metric-sub">vs lab investment cost</div>
            </div>
          </div>
          <div style={{ padding: "16px", background: "var(--surface-2)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "12px", fontSize: ".8rem", color: "var(--text-3)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--accent)" }}>CSR perspective:</strong> At {"₹"}{costPerStudent.toLocaleString("en-IN")} per student, this qualifies as high-impact CSR spend — well below the {"₹"}5,000/student benchmark for education CSR programs in India.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEAD MODAL
═══════════════════════════════════════════════════════════════════ */
function LeadModal({ pkg, audience, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", inst: "", role: "", city: "", state: "", students: "", timeline: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
const submit = async (e) => {

  e.preventDefault();

  setLoading(true);

  try {

    console.log("Submitting...");

    const docRef = await addDoc(

      collection(db, "custom_proposals"),

      {

        fullName: form.name,

        phone: form.phone,

        email: form.email,

        institution: form.inst,

        role: form.role,

        city: form.city,

        state: form.state,

        students: form.students,

        timeline: form.timeline,

        requirements: form.note,

        packageName:
          pkg?.name || "Custom",

        createdAt: new Date(),
      }
    );

    console.log(
      "SUCCESS:",
      docRef.id
    );

    setLoading(false);

    setDone(true);

  } catch (err) {

    console.log(
      "FIREBASE ERROR:",
      err
    );

    alert(err.message);

    setLoading(false);
  }
};

  return (
    <div className="lp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lp-modal">
        <button className="lp-modal-close" onClick={onClose}>&#x2715;</button>
        {done ? (
          <div className="lp-modal-success">
            <div style={{ fontSize: "2.4rem", marginBottom: ".9rem", color: "var(--accent)" }}>&#10003;</div>
            <h3>Proposal Request Sent!</h3>
            <p>
              Our team will prepare a <strong style={{ color: "var(--text-1)" }}>customised proposal</strong> for your institution within <strong style={{ color: "var(--text-1)" }}>48 hours</strong>.<br /><br />
              For faster response, WhatsApp us directly:<br />
              <strong style={{ color: "#25D366" }}>+91 78158 09412</strong><br /><br />
              <span style={{ fontSize: ".78rem" }}>Reference: {pkg?.name} · {audience === "school" ? "School" : "College"}</span>
            </p>
          </div>
        ) : (
          <>
            <div className="lp-modal-head">
              <h3>Request a Custom Proposal</h3>
              <p>Fill in your institution's details. We'll send a tailored proposal with pricing, layout plan, and curriculum breakdown within 48 hours.</p>
              {pkg && (
                <div className="lp-modal-pkg">
                  <span className="lp-stat-badge" style={{ background: `${pkg.colorHex}22`, color: pkg.colorHex }}>{pkg.badge}</span>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: ".9rem", fontWeight: 700, color: "var(--text-1)" }}>{pkg.name} — {audience === "school" ? "School" : "College"}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-3)", marginTop: "2px" }}>Starting at <strong style={{ color: pkg.colorHex }}>{pkg.price}</strong> · ARC LABS Lab Package</div>
                  </div>
                </div>
              )}
            </div>
            <div className="lp-modal-body">
              <form onSubmit={submit}>
                <div className="lp-form-2">
                  <div className="lp-form-row"><label>Full Name *</label><input name="name" value={form.name} onChange={h} placeholder="Your name" required /></div>
                  <div className="lp-form-row"><label>Phone *</label><input name="phone" value={form.phone} onChange={h} placeholder="+91 XXXXX XXXXX" required /></div>
                </div>
                <div className="lp-form-row"><label>Email Address *</label><input type="email" name="email" value={form.email} onChange={h} placeholder="you@school.edu.in" required /></div>
                <div className="lp-form-row"><label>Institution Name *</label><input name="inst" value={form.inst} onChange={h} placeholder="School or college name" required /></div>
                <div className="lp-form-2">
                  <div className="lp-form-row"><label>Your Role</label>
                    <select name="role" value={form.role} onChange={h}>
                      <option value="">Select</option>
                      <option>Principal / Director</option><option>Vice Principal</option>
                      <option>Head of Department</option><option>Lab In-charge</option>
                      <option>CSR / Trustee</option><option>Government Official</option><option>Procurement Officer</option>
                    </select>
                  </div>
                  <div className="lp-form-row"><label>State</label>
                    <select name="state" value={form.state} onChange={h}>
                      <option value="">Select State</option>
                      {["Telangana", "Andhra Pradesh", "Karnataka", "Tamil Nadu", "Maharashtra", "Kerala", "Gujarat", "Delhi", "Rajasthan", "Madhya Pradesh", "West Bengal", "Uttar Pradesh", "Other"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="lp-form-2">
                  <div className="lp-form-row"><label>City</label><input name="city" value={form.city} onChange={h} placeholder="City" /></div>
                  <div className="lp-form-row"><label>Students per year (approx)</label><input name="students" value={form.students} onChange={h} placeholder="e.g. 120" /></div>
                </div>
                <div className="lp-form-row"><label>Expected Timeline</label>
                  <select name="timeline" value={form.timeline} onChange={h}>
                    <option value="">When do you need the lab?</option>
                    <option>Within 1 month</option><option>1–3 months</option><option>3–6 months</option>
                    <option>Next academic year</option><option>Just exploring</option>
                  </select>
                </div>
                <div className="lp-form-row"><label>Additional Requirements</label>
                  <textarea name="note" value={form.note} onChange={h} placeholder="CSR funding interest, specific topics, space dimensions, any other requirements..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px", fontSize: ".95rem", marginTop: ".5rem" }} disabled={loading}>
                  {loading ? "Sending..." : "Request Proposal"}
                </button>
                <p className="lp-form-note">No spam. Your details are only used to prepare your proposal. We respond within 48 hours.</p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LabPackagesPage() {
  const [audience, setAudience] = useState("school");
  const [insideTab, setInsideTab] = useState("hardware");
  const [openFaq, setOpenFaq] = useState(null);
  const [modal, setModal] = useState(null);

  const pkgs = PACKAGES[audience];

  return (
    <>
      <Helmet>
        <title>Complete IoT &amp; Robotics Lab Packages for Schools &amp; Colleges — ARC LABS</title>
        <meta name="description" content="Complete IoT & Robotics lab packages for schools and colleges. Hardware, curriculum, teacher training, installation — fixed pricing from ₹2.5L. 500+ labs installed across India." />
        <link rel="canonical" href="https://arclabs.in/lab-packages" />
        <meta property="og:url" content="https://arclabs.in/lab-packages" />
        <meta property="og:title" content="IoT & Robotics Lab Packages — ARC LABS" />
        <meta property="og:description" content="Complete lab packages with hardware, curriculum, teacher training & support. Fixed pricing from ₹2.5L." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        })}</script>
      </Helmet>
      <style>{pageStyles}</style>

      {/* HERO */}
      <div className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-inner">
          <div>
            <div className="section-label">Hardware + Curriculum + Training + Support</div>
            <h1>Complete IoT &amp; Robotics<br />Lab Packages for<br /><em>Schools &amp; Colleges</em></h1>
            <p>No sourcing hardware separately. No writing curriculum. No finding trainers. ARC LABS delivers the complete lab — designed, installed, and supported — so your institution starts teaching from week one.</p>
            <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => setModal({ pkg: null })}>Get Custom Proposal</button>
              <a href="#packages" className="btn btn-ghost">View All Packages</a>
            </div>
          </div>

          <div className="lp-stats">
            {[
              { num: "500+", label: "Labs installed across India", badge: "LABS", color: "var(--accent)", colorHex: "#00d4aa", fill: 85 },
              { num: "₹800", label: "Min. cost per student / CSR", badge: "CSR", color: "var(--blue)", colorHex: "#3b82f6", fill: 60 },
              { num: "4 Wks", label: "Avg. time from order to live lab", badge: "FAST", color: "var(--amber)", colorHex: "#f59e0b", fill: 70 },
              { num: "98%", label: "School renewal rate on support contracts", badge: "RENEW", color: "var(--violet)", colorHex: "#8b5cf6", fill: 98 },
            ].map((s) => (
              <div className="lp-stat" key={s.label} style={{ "--stat-color": s.color }}>
                <div className="lp-stat-row">
                  <div className="lp-stat-num">{s.num}</div>
                  <span className="lp-stat-badge" style={{ background: `${s.colorHex}1a`, color: s.colorHex }}>{s.badge}</span>
                </div>
                <div className="lp-stat-label">{s.label}</div>
                <div className="lp-stat-bar"><div className="lp-stat-fill" style={{ width: `${s.fill}%`, background: s.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIENCE SWITCHER */}
      <div className="lp-audience-bar" id="packages">
        {[
          { id: "school", label: "For Schools", sub: "Classes 6–12" },
          { id: "college", label: "For Colleges & Universities", sub: "Diploma, B.Tech, M.Tech, R&D" },
        ].map((a) => (
          <button key={a.id} className={`lp-aud-btn${audience === a.id ? " active" : ""}`} onClick={() => setAudience(a.id)}>
            {a.label}
            <span style={{ fontSize: ".72rem", color: "var(--text-4)", marginLeft: "4px" }}>— {a.sub}</span>
          </button>
        ))}
      </div>

      {/* PACKAGES GRID */}
      <div className="lp-pkg-section">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>
            {audience === "school" ? "School Lab Packages" : "College & University Packages"}
          </div>
          <h2 className="section-heading">Fixed tiers. <span style={{ color: "var(--accent)" }}>No custom quoting.</span></h2>
          <p className="section-desc" style={{ textAlign: "center", margin: "0 auto" }}>Pick the tier that matches your budget and student count. We handle the rest.</p>
        </div>

        <div className="lp-pkg-grid">
          {pkgs.map((pkg) => (
            <div key={pkg.id} className={`lp-card${pkg.featured ? " featured" : ""}`}>
              <div className="lp-card-bar" style={{ background: `linear-gradient(90deg, ${pkg.colorHex}, transparent)` }} />
              {pkg.featured && <div className="lp-popular">MOST POPULAR</div>}
              <div className="lp-card-head">
                <div className="lp-card-tier" style={{ color: pkg.colorHex }}>{pkg.tier} · {pkg.badge}</div>
                <div className="lp-card-name">{pkg.name}</div>
                <div className="lp-card-tagline">{pkg.tagline}</div>
                <div className="lp-price-block">
                  <div className="lp-price" style={{ color: pkg.colorHex }}>{pkg.price} <span>/ lab setup</span></div>
                  <div className="lp-price-sub">One-time investment · Annual support contract separate</div>
                  <div className="lp-price-note">+ {pkg.priceNote}</div>
                </div>
              </div>
              <div className="lp-includes">
                <h4>What's included</h4>
                <ul className="lp-feat-list">
                  {pkg.features.map((f) => (
                    <li key={f.title}><span className="pf-text"><b>{f.title}</b><span>{f.detail}</span></span></li>
                  ))}
                </ul>
              </div>
              <div className="lp-specs">
                {Object.entries(pkg.specs).map(([k, v]) => (
                  <div key={k} className="lp-spec"><span>{k}: </span><strong style={{ color: pkg.colorHex }}>{v}</strong></div>
                ))}
              </div>
              <div className="lp-aud-tags">
                {pkg.audience.map((a) => <span key={a} className="lp-aud-tag">{a}</span>)}
              </div>
              <div className="lp-card-foot">
                <button className="btn btn-primary" style={{ width: "100%", background: pkg.colorHex, color: pkg.colorHex === "#00d4aa" ? "var(--bg)" : "#fff" }} onClick={() => setModal({ pkg })}>
                  Get This Package
                </button>
                <a href="https://wa.me/917815809412" className="btn btn-ghost" style={{ width: "100%", textAlign: "center", justifyContent: "center" }} target="_blank" rel="noreferrer">
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT'S INSIDE */}
      <div className="lp-inside">
        <div className="section-label">What's Inside Every Package</div>
        <h2 className="section-heading">Every detail. <span style={{ color: "var(--accent)" }}>Nothing missing.</span></h2>
        <p className="section-desc" style={{ marginBottom: "2rem" }}>
          Every ARC LABS lab package bundles four pillars — hardware, curriculum, training, and support. No sourcing separately.
        </p>
        <div className="lp-tabs">
          {INSIDE_TABS.map((t) => (
            <button key={t.id} className={`lp-tab${insideTab === t.id ? " active" : ""}`}
              style={insideTab === t.id ? { borderColor: t.color, color: t.color } : {}}
              onClick={() => setInsideTab(t.id)}>
              {t.abbr} · {t.label}
            </button>
          ))}
        </div>
        <div className="lp-inside-grid" key={insideTab}>
          {INSIDE_ITEMS[insideTab].map((item) => (
            <div className="lp-inside-item" key={item.name}>
              <div className="lp-ins-icon" style={{ background: item.bg, color: item.color }}>{item.abbr}</div>
              <div>
                <div className="lp-ins-name">{item.name}</div>
                <div className="lp-ins-desc">{item.desc}</div>
                <span className="lp-ins-tag" style={{ background: item.tagBg, color: item.tagColor }}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROCESS */}
      <div className="lp-process">
        <div className="section-label" style={{ justifyContent: "center" }}>Implementation Process</div>
        <h2 className="section-heading" style={{ textAlign: "center" }}>
          From enquiry to live lab in <span style={{ color: "var(--accent)" }}>4 weeks.</span>
        </h2>
        <div className="lp-proc-grid">
          {PROCESS_STEPS.map((step) => (
            <div className="lp-proc-step" key={step.num} style={{ "--ps-color": step.color }}>
              <div className="lp-proc-num">{step.num}</div>
              <div className="lp-proc-title">{step.title}</div>
              <div className="lp-proc-desc">{step.desc}</div>
              <div className="lp-proc-time">{step.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI CALCULATOR */}
      <ROICalculator onOpenModal={() => setModal({ pkg: null })} />

      {/* CSR CALLOUT */}
      <div className="lp-csr-callout">
        <div className="lp-csr-inner">
          <div>
            <h3 className="section-heading" style={{ marginBottom: ".5rem" }}>
              Funding your lab through CSR?<br /><span style={{ color: "var(--accent)" }}>We make it simple.</span>
            </h3>
            <p style={{ fontSize: ".87rem", color: "var(--text-3)", lineHeight: 1.7, maxWidth: "520px" }}>
              ARC LABS handles all CSR documentation — cost per beneficiary calculation, impact reports, Schedule VII compliance, and annual outcome tracking.
            </p>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: "1rem" }}>
              {["Schedule VII Eligible", "Cost per Beneficiary Report", "3-Year Impact Tracking", "Board-Ready Documentation", "Listed on CSR Box & GiveIndia"].map((p) => (
                <span key={p} className="chip">{p}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", flexShrink: 0 }}>
            <button className="btn btn-primary" onClick={() => setModal({ pkg: null })}>CSR Partnership Enquiry</button>
            <Link to="/csr-partners" className="btn btn-ghost">Learn About CSR</Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="lp-faq">
        <div className="section-label">Frequently Asked Questions</div>
        <h2 className="section-heading">Common questions, answered.</h2>
        <div className="lp-faq-grid">
          {FAQS.map((faq, i) => (
            <div key={i} className={`lp-faq-item${openFaq === i ? " open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="lp-faq-q">
                <span>{faq.q}</span>
                <span className="lp-faq-toggle">{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div className="lp-faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="lp-bottom-cta">
        <h2>Ready to set up your <em>STEM lab?</em></h2>
        <p>Get a free, no-obligation proposal tailored to your institution within 48 hours.</p>
        <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
          <button className="btn btn-primary" onClick={() => setModal({ pkg: null })}>Get Custom Proposal</button>
          <a href="https://wa.me/917815809412" className="btn btn-ghost" target="_blank" rel="noreferrer">WhatsApp Us</a>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: ".85rem", color: "var(--text-3)" }}>
          Looking for training programs instead? <Link to="/programs" style={{ color: "var(--accent)" }}>Explore our workshops &amp; courses &rarr;</Link>
          &nbsp;&middot;&nbsp; <Link to="/products" style={{ color: "var(--accent)" }}>View individual IoT kits &rarr;</Link>
        </p>
      </div>

      {/* MODAL */}
      {modal && <LeadModal pkg={modal.pkg} audience={audience} onClose={() => setModal(null)} />}
    </>
  );
}
