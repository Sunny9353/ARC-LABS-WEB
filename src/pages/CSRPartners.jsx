import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useBodyScrollLock, validateRequiredFields } from "../utils/ui";

/* ═══════════════════════════════════════════════════════════════════
   CSR PARTNERS PAGE — Premium dark tech design system
   Uses global tokens from global.css + scoped pageStyles
═══════════════════════════════════════════════════════════════════ */

const pageStyles = `
/* ── CSR Hero ─────────────────────────────────────── */
.csr-hero{
  min-height:92vh;display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(460px,.95fr);
  position:relative;overflow:hidden;
}
@media(max-width:1100px){.csr-hero{grid-template-columns:minmax(0,1.25fr) minmax(360px,.9fr)}}
@media(max-width:900px){.csr-hero{grid-template-columns:1fr;min-height:auto}}

.csr-hero-left{
  min-width:0;
  padding:120px clamp(40px,5vw,96px) 80px 5vw;
  display:flex;flex-direction:column;justify-content:center;
  position:relative;z-index:1;
  border-right:1px solid var(--border-1);
  background:var(--surface);
}
@media(max-width:900px){.csr-hero-left{padding:100px 5vw 60px;border-right:none;border-bottom:1px solid var(--border-1)}}
@media(max-width:640px){.csr-hero-left{padding:84px 6vw 52px}}

.csr-hero-left h1{
  font-family:var(--font-heading);font-weight:800;
  max-width:980px;
  font-size:clamp(2.75rem,4.15vw,4.2rem);
  line-height:1.03;letter-spacing:-.032em;margin-bottom:1.5rem;
  color:var(--text-1);
  text-wrap:balance;
  overflow-wrap:normal;
}
@media(max-width:640px){
  .csr-hero-left h1{
    font-size:clamp(2.25rem,12vw,3.2rem);
    line-height:1.08;
  }
}
.csr-hero-left h1 em{
  font-style:normal;
  background:linear-gradient(135deg,var(--accent),var(--blue));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  display:block;
}
.csr-deck{
  font-size:1rem;color:var(--text-3);
  max-width:420px;line-height:1.8;margin-bottom:2rem;
  text-wrap:pretty;
}
.csr-ctas{display:flex;gap:.8rem;flex-wrap:wrap}

.csr-compliance{
  margin-top:2rem;display:inline-flex;align-items:center;gap:12px;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  border-radius:10px;padding:12px 16px;max-width:420px;
}
.csr-comp-icon{
  width:36px;height:36px;border-radius:8px;flex-shrink:0;
  background:var(--tag-bg);display:flex;align-items:center;justify-content:center;
  font-size:.7rem;font-weight:700;color:var(--accent);font-family:var(--font-sans);
}
.csr-comp-text{font-size:.78rem;color:var(--text-3);line-height:1.55}
.csr-comp-text strong{color:var(--accent);display:block;margin-bottom:2px;font-size:.8rem}

/* Hero right — impact wall */
.csr-hero-right{
  min-width:0;
  display:flex;flex-direction:column;justify-content:center;
  padding:80px 5vw 80px clamp(32px,4vw,68px);
  background:var(--surface);position:relative;
}
@media(max-width:900px){.csr-hero-right{padding:56px 5vw 64px}}
@media(max-width:640px){.csr-hero-right{padding:44px 6vw 56px}}
.csr-hero-right::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 60% at 50% 30%,var(--tag-bg),transparent 70%);
  pointer-events:none;
}
.csr-iw-label{
  font-family:var(--font-body);font-size:.7rem;font-weight:600;
  color:var(--accent);letter-spacing:.14em;text-transform:uppercase;
  margin-bottom:1.5rem;opacity:.7;
  width:100%;
  max-width:560px;
  align-self:center;
  display:flex;align-items:center;gap:8px;
}
.csr-iw-label::before{
  content:'';width:12px;height:1px;background:var(--accent);
}
.csr-iw{
  display:grid;grid-template-columns:1fr 1fr;
  gap:1px;background:var(--border-1);border:1px solid var(--border-1);
  border-radius:16px;overflow:hidden;
  width:100%;
  max-width:560px;
  align-self:center;
}
@media(max-width:900px){.csr-iw{max-width:100%}}
@media(max-width:460px){.csr-iw{grid-template-columns:1fr}}
.csr-iw-cell{
  min-width:0;
  background:var(--surface-2);padding:22px 18px;
  position:relative;overflow:hidden;transition:background .2s;
}
.csr-iw-cell:hover{background:var(--surface-3)}
.csr-iw-cell::before{
  content:'';position:absolute;
  top:0;left:0;right:0;height:2px;
  background:var(--cell-color,var(--accent));opacity:.5;
}
.csr-iw-num{
  font-family:var(--font-heading);font-weight:800;
  font-size:clamp(1.65rem,2.4vw,2rem);line-height:1;letter-spacing:-.025em;
  color:var(--cell-color,var(--accent));margin-bottom:.3rem;
  white-space:nowrap;
}
.csr-iw-lbl{font-size:.76rem;color:var(--text-3);line-height:1.5;overflow-wrap:break-word}
.csr-iw-sub{
  font-family:var(--font-sans);font-size:.58rem;
  color:var(--text-4);margin-top:.5rem;letter-spacing:.04em;
  overflow-wrap:break-word;
}

/* ── Marquee ─────────────────────────────────────── */
.csr-marquee{
  border-top:1px solid var(--border-1);border-bottom:1px solid var(--border-1);
  padding:18px 0;overflow:hidden;background:var(--surface);
}
.csr-marquee-track{
  display:flex;gap:3.5rem;white-space:nowrap;
  animation:csrMarquee 25s linear infinite;
}
@keyframes csrMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.csr-mq-item{
  display:flex;align-items:center;gap:10px;flex-shrink:0;
  font-family:var(--font-sans);font-size:.68rem;
  color:var(--text-4);letter-spacing:.08em;
}
.csr-mq-item::before{content:'';width:4px;height:4px;border-radius:50%;background:var(--accent);opacity:.6}

/* ── Section common ──────────────────────────────── */
.csr-sec{padding:80px 5vw;position:relative;z-index:1}
.csr-sec-alt{background:var(--surface);border-top:1px solid var(--border-1);border-bottom:1px solid var(--border-1)}

/* ── Why CSR Grid ────────────────────────────────── */
.csr-why-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:1px;margin-top:3rem;
  background:var(--border-1);border:1px solid var(--border-1);border-radius:16px;overflow:hidden;
}
@media(max-width:980px){.csr-why-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.csr-why-grid{grid-template-columns:1fr}}
.csr-why-card{
  background:var(--surface-2);padding:30px 28px;
  position:relative;overflow:hidden;transition:background .25s;
}
.csr-why-card:hover{background:var(--surface-3)}
.csr-why-card::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--wc-color,var(--accent)),transparent);
  transform:scaleX(0);transform-origin:left;transition:transform .3s;
}
.csr-why-card:hover::after{transform:scaleX(1)}
.csr-why-icon{
  width:44px;height:44px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:.65rem;font-weight:700;font-family:var(--font-sans);
  margin-bottom:1.2rem;
}
.csr-why-card h3{
  font-family:var(--font-heading);font-weight:700;font-size:1.05rem;
  letter-spacing:-.02em;margin-bottom:.5rem;color:var(--text-1);
}
.csr-why-card p{font-size:.83rem;color:var(--text-3);line-height:1.7}
.csr-why-stat{
  margin-top:1rem;
  font-family:var(--font-sans);font-size:.65rem;
  color:var(--wc-color,var(--accent));letter-spacing:.05em;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  display:inline-block;padding:3px 10px;border-radius:4px;
}

/* ── Schedule VII ────────────────────────────────── */
.csr-sch7-layout{
  display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:start;
}
@media(max-width:800px){.csr-sch7-layout{grid-template-columns:1fr;gap:2.5rem}}

.csr-sch7-doc{
  background:var(--surface-2);border:1px solid var(--border-2);border-radius:16px;overflow:hidden;
}
.csr-sch7-doc-header{
  padding:20px 24px;border-bottom:1px solid var(--border-1);
  display:flex;align-items:center;gap:12px;justify-content:space-between;
}
.csr-doc-chip{
  font-family:var(--font-sans);font-size:.6rem;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  color:var(--accent);padding:3px 10px;border-radius:4px;letter-spacing:.06em;
}
.csr-sch7-doc-body{padding:24px}
.csr-sch7-clause{
  display:flex;gap:14px;padding:12px 0;
  border-bottom:1px solid var(--border-1);transition:background .15s;
}
.csr-sch7-clause:last-child{border-bottom:none}
.csr-clause-num{
  font-family:var(--font-sans);font-size:.62rem;
  color:var(--accent);width:30px;flex-shrink:0;margin-top:2px;
}
.csr-clause-text{font-size:.82rem;color:var(--text-3);line-height:1.6}
.csr-clause-text strong{color:var(--accent);font-weight:600}
.csr-sch7-eligible{
  margin-top:1rem;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  border-radius:10px;padding:14px 16px;
  display:flex;align-items:flex-start;gap:10px;
}
.csr-elig-icon{
  width:28px;height:28px;border-radius:6px;flex-shrink:0;
  background:var(--tag-bg);display:flex;align-items:center;justify-content:center;
  font-size:.6rem;font-weight:700;color:var(--accent);font-family:var(--font-sans);
}
.csr-elig-text{font-size:.8rem;color:var(--accent);line-height:1.6}
.csr-elig-text strong{display:block;margin-bottom:3px;font-size:.83rem}

.csr-steps{list-style:none;counter-reset:steps}
.csr-step{
  display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--border-1);
}
.csr-step:last-child{border-bottom:none}
.csr-step-num{
  width:32px;height:32px;border-radius:50%;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  color:var(--accent);font-family:var(--font-heading);font-weight:700;font-size:.9rem;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.csr-step-title{font-size:.88rem;font-weight:600;margin-bottom:.3rem;color:var(--text-1)}
.csr-step-desc{font-size:.8rem;color:var(--text-3);line-height:1.6}

.csr-docs-box{
  margin-top:2rem;background:var(--surface-2);
  border:1px solid var(--border-2);border-radius:12px;padding:18px 20px;
}
.csr-docs-box h4{
  font-family:var(--font-sans);font-size:.62rem;
  color:var(--accent);letter-spacing:.1em;text-transform:uppercase;
  margin-bottom:.9rem;
}
.csr-doc-list{list-style:none;display:flex;flex-direction:column;gap:.5rem}
.csr-doc-list li{
  font-size:.8rem;color:var(--text-3);
  display:flex;align-items:center;gap:8px;
  padding:6px 0;border-bottom:1px dashed var(--border-1);
}
.csr-doc-list li:last-child{border-bottom:none}
.csr-doc-list li::before{content:'>';color:var(--accent);font-size:.7rem;font-family:var(--font-sans)}

/* ── Sector Targeting ────────────────────────────── */
.csr-sectors-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:1rem;margin-top:2.8rem;
}
@media(max-width:980px){.csr-sectors-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.csr-sectors-grid{grid-template-columns:1fr}}
.csr-sector-card{
  background:var(--surface-2);border:1px solid var(--border-1);border-radius:14px;
  padding:22px 20px;cursor:pointer;transition:all .28s;
  position:relative;overflow:hidden;
}
.csr-sector-card:hover{
  border-color:var(--sc-color,var(--accent));transform:translateY(-3px);
  box-shadow:0 16px 40px rgba(0,0,0,.4);
}
.csr-sector-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--sc-color,var(--accent));transform:scaleX(0);transform-origin:left;
  transition:transform .3s;
}
.csr-sector-card:hover::before{transform:scaleX(1)}
.csr-sc-icon{
  width:44px;height:44px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:.6rem;font-weight:700;font-family:var(--font-sans);
  margin-bottom:.9rem;
}
.csr-sc-name{
  font-family:var(--font-heading);font-weight:700;font-size:1rem;
  letter-spacing:-.02em;margin-bottom:.4rem;color:var(--text-1);
}
.csr-sc-desc{font-size:.77rem;color:var(--text-3);line-height:1.6;margin-bottom:.8rem}
.csr-sc-csr{
  font-family:var(--font-sans);font-size:.58rem;
  color:var(--sc-color,var(--accent));letter-spacing:.06em;
}

/* ── Impact Metrics ──────────────────────────────── */
.csr-impact-strip{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
  gap:1px;background:var(--border-1);border-radius:16px;overflow:hidden;
  border:1px solid var(--border-1);margin-top:3rem;
}
.csr-imp-cell{
  background:var(--surface-2);padding:28px 20px;text-align:center;
}
.csr-imp-num{
  font-family:var(--font-heading);font-weight:800;
  font-size:2.2rem;letter-spacing:-.04em;line-height:1;
  color:var(--accent);margin-bottom:.3rem;
}
.csr-imp-label{font-size:.76rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em}
.csr-imp-sub{font-size:.68rem;color:var(--text-4);margin-top:.3rem}

/* ── Case Studies ────────────────────────────────── */
.csr-cases-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:1.5rem;margin-top:3rem;
}
.csr-case-card{
  background:var(--surface-2);border:1px solid var(--border-1);border-radius:16px;
  overflow:hidden;transition:all .3s;
}
.csr-case-card:hover{border-color:var(--border-2);transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.4)}
.csr-case-top{height:4px}
.csr-case-body{padding:24px}
.csr-case-sector{
  display:inline-flex;align-items:center;gap:6px;margin-bottom:.9rem;
  font-family:var(--font-sans);font-size:.6rem;letter-spacing:.08em;
  padding:3px 10px;border-radius:4px;
}
.csr-case-name{
  font-family:var(--font-heading);font-weight:700;font-size:1.05rem;
  letter-spacing:-.02em;margin-bottom:.3rem;color:var(--text-1);
}
.csr-case-location{font-size:.76rem;color:var(--text-4);margin-bottom:.9rem}
.csr-case-metrics{
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:1rem;
}
.csr-case-metric{
  background:var(--surface-3);border-radius:8px;padding:10px 8px;text-align:center;
}
.csr-cm-num{
  font-family:var(--font-heading);font-weight:700;font-size:1rem;line-height:1;
}
.csr-cm-label{font-size:.62rem;color:var(--text-4);margin-top:3px;line-height:1.3}
.csr-case-quote{
  font-size:.8rem;color:var(--text-3);line-height:1.7;
  border-left:2px solid var(--accent);padding-left:12px;font-style:italic;margin-top:.5rem;
}
.csr-case-attr{margin-top:.7rem;font-size:.72rem;color:var(--text-4);font-style:normal}

/* ── Reporting ───────────────────────────────────── */
.csr-report-layout{
  display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start;
}
@media(max-width:800px){.csr-report-layout{grid-template-columns:1fr;gap:2.5rem}}

.csr-rdp{
  background:var(--surface-2);border:1px solid var(--border-2);
  border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);
}
.csr-rdp-header{
  background:var(--surface-3);padding:14px 18px;
  display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid var(--border-1);
}
.csr-rdp-dots{display:flex;gap:6px}
.csr-rdp-dot{width:10px;height:10px;border-radius:50%}
.csr-rdp-title{font-family:var(--font-sans);font-size:.62rem;color:var(--text-4);letter-spacing:.06em}
.csr-rdp-body{padding:22px}
.csr-rdp-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 0;border-bottom:1px solid var(--border-1);
}
.csr-rdp-row:last-child{border-bottom:none}
.csr-rdp-key{font-size:.78rem;color:var(--text-3)}
.csr-rdp-val{font-family:var(--font-sans);font-size:.72rem;color:var(--accent);font-weight:600}
.csr-rdp-bar-row{padding:12px 0;border-bottom:1px solid var(--border-1)}
.csr-rdp-bar-label{display:flex;justify-content:space-between;font-size:.72rem;color:var(--text-3);margin-bottom:6px}
.csr-rdp-bar{height:5px;background:var(--border-1);border-radius:3px;overflow:hidden}
.csr-rdp-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--blue))}

.csr-report-items{display:flex;flex-direction:column;gap:1rem}
.csr-report-item{
  background:var(--surface-2);border:1px solid var(--border-1);border-radius:12px;
  padding:18px 20px;display:flex;gap:14px;align-items:flex-start;
  transition:border-color .2s;
}
.csr-report-item:hover{border-color:var(--border-2)}
.csr-ri-icon{
  width:40px;height:40px;border-radius:10px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:.6rem;font-weight:700;font-family:var(--font-sans);
}
.csr-ri-name{font-size:.87rem;font-weight:600;margin-bottom:3px;color:var(--text-1)}
.csr-ri-desc{font-size:.77rem;color:var(--text-3);line-height:1.55}
.csr-ri-badge{
  display:inline-block;margin-top:6px;
  font-family:var(--font-sans);font-size:.56rem;
  padding:2px 8px;border-radius:3px;letter-spacing:.05em;
}

/* ── Platforms ────────────────────────────────────── */
.csr-platforms{
  padding:52px 5vw;
  border-top:1px solid var(--border-1);border-bottom:1px solid var(--border-1);
  background:var(--surface);
}
.csr-platforms-label{
  text-align:center;font-family:var(--font-sans);font-size:.65rem;
  color:var(--text-4);letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:2rem;
}
.csr-platforms-row{
  display:flex;justify-content:center;align-items:center;gap:1.5rem;flex-wrap:wrap;
}
.csr-platform-badge{
  display:flex;align-items:center;gap:10px;
  background:var(--surface-2);border:1px solid var(--border-2);
  border-radius:10px;padding:14px 20px;transition:all .22s;cursor:default;
}
.csr-platform-badge:hover{border-color:var(--tag-bg);background:var(--surface-3)}
.csr-pb-icon{
  width:32px;height:32px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;
  font-size:.55rem;font-weight:700;font-family:var(--font-sans);
}
.csr-pb-name{font-size:.85rem;font-weight:600;color:var(--text-1)}
.csr-pb-status{font-family:var(--font-sans);font-size:.6rem;color:var(--accent);margin-top:2px;letter-spacing:.04em}

/* ── Partnership Tiers ───────────────────────────── */
.csr-tiers-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:1rem;margin-top:3rem;
}
.csr-tier-card{
  background:var(--surface-2);border:1px solid var(--border-1);
  border-radius:16px;padding:28px 24px;
  position:relative;overflow:hidden;transition:all .3s;
}
.csr-tier-card.csr-gold{
  border-color:var(--accent);
  background:linear-gradient(155deg,var(--tag-bg),var(--surface-2));
  box-shadow:0 0 0 1px var(--accent),0 16px 48px var(--tag-bg);
}
.csr-tier-card:hover{transform:translateY(-4px)}
.csr-tier-icon{
  width:48px;height:48px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-size:.7rem;font-weight:800;font-family:var(--font-heading);
  margin-bottom:1rem;
}
.csr-tier-tier{
  font-family:var(--font-sans);font-size:.62rem;
  letter-spacing:.1em;margin-bottom:.4rem;
}
.csr-tier-name{
  font-family:var(--font-heading);font-weight:700;font-size:1.2rem;
  letter-spacing:-.02em;margin-bottom:.3rem;color:var(--text-1);
}
.csr-tier-budget{
  font-family:var(--font-sans);font-size:.75rem;margin-bottom:1rem;
}
.csr-tier-features{list-style:none;margin-bottom:1.2rem}
.csr-tier-features li{
  font-size:.8rem;color:var(--text-3);padding:6px 0;
  border-bottom:1px solid var(--border-1);
  display:flex;align-items:flex-start;gap:8px;
}
.csr-tier-features li:last-child{border-bottom:none}
.csr-tier-features li::before{content:'>';color:var(--accent);font-size:.7rem;flex-shrink:0;margin-top:2px;font-family:var(--font-sans)}
.csr-tier-students{font-family:var(--font-sans);font-size:.65rem;color:var(--text-4)}
.csr-tier-students strong{font-size:.75rem}

/* ── Contact ─────────────────────────────────────── */
.csr-contact-layout{
  display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:start;
}
@media(max-width:800px){.csr-contact-layout{grid-template-columns:1fr;gap:2.5rem}}
.csr-ci-item{
  display:flex;gap:14px;align-items:flex-start;
  padding:16px 0;border-bottom:1px solid var(--border-1);
}
.csr-ci-item:last-child{border-bottom:none}
.csr-ci-icon{
  width:38px;height:38px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:.55rem;font-weight:700;font-family:var(--font-sans);
}
.csr-ci-title{font-size:.85rem;font-weight:600;margin-bottom:2px;color:var(--text-1)}
.csr-ci-val{font-size:.82rem;color:var(--text-3)}
.csr-ci-val a{color:var(--accent);text-decoration:none}
.csr-ci-val a:hover{text-decoration:underline}

/* ── FAQ ─────────────────────────────────────────── */
.csr-faq-item{
  background:var(--surface-2);border:1px solid var(--border-1);
  border-radius:12px;margin-bottom:.8rem;overflow:hidden;
  cursor:pointer;transition:border-color .2s;
}
.csr-faq-item.csr-faq-open{border-color:var(--tag-bg)}
.csr-faq-q{
  padding:18px 20px;display:flex;justify-content:space-between;
  align-items:center;gap:1rem;
}
.csr-faq-q span{font-size:.88rem;font-weight:600;line-height:1.5;color:var(--text-1)}
.csr-faq-toggle{
  width:26px;height:26px;border-radius:6px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:.8rem;
  transition:all .2s;
}
.csr-faq-a{
  padding:0 20px 18px;font-size:.83rem;color:var(--text-3);
  line-height:1.75;border-top:1px solid var(--border-1);
  animation:csrFade .22s ease;
}
@keyframes csrFade{from{opacity:0}to{opacity:1}}

/* ── Bottom CTA ──────────────────────────────────── */
.csr-bottom-cta{
  padding:110px 5vw;text-align:center;
  background:var(--surface);border-top:1px solid var(--border-1);
  position:relative;overflow:hidden;
}
.csr-bottom-cta::before{
  content:'';position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);width:700px;height:500px;
  background:radial-gradient(ellipse,var(--tag-bg),transparent 65%);
  pointer-events:none;
}
.csr-bottom-cta h2{
  font-family:var(--font-heading);font-weight:800;
  font-size:clamp(2.2rem,5vw,4rem);letter-spacing:-.04em;
  line-height:1.02;margin-bottom:1rem;position:relative;color:var(--text-1);
}
.csr-bottom-cta h2 em{
  font-style:normal;
  background:linear-gradient(135deg,var(--accent),var(--blue));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.csr-bottom-cta p{color:var(--text-3);font-size:.97rem;margin-bottom:2.2rem;position:relative;max-width:520px;margin-left:auto;margin-right:auto}
.csr-bottom-btns{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;position:relative}

/* ── Modal ───────────────────────────────────────── */
.csr-modal-overlay{
  position:fixed;inset:0;z-index:1100;
  background:rgba(9,9,11,.92);backdrop-filter:blur(18px);
  display:flex;align-items:center;justify-content:center;
  padding:calc(var(--nav-h) + 18px) 1.5rem 28px;animation:csrFade .2s;
  overflow:hidden;
}
.csr-modal{
  background:var(--surface-3);border:1px solid var(--border-2);
  border-radius:22px;width:100%;max-width:580px;
  max-height:calc(100svh - var(--nav-h) - 46px);overflow-y:auto;
  animation:csrModalScale .32s cubic-bezier(.34,1.56,.64,1);position:relative;
}
@keyframes csrModalScale{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.csr-modal-close{
  position:absolute;top:14px;right:14px;
  background:rgba(255,255,255,.07);border:none;color:var(--text-4);
  width:30px;height:30px;border-radius:7px;font-size:.9rem;
  cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.csr-modal-close:hover{background:rgba(255,255,255,.13);color:var(--text-1)}
.csr-modal-header{padding:32px 32px 20px;border-bottom:1px solid var(--border-1)}
.csr-modal-header h3{
  font-family:var(--font-heading);font-weight:800;font-size:1.4rem;
  letter-spacing:-.03em;margin-bottom:.4rem;color:var(--text-1);
}
.csr-modal-header p{font-size:.83rem;color:var(--text-3);line-height:1.65}
.csr-modal-badges{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem}
.csr-modal-badge{
  font-family:var(--font-sans);font-size:.62rem;
  padding:4px 11px;border-radius:5px;
  background:var(--tag-bg);border:1px solid var(--tag-bg);
  color:var(--accent);letter-spacing:.04em;
}
.csr-modal-body{padding:22px 32px 32px}
.csr-field{margin-bottom:.9rem}
.csr-field label{
  display:block;font-size:.74rem;font-weight:600;
  color:var(--text-3);margin-bottom:5px;letter-spacing:.03em;
}
.csr-field input,.csr-field select,.csr-field textarea{
  width:100%;background:var(--surface-2);
  border:1px solid var(--border-2);border-radius:8px;
  color:var(--text-1);font-family:var(--font-body);
  font-size:.86rem;padding:10px 13px;outline:none;transition:border-color .2s;
}
.csr-field input:focus,.csr-field select:focus,.csr-field textarea:focus{
  border-color:var(--accent);box-shadow:0 0 0 3px var(--tag-bg);
}
.csr-field select option{background:var(--surface-3)}
.csr-field textarea{resize:vertical;min-height:80px}
.csr-field-2{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
@media(max-width:460px){.csr-field-2{grid-template-columns:1fr}}
.csr-submit{
  width:100%;padding:14px;border-radius:10px;
  border:none;cursor:pointer;transition:all .24s;margin-top:.4rem;
  display:flex;align-items:center;justify-content:center;gap:7px;
  font-weight:700;font-size:.95rem;
}
.csr-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
.csr-modal-note{font-size:.7rem;color:var(--text-4);text-align:center;margin-top:.8rem}
.csr-modal-success{padding:52px 32px;text-align:center}
.csr-success-icon{
  width:56px;height:56px;border-radius:14px;margin:0 auto .9rem;
  background:var(--tag-bg);display:flex;align-items:center;justify-content:center;
  font-size:.9rem;font-weight:700;color:var(--accent);font-family:var(--font-sans);
}
.csr-modal-success h3{
  font-family:var(--font-heading);font-size:1.5rem;font-weight:800;
  color:var(--accent);margin-bottom:.5rem;letter-spacing:-.03em;
}
.csr-modal-success p{color:var(--text-3);font-size:.86rem;line-height:1.75}
`;

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */

