import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DottedSurface } from "../components/ui/dotted-surface";
import { useBodyScrollLock } from "../utils/ui";

/* ─── SCOPED STYLES ────────────────────────────────────────────────── */
const pageStyles = `
/* Hero */
.ph-hero{min-height:440px;padding:108px 5vw 72px;text-align:center;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ph-hero::before{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:900px;height:430px;pointer-events:none;background:radial-gradient(ellipse,var(--tag-bg) 0%,var(--tag-bg) 45%,transparent 70%);z-index:1}
.product-dotted-surface{position:absolute;inset:-90px 0 -120px;pointer-events:none;z-index:0;opacity:.52}
.product-dotted-surface canvas{width:100%!important;height:100%!important;display:block}
.ph-hero > .badge,.ph-hero > h1,.ph-hero > p,.ph-hero-content{position:relative;z-index:2}
.ph-hero-content{max-width:820px;margin:0 auto}
.ph-hero h1{font-family:var(--font-heading);font-weight:800;font-size:clamp(2rem,5vw,3.4rem);letter-spacing:-.035em;line-height:1.08;margin-bottom:1rem;position:relative;text-shadow:0 18px 55px rgba(0,0,0,.55)}
.ph-hero h1 em{font-style:normal;color:var(--accent)}
.ph-hero p{color:var(--text-3);font-size:1rem;font-weight:400;max-width:560px;margin:0 auto 0;line-height:1.75;position:relative}

/* Filter bar */
.filter-bar{display:flex;justify-content:center;gap:.5rem;flex-wrap:wrap;padding:0 5vw 52px;position:relative;z-index:1}
.filter-btn{background:var(--surface);border:1px solid var(--border-2);color:var(--text-3);font-size:.8rem;font-weight:500;padding:8px 18px;border-radius:var(--radius);cursor:pointer;transition:all .2s;font-family:var(--font-body);display:flex;align-items:center;gap:6px}
.filter-btn.active,.filter-btn:hover{background:var(--accent-dim);border-color:var(--accent);color:var(--accent)}

/* Product grid */
.products-wrap{padding:0 5vw 80px;position:relative;z-index:1}
.pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.4rem;align-items:stretch}
.pg-grid.focus-mode{display:grid}
.pg-grid.focus-mode .pcard:not(.selected){display:none}

/* Product card */
.pcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;transition:all .3s;cursor:pointer;position:relative;display:flex;flex-direction:column;height:100%}
.pcard:hover{border-color:var(--pc-color,var(--accent));transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.pcard.selected{border-color:var(--pc-color,var(--accent));box-shadow:0 0 0 1px var(--pc-color,var(--accent)),var(--shadow-lg);animation:selectedKitCenter .34s ease both}
@keyframes selectedKitCenter{from{opacity:.72;transform:translateY(8px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}

.pc-visual{height:220px;position:relative;overflow:hidden;background:linear-gradient(135deg,var(--bg),var(--surface-2));display:flex;align-items:center;justify-content:center}
.pc-image{width:100%;height:100%;object-fit:contain;object-position:center;position:relative;z-index:1;padding:14px}
.pc-badge-wrap{position:absolute;top:14px;left:14px;display:flex;gap:6px;z-index:2}
.pc-badge{font-family:var(--font-body);font-size:.62rem;font-weight:800;padding:5px 11px;border-radius:6px;letter-spacing:.06em;border:1px solid var(--pc-color,var(--accent));background:var(--pc-color,var(--accent));color:#04110f;box-shadow:0 12px 26px color-mix(in srgb,var(--pc-color,var(--accent)) 28%,transparent)}
.pc-best{position:absolute;top:14px;right:14px;z-index:2;background:var(--accent-dim);color:var(--accent);border:1px solid rgba(0,220,130,.34);font-family:var(--font-body);font-size:.6rem;font-weight:800;padding:4px 10px;border-radius:5px;letter-spacing:.06em;box-shadow:0 10px 24px rgba(0,220,130,.13)}
.pc-fade{position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(transparent,var(--surface));z-index:1}

.pc-body{padding:22px 22px 0;display:flex;flex-direction:column;flex:1}
.pc-tier{font-family:var(--font-body);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.4rem}
.pc-name{font-family:var(--font-heading);font-weight:800;font-size:1.12rem;letter-spacing:-.02em;margin-bottom:.4rem}
.pc-tagline{font-size:.82rem;color:var(--text-3);line-height:1.55;margin-bottom:1rem}
.pc-chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:1rem}

.pc-price-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 0;border-top:1px solid var(--border);margin-top:auto;min-height:108px}
.pc-price-block{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
.pc-price{font-family:var(--font-heading);font-weight:800;font-size:1.6rem;line-height:1;letter-spacing:-.02em}
.pc-price span{display:block;margin-top:7px;font-family:var(--font-body);font-size:0;color:var(--text-3);font-weight:400;line-height:1.35;letter-spacing:0}
.pc-price span::before{content:"(including GST / unit)";font-size:.78rem}
.pc-tax-note{display:block;margin-top:7px;font-size:.78rem;color:var(--text-3);font-weight:400;line-height:1.35}
.pc-old-price{font-size:.78rem;color:var(--text-4);text-decoration:line-through;margin-top:12px}
.pc-save{font-family:var(--font-body);font-size:.62rem;padding:4px 10px;border-radius:5px;text-align:center;flex:0 0 auto}

.pc-footer{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;padding:14px 22px 18px}
.pc-btn-detail{background:transparent;border:1px solid var(--border-2);color:var(--text-3);font-size:.78rem;font-weight:500;padding:9px;border-radius:var(--radius);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.pc-btn-detail:hover{color:var(--text);border-color:var(--border-3)}
.pc-btn-buy{border:none;color:var(--bg);font-size:.78rem;font-weight:700;padding:9px;border-radius:var(--radius);cursor:pointer;font-family:var(--font-body);transition:all .2s}
.pc-btn-buy:hover{filter:brightness(1.1);transform:translateY(-1px)}

/* Detail drawer */
.product-detail-overlay{position:fixed;inset:0;z-index:1100;background:rgba(9,9,11,.72);backdrop-filter:blur(14px);display:flex;align-items:flex-start;justify-content:center;padding:calc(var(--nav-h) + 10px) 5vw 20px;animation:productOverlayIn .22s ease;overflow:hidden}
.detail-drawer{background:var(--surface-2);border:1px solid var(--border-2);border-radius:var(--radius-xl);overflow:hidden;animation:ddIn .42s cubic-bezier(.2,.8,.2,1);width:min(100%,1080px);max-height:calc(100svh - var(--nav-h) - 30px);overflow-y:auto;box-shadow:0 34px 110px rgba(0,0,0,.52);scroll-margin-top:calc(var(--nav-h) + 10px);transform-origin:center;margin-top:0;position:relative}
.detail-drawer-close-top{position:sticky;top:12px;float:right;z-index:20;margin:12px 12px -52px 0;border:1px solid rgba(255,111,111,.45);background:rgba(255,111,111,.12);color:#ff6f6f;border-radius:10px;padding:9px 14px;font-size:.76rem;font-weight:800;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
@keyframes productOverlayIn{from{opacity:0}to{opacity:1}}
@keyframes ddIn{from{opacity:0;transform:translateY(18px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}

/* Kit assembly animation */
.kit-stage{min-height:310px;padding:42px 32px 22px;border-bottom:1px solid var(--border);background:radial-gradient(circle at 50% 42%,rgba(var(--kit-glow),.18),transparent 43%),linear-gradient(180deg,rgba(255,255,255,.03),transparent);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.kit-stage::before{content:'';position:absolute;left:12%;right:12%;bottom:40px;height:26px;background:radial-gradient(ellipse,rgba(0,0,0,.48),transparent 68%);filter:blur(4px);opacity:.65}
.kit-caption{position:absolute;left:36px;top:28px;font-family:var(--font-heading);font-weight:800;font-size:1rem;letter-spacing:-.01em;color:var(--text);z-index:3}
.kit-caption span{display:block;margin-top:4px;font-family:var(--font-body);font-size:.72rem;font-weight:500;color:var(--text-3);letter-spacing:0}
.kit-gallery{width:min(820px,94vw);display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;align-items:center;position:relative;z-index:2}
.kit-thumbs{display:flex;flex-direction:column;gap:10px;align-items:stretch;justify-content:flex-start;align-self:stretch;padding-top:4px}
.kit-thumb{width:66px;height:66px;border:1px solid var(--border-2);border-radius:8px;background:#fff;padding:5px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.kit-thumb:hover,.kit-thumb.active{border-color:var(--kit-color,var(--accent));box-shadow:0 10px 26px rgba(var(--kit-glow),.18);transform:translateX(2px)}
.kit-thumb img{width:100%;height:100%;display:block;object-fit:contain;object-position:center}
.kit-board{width:100%;min-height:270px;position:relative;display:flex;align-items:center;justify-content:center}
.kit-photo-wrap{width:min(560px,100%);aspect-ratio:16/9;border:1px solid rgba(255,255,255,.16);border-radius:18px;background:#fff;box-shadow:0 28px 60px rgba(0,0,0,.36),inset 0 0 0 1px rgba(255,255,255,.06);position:relative;overflow:hidden;animation:kitDrop .72s cubic-bezier(.18,.89,.32,1.22) both;transform-origin:center;cursor:zoom-in;touch-action:none}
.kit-photo-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent);transform:translateX(-120%);animation:kitShine 1.4s ease .65s both}
.kit-photo{width:100%;height:100%;object-fit:contain;object-position:center;display:block;transition:transform .18s ease;transform-origin:var(--zoom-x,50%) var(--zoom-y,50%);will-change:transform}
.kit-photo-wrap.is-zooming .kit-photo{transform:scale(2.1)}

@keyframes kitDrop{0%{opacity:0;transform:translateY(-260px) rotate(-4deg) scale(.9)}72%{opacity:1;transform:translateY(12px) rotate(1deg) scale(1.02)}100%{opacity:1;transform:translateY(0) rotate(0) scale(1)}}
@keyframes kitShine{to{transform:translateX(120%)}}
@keyframes componentFall{0%{opacity:0;transform:translate3d(var(--fall-x),-360px,0) rotate(var(--fall-rot)) scale(.78)}58%{opacity:1;transform:translate3d(calc(var(--fall-x) * .24),-38px,0) rotate(calc(var(--fall-rot) * .35)) scale(.96)}82%{opacity:1;transform:translate3d(0,10px,0) rotate(2deg) scale(1.03)}100%{opacity:1;transform:translate3d(0,0,0) rotate(0) scale(1)}}

.dd-header{display:flex;align-items:flex-start;justify-content:space-between;padding:32px 36px 24px;border-bottom:1px solid var(--border);gap:2rem;flex-wrap:wrap}
.dd-hl{flex:1;min-width:240px}
.dd-eyebrow{font-family:var(--font-body);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:.5rem}
.dd-hl h2{font-family:var(--font-heading);font-weight:800;font-size:clamp(1.4rem,3vw,2rem);letter-spacing:-.025em;margin-bottom:.4rem}
.dd-hl p{font-size:.87rem;color:var(--text-3);line-height:1.7;max-width:520px}
.dd-hr{display:flex;flex-direction:column;align-items:flex-end;gap:.8rem;flex-shrink:0}
.dd-price-big{font-family:var(--font-heading);font-weight:800;font-size:2.4rem;letter-spacing:-.03em;text-align:right}
.dd-price-big span{font-size:1rem;font-weight:400;color:var(--text-3)}

.dd-tabs{display:flex;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.dd-tabs::-webkit-scrollbar{display:none}
.dd-tab{flex-shrink:0;padding:14px 24px;font-size:.82rem;font-weight:500;cursor:pointer;border:none;background:none;color:var(--text-3);font-family:var(--font-body);border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap}
.dd-tab.active{color:var(--tab-c,var(--accent));border-bottom-color:var(--tab-c,var(--accent))}
.dd-tab:hover:not(.active){color:var(--text-2)}

.dd-content{padding:28px 36px 36px}

/* Specs */
.spec-sections{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem}
.spec-section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px 20px}
.spec-section h4{font-family:var(--font-heading);font-size:.82rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.spec-section h4::before{content:'';width:3px;height:14px;background:var(--ss-c,var(--accent));border-radius:2px}
.spec-list{list-style:none}
.spec-list li{font-size:.78rem;color:var(--text-2);padding:6px 0;border-bottom:1px dashed var(--border);display:flex;align-items:flex-start;gap:8px}
.spec-list li:last-child{border-bottom:none}
.spec-list li::before{content:'\\2192';color:var(--ss-c,var(--accent));font-size:.72rem;flex-shrink:0;margin-top:1px}

/* In-box */
.inbox-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
.inbox-item{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px;display:flex;align-items:flex-start;gap:10px}
.inbox-icon{font-size:1.1rem;flex-shrink:0;width:32px;height:32px;background:var(--accent-dim);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--font-body);font-weight:700;font-size:.7rem;color:var(--accent)}
.inbox-name{font-size:.82rem;font-weight:600;margin-bottom:2px}
.inbox-desc{font-size:.74rem;color:var(--text-3);line-height:1.5}

/* Use cases */
.usecase-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
.usecase-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;position:relative;overflow:hidden}
.usecase-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--uc-c,var(--accent)),transparent)}
.usecase-num{font-family:var(--font-body);font-size:.58rem;color:var(--uc-c,var(--accent));margin-bottom:.4rem;letter-spacing:.08em}
.usecase-title{font-family:var(--font-heading);font-size:.9rem;font-weight:700;margin-bottom:.4rem}
.usecase-desc{font-size:.78rem;color:var(--text-3);line-height:1.6}

/* Compare table */
.compare-table{width:100%;border-collapse:collapse;font-size:.8rem}
.compare-table th{text-align:left;padding:12px 16px;font-family:var(--font-heading);font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border)}
.compare-table th:first-child{color:var(--text-3);font-size:.7rem;font-weight:500;text-transform:none;letter-spacing:0}
.compare-table td{padding:11px 16px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--text-2)}
.compare-table td:first-child{color:var(--text-3);font-size:.76rem}
.compare-table tr:last-child td{border-bottom:none}
.compare-table tr:hover td{background:rgba(255,255,255,0.02)}
.ct-yes{color:var(--accent)!important;font-weight:600}
.ct-no{color:var(--text-4)!important}

/* Drawer CTA */
.dd-cta{border-top:1px solid var(--border);padding:22px 36px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem}
.dd-cta-note{font-size:.8rem;color:var(--text-3)}
.dd-cta-note strong{color:var(--text)}
.dd-cta-btns{display:flex;gap:.7rem;flex-wrap:wrap}

/* Comparison section */
.compare-section{padding:80px 5vw;background:var(--bg-alt);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.fct{width:100%;border-collapse:separate;border-spacing:0}
.fct thead tr th{padding:14px 18px;font-family:var(--font-heading);font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid var(--border-2);text-align:center}
.fct thead tr th:first-child{text-align:left;color:var(--text-3);font-weight:500;font-size:.72rem;text-transform:none;letter-spacing:0}
.fct thead .th-essential{
  color:#00ff9d;
}
.fct thead .th-lite{color:var(--amber)}
.fct thead .th-kit{color:var(--accent)}
.fct thead .th-pro{color:var(--blue)}
.fct tbody tr:hover td{background:rgba(255,255,255,0.02)}
.fct tbody td{padding:12px 18px;border-bottom:1px solid var(--border);font-size:.8rem;color:var(--text-2);text-align:center;vertical-align:middle}
.fct tbody td:first-child{text-align:left;color:var(--text-3);font-size:.76rem}
.fct-cat td{background:var(--surface)!important;font-family:var(--font-heading);font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-3)!important;text-align:left!important;padding:10px 18px!important}
.fct-yes{color:var(--accent)!important;font-size:1rem}
.fct-no{color:rgba(255,255,255,.12)!important;font-size:1rem}
.fct-val{color:var(--text)!important;font-weight:600}
.fct-best{color:var(--bg)!important;font-weight:700;font-size:.7rem;background:var(--amber);padding:3px 8px;border-radius:4px;display:inline-block}
.price-row-fct td{font-family:var(--font-heading)!important;font-size:1.2rem!important;font-weight:800!important;padding:18px 18px!important}
.price-row-fct td:nth-child(2){color:var(--amber)!important}
.price-row-fct td:nth-child(3){color:var(--accent)!important}
.price-row-fct td:nth-child(4){color:var(--blue)!important}

/* Bottom CTA */
.pcta-section{padding:90px 5vw;text-align:center;position:relative;overflow:hidden}
.pcta-section::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:400px;background:radial-gradient(ellipse,var(--tag-bg),transparent 65%);pointer-events:none}
.pcta-section h2{font-family:var(--font-heading);font-weight:800;font-size:clamp(1.8rem,4vw,3rem);letter-spacing:-.03em;margin-bottom:.8rem;position:relative}
.pcta-section p{color:var(--text-3);font-size:.95rem;margin-bottom:2rem;position:relative}
.pcta-btns{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;position:relative}

:root[data-theme="light"] .ph-hero h1{ text-shadow:none; }
:root[data-theme="light"] .product-dotted-surface{ display:none; }
:root[data-theme="light"] .ph-hero::before{
  background:
    radial-gradient(ellipse, rgba(0,220,130,0.06) 0%, rgba(0,220,130,0.03) 34%, transparent 68%);
}
.detail-drawer{
  scroll-margin-top:calc(var(--nav-h) + 10px);
}
.detail-drawer[data-open="true"]{
  animation:ddIn .42s cubic-bezier(.25,1,.5,1);
}

@media(max-width:768px){
  .ph-hero{min-height:390px;padding:92px 5vw 58px}
  .filter-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:0 4vw 34px}
  .filter-btn{min-height:40px;justify-content:center;padding:8px 4px;font-size:clamp(.54rem,2.45vw,.7rem);line-height:1.12;white-space:normal;text-align:center}
  .product-dotted-surface{inset:-60px -30% -110px;opacity:.42}
  .product-detail-overlay{padding:calc(var(--nav-h) + 8px) 3vw 14px}
  .detail-drawer{max-height:calc(100svh - var(--nav-h) - 22px);border-radius:16px}
  .detail-drawer-close-top{top:10px;margin:10px 10px -48px 0;padding:8px 12px;border-radius:9px}
  .kit-stage{min-height:auto;padding:48px 14px 16px}
  .kit-caption{left:20px;top:22px;right:20px}
  .kit-gallery{grid-template-columns:1fr;gap:12px;width:100%;padding-top:38px}
  .kit-thumbs{flex-direction:row;justify-content:flex-start;overflow-x:auto;padding:2px 2px 6px}
  .kit-thumb{width:58px;height:58px;flex:0 0 auto}
  .kit-thumb:hover,.kit-thumb.active{transform:translateY(-2px)}
  .kit-board{width:100%;min-height:190px}
  .kit-photo-wrap{width:100%}

  .dd-header{padding:22px 20px 18px}
  .dd-content{padding:20px}
  .dd-cta{padding:16px 20px}
  .compare-section{padding:52px 4vw}
  .pg-grid{grid-template-columns:1fr}
}
`;