const IMPACT_WALL = [
  { num: "25,000+", label: "Students Reached", sub: "via CSR-funded programs", color: "var(--accent)" },
  { num: "₹800", label: "Min. Cost Per Beneficiary", sub: "lowest in EdTech CSR segment", color: "var(--blue)" },
  { num: "500+", label: "Labs Installed", sub: "across Telangana & AP", color: "var(--accent)" },
  { num: "10+", label: "Years Delivering", sub: "MSME-registered, Hyderabad", color: "var(--amber)" },
  { num: "100%", label: "Documentation Provided", sub: "Schedule VII compliant", color: "var(--accent)" },
  { num: "3 Yrs", label: "Outcome Tracking", sub: "available for long-term CSR", color: "var(--blue)" },
];

const WHY_ITEMS = [
  { abbr: "VII", title: "Schedule VII Compliant", color: "var(--accent)", desc: "Our programs fall directly under Item (ii) of Schedule VII — ‘Promoting education, including special education and employment enhancing vocation skills.’ Your CSR spend is fully eligible and defensible.", stat: "Companies Act 2013 — Schedule VII" },
  { abbr: "RPT", title: "Board-Ready Reporting", color: "var(--blue)", desc: "We deliver structured impact reports with student headcount, sessions completed, certification rates, and before/after skill assessments — exactly what your Board and CSR Committee need annually.", stat: "Annual Impact Report Included" },
  { abbr: "ROI", title: "Highest Impact per Rupee", color: "var(--accent)", desc: "At ₹800–₹2,000 per direct beneficiary, ARC LABS delivers one of the lowest cost-per-student ratios in STEM education CSR — well below the ₹5,000–₹8,000 typical for comparable programs.", stat: "₹800–₹2,000 per student" },
  { abbr: "INF", title: "Permanent Infrastructure", color: "var(--rose)", desc: "Unlike one-time workshops, our labs are permanent installations. Students, faculty, and communities benefit year after year from a single CSR investment — compounding impact over time.", stat: "3–5 year recurring impact" },
  { abbr: "AUD", title: "Third-Party Verifiable", color: "var(--amber)", desc: "Lab installations, student attendance, and faculty certifications are documented with photographs, sign-in sheets, and institutional records — independently verifiable for CSR audits.", stat: "Audit-ready documentation" },
  { abbr: "BRD", title: "Co-Branding Available", color: "var(--blue)", desc: "Gold and Platinum tier partners receive co-branded lab nameplates, certificates, and collateral — giving your CSR program visible recognition within the institution and community.", stat: "Gold & Platinum tiers only" },
];

const SCH7_CLAUSES = [
  { num: "(i)", text: "Eradicating hunger, poverty and malnutrition...", highlight: false },
  { num: "(ii)", text: null, highlight: true },
  { num: "(iv)", text: "Ensuring environmental sustainability, ecological balance...", highlight: false },
  { num: "(x)", text: "Rural development projects...", highlight: false },
];

const SCH7_STEPS = [
  { num: "1", title: "Identify the Program", desc: "Select the ARC LABS lab package appropriate for your CSR budget and beneficiary targets." },
  { num: "2", title: "Due Diligence", desc: "We provide MSME certificate, PAN, bank details, prior impact reports, and institutional references." },
  { num: "3", title: "CSR Agreement", desc: "A formal implementation agreement is signed between your company, ARC LABS, and the beneficiary institution." },
  { num: "4", title: "Fund Transfer & Execution", desc: "CSR funds are transferred per your company’s process. Lab installation begins within 2 weeks of receipt." },
  { num: "5", title: "Impact Documentation", desc: "During and after the program, we document student data, attendance, certifications, and outcomes." },
  { num: "6", title: "Annual Report Delivery", desc: "Full impact report delivered to your CSR team annually — formatted for board presentation." },
];

const DOCS_WE_PROVIDE = [
  "MSME Certificate and PAN Card",
  "Audited financials (previous 3 years)",
  "80G exemption certificate",
  "Prior CSR impact reports with photographs",
  "Institutional MoU templates",
  "Student-level beneficiary data (anonymized)",
  "Certification records for faculty and students",
  "Cost per beneficiary calculation sheet",
  "Schedule VII eligibility declaration",
  "Annual impact report (formatted for BRSR/Annual Report)",
];