/* ─── PRODUCT DATA ──────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "essential",
    tier: "TIER 01 · essential",
    name: "ARC LABS IoT Essential Kit",
    short: "IoT essential Kit",
    tagline: "Dual-controller trainer with Raspberry Pi Pico, ESP32, sensors, relays, and display modules.",
    price: 1,
    oldPrice: 15000,
    color: "var(--accent)",
    glow: "0,220,130",
    image: "/images/products/essential-kit.jpg",
    galleryImages: [
      { src: "/images/products/essential-kit.jpg", alt: "ARC LABS IoT Essential Kit main product image" },
      { src: "/images/products/gallery/essential-kit-1.jpg", alt: "ARC LABS IoT Essential Kit close-up image 1" },
      { src: "/images/products/gallery/essential-kit-2.jpg", alt: "ARC LABS IoT Essential Kit close-up image 2" },
    ],
    badge: "ESSENTIAL",
    badgeBg: "var(--accent-dim)",
    badgeColor: "var(--accent)",
    overview: "The ARC LABS IoT Essential Kit is a compact hands-on trainer built around Raspberry Pi Pico and ESP32. It includes onboard sensor, display, relay, buzzer, potentiometer, terminal, and GPIO sections so students can practice embedded programming, sensor reading, Wi-Fi/Bluetooth IoT, and basic automation on one ready-to-use board.",
    controllers: ["Raspberry Pi Pico", "ESP32 Wi-Fi + Bluetooth"],
    sensors: ["DHT11 — Temperature & Humidity", "HC-SR04 — Ultrasonic Sensor", "LDR — Light Sensor", "IR Obstacle Sensor"],
    sensors: ["HC-SR04 Ultrasonic Sensor", "DHT Sensor Interface", "IR / Digital Sensor Interface", "Analog Sensor Input via Potentiometer"],
    display: ["0.96\" OLED Display", "Status LED Indicators", "Active Buzzer"],
    actuators: ["Dual Relay Modules", "Tactile Push Buttons", "Screw Terminal Outputs"],
    connectivity: ["Pico GPIO Breakouts", "ESP32 GPIO Breakouts", "UART / I2C / SPI practice headers", "5V & 3.3V Power Rails"],
    includes: [
      { label: "HW", name: "Essential Kit Board", desc: "Pre-assembled Pico + ESP32 trainer" },
      { label: "CD", name: "Sample Codes", desc: "Pico, MicroPython, and ESP32 examples" },
      { label: "MN", name: "User Manual", desc: "Pin maps, wiring notes, and lab exercises" },
      { label: "SP", name: "Technical Support", desc: "ARC LABS support access" },
    ],
    useCases: [
      { title: "Pico + ESP32 Training", desc: "Practice GPIO, ADC, I2C display control, and Wi-Fi/Bluetooth IoT with two popular controller platforms." },
      { title: "Sensor & Automation Labs", desc: "Build distance sensing, buzzer alerts, relay switching, and simple monitoring experiments." },
      { title: "Workshop Projects", desc: "Use the onboard modules to complete beginner-friendly embedded and IoT projects without loose wiring." },
    ],
    forTags: ["School Students", "Diploma & Engineering Year 1", "Pico + ESP32 Basics", "Workshop Labs"],
  },
  {
    id: "lite",
    tier: "TIER 02 · STARTER",
    name: "ARC LABS IoT Lite Kit",
    short: "IoT Lite Kit",
    tagline: "Compact, beginner-friendly IoT training board for Arduino & ESP32.",
    price: 18000,
    oldPrice: 21000,
    color: "var(--accent)",
    glow: "0,220,130",
    image: "/images/products/lite-kit.jpg",
    galleryImages: [
      { src: "/images/products/lite-kit.jpg", alt: "ARC LABS IoT Lite Kit main product image" },
      { src: "/images/products/gallery/lite-kit-1.jpg", alt: "ARC LABS IoT Lite Kit product image 1" },
      { src: "/images/products/gallery/lite-kit-2.jpg", alt: "ARC LABS IoT Lite Kit product image 2" },
      { src: "/images/products/gallery/lite-kit-3.jpg", alt: "ARC LABS IoT Lite Kit product image 3" },
    ],
    badge: "BEGINNER",
    badgeBg: "var(--accent-dim)",
    badgeColor: "var(--accent)",
    overview: "The ARC LABS IoT Lite Kit is a compact, budget-friendly training platform designed for beginners, students, and aspiring innovators entering the world of IoT and embedded systems. Dual microcontroller support (Arduino UNO + ESP32) with a curated sensor set and plug-and-play design.",
    controllers: ["Arduino UNO (ATmega328P)", "ESP32 (Dual-core Wi-Fi + Bluetooth)", "Dual MCU slots for flexible usage"],
    sensors: ["DHT11 — Temperature & Humidity", "HC-SR04 — Ultrasonic Distance", "IR Obstacle Sensor — Digital proximity", "Touch Sensor — Capacitive input", "LDR — Light detection", "MQ Gas Sensor — Gas leakage", "Potentiometer — Analog ADC testing"],
    display: ["0.96\" OLED Display (I2C)", "RGB LED Indicators", "Active Buzzer Output"],
    actuators: ["Dual Relay Modules (AC/DC control)", "Tactile Push Buttons"],
    connectivity: ["Onboard 5V/3.3V regulated rails", "Screw terminals for relay", "UART, SPI, I2C, GPIO breakout headers"],
    includes: [
      { label: "HW", name: "Assembled Lite Kit Board", desc: "Fully built, ready-to-use" },
      { label: "CD", name: "Sample Codes", desc: "Arduino & ESP32 examples" },
      { label: "DC", name: "Sensor Datasheets", desc: "All onboard sensors" },
      { label: "MN", name: "Basic User Manual", desc: "Setup and getting started" },
      { label: "SP", name: "Technical Support", desc: "ARC LABS expert team" },
    ],
    useCases: [
      { title: "Academic IoT Lab", desc: "Perfect for school and college IoT labs — students can start without any prior electronics experience." },
      { title: "Embedded Systems Basics", desc: "Learn GPIO, sensors, actuators, and communication protocols from scratch." },
      { title: "DIY & Hobby Projects", desc: "Build smart home prototypes, weather stations, and automation controllers." },
      { title: "Early Prototyping", desc: "Rapid proof-of-concept for IoT product ideas — from idea to working demo in hours." },
    ],
    forTags: ["School Students (Class 9-12)", "Engineering Year 1", "Beginners & Hobbyists", "Academic Labs"],
  },
  {
    id: "experience",
    tier: "TIER 03 · FLAGSHIP",
    name: "ARC LABS IoT Experience Kit",
    short: "IoT Experience Kit",
    tagline: "All-in-one multi-MCU trainer — the most versatile kit in the lineup.",
    price: 24000,
    oldPrice: 27000,
    color: "var(--accent)",
    glow: "0,220,130",
    image: "/images/products/experience-kit.jpg",
    galleryImages: [
      { src: "/images/products/experience-kit.jpg", alt: "ARC LABS IoT Experience Kit main product image" },
      { src: "/images/products/gallery/experience-kit-1.jpg", alt: "ARC LABS IoT Experience Kit board top view" },
      { src: "/images/products/gallery/experience-kit-2.jpg", alt: "ARC LABS IoT Experience Kit close-up view" },
    ],
    badge: "BEST SELLER",
    badgeBg: "var(--accent-dim)",
    badgeColor: "var(--accent)",
    isBest: true,
    overview: "The ARC LABS IoT Experience Kit is a comprehensive, all-in-one embedded systems trainer supporting 5 microcontrollers — Arduino, ESP32, STM32, Raspberry Pi Pico, and Raspberry Pi 4/5 — with LoRa, GSM/4G, RS485, and full sensor coverage.",
    controllers: ["Arduino UNO (ATmega328P) — Beginner dev", "ESP32 DevKit — Dual-core Wi-Fi + BT", "STM32 DevKit — ARM Cortex-M industrial", "Raspberry Pi Pico/W — RP2040 + Wi-Fi", "Raspberry Pi 4/5 Header — 40-pin GPIO"],
    sensors: ["BMP180 — Barometric pressure & temp", "DHT11 — Temperature & Humidity", "Ultrasonic HC-SR04 — Distance", "IR Obstacle Detection", "INA219 — Current & Voltage monitoring", "Potentiometer — Analog ADC input"],
    display: ["1.8\" TFT Color Display (SPI)", "RGB LED — Full color", "Active Buzzer", "4x DP Switches with onboard LEDs"],
    actuators: ["Dual Relay Module (RELAY1 & RELAY2)", "Servo Motor Port", "Digital Output Headers"],
    connectivity: ["LoRa Module Interface — Long range", "GSM/4G Module (SIMCOM) — SIM slot", "RS485 — Industrial serial", "I2C & UART Headers", "USB-Powered", "GPIO Breakout Headers"],
    includes: [
      { label: "HW", name: "Pre-assembled Training Board", desc: "Ready to use — plug in and start" },
      { label: "PW", name: "Optional Power Supply", desc: "External 5V supply supported" },
      { label: "CD", name: "Sample Codes & Manuals", desc: "All 5 controller platforms covered" },
      { label: "CL", name: "Cloud Platform Access", desc: "Arc Lab Cloud, Blynk, MQTT ready" },
      { label: "SP", name: "Expert Technical Support", desc: "ARC LABS certified team" },
    ],
    useCases: [
      { title: "Wireless Sensor Networks", desc: "Use LoRa and GSM to build long-range IoT sensor networks for agriculture, smart cities, or industry." },
      { title: "Embedded Systems R&D", desc: "Experiment with 5 different MCU platforms — compare performance, power, and code on real hardware." },
      { title: "Cloud IoT Integration", desc: "Connect to Arc Lab Cloud, Blynk, or custom MQTT servers and build live dashboards." },
      { title: "Industrial Monitoring", desc: "Use RS485, current sensing, and relay control to simulate industrial automation scenarios." },
      { title: "Smart Home Systems", desc: "Build complete smart home automation with sensors, relays, cloud alerts, and remote control." },
      { title: "AIoT Projects", desc: "Combine sensor data with edge AI on Raspberry Pi — build intelligent IoT systems." },
    ],
    forTags: ["Engineering Year 1-3", "IoT Professionals", "R&D Labs", "Academic Institutions", "Training Programs"],
  },
  {
    id: "pro",
    tier: "TIER 04 · ADVANCED",
    name: "ARC LABS IoT Pro Kit",
    short: "IoT Pro Kit",
    tagline: "High-performance board for advanced IoT, edge AI, and Raspberry Pi.",
    price: 30000,
    oldPrice: 33000,
    color: "var(--accent)",
    glow: "0,220,130",
    image: "/images/products/pro-kit.jpg",
    galleryImages: [
      { src: "/images/products/pro-kit.jpg", alt: "ARC LABS IoT Pro Kit main product image" },
      { src: "/images/products/gallery/pro-kit-1.jpg", alt: "ARC LABS IoT Pro Kit board top view" },
      { src: "/images/products/gallery/pro-kit-2.jpg", alt: "ARC LABS IoT Pro Kit detailed view" },
    ],
    badge: "ADVANCED",
    badgeBg: "var(--accent-dim)",
    badgeColor: "var(--accent)",
    overview: "The ARC LABS IoT Pro Kit is a high-performance development board for advanced learners, researchers, and developers. Dual-controller support for Raspberry Pi 4 and ESP32 with shared I/O zones — ideal for edge computing, AIoT, sensor fusion, and complex data acquisition.",
    controllers: ["Raspberry Pi 4 — 40-pin GPIO interface", "ESP32 DevKit — Wi-Fi + Bluetooth", "Shared I/O zones for hybrid Pi + ESP32 experiments"],
    sensors: ["BMP180 — Barometric Pressure & Temp", "DHT11 — Temperature & Humidity", "HC-SR04 — Ultrasonic Distance", "MQ-135 — Gas & Air Quality", "ADXL345 — 3-Axis Accelerometer", "Touch Sensor — Capacitive", "IR Obstacle Detection", "LDR — Light Dependent Resistor", "Potentiometer — ADC testing"],
    display: ["1.8\" SPI TFT Color Display", "RGB LED Output", "1-Digit 7-Segment Display", "3x Push Buttons", "Onboard 3.3V & 5V Power Indicators"],
    actuators: ["Dual Relay Module", "Active Buzzer", "GPIO Breakout Headers"],
    connectivity: ["Isolated 3.3V and 5V power rails", "MCP3008 ADC — analog sensor inputs", "GPIO expansion for Pi + ESP32", "USB / Power connectivity"],
    includes: [
      { label: "HW", name: "Assembled IoT Pro Kit Board", desc: "Fully built and tested" },
      { label: "CB", name: "Ribbon Cable for Raspberry Pi", desc: "40-pin GPIO ribbon included" },
      { label: "CD", name: "Sample Codes & Tutorials", desc: "Python (Pi) + Arduino (ESP32)" },
      { label: "DC", name: "Full Documentation", desc: "Online tutorials + schematic" },
      { label: "SP", name: "Arc Lab Technical Support", desc: "Priority support access" },
    ],
    useCases: [
      { title: "Edge Computing & AIoT", desc: "Run TensorFlow Lite models on Raspberry Pi while ESP32 handles real-time sensor acquisition." },
      { title: "Environmental Monitoring", desc: "Multi-sensor data logging with gas, temperature, pressure, light, and motion — cloud-connected." },
      { title: "Wireless Data Logging", desc: "ESP32 Wi-Fi + Raspberry Pi Linux stack for enterprise-grade wireless sensor deployments." },
      { title: "Industrial Training", desc: "Simulate real industrial sensor systems — accelerometer, gas, relay control, and current sensing." },
      { title: "Research Projects", desc: "Ideal for dissertation, publication, and advanced research in embedded systems and IoT." },
      { title: "Product Development", desc: "Use as a rapid-development platform to validate IoT product concepts before PCB design." },
    ],
    forTags: ["Engineering Year 3-4", "Postgraduate Students", "Researchers & R&D Teams", "IoT Professionals", "Product Developers"],
  },
];

/* ─── COMPARISON DATA ──────────────────────────────────────────── */
const COMPARE_ROWS = [

  {
    section: "CONTROLLERS",
  },

  {
    label: "Arduino UNO",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "—",
  },

  {
    label: "ESP32",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "STM32",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "—",
  },

  {
    label: "Raspberry Pi Pico/W",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "—",
  },

  {
    label: "Raspberry Pi 4/5",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  // =========================

  {
    section: "SENSORS",
  },

  {
    label: "DHT11 Temp & Humidity",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Ultrasonic HC-SR04",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "BMP180 Barometric",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "INA219 Current/Voltage",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "—",
  },

  {
    label: "Gas Sensor MQ135",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "IR Obstacle Sensor",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "LDR Sensor",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  // =========================

  {
    section: "DISPLAY & UI",
  },

  {
    label: "OLED Display",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "RGB LEDs",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Push Buttons",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Buzzer",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  // =========================

  {
    section: "CONNECTIVITY",
  },

  {
    label: "Wi-Fi",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Bluetooth",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "LoRa",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "GSM / 4G",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "RS485 Industrial",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  // =========================

  {
    section: "APPLICATIONS",
  },

  {
    label: "Beginner IoT Projects",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Embedded Systems",
    essential: "✓",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "Industrial IoT",
    essential: "—",
    lite: "—",
    exp: "✓",
    pro: "✓",
  },

  {
    label: "AI + Edge Computing",
    essential: "—",
    lite: "—",
    exp: "—",
    pro: "✓",
  },

  {
    label: "Cloud Integration",
    essential: "—",
    lite: "✓",
    exp: "✓",
    pro: "✓",
  },

];
/* ─── DETAIL DRAWER ──────────────────────────────────────────────── */
function getEssentialCompareValue(row) {
  const overrides = {
    "Arduino UNO": "—",
    "Raspberry Pi Pico/W": "✓",
    "LDR Sensor": "—",
    "RGB LEDs": "✓",
    "Cloud Integration": "✓",
  };

  return overrides[row.label] || row.essential;
}

function isCompareTick(value) {
  return value === "✓" || value === "âœ“";
}

function isCompareDash(value) {
  return value === "—" || value === "â€”";
}

function DetailDrawer({ product, anchorY, onClose }) {
  useBodyScrollLock(true);
  const [tab, setTab] = useState("specs");
  const galleryImages = product.galleryImages?.length
    ? product.galleryImages
    : [{ src: product.image, alt: product.name }];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [zoomPoint, setZoomPoint] = useState({ active: false, x: 50, y: 50 });
  const ref = useRef(null);

  const updateZoomPoint = (target, clientX, clientY) => {
    const rect = target.getBoundingClientRect();
    setZoomPoint({
      active: true,
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    });
  };

  const resetZoomPoint = () => {
    setZoomPoint((current) => ({ ...current, active: false }));
  };

  const TABS = [
    { id: "specs", label: "Specifications" },
    { id: "inbox", label: "What's Included" },
    { id: "usecases", label: "Use Cases" },
    { id: "compare", label: "Compare All" },
  ];

  const drawer = (
    <div className="product-detail-overlay" style={{ "--product-anchor-y": `${Math.round(anchorY || 140)}px` }} onClick={onClose}>
    <div
      className="detail-drawer"
      data-open="true"
      ref={ref}
      style={{
        "--kit-color": product.color,
        "--kit-glow": product.glow,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="detail-drawer-close-top" type="button" onClick={onClose}>
        Close
      </button>
      <div className="kit-stage">
        <div className="kit-caption">
          {product.short} assembly
        </div>
        <div className="kit-gallery">
          {galleryImages.length > 1 && (
            <div className="kit-thumbs" aria-label={`${product.name} images`}>
              {galleryImages.map((image) => (
                <button
                  type="button"
                  key={image.src}
                  className={`kit-thumb${activeImage.src === image.src ? " active" : ""}`}
                  onClick={() => setActiveImage(image)}
                  aria-label={`View ${image.alt || product.name}`}
                >
                  <img src={image.src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="kit-board">
            <div
              className={`kit-photo-wrap${zoomPoint.active ? " is-zooming" : ""}`}
              style={{
                "--zoom-x": `${zoomPoint.x}%`,
                "--zoom-y": `${zoomPoint.y}%`,
              }}
              onMouseMove={(event) => updateZoomPoint(event.currentTarget, event.clientX, event.clientY)}
              onMouseLeave={resetZoomPoint}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                if (touch) updateZoomPoint(event.currentTarget, touch.clientX, touch.clientY);
              }}
              onTouchMove={(event) => {
                const touch = event.touches[0];
                if (touch) updateZoomPoint(event.currentTarget, touch.clientX, touch.clientY);
              }}
              onTouchEnd={resetZoomPoint}
              onTouchCancel={resetZoomPoint}
            >
              <img className="kit-photo" src={activeImage.src} alt={activeImage.alt || product.name} />
            </div>
          </div>
        </div>
      </div>
      <div className="dd-header">
        <div className="dd-hl">
          <div className="dd-eyebrow" style={{ color: product.color }}>{product.tier}</div>
          <h2>{product.name}</h2>
          <p>{product.overview}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "1rem" }}>
            {product.forTags.map((f) => (
              <span key={f} className="chip" style={{ color: product.color, borderColor: `${product.color}30` }}>{f}</span>
            ))}
          </div>
        </div>
        <div className="dd-hr">
          <div className="dd-price-big" style={{ color: product.color }}>
            ₹{product.price.toLocaleString("en-IN")} <span>/ unit</span>
          </div>
          <div style={{ textDecoration: "line-through", fontSize: ".8rem", color: "var(--text-4)", textAlign: "right" }}>
            MRP ₹{product.oldPrice.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="dd-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`dd-tab${tab === t.id ? " active" : ""}`} style={{ "--tab-c": product.color }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="dd-content">
        {tab === "specs" && (
          <div className="spec-sections">
            {[
              { title: "Controllers / MCUs", items: product.controllers },
              { title: "Sensors", items: product.sensors },
              { title: "Display & Output", items: product.display },
              { title: "Actuators", items: product.actuators },
              { title: "Connectivity & Power", items: product.connectivity },
            ].map((sec) => (
              <div className="spec-section" key={sec.title} style={{ "--ss-c": product.color }}>
                <h4>{sec.title}</h4>
                <ul className="spec-list">
                  {sec.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "inbox" && (
          <div className="inbox-grid">
            {product.includes.map((item) => (
              <div className="inbox-item" key={item.name}>
                <span className="inbox-icon">{item.label}</span>
                <div>
                  <div className="inbox-name">{item.name}</div>
                  <div className="inbox-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "usecases" && (
          <div className="usecase-grid">
            {product.useCases.map((uc, i) => (
              <div className="usecase-card" key={uc.title} style={{ "--uc-c": product.color }}>
                <div className="usecase-num">USE CASE {String(i + 1).padStart(2, "0")}</div>
                <div className="usecase-title">{uc.title}</div>
                <div className="usecase-desc">{uc.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "compare" && (
          <div style={{ overflowX: "auto" }}>
            <table className="fct">
<thead>
  <tr>
    <th style={{ minWidth: "210px" }}>Feature</th>

    <th className="th-essential">
      IoT Essential Kit
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹12,000
      </span>
    </th>

    <th className="th-lite">
      IoT Lite Kit
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹18,000
      </span>
    </th>

    <th className="th-kit">
      IoT Experience Kit
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹24,000
      </span>
    </th>

    <th className="th-pro">
      IoT Pro Kit
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹30,000
      </span>
    </th>
  </tr>
</thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => {
if (row.cat) return <tr className="fct-cat" key={i}><td colSpan={5}>{row.label}</td></tr>;
                  const cls = (v) => v === "✓" ? "fct-yes" : v === "—" ? "fct-no" : row.priceRow ? "fct-val" : "";
                  const cls2 = (v) => isCompareTick(v) ? "fct-yes" : isCompareDash(v) ? "fct-no" : row.priceRow ? "fct-val" : "";
                  return (
                    <tr key={i} className={row.priceRow ? "price-row-fct" : ""}>
                      <td>{row.label}</td>
                      <td className={cls2(getEssentialCompareValue(row))}>{getEssentialCompareValue(row)}</td>
                      <td className={cls(row.lite)}>{row.lite}</td>
                      <td className={cls(row.exp)}>{row.exp}{row.label === "Best For" && <span className="fct-best" style={{ marginLeft: 6 }}>BEST</span>}</td>
                      <td className={cls(row.pro)}>{row.pro}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dd-cta">
        <div className="dd-cta-note">
          <strong>{product.short}</strong> · ₹{product.price.toLocaleString("en-IN")} · Made in India
        </div>
        <div className="dd-cta-btns">
          <a href="https://wa.me/917815809412" className="btn btn-secondary" target="_blank" rel="noreferrer">WhatsApp</a>
          <button className="btn btn-primary" style={{ background: product.color }} onClick={() => window.location.href = `/checkout?product=${product.id}&price=${product.price}`}>
            Order This Kit &rarr;
          </button>
        </div>
      </div>
    </div>
    </div>
  );

  return typeof document === "undefined" ? drawer : createPortal(drawer, document.body);
}

/* ─── PRODUCT CARD ───────────────────────────────────────────────── */
function ProductCard({ product, isSelected, onSelect }) {
  return (
    <div
      className={`pcard${isSelected ? " selected" : ""}`}
      style={{ "--pc-color": product.color }}
      onClick={(event) => onSelect(product.id, event)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product.id, e);
        }
      }}
    >
      <div className="pc-visual">
        <div className="pc-badge-wrap">
          <span className="pc-badge">{product.badge}</span>
        </div>
        {product.image ? (
          <img className="pc-image" src={product.image} alt={product.name} loading="lazy" />
        ) : null}
        <div className="pc-fade" />
      </div>

      <div className="pc-body">
        <div className="pc-tier" style={{ color: product.color }}>{product.tier}</div>
        <div className="pc-name">{product.name}</div>
        <div className="pc-tagline">{product.tagline}</div>
        <div className="pc-chips">
          {product.controllers.slice(0, 3).map((c) => (
            <span className="chip" key={c}>{c.split("—")[0].split("(")[0].trim()}</span>
          ))}
        </div>
        <div className="pc-price-row">
          <div>
            <div className="pc-price" style={{ color: product.color }}>₹{product.price.toLocaleString("en-IN")} <span> included GST / unit</span></div>
            <div className="pc-old-price">MRP ₹{product.oldPrice.toLocaleString("en-IN")}</div>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: ".62rem", color: product.color, background: product.badgeBg, padding: "4px 10px", borderRadius: "5px", textAlign: "center" }}>
            SAVE<br />₹{(product.oldPrice - product.price).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="pc-footer">
        <button
          className="pc-btn-detail"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product.id, e);
          }}
        >
          {isSelected ? "Hide Details" : "Full Specs"}
        </button>
        <button
          className="pc-btn-buy"
          style={{ background: product.color }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/checkout?product=${product.id}&price=${product.price}`;
          }}
        >
          Order Now
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function ProductsPage() {
  const [selected, setSelected] = useState(null);
  const [detailAnchorY, setDetailAnchorY] = useState(140);
  const [filter, setFilter] = useState("all");
  const handleSelect = (id, event) => {
    if (event?.currentTarget) setDetailAnchorY(event.currentTarget.getBoundingClientRect().top);
    setSelected((prev) => (prev === id ? null : id));
  };

  const handleFilter = (id) => {
    setFilter(id);
    setSelected(null);
  };

  const filtered = filter === "all" ? PRODUCTS
    : filter === "essential" ? PRODUCTS.filter((p) => p.id === "essential")
    : filter === "beginner" ? PRODUCTS.filter((p) => p.id === "lite")
    : filter === "flagship" ? PRODUCTS.filter((p) => p.id === "experience")
    : PRODUCTS.filter((p) => p.id === "pro");

  const selectedId = selected;
  const selectedProduct = PRODUCTS.find((p) => p.id === selectedId);

  const FILTERS = [
    { id: "all", label: "All Kits" },
    { id: "essential", label: "Essential" },
    { id: "beginner", label: "Beginner" },
    { id: "flagship", label: "Flagship" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <>
      <Helmet>
        <title>IoT &amp; Robotics AI Kits, Drones &amp; STEM Educational Boards | ARC LABS</title>
        <meta name="description" content="Buy premium made-in-India IoT and robotics AI kits, educational drones, and STM32/ESP32/Raspberry Pi development boards online. Designed for STEM school labs &amp; college training." />
        <link rel="canonical" href="https://arclabs.in/products" />
        <meta property="og:url" content="https://arclabs.in/products" />
        <meta property="og:title" content="IoT &amp; Robotics AI Kits, Drones &amp; STEM Educational Boards" />
        <meta property="og:description" content="Buy premium educational AI, IoT, robotics kits and drone training boards online. Support for Arduino, ESP32, STM32, and Raspberry Pi." />
      </Helmet>
      <style>{pageStyles}</style>

      <div className="ph-hero">
        <DottedSurface className="product-dotted-surface" />
        <div className="badge" style={{ marginBottom: "1.8rem" }}>
          ARC Labs Hardware · Made in India
        </div>
        <h1>IoT &amp; Robotics Development Kits<br /><em>for Innovation</em></h1>
        <p>Four development boards. Every major microcontroller. Designed in Hyderabad for Indian classrooms and labs.</p>
      </div>

      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button key={f.id} className={`filter-btn${filter === f.id ? " active" : ""}`} onClick={() => handleFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="products-wrap">
        <div className={`pg-grid${selectedId ? " focus-mode" : ""}`}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} isSelected={selectedId === product.id} onSelect={handleSelect} />
          ))}
        </div>
        {selectedId && selectedProduct && (
          <DetailDrawer key={selectedId} product={selectedProduct} anchorY={detailAnchorY} onClose={() => setSelected(null)} />
        )}
      </div>

      <div className="compare-section">
        <div className="section-label">Side-by-Side Comparison</div>
        <h2 className="section-heading">Which kit is right for you?</h2>
        <p className="section-desc" style={{ marginBottom: "2.5rem" }}>Compare all three kits across controllers, sensors, connectivity, and price.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="fct">
<thead>
  <tr>
    <th style={{ minWidth: "210px" }}>Feature</th>

    <th className="th-essential">
      IOT ESSENTIAL KIT
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹12,000
      </span>
    </th>

    <th className="th-lite">
      IOT LITE KIT
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹18,000
      </span>
    </th>

    <th className="th-kit">
      IOT EXPERIENCE KIT
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹24,000
      </span>
    </th>

    <th className="th-pro">
      IOT PRO KIT
      <br />
      <span
        style={{
          fontSize: ".65rem",
          fontWeight: 400,
          color: "var(--text-3)",
        }}
      >
        ₹30,000
      </span>
    </th>
  </tr>
</thead>

<tbody>
  {COMPARE_ROWS.map((row, i) => {
    if (row.section)
      return (
        <tr className="fct-cat" key={i}>
          <td colSpan={5}>{row.section}</td>
        </tr>
      );

    const cell = (v) =>
      v === "✓" ? (
        <span className="fct-yes">{v}</span>
      ) : v === "—" ? (
        <span className="fct-no">{v}</span>
      ) : (
        <span className="fct-val">{v}</span>
      );

    const cell2 = (v) =>
      isCompareTick(v) ? (
        <span className="fct-yes">{v}</span>
      ) : isCompareDash(v) ? (
        <span className="fct-no">{v}</span>
      ) : (
        <span className="fct-val">{v}</span>
      );

    return (
      <tr key={i}>
        <td>{row.label}</td>

        <td>{cell2(getEssentialCompareValue(row))}</td>

        <td>{cell(row.lite)}</td>

        <td>{cell(row.exp)}</td>

        <td>{cell(row.pro)}</td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>
      </div>

      <div className="pcta-section">
        <h2>Need help choosing the <span style={{ color: "var(--accent)" }}>right kit?</span></h2>
        <p>Talk to our team. We'll recommend the right board for your lab, budget, and curriculum.</p>
        <div className="pcta-btns">
          <a href="tel:+917815809412" className="btn btn-primary">+91 7815809412</a>
          <a href="https://wa.me/917815809412" className="btn btn-secondary" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="mailto:hello@arclabs.in" className="btn btn-secondary">hello@arclabs.in</a>
        </div>
        <p style={{ marginTop: "1.5rem", fontSize: ".85rem", color: "var(--text-3)" }}>
          Need a complete lab? <Link to="/lab-packages" style={{ color: "var(--accent)" }}>See our lab packages &rarr;</Link>
          &nbsp;&middot;&nbsp; <Link to="/programs" style={{ color: "var(--accent)" }}>Explore training programs &rarr;</Link>
        </p>
      </div>
    </>
  );
}