const SECTORS = [
  { abbr: "MFG", name: "Manufacturing", desc: "Large workforces and plant locations near schools — natural fit for community STEM labs.", csr: "₹25L–₹2Cr typical CSR budget", color: "var(--amber)" },
  { abbr: "PHA", name: "Pharma & Life Sciences", desc: "Hyderabad’s largest CSR spenders. Strong alignment with science education outcomes.", csr: "₹50L–₹5Cr typical CSR budget", color: "var(--accent)" },
  { abbr: "IT", name: "IT & Technology", desc: "Tech companies aligning CSR with digital literacy and future workforce development goals.", csr: "₹20L–₹1Cr typical CSR budget", color: "var(--blue)" },
  { abbr: "PWR", name: "Energy & Power", desc: "PSUs like NTPC, BHEL, NMDC — mandated CSR with large education allocations.", csr: "₹1Cr–₹10Cr typical CSR budget", color: "var(--rose)" },
  { abbr: "FIN", name: "Banking & Finance", desc: "Banks with rural and semi-urban branch networks — strong interest in community education.", csr: "₹30L–₹3Cr typical CSR budget", color: "var(--blue)" },
  { abbr: "AUT", name: "Automotive & Engineering", desc: "Tier 1 suppliers and OEMs supporting STEM skills to develop future engineering talent.", csr: "₹25L–₹2Cr typical CSR budget", color: "var(--amber)" },
];

const CASE_STUDIES = [
  { sector: "MANUFACTURING", name: "Govt. High School, Zaheerabad", location: "Sangareddy District, Telangana", metrics: [{ num: "240", label: "Students/Year" }, { num: "₹4.8L", label: "CSR Investment" }, { num: "₹2,000", label: "Per Student" }], quote: "Before the lab, our students had never touched a circuit board. Within 6 months, three students won district-level robotics competitions.", attribution: "— Principal, Govt. HS Zaheerabad", color: "var(--amber)" },
  { sector: "PHARMA", name: "St. Joseph’s High School, Hyderabad", location: "Secunderabad, Telangana", metrics: [{ num: "380", label: "Students/Year" }, { num: "₹9.5L", label: "CSR Investment" }, { num: "₹1,250", label: "Per Student" }], quote: "The ARC LABS team handled everything — installation, training, and annual reporting. Our CSR head presented the impact report directly to our board.", attribution: "— CSR Manager, Pharma Company", color: "var(--accent)" },
  { sector: "IT SECTOR", name: "Polytechnic College, Warangal", location: "Warangal, Telangana", metrics: [{ num: "520", label: "Students/Year" }, { num: "₹14L", label: "CSR Investment" }, { num: "₹900", label: "Per Student" }], quote: "Our IoT and Embedded lab directly improved placement rates. 68% of IoT-certified students received job offers within 3 months of certification.", attribution: "— Principal, Polytechnic College Warangal", color: "var(--blue)" },
];

const PARTNERSHIP_TIERS = [
  { tier: "SILVER PARTNER", name: "Community Impact", abbr: "SLV", budget: "₹5L – ₹15L / year", color: "var(--text-3)", features: ["1 School or College Lab Setup", "50–150 students benefited annually", "Schedule VII documentation", "Annual impact report", "ARC LABS CSR Partner certificate"], students: "50–150" },
  { tier: "GOLD PARTNER", name: "District-Level Impact", abbr: "GLD", budget: "₹15L – ₹50L / year", color: "var(--accent)", goldTier: true, features: ["3–5 School / College Labs", "300–800 students benefited annually", "Co-branded lab nameplates", "Quarterly impact updates", "CSR Board presentation deck", "Dedicated ARC LABS account manager"], students: "300–800" },
  { tier: "PLATINUM PARTNER", name: "State-Level Impact", abbr: "PLT", budget: "₹50L+ / year", color: "var(--blue)", features: ["10+ Labs across districts", "1,000+ students annually", "Full co-branding program", "Featured in ARC LABS Annual Report", "BRSR-ready impact documentation", "Press release and media coverage", "Executive quarterly review meetings"], students: "1,000+" },
];

const REPORT_ITEMS = [
  { abbr: "SUM", bg: "var(--tag-bg)", color: "var(--accent)", name: "Executive Impact Summary", desc: "1-page board-ready summary of beneficiaries, outcomes, and spend.", badge: "BOARD READY", badgeBg: "var(--tag-bg)", badgeColor: "var(--accent)" },
  { abbr: "BEN", bg: "var(--tag-bg)", color: "var(--blue)", name: "Student Beneficiary Data", desc: "Anonymized student count, demographics, attendance, and certification rates.", badge: "ANONYMIZED", badgeBg: "var(--tag-bg)", badgeColor: "var(--blue)" },
  { abbr: "FAC", bg: "var(--tag-bg)", color: "var(--accent)", name: "Faculty Certification Records", desc: "Teacher certification numbers and training hours documented.", badge: "CERTIFIED RECORDS", badgeBg: "var(--tag-bg)", badgeColor: "var(--accent)" },
  { abbr: "VIS", bg: "var(--tag-bg)", color: "var(--rose)", name: "Photo & Video Documentation", desc: "Timestamped installation photos, student activity images, and lab videos.", badge: "VISUAL PROOF", badgeBg: "var(--tag-bg)", badgeColor: "var(--rose)" },
  { abbr: "BSR", bg: "var(--tag-bg)", color: "var(--amber)", name: "BRSR / Annual Report Content", desc: "Pre-formatted content blocks ready to paste into your BRSR or Annual Report.", badge: "BRSR READY", badgeBg: "var(--tag-bg)", badgeColor: "var(--amber)" },
  { abbr: "PKG", bg: "var(--tag-bg)", color: "var(--blue)", name: "Audit Evidence Package", desc: "All documents in a single zip — ready for CA or third-party CSR auditor review.", badge: "AUDIT READY", badgeBg: "var(--tag-bg)", badgeColor: "var(--blue)" },
];

const PLATFORMS = [
  { abbr: "CSR", name: "CSR Box", status: "LISTED & VERIFIED", color: "var(--blue)" },
  { abbr: "GIV", name: "GiveIndia Corporate", status: "REGISTERED", color: "var(--accent)" },
  { abbr: "SAT", name: "Sattva Platform", status: "REGISTERED", color: "var(--amber)" },
  { abbr: "GeM", name: "GeM Portal", status: "EMPANELLED", color: "var(--rose)" },
  { abbr: "TSS", name: "TSSC Telangana", status: "EMPANELLED", color: "var(--violet)" },
];

/* ═══════════════════════════════════════════════════════════════════
   MODAL COMPONENT
═══════════════════════════════════════════════════════════════════ */
function CSRModal({ onClose }) {
  useBodyScrollLock(true);
  const [form, setForm] = useState({
    name: "", title: "", company: "", email: "", phone: "",
    budget: "", sector: "", timeline: "", geography: "", note: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const h = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!validateRequiredFields(e.currentTarget)) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1500);
  };

  return (
    <div className="csr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="csr-modal">
        <button className="csr-modal-close" onClick={onClose}>x</button>
        {done ? (
          <div className="csr-modal-success">
            <div className="csr-success-icon">OK</div>
            <h3>Partnership Enquiry Received</h3>
            <p>
              Thank you. Our CSR partnerships team will reach out within{" "}
              <strong style={{ color: "var(--text-1)" }}>48 hours</strong> with a
              tailored proposal including impact projections, documentation
              samples, and implementation timeline.
              <br /><br />
              For immediate response:<br />
              <strong style={{ color: "var(--accent)" }}>hello@arclabs.in</strong><br />
              <strong style={{ color: "var(--accent)" }}>+91 8699929532 (WhatsApp)</strong>
            </p>
          </div>
        ) : (
          <>
            <div className="csr-modal-header">
              <h3>CSR Partnership Enquiry</h3>
              <p>Our team will prepare a tailored proposal with impact projections, documentation samples, and lab implementation plan within 48 hours.</p>
              <div className="csr-modal-badges">
                {["Schedule VII Eligible", "Impact Report Included", "BRSR-Ready Documentation", "Co-branding Available"].map((t) => (
                  <span className="csr-modal-badge" key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div className="csr-modal-body">
              <form onSubmit={submit}>
                <div className="csr-field-2">
                  <div className="csr-field"><label>Your Name *</label><input name="name" value={form.name} onChange={h} placeholder="Full name" required /></div>
                  <div className="csr-field"><label>Designation *</label><input name="title" value={form.title} onChange={h} placeholder="CSR Head / CFO / Trustee" required /></div>
                </div>
                <div className="csr-field"><label>Company / Organisation *</label><input name="company" value={form.company} onChange={h} placeholder="Company name" required /></div>
                <div className="csr-field-2">
                  <div className="csr-field"><label>Email *</label><input type="email" name="email" value={form.email} onChange={h} placeholder="csr@company.com" required /></div>
                  <div className="csr-field"><label>Phone *</label><input name="phone" value={form.phone} onChange={h} placeholder="+91 XXXXX XXXXX" required /></div>
                </div>
                <div className="csr-field-2">
                  <div className="csr-field">
                    <label>Annual CSR Budget (approx)</label>
                    <select name="budget" value={form.budget} onChange={h}>
                      <option value="">Select range</option>
                      <option>Under &#8377;5 Lakhs</option>
                      <option>&#8377;5L &#8211; &#8377;15L</option>
                      <option>&#8377;15L &#8211; &#8377;50L</option>
                      <option>&#8377;50L &#8211; &#8377;1 Crore</option>
                      <option>Above &#8377;1 Crore</option>
                    </select>
                  </div>
                  <div className="csr-field">
                    <label>Industry Sector</label>
                    <select name="sector" value={form.sector} onChange={h}>
                      <option value="">Select sector</option>
                      <option>Manufacturing</option>
                      <option>Pharma / Life Sciences</option>
                      <option>IT / Technology</option>
                      <option>Energy / Power / PSU</option>
                      <option>Banking / Finance / NBFC</option>
                      <option>Automotive / Engineering</option>
                      <option>FMCG / Consumer</option>
                      <option>Infrastructure / Real Estate</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="csr-field-2">
                  <div className="csr-field">
                    <label>Implementation Timeline</label>
                    <select name="timeline" value={form.timeline} onChange={h}>
                      <option value="">When to start?</option>
                      <option>This financial year (before March)</option>
                      <option>Q1 next year (Apr&#8211;Jun)</option>
                      <option>Q2 next year (Jul&#8211;Sep)</option>
                      <option>Planning phase only</option>
                    </select>
                  </div>
                  <div className="csr-field"><label>Preferred Geography</label><input name="geography" value={form.geography} onChange={h} placeholder="e.g. Telangana, AP, PAN India" /></div>
                </div>
                <div className="csr-field"><label>Additional Context</label><textarea name="note" value={form.note} onChange={h} placeholder="Number of beneficiaries you want to target, specific districts, co-branding requirements, or any other requirements..." /></div>
                <button type="submit" className="btn btn-primary csr-submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Partnership Enquiry"}
                </button>
                <p className="csr-modal-note">Your details are used only to prepare your proposal. ARC LABS does not share contact information with third parties.</p>
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
export default function CSRPartnersPage() {
  const [showModal, setShowModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const FAQS = [
    { q: "Is ARC LABS registered and CSR-eligible?", a: "Yes. ARC LABS is registered under the Ministry of MSME, holds a valid PAN, and maintains audited financial statements. Our programs qualify under Schedule VII Item (ii) of the Companies Act 2013. We can provide all due diligence documents within 24 hours of request." },
    { q: "How do you calculate cost per beneficiary?", a: "Cost per beneficiary is calculated as total CSR grant divided by total number of students who complete at least 60% of the program in a given year. We use a conservative 3-year model — spreading the one-time lab cost over three years of student cohorts — resulting in ₹800–₹2,000 per student depending on package." },
    { q: "Can we select specific schools or districts for the lab?", a: "Yes. You can specify geographic preferences, school type (government, aided, private), student demographics, or any other criteria. We will identify suitable institutions within your preferred geography and share their profiles before any commitment." },
    { q: "What happens after the CSR period ends?", a: "Labs installed by ARC LABS are permanent school infrastructure. After the CSR term ends, the institution can continue using the lab independently — teachers are trained to operate without ARC LABS’ ongoing presence. Annual support contracts can be renewed as a recurring CSR program." },
    { q: "Do you work with government-run schools?", a: "Yes, and we prefer them for CSR programs because they serve the highest-need students. We have experience working with Telangana state government schools, Andhra Pradesh government institutions, and kendriya vidyalayas. We handle all government paperwork and coordination." },
    { q: "Can we get an 80G deduction on this CSR spend?", a: "ARC LABS holds an 80G exemption certificate. However, please note that CSR expenditure under Section 135 of the Companies Act is not automatically eligible for 80G deduction in addition to CSR compliance — this depends on whether the spend is routed through an implementing agency. We recommend consulting your CA on the structuring." },
  ];

  /* color helper for inline rgba styles */
  const colorMap = {
    "var(--accent)": "0,212,170",
    "var(--blue)": "59,130,246",
    "var(--amber)": "245,158,11",
    "var(--rose)": "244,63,94",
    "var(--violet)": "139,92,246",
  };
  const rgba = (c, a) => `rgba(${colorMap[c] || "0,212,170"},${a})`;

  return (
    <>
      <Helmet>
        <title>CSR-Funded STEM Lab Implementation for Schools — ARC LABS</title>
        <meta name="description" content="CSR-funded STEM lab implementation for schools. Schedule VII eligible, impact documentation, cost per beneficiary from ₹800. Partner with ARC LABS for AI, IoT & Robotics labs." />
        <link rel="canonical" href="https://arclabs.in/csr-partners" />
        <meta property="og:url" content="https://arclabs.in/csr-partners" />
        <meta property="og:title" content="CSR STEM Lab Partnership — ARC LABS" />
        <meta property="og:description" content="CSR-funded STEM lab implementation. Schedule VII eligible, impact documentation, cost per beneficiary from ₹800." />
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
      <div className="csr-hero">
        <div className="csr-hero-left">
          <span className="section-label">CSR Partnership Program</span>
          <h1>
            CSR-Funded STEM Lab
            <em>Implementation for Schools</em>
          </h1>
          <p className="csr-deck">
            ARC LABS installs permanent AI, IoT, and Robotics labs in schools
            and colleges across India — funded by corporate CSR. One investment.
            Years of student impact. Board-ready documentation included.
          </p>
          <div className="csr-ctas">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Become a Partner</button>
            <a href="#how-it-works" className="btn btn-ghost">See How It Works</a>
          </div>
          <div className="csr-compliance">
            <div className="csr-comp-icon">VII</div>
            <div className="csr-comp-text">
              <strong>Schedule VII Compliant — Companies Act 2013</strong>
              Programs qualify under Item (ii): Promoting education and employment-enhancing vocational skills.
            </div>
          </div>
        </div>

        <div className="csr-hero-right">
          <div className="csr-iw-label">Impact at a Glance</div>
          <div className="csr-iw">
            {IMPACT_WALL.map((item) => (
              <div className="csr-iw-cell" key={item.label} style={{ "--cell-color": item.color }}>
                <div className="csr-iw-num">{item.num}</div>
                <div className="csr-iw-lbl">{item.label}</div>
                <div className="csr-iw-sub">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="csr-marquee">
        <div className="csr-marquee-track">
          {["Schedule VII Compliant", "₹800 Minimum Per Beneficiary", "Permanent Lab Infrastructure", "BRSR-Ready Reporting", "Co-branding Available", "Government School Focus", "Audit-Ready Documentation", "25,000+ Students Impacted", "MSME Registered", "Telangana & AP Reach",
            "Schedule VII Compliant", "₹800 Minimum Per Beneficiary", "Permanent Lab Infrastructure", "BRSR-Ready Reporting", "Co-branding Available", "Government School Focus", "Audit-Ready Documentation", "25,000+ Students Impacted",
          ].map((item, i) => (
            <span className="csr-mq-item" key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* WHY PARTNER */}
      <div className="csr-sec">
        <span className="section-label">Why Partner with ARC LABS</span>
        <h2 className="section-heading">Six reasons CSR heads choose ARC LABS.</h2>
        <p className="section-desc">We are built for institutional CSR — not one-off workshops. Every partnership is structured for compliance, impact, and visibility.</p>
        <div className="csr-why-grid">
          {WHY_ITEMS.map((item) => (
            <div className="csr-why-card" key={item.title} style={{ "--wc-color": item.color }}>
              <div className="csr-why-icon" style={{ background: rgba(item.color, 0.12), color: item.color }}>{item.abbr}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="csr-why-stat" style={{ color: item.color, background: rgba(item.color, 0.06), borderColor: rgba(item.color, 0.15) }}>{item.stat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE VII SECTION */}
      <div className="csr-sec csr-sec-alt" id="how-it-works">
        <span className="section-label">Legal Framework</span>
        <h2 className="section-heading">Schedule VII. Fully eligible. Fully documented.</h2>
        <p className="section-desc" style={{ marginBottom: "3rem" }}>Every ARC LABS program is designed with Schedule VII compliance in mind. Here is the legal basis and the step-by-step process.</p>
        <div className="csr-sch7-layout">
          <div>
            <div className="csr-sch7-doc">
              <div className="csr-sch7-doc-header">
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: ".9rem", marginBottom: "2px" }}>Companies Act 2013</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: ".6rem", color: "var(--text-4)" }}>Schedule VII — CSR Activities</div>
                </div>
                <span className="csr-doc-chip">ELIGIBLE</span>
              </div>
              <div className="csr-sch7-doc-body">
                {SCH7_CLAUSES.map((c) => (
                  <div className="csr-sch7-clause" key={c.num}>
                    <div className="csr-clause-num">{c.num}</div>
                    <div className="csr-clause-text">
                      {c.highlight ? (
                        <>
                          <strong>Promoting education, including special education and employment enhancing vocation skills especially among children, women, elderly, and the differently abled and livelihood enhancement projects.</strong>{" "}
                          — ARC LABS programs qualify directly under this clause.
                        </>
                      ) : c.text}
                    </div>
                  </div>
                ))}
                <div className="csr-sch7-eligible">
                  <div className="csr-elig-icon">OK</div>
                  <div className="csr-elig-text">
                    <strong>ARC LABS programs qualify under Item (ii)</strong>
                    All STEM lab installations, teacher training, and student skill programs fall directly within this clause. No legal ambiguity.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem", letterSpacing: "-.02em" }}>How the CSR process works</h3>
            <ol className="csr-steps">
              {SCH7_STEPS.map((s) => (
                <li className="csr-step" key={s.num}>
                  <span className="csr-step-num">{s.num}</span>
                  <div>
                    <div className="csr-step-title">{s.title}</div>
                    <div className="csr-step-desc">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="csr-docs-box">
              <h4>Documents we provide for due diligence</h4>
              <ul className="csr-doc-list">
                {DOCS_WE_PROVIDE.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* IMPACT METRICS */}
      <div className="csr-sec">
        <span className="section-label">Verified Impact</span>
        <h2 className="section-heading">Numbers that hold up in a board meeting.</h2>
        <p className="section-desc">Every metric below comes from documented programs with sign-in sheets, photos, and institutional sign-offs.</p>
        <div className="csr-impact-strip">
          {[
            { num: "25,000+", label: "Direct Beneficiaries", sub: "Students trained across programs" },
            { num: "1,000+", label: "Faculty Certified", sub: "Trained & certified teachers" },
            { num: "500+", label: "Lab Installations", sub: "Permanent infrastructure" },
            { num: "₹800", label: "Min. Cost Per Student", sub: "3-year amortized basis" },
            { num: "10+", label: "Years Experience", sub: "MSME-registered delivery" },
            { num: "100%", label: "Documentation Rate", sub: "All programs documented" },
          ].map((m) => (
            <div className="csr-imp-cell" key={m.label}>
              <div className="csr-imp-num">{m.num}</div>
              <div className="csr-imp-label">{m.label}</div>
              <div className="csr-imp-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TARGET SECTORS */}
      <div className="csr-sec csr-sec-alt">
        <span className="section-label">Industry Sectors</span>
        <h2 className="section-heading">Which companies partner with ARC LABS?</h2>
        <p className="section-desc">Companies across six sectors have found ARC LABS programs to be an effective, high-impact use of their CSR education budget.</p>
        <div className="csr-sectors-grid">
          {SECTORS.map((s) => (
            <div className="csr-sector-card" key={s.name} style={{ "--sc-color": s.color }}>
              <div className="csr-sc-icon" style={{ background: rgba(s.color, 0.12), color: s.color }}>{s.abbr}</div>
              <div className="csr-sc-name">{s.name}</div>
              <div className="csr-sc-desc">{s.desc}</div>
              <div className="csr-sc-csr">{s.csr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CASE STUDIES */}
      <div className="csr-sec">
        <span className="section-label">Impact Stories</span>
        <h2 className="section-heading">Real labs. Real outcomes. Real board reports.</h2>
        <p className="section-desc">Representative case studies from ARC LABS-installed programs across Telangana.</p>
        <div className="csr-cases-grid">
          {CASE_STUDIES.map((c) => (
            <div className="csr-case-card" key={c.name}>
              <div className="csr-case-top" style={{ background: `linear-gradient(90deg,${c.color},transparent)` }} />
              <div className="csr-case-body">
                <div className="csr-case-sector" style={{ color: c.color, background: rgba(c.color, 0.08), borderColor: rgba(c.color, 0.22), border: `1px solid ${rgba(c.color, 0.22)}` }}>{c.sector}</div>
                <div className="csr-case-name">{c.name}</div>
                <div className="csr-case-location">{c.location}</div>
                <div className="csr-case-metrics">
                  {c.metrics.map((m) => (
                    <div className="csr-case-metric" key={m.label}>
                      <div className="csr-cm-num" style={{ color: c.color }}>{m.num}</div>
                      <div className="csr-cm-label">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="csr-case-quote" style={{ borderColor: c.color }}>{c.quote}</div>
                <div className="csr-case-attr">{c.attribution}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPORTING & DOCUMENTATION */}
      <div className="csr-sec csr-sec-alt">
        <span className="section-label">Impact Documentation</span>
        <h2 className="section-heading">Everything your board, auditor, and BRSR needs.</h2>
        <p className="section-desc" style={{ marginBottom: "3rem" }}>ARC LABS delivers a complete documentation package — no chasing for data, no formatting impact reports yourself.</p>
        <div className="csr-report-layout">
          <div>
            <div className="csr-rdp">
              <div className="csr-rdp-header">
                <div className="csr-rdp-dots">
                  <div className="csr-rdp-dot" style={{ background: "#FF5F56" }} />
                  <div className="csr-rdp-dot" style={{ background: "#FFBD2E" }} />
                  <div className="csr-rdp-dot" style={{ background: "#27C93F" }} />
                </div>
                <span className="csr-rdp-title">ARC_LABS_CSR_Impact_Report_2024.pdf</span>
              </div>
              <div className="csr-rdp-body">
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem", letterSpacing: "-.02em" }}>CSR Impact Report — FY 2024–25</div>
                {[
                  { k: "Partner Company", v: "[ Your Company ]" },
                  { k: "Program Name", v: "ARC LABS STEM Lab Program" },
                  { k: "Beneficiary Institutions", v: "3 Schools, Hyderabad" },
                  { k: "Direct Beneficiaries", v: "486 students" },
                  { k: "Faculty Trained", v: "12 teachers" },
                  { k: "CSR Spend", v: "₹12,50,000" },
                  { k: "Cost per Beneficiary", v: "₹857" },
                  { k: "Schedule VII Clause", v: "Item (ii)" },
                ].map((r) => (
                  <div className="csr-rdp-row" key={r.k}>
                    <span className="csr-rdp-key">{r.k}</span>
                    <span className="csr-rdp-val">{r.v}</span>
                  </div>
                ))}
                {[
                  { label: "Session Completion Rate", val: "94%", fill: 94 },
                  { label: "Student Certification Rate", val: "78%", fill: 78 },
                  { label: "Teacher Confidence Score", val: "91%", fill: 91 },
                ].map((b) => (
                  <div className="csr-rdp-bar-row" key={b.label}>
                    <div className="csr-rdp-bar-label">
                      <span>{b.label}</span>
                      <span style={{ color: "var(--accent)" }}>{b.val}</span>
                    </div>
                    <div className="csr-rdp-bar">
                      <div className="csr-rdp-bar-fill" style={{ width: `${b.fill}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="csr-report-items">
            {REPORT_ITEMS.map((item) => (
              <div className="csr-report-item" key={item.name}>
                <div className="csr-ri-icon" style={{ background: item.bg, color: item.color }}>{item.abbr}</div>
                <div>
                  <div className="csr-ri-name">{item.name}</div>
                  <div className="csr-ri-desc">{item.desc}</div>
                  <span className="csr-ri-badge" style={{ background: item.badgeBg, color: item.badgeColor }}>{item.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PARTNERSHIP TIERS */}
      <div className="csr-sec">
        <span className="section-label">Partnership Tiers</span>
        <h2 className="section-heading">Three levels of partnership. One clear framework.</h2>
        <p className="section-desc">Choose the tier that matches your CSR budget and impact ambitions. All tiers include full documentation.</p>
        <div className="csr-tiers-grid">
          {PARTNERSHIP_TIERS.map((t) => (
            <div key={t.tier} className={`csr-tier-card${t.goldTier ? " csr-gold" : ""}`}>
              <div className="csr-tier-icon" style={{ background: rgba(t.color, 0.12), color: t.color }}>{t.abbr}</div>
              <div className="csr-tier-tier" style={{ color: t.color }}>{t.tier}</div>
              <div className="csr-tier-name">{t.name}</div>
              <div className="csr-tier-budget" style={{ color: t.color }}>{t.budget}</div>
              <ul className="csr-tier-features">
                {t.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div className="csr-tier-students">
                Students impacted annually: <strong style={{ color: t.color }}>{t.students}</strong>
              </div>
              <button
                className={`btn ${t.goldTier ? "btn-primary" : "btn-ghost"}`}
                style={{ width: "100%", justifyContent: "center", marginTop: "1.2rem" }}
                onClick={() => setShowModal(true)}
              >
                Enquire About {t.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CSR PLATFORMS */}
      <div className="csr-platforms">
        <div className="csr-platforms-label">ARC LABS is registered on all major CSR discovery platforms</div>
        <div className="csr-platforms-row">
          {PLATFORMS.map((p) => (
            <div className="csr-platform-badge" key={p.name}>
              <div className="csr-pb-icon" style={{ background: rgba(p.color, 0.12), color: p.color }}>{p.abbr}</div>
              <div>
                <div className="csr-pb-name">{p.name}</div>
                <div className="csr-pb-status">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="csr-sec csr-sec-alt">
        <span className="section-label">Common Questions</span>
        <h2 className="section-heading">Questions your legal and finance team will ask — answered.</h2>
        <div style={{ maxWidth: "780px", marginTop: "2.5rem" }}>
          {FAQS.map((faq, i) => (
            <div key={i} className={`csr-faq-item${openFaq === i ? " csr-faq-open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="csr-faq-q">
                <span>{faq.q}</span>
                <div className="csr-faq-toggle" style={{
                  background: openFaq === i ? "var(--tag-bg)" : "var(--surface-3)",
                  color: openFaq === i ? "var(--accent)" : "var(--text-4)",
                }}>
                  {openFaq === i ? "−" : "+"}
                </div>
              </div>
              {openFaq === i && <div className="csr-faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="csr-sec">
        <span className="section-label">Get in Touch</span>
        <h2 className="section-heading">Talk to our CSR partnerships team.</h2>
        <div className="csr-contact-layout" style={{ marginTop: "2.5rem" }}>
          <div>
            {[
              { abbr: "TEL", bg: "var(--tag-bg)", color: "var(--accent)", title: "Direct Line", val: <><a href="tel:+918699929532">+91 8699929532</a> · <a href="tel:+914035659806">+91 40 3565 9806</a></> },
              { abbr: "EML", bg: "var(--tag-bg)", color: "var(--blue)", title: "Email", val: <a href="mailto:hello@arclabs.in">hello@arclabs.in</a> },
              { abbr: "WA", bg: "var(--accent-glow)", color: "var(--accent)", title: "WhatsApp", val: <a href="https://wa.me/918699929532" target="_blank" rel="noreferrer">+91 8699929532 — preferred for quick response</a> },
              { abbr: "LOC", bg: "var(--tag-bg)", color: "var(--amber)", title: "Office", val: "4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad – 500007" },
              { abbr: "REG", bg: "var(--tag-bg)", color: "var(--accent)", title: "Registration", val: "MSME Registered · PAN: Available on request · 80G Certificate: Available" },
            ].map((c) => (
              <div className="csr-ci-item" key={c.title}>
                <div className="csr-ci-icon" style={{ background: c.bg, color: c.color }}>{c.abbr}</div>
                <div>
                  <div className="csr-ci-title">{c.title}</div>
                  <div className="csr-ci-val">{c.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--tag-bg)", borderRadius: "16px", padding: "28px" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", marginBottom: ".5rem", letterSpacing: "-.02em" }}>Ready to start a conversation?</div>
              <p style={{ fontSize: ".85rem", color: "var(--text-3)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                Submit your partnership enquiry and our team will prepare a tailored impact proposal — including projected beneficiaries, cost-per-student calculation, lab options, and implementation timeline — within 48 hours.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
                <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => setShowModal(true)}>Submit Partnership Enquiry</button>
                <a href="https://wa.me/918699929532" className="btn btn-ghost" style={{ justifyContent: "center" }} target="_blank" rel="noreferrer">WhatsApp Our CSR Team</a>
                <a href="mailto:hello@arclabs.in?subject=CSR Partnership Enquiry" className="btn btn-secondary" style={{ justifyContent: "center" }}>Email for Due Diligence Documents</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="csr-bottom-cta">
        <h2>
          Your CSR rupee can build a lab that teaches <em>for years.</em>
        </h2>
        <p>One permanent lab. Hundreds of students. Year after year. That is what ARC LABS delivers with your CSR investment.</p>
        <div className="csr-bottom-btns">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Become a Partner</button>
          <Link to="/lab-packages" className="btn btn-ghost">View Lab Packages</Link>
          <a href="https://wa.me/918699929532" className="btn btn-ghost" target="_blank" rel="noreferrer">WhatsApp Us</a>
        </div>
      </div>

      {/* Modal */}
      {showModal && <CSRModal onClose={() => setShowModal(false)} />}
    </>
  );
}
