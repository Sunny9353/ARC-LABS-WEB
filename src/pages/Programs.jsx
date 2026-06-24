import { Fragment, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Helmet } from "react-helmet-async";
import RobotPreviewFrame from "../components/RobotPreviewFrame";
import { buildInternshipTechnologies, INTERNSHIP_DURATIONS } from "../data/internshipCurriculum.js";
import { useBodyScrollLock, validateRequiredFields } from "../utils/ui";
/* ─── Page-scoped styles (no global overrides) ─── */
export const pageStyles = `
  /* Hero */
  .prog-hero {
    min-height: calc(100svh - var(--nav-h));
    padding: clamp(64px, 7vh, 92px) 5vw clamp(48px, 6vh, 76px);
    position: relative;
    overflow: clip;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .prog-hero::before {
    display: none;
  }
  .prog-hero-panel {
    width: min(1580px, 100%);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(2rem, 4vw, 5rem);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    position: relative;
    z-index: 2;
    overflow: visible;
  }
  .prog-hero-panel::before {
    display: none;
  }
  .prog-hero-system {
    position: relative;
    width: 100%;
    grid-column: 2;
    z-index: 0;
    pointer-events: auto;
    display: grid;
    place-items: center;
    overflow: visible;
  }
  .prog-hero-system::before {
    display: none;
  }
  .prog-robot-stage {
    position: relative;
    z-index: 0;
    width: 100%;
    min-height: clamp(440px, 58vh, 640px);
    aspect-ratio: 1;
    border-radius: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    overflow: visible;
    isolation: isolate;
  }
  .prog-robot-stage::before {
    display: none;
  }
  .prog-robot-stage::after {
    display: none;
  }
  .prog-robot-frame {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    background: transparent;
    transform: scale(1);
    transform-origin: center center;
  }
  .prog-robot-status,
  .prog-robot-readout {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    font-family: var(--font-body);
    font-size: 0.62rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .prog-robot-status {
    top: 22px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(250,250,250,0.64);
  }
  .prog-robot-status span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 16px rgba(0,220,130,0.72);
    animation: progRobotPulse 2s ease-in-out infinite;
  }
  .prog-robot-readout {
    right: 24px;
    bottom: 22px;
    display: grid;
    justify-items: end;
    gap: 4px;
  }
  .prog-robot-readout strong {
    color: rgba(250,250,250,0.62);
    font-weight: 500;
  }
  .prog-robot-readout span {
    color: var(--accent);
  }
  .prog-robot-corner {
    display: none;
  }
  .prog-robot-corner-tl {
    top: 13px;
    left: 13px;
    border-top: 1px solid rgba(0,220,130,0.54);
    border-left: 1px solid rgba(0,220,130,0.54);
  }
  .prog-robot-corner-br {
    right: 13px;
    bottom: 13px;
    border-right: 1px solid rgba(0,220,130,0.54);
    border-bottom: 1px solid rgba(0,220,130,0.54);
  }
  :root[data-theme="light"] .prog-robot-stage {
    border-color: transparent;
    box-shadow: none;
  }
  @keyframes progRobotPulse {
    0%, 100% { opacity: .5; transform: scale(.86); }
    50% { opacity: 1; transform: scale(1.16); }
  }
  .prog-hero-inner {
    position: relative;
    z-index: 2;
    grid-column: 1;
    text-align: left;
    max-width: 640px;
    margin: 0;
    padding: 0;
    border-radius: 0;
    background: transparent;
    border: 0;
    backdrop-filter: none;
  }
  :root[data-theme="light"] .prog-hero-inner {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }
  .prog-hero h1 {
    font-size: clamp(2.1rem, 4.7vw, 3.55rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin-bottom: 1.2rem;
    color: var(--text);
    text-shadow: 0 18px 50px rgba(0,0,0,0.42);
  }
  :root[data-theme="light"] .prog-hero h1 {
    text-shadow: none;
  }
  .prog-hero h1 em {
    font-style: normal;
    color: var(--accent);
  }
  .prog-hero p {
    color: var(--text-3);
    font-size: 1rem;
    font-weight: 400;
    max-width: 500px;
    margin: 0 0 1.8rem;
    line-height: 1.75;
  }
  .prog-stats-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    justify-content: flex-start;
    gap: 1.2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  @media (max-width: 768px) {
    .prog-hero {
      min-height: auto;
      padding: 86px 5vw 58px;
      align-items: center;
    }
    .prog-hero-panel {
      width: 100%;
      grid-template-columns: 1fr;
      padding: 0;
      gap: 1.25rem;
    }
    .prog-hero-system {
      width: 100%;
      position: relative;
      inset: auto;
      grid-column: 1;
      order: -1;
    }
    .prog-hero-system::before {
      background:
        linear-gradient(180deg, rgba(9,9,11,0.04), rgba(9,9,11,0.42) 52%, var(--bg) 100%);
    }
    .prog-robot-stage {
      width: 100%;
      min-height: 360px;
      opacity: 0.86;
      pointer-events: none;
    }
    .prog-robot-frame { transform: scale(1.08); }
    .prog-robot-status,
    .prog-robot-readout { display: none; }
    .prog-hero-inner {
      text-align: center;
      padding: 0;
      border-radius: 0;
    }
    .prog-hero p {
      margin-left: auto;
      margin-right: auto;
    }
    .prog-stats-row {
      justify-content: center;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  .prog-stat { text-align: center; }
  .prog-stat-n {
    font-family: var(--font-heading);
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--accent);
  }
  .prog-stat-l {
    font-size: 0.72rem;
    color: var(--text-3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 3px;
  }

  /* Tech section */
  .tech-section {
    padding: 60px 5vw 80px;
    position: relative;
  }
  .sec-sub {
    color: var(--text-3);
    font-size: 0.95rem;
    font-weight: 400;
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 1.8rem;
  }
  .level-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0 0 1.6rem;
  }
  .track-mode-switch {
    width: min(560px, 100%);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 8px;
    margin: 2.1rem auto 2rem;
    border: 1px solid rgba(0,220,130,0.22);
    border-radius: 999px;
    background: var(--surface);
    box-shadow: none;
  }
  .track-mode-btn {
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--text-3);
    padding: 14px 18px;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 0.82rem;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  }
  .track-mode-btn:hover {
    color: var(--text);
    transform: translateY(-1px);
  }
  .track-mode-btn.active {
    background: var(--accent);
    color: #09090b;
    box-shadow: none;
  }
  .level-filter-btn {
    --level-color: var(--accent);
    border: 1px solid var(--border-2);
    background: var(--surface);
    color: var(--text-2);
    border-radius: 999px;
    padding: 0.75rem 1.1rem;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform .25s cubic-bezier(.25,1,.5,1), background .25s, color .25s, border-color .25s;
  }
  .level-filter-btn:hover {
    transform: translateY(-1px);
    color: var(--text);
  }
  .level-filter-btn.active {
    background: var(--level-color);
    border-color: var(--level-color);
    color: #09090b;
    box-shadow: none;
  }

  /* Tech grid */
  .tech-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5px;
    background: var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
  }
  @media (max-width: 980px) {
    .tech-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 640px) {
    .tech-grid {
      grid-template-columns: 1fr;
    }
    .track-mode-switch {
      grid-template-columns: 1fr;
    }
  }
  .tech-card {
    background: var(--surface);
    padding: 32px 28px 28px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      background 0.3s cubic-bezier(0.25,1,0.5,1),
      box-shadow 0.3s cubic-bezier(0.25,1,0.5,1);
    display: flex;
    flex-direction: column;
    min-height: 330px;
  }
  .tech-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--tc-color, var(--accent));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  }
  .tech-card:hover::before,
  .tech-card.active::before { transform: scaleX(1); }
  .tech-card:hover,
  .tech-card.active {
    background:
      radial-gradient(420px 180px at 20% 0%, color-mix(in srgb, var(--tc-color, var(--accent)) 12%, transparent), transparent 70%),
      var(--surface-2);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tc-color, var(--accent)) 42%, transparent);
  }
  .tech-card.active { outline: 1px solid var(--border-2); }

  .tc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .tc-icon {
    width: 46px; height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-family: var(--font-body);
    font-weight: 700;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .tc-level {
    font-family: var(--font-body);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    padding: 3px 9px;
    border-radius: 4px;
    font-weight: 600;
  }
  .tech-card h3 {
    font-family: var(--font-heading);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
    color: var(--text);
  }
  .tech-card p {
    font-size: 0.82rem;
    color: var(--text-3);
    line-height: 1.65;
    flex: 1;
  }
  .tc-tools {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-top: 1rem;
  }
  .tc-tool {
    font-family: var(--font-body);
    font-size: 0.62rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    color: var(--text-2);
  }
  .tc-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 1.4rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--tc-color, var(--accent));
    transition: gap 0.2s;
  }
  .tech-card:hover .tc-cta { gap: 10px; }

  /* Detail panel */
  .detail-panel {
    margin-top: 24px;
    grid-column: 1 / -1;
    scroll-margin-top: calc(var(--nav-h) + 24px);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-2);
    background: var(--surface-2);
    overflow: hidden;
    animation: pgSlideDown 0.4s cubic-bezier(0.4,0,0.2,1);
  }
  .tech-grid .detail-panel {
    margin: 12px 0 28px;
  }
  @keyframes pgSlideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dp-header {
    padding: 36px 40px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .dp-header-left { flex: 1; min-width: 260px; }
  .dp-tag {
    font-family: var(--font-body);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.6rem;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dp-tag-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
  }
  .dp-header-left h2 {
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin-bottom: 0.6rem;
    color: var(--text);
  }
  .dp-header-left p {
    font-size: 0.88rem;
    color: var(--text-3);
    line-height: 1.7;
    max-width: 480px;
  }
  .dp-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.8rem;
  }

  /* Duration tabs */
  .dur-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .dur-tab {
    border: 1px solid var(--border-2);
    background: transparent;
    color: var(--text-3);
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 8px 18px;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .dur-tab span.dt-days {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 800;
    line-height: 1;
  }
  .dur-tab span.dt-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .dur-tab.active,
  .dur-tab:hover {
    border-color: var(--tab-active-color, var(--accent));
    color: var(--tab-active-color, var(--accent));
    background: rgba(255,255,255,0.03);
  }

  /* Curriculum body */
  .dp-body { padding: 32px 40px; }
  .curriculum-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.8rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .curriculum-header h3 {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text);
  }
  .curr-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .curr-badge {
    font-family: var(--font-body);
    font-size: 0.68rem;
    padding: 4px 12px;
    border-radius: 5px;
    font-weight: 500;
    border: 1px solid var(--border-2);
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  .module-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .module-card:hover { border-color: var(--border-2); }
  .module-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: var(--mc-color, var(--accent));
  }
  .mod-num {
    font-family: var(--font-body);
    font-size: 0.6rem;
    color: var(--text-3);
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }
  .mod-title {
    font-family: var(--font-heading);
    font-size: 0.92rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text);
  }
  .mod-desc {
    font-size: 0.8rem;
    color: var(--text-3);
    line-height: 1.6;
    margin-bottom: 0.8rem;
  }
  .mod-topics { list-style: none; }
  .mod-topics li {
    font-size: 0.75rem;
    color: var(--text-2);
    padding: 3px 0;
    display: flex;
    align-items: flex-start;
    gap: 7px;
    border-bottom: 1px dashed var(--border);
  }
  .mod-topics li:last-child { border-bottom: none; }
  .mod-topics li::before {
    content: '>';
    font-family: var(--font-body);
    color: var(--mc-color, var(--accent));
    font-size: 0.8rem;
    flex-shrink: 0;
    margin-top: -1px;
  }
  .mod-duration {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 0.8rem;
    font-family: var(--font-body);
    font-size: 0.62rem;
    color: var(--text-4);
    letter-spacing: 0.05em;
  }

  /* Outcomes */
  .outcomes-strip {
    margin-top: 2rem;
    padding: 20px 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .outcomes-strip h4 {
    font-family: var(--font-heading);
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
    color: var(--text);
  }
  .outcomes-list {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    flex: 1;
  }
  .outcome-pill {
    font-size: 0.75rem;
    color: var(--text-2);
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .outcome-pill::before {
    content: '\\2713';
    color: var(--accent);
    font-size: 0.65rem;
  }

  /* Panel footer */
  .dp-footer {
    border-top: 1px solid var(--border);
    padding: 24px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .dp-footer-note {
    font-size: 0.82rem;
    color: var(--text-3);
    flex: 1 1 260px;
  }
  .dp-footer-note strong { color: var(--text); }
  .dp-cta-row {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 1 1 280px;
    max-width: 100%;
  }
  .dp-cta-row .btn {
    white-space: nowrap;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(9,9,11,0.88);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: calc(var(--nav-h) + 18px) 5vw 28px;
    overflow: hidden;
    animation: pgFadeIn 0.2s ease;
  }
  @keyframes pgFadeIn { from{opacity:0} to{opacity:1} }
  .modal {
    background: var(--surface-2);
    border: 1px solid var(--border-2);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 520px;
    max-height: calc(100svh - var(--nav-h) - 46px);
    overflow-y: auto;
    margin-top: clamp(0px, calc(var(--modal-anchor-y, 120px) - var(--nav-h) - 18px), 26px);
    animation: pgScaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position: relative;
  }
  @keyframes pgScaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
  .modal-close {
    position: absolute;
    top: 16px; right: 16px;
    background: rgba(255,255,255,0.06);
    border: none;
    color: var(--text-3);
    width: 32px; height: 32px;
    border-radius: var(--radius);
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .modal-close:hover {
    background: rgba(255,255,255,0.1);
    color: var(--text);
  }
  .modal-header {
    padding: 32px 32px 20px;
    border-bottom: 1px solid var(--border);
  }
  .modal-header h3 {
    font-family: var(--font-heading);
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .modal-header p {
    font-size: 0.83rem;
    color: var(--text-3);
    line-height: 1.6;
  }
  .modal-selected {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 0.8rem;
  }
  .modal-sel-tag {
    font-family: var(--font-body);
    font-size: 0.65rem;
    padding: 4px 10px;
    border-radius: 5px;
    font-weight: 500;
    background: var(--accent-dim);
    border: 1px solid var(--tag-bg);
    color: var(--accent);
  }
  .modal-body { padding: 24px 32px 32px; }
  .form-row { margin-bottom: 1rem; }
  .form-row label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 6px;
    letter-spacing: 0.03em;
  }
  .form-row input,
  .form-row select,
  .form-row textarea {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border-2);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.88rem;
    padding: 11px 14px;
    outline: none;
    transition: border-color 0.2s;
    -webkit-appearance: none;
  }
  .form-row input:focus,
  .form-row select:focus,
  .form-row textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-dim);
  }
  .form-row select option { background: var(--surface-2); }
  .form-row textarea { resize: vertical; min-height: 80px; }
  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }
  @media(max-width:480px) { .form-row-2 { grid-template-columns: 1fr; } }

  .form-submit {
    width: 100%;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .form-note {
    font-size: 0.72rem;
    color: var(--text-4);
    text-align: center;
    margin-top: 0.8rem;
  }

  /* Success state */
  .modal-success {
    padding: 48px 32px;
    text-align: center;
  }
  .success-check {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: var(--accent-dim);
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.2rem;
    font-size: 1.5rem;
    color: var(--accent);
  }
  .modal-success h3 {
    font-family: var(--font-heading);
    font-size: 1.4rem;
    font-weight: 800;
    margin-bottom: 0.6rem;
    color: var(--accent);
  }
  .modal-success p {
    color: var(--text-3);
    font-size: 0.88rem;
    line-height: 1.7;
  }

  /* Bottom CTA */
  .prog-bottom-cta {
    padding: 100px 5vw;
    text-align: center;
    position: relative;
    overflow: hidden;
    background: var(--bg-alt);
    border-top: 1px solid var(--border);
  }
  .prog-bottom-cta::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    width: 700px; height: 500px;
    background: radial-gradient(ellipse, var(--tag-bg) 0%, transparent 65%);
    pointer-events: none;
  }
  .prog-bottom-cta h2 {
    font-size: clamp(1.8rem, 4vw, 3rem);
    letter-spacing: -0.025em;
    line-height: 1.1;
    margin-bottom: 0.8rem;
    position: relative;
    color: var(--text);
  }
  .prog-bottom-cta p {
    color: var(--text-3);
    font-size: 0.95rem;
    margin-bottom: 2rem;
    position: relative;
  }
  .cta-row {
    display: flex;
    gap: 0.8rem;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }

  /* Close panel button */
  .btn-close-panel {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-3);
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.78rem;
    cursor: pointer;
    font-family: var(--font-body);
    transition: all 0.2s;
  }
  .btn-close-panel:hover {
    color: var(--text);
    border-color: var(--border-2);
  }

  /* Responsive */
  @media(max-width:768px) {
    .dp-header { padding: 24px; }
    .dp-body { padding: 20px 24px; }
    .dp-footer { padding: 16px 24px; }
    .dp-cta-row { justify-content: stretch; }
    .dp-cta-row .btn { width: 100%; justify-content: center; }
    .dur-tabs { justify-content: flex-start; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

export const TECHNOLOGIES = [
  {
    id: "iot",
    name: "Internet of Things",
    abbr: "IoT",
    color: "var(--accent)",
    iconLabel: "IoT",
    iconBg: "var(--tag-bg)",
    level: "FOUNDATIONAL",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--accent)",
    desc: "Connect physical devices to the internet. Build smart systems that sense, communicate, and respond in real-time.",
    tools: ["ESP32", "Arduino", "MQTT", "Node-RED", "AWS IoT", "Thingspeak"],
    tagline: "The gateway to smart, connected systems.",
    fullDesc:
      "Students learn to design and deploy connected device systems from scratch — from sensor interfacing to cloud data visualization. This is the most widely applicable foundational skill in the modern tech stack.",
    workshops: {
      2: {
        title: "IoT Foundations — 2-Day Workshop",
        subtitle: "From zero to your first connected device",
        audience: "Classes 9–12, Engineering Year 1",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS IoT Fundamentals Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Hardware Setup & Sensing",
            desc: "Hands-on introduction to microcontrollers, GPIO, and sensor interfacing.",
            topics: [
              "Introduction to IoT ecosystem and applications",
              "ESP32 and Arduino pinout and setup",
              "Digital & Analog sensors — DHT11, LDR, Soil Moisture",
              "Serial communication and debugging",
              "LED, Buzzer, Relay output control",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Connectivity & Cloud Basics",
            desc: "Connect your device to Wi-Fi and push data to a live dashboard.",
            topics: [
              "Wi-Fi provisioning on ESP32",
              "MQTT protocol — publish and subscribe",
              "ThingSpeak cloud dashboard setup",
              "Live sensor data visualization",
              "Capstone: Smart Room Monitor project",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build a working IoT device",
          "Understand MQTT protocol",
          "Read & visualize sensor data",
          "Complete a working project",
        ],
      },
      3: {
        title: "IoT Systems — 3-Day Workshop",
        subtitle: "Design, connect, and automate real IoT systems",
        audience: "Classes 10–12, Engineering Year 1–2",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS IoT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Hardware Mastery",
            desc: "Deep dive into sensors, actuators, and multi-module interfacing.",
            topics: [
              "Microcontroller architecture — ESP32 deep dive",
              "Multiple sensor types and interfacing strategies",
              "I2C & SPI communication protocols",
              "Actuator control — servo, stepper, relay",
              "Breadboard circuit design fundamentals",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Networking & Protocols",
            desc: "End-to-end connectivity from device to cloud.",
            topics: [
              "Wi-Fi, Bluetooth BLE, and LoRa comparison",
              "MQTT, HTTP REST API, and WebSocket protocols",
              "AWS IoT Core device registration",
              "Device shadow and telemetry pipelines",
              "Node-RED flow-based programming",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Automation & Capstone",
            desc: "Build a fully automated system with remote monitoring and control.",
            topics: [
              "Rule-based automation and triggers",
              "Threshold alerts and push notifications",
              "Dashboard design — Grafana or Thingspeak",
              "Security basics for IoT deployments",
              "Capstone: Smart Environment Monitoring System",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design end-to-end IoT systems",
          "Work with multiple protocols",
          "Deploy to AWS IoT Core",
          "Build automation pipelines",
          "Present a live working project",
        ],
      },
      5: {
        title: "IoT Engineering — 5-Day Workshop",
        subtitle: "Complete IoT product development cycle",
        audience: "Engineering Year 2–4, Professionals",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified IoT Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "Architecture & Hardware",
            desc: "System architecture design and advanced hardware interfacing.",
            topics: [
              "IoT system architecture patterns",
              "ESP32 vs STM32 vs Raspberry Pi — trade-offs",
              "ADC, DAC, PWM in-depth",
              "Industrial sensor types and calibration",
              "PCB design basics for IoT",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Communication Stack",
            desc: "Full protocol stack from BLE to LPWAN.",
            topics: [
              "MQTT 5.0, CoAP, AMQP deep dive",
              "BLE mesh networking",
              "LoRaWAN and long-range IoT",
              "OTA firmware updates",
              "Message broker setup — Mosquitto, HiveMQ",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Cloud & Data Pipeline",
            desc: "Production-grade cloud integrations and data pipelines.",
            topics: [
              "AWS IoT Core — rules, shadow, Greengrass",
              "Azure IoT Hub comparison",
              "Time-series databases — InfluxDB",
              "Real-time streaming with Kafka basics",
              "Data pipeline architecture",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Security & Edge Computing",
            desc: "Securing deployments and processing at the edge.",
            topics: [
              "TLS/mTLS for device authentication",
              "Certificate-based provisioning",
              "Edge computing with Raspberry Pi",
              "Local inference at the edge",
              "Anomaly detection pipeline",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Product Development & Deployment",
            desc: "Build, document, and demo a complete IoT product.",
            topics: [
              "Product requirement documentation",
              "Complete system integration",
              "Stress testing and validation",
              "Client demo preparation",
              "Capstone presentation and evaluation",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design production IoT architecture",
          "Implement secure device communication",
          "Deploy to AWS/Azure cloud",
          "Work with edge computing",
          "Build a shippable IoT product",
          "Earn ARC LABS Certification",
        ],
      },
    },
  },
  {
    id: "embedded",
    name: "Embedded Systems",
    abbr: "Embedded",
    color: "var(--tag-text)",
    iconLabel: "EMB",
    iconBg: "var(--tag-bg)",
    level: "FOUNDATIONAL",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "Program microcontrollers at the hardware level. Build firmware, control peripherals, and design real-time systems.",
    tools: ["STM32", "Arduino", "FreeRTOS", "C/C++", "Keil", "CubeMX"],
    tagline: "The foundation of every smart device.",
    fullDesc:
      "Embedded Systems is the backbone of all IoT, robotics, and industrial electronics. Students learn bare-metal programming, RTOS fundamentals, and peripheral control — skills directly applicable to product development careers.",
    workshops: {
      2: {
        title: "Embedded Essentials — 2-Day Workshop",
        subtitle: "Program hardware from the ground up",
        audience: "Engineering Year 1–2, Diploma students",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS Embedded Essentials Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Microcontroller Programming",
            desc: "From C basics to GPIO control on real hardware.",
            topics: [
              "Microcontroller architecture — CPU, memory, peripherals",
              "C programming for embedded — data types, pointers",
              "GPIO configuration and digital I/O",
              "Timer and delay functions",
              "Interrupt service routines — basics",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Peripherals & Communication",
            desc: "UART, I2C, SPI — the protocols that power embedded systems.",
            topics: [
              "UART serial communication",
              "I2C protocol — master/slave configuration",
              "SPI interface — sensors and displays",
              "ADC — analog sensor reading",
              "Capstone: Multi-sensor embedded controller",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Write C code for microcontrollers",
          "Configure GPIO and peripherals",
          "Use UART, I2C, SPI",
          "Build an embedded sensor node",
        ],
      },
      3: {
        title: "Embedded Systems — 3-Day Workshop",
        subtitle: "Bare-metal to RTOS — real firmware development",
        audience: "Engineering Year 2–3, ECE/EEE students",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS Embedded Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Architecture Deep Dive",
            desc: "ARM Cortex-M architecture and memory-mapped I/O.",
            topics: [
              "ARM Cortex-M architecture — pipeline, registers",
              "Memory map and linker scripts",
              "Startup code and vector table",
              "Clock configuration and PLL",
              "Low-power modes and sleep states",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Real-Time Programming",
            desc: "FreeRTOS tasks, queues, and real-time control loops.",
            topics: [
              "FreeRTOS fundamentals — tasks and scheduler",
              "Queues and semaphores for synchronization",
              "Timer peripherals — PWM and capture",
              "DMA for high-speed data transfer",
              "Watchdog and fault handling",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Communication & Integration",
            desc: "Multi-protocol interfacing and system integration.",
            topics: [
              "CAN bus basics for automotive/industrial",
              "UART bootloader and firmware update",
              "Display interfacing — OLED, TFT",
              "Complete embedded product architecture",
              "Capstone: Embedded control system",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand ARM Cortex-M architecture",
          "Write FreeRTOS applications",
          "Interface multiple peripherals",
          "Design robust embedded firmware",
        ],
      },
      5: {
        title: "Advanced Embedded Engineering — 5-Day",
        subtitle: "Professional firmware development and RTOS mastery",
        audience: "Engineering Final Year, Working Professionals",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified Embedded Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "ARM Architecture & Toolchain",
            desc: "Professional development environment and ARM internals.",
            topics: [
              "ARM Cortex-M0/M3/M4/M7 differences",
              "Toolchain setup — GCC, OpenOCD, GDB",
              "Startup file and linker script deep dive",
              "Clocks, PLLs, and power domains",
              "CMSIS layer usage",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "RTOS Mastery",
            desc: "Production-grade FreeRTOS application design.",
            topics: [
              "Task states, priorities, and preemption",
              "Mutexes, semaphores, event groups",
              "Memory management in RTOS",
              "Software timers and callbacks",
              "RTOS debugging techniques",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Industrial Protocols",
            desc: "CAN, Modbus, and industrial communication stacks.",
            topics: [
              "CAN 2.0A/B frame structure and configuration",
              "Modbus RTU/TCP implementation",
              "RS-485 and industrial interfaces",
              "PROFIBUS basics",
              "Protocol debugging with logic analyzer",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Security & OTA",
            desc: "Secure boot, encrypted storage, and OTA updates.",
            topics: [
              "Secure boot and firmware signing",
              "Flash encryption and secure element",
              "OTA firmware update architecture",
              "Fault injection countermeasures",
              "MPU configuration for memory protection",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Product Development",
            desc: "End-to-end embedded product build and documentation.",
            topics: [
              "Requirements to architecture mapping",
              "Code review and static analysis — cppcheck",
              "Embedded unit testing — Unity framework",
              "Documentation standards",
              "Capstone: Complete embedded product demo",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Master FreeRTOS for production",
          "Implement industrial protocols",
          "Design secure embedded systems",
          "Write production-grade firmware",
          "Pass embedded engineering interviews",
          "Earn ARC LABS Certification",
        ],
      },
    },
  },
  {
    id: "iiot",
    name: "Industrial IoT",
    abbr: "IIoT",
    color: "var(--tag-text)",
    iconLabel: "IIoT",
    iconBg: "var(--tag-bg)",
    level: "INTERMEDIATE",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "IoT for factory floors and industrial environments. PLCs, SCADA, OPC-UA, and predictive maintenance at scale.",
    tools: ["PLCs", "SCADA", "OPC-UA", "Modbus", "Siemens", "InfluxDB"],
    tagline: "Where IoT meets the factory floor.",
    fullDesc:
      "IIoT bridges operational technology (OT) and information technology (IT). Students learn how industrial machines are connected, monitored, and optimized — directly applicable to manufacturing, energy, and infrastructure sectors.",
    workshops: {
      2: {
        title: "IIoT Fundamentals — 2-Day Workshop",
        subtitle: "Industrial connectivity and monitoring basics",
        audience: "Engineering Year 2–3, Instrumentation students",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS IIoT Fundamentals Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Industrial Architecture",
            desc: "OT vs IT convergence and the Purdue reference model.",
            topics: [
              "Purdue reference model — Levels 0–4",
              "OT vs IT systems — differences and integration",
              "Industrial sensors — pressure, flow, temperature, vibration",
              "4-20mA and 0-10V analog signal standards",
              "PLC basics and ladder logic introduction",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Connectivity & Monitoring",
            desc: "Modbus, OPC-UA, and real-time industrial dashboards.",
            topics: [
              "Modbus RTU/TCP protocol hands-on",
              "OPC-UA server and client setup",
              "Connecting to Ignition SCADA (trial)",
              "Industrial data to cloud pipeline",
              "Capstone: Remote machine monitoring dashboard",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand industrial architecture",
          "Configure Modbus devices",
          "Build SCADA dashboards",
          "Connect OT to cloud",
        ],
      },
      3: {
        title: "IIoT Systems — 3-Day Workshop",
        subtitle: "Full industrial connectivity stack",
        audience: "Engineering Year 3–4, Automation professionals",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS IIoT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Industrial Sensors & PLCs",
            desc: "From sensors to PLC programming with real hardware.",
            topics: [
              "Industrial sensor types and selection",
              "PLC architecture — CPU, I/O modules",
              "Ladder logic and FBD programming",
              "HMI panel configuration basics",
              "Signal conditioning and noise filtering",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Protocols & SCADA",
            desc: "Deep dive into industrial communication protocols.",
            topics: [
              "Modbus, PROFIBUS, EtherNet/IP comparison",
              "OPC-UA security and encryption",
              "SCADA system design principles",
              "Historian database configuration",
              "Alarm management and operator interfaces",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Predictive Maintenance & Analytics",
            desc: "Data-driven maintenance using IIoT data.",
            topics: [
              "Vibration analysis for motor health",
              "Statistical process control (SPC) basics",
              "Anomaly detection with rule engines",
              "Downtime analytics dashboard",
              "Capstone: Predictive maintenance prototype",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Program PLCs",
          "Configure SCADA systems",
          "Implement industrial protocols",
          "Build predictive maintenance dashboards",
        ],
      },
      5: {
        title: "IIoT Engineering — 5-Day Workshop",
        subtitle: "Industrial IoT from PLC to cloud analytics",
        audience: "Final year engineers, Industry professionals",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified IIoT Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "Industrial Architecture & Standards",
            desc: "Complete industrial systems architecture.",
            topics: [
              "IEC 62443 cybersecurity standard overview",
              "ISA-95 enterprise integration model",
              "NAMUR open architecture",
              "Digital twin concepts",
              "Industry 4.0 maturity model",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Advanced PLC & HMI",
            desc: "Structured text and advanced PLC applications.",
            topics: [
              "IEC 61131-3 all five languages",
              "Motion control and servo drives",
              "Redundancy and failsafe PLCs",
              "Advanced HMI with data binding",
              "SIL concepts for safety systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Edge Computing & AI",
            desc: "Edge gateways and ML at the industrial edge.",
            topics: [
              "Industrial edge gateway setup",
              "Docker containers on edge devices",
              "ML model deployment at the edge",
              "Vibration ML model for bearing detection",
              "Edge-to-cloud hybrid architecture",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Cybersecurity for OT",
            desc: "Securing industrial networks and devices.",
            topics: [
              "OT network segmentation with DMZ",
              "Firewall rules for industrial networks",
              "Patch management for PLCs",
              "Incident response for OT environments",
              "Zero trust for industrial systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Digital Factory Capstone",
            desc: "Design and deploy a complete IIoT solution.",
            topics: [
              "Requirements for a digital factory project",
              "Full system integration and testing",
              "ROI calculation and business case",
              "Executive demo preparation",
              "Certification assessment",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design IIoT architectures",
          "Implement industrial cybersecurity",
          "Deploy edge ML models",
          "Configure OPC-UA and SCADA",
          "Build digital factory solutions",
        ],
      },
    },
  },
  {
    id: "robotics",
    name: "Robotics",
    abbr: "Robotics",
    color: "var(--tag-text)",
    iconLabel: "ROB",
    iconBg: "var(--tag-bg)",
    level: "FOUNDATIONAL",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "Build robots that move, sense, and act. Kinematics, motor control, path planning, and autonomous behavior.",
    tools: ["Arduino", "ROS", "Servo Motors", "L298N", "Ultrasonic", "OpenCV"],
    tagline: "Build machines that move and think.",
    fullDesc:
      "Robotics combines mechanical design, electronics, and programming. Students build autonomous robots, learn motion control, obstacle avoidance, and line following — then progress to ROS-based systems and computer vision integration.",
    workshops: {
      2: {
        title: "Robotics Starter — 2-Day Workshop",
        subtitle: "Build and program your first autonomous robot",
        audience: "Classes 6–10, Engineering Year 1",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS Robotics Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Robot Hardware & Motion",
            desc: "Chassis, motors, and basic movement programming.",
            topics: [
              "Robot anatomy — chassis, wheels, motors",
              "DC motor types and selection",
              "L298N and L293D motor driver circuits",
              "PWM motor speed control",
              "Forward, reverse, turn — basic locomotion code",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Sensing & Autonomy",
            desc: "Adding sensors to make the robot react to its environment.",
            topics: [
              "Ultrasonic distance sensing — HC-SR04",
              "IR obstacle and line sensors",
              "Servo motor for pan-tilt control",
              "Obstacle avoidance algorithm",
              "Capstone: Autonomous obstacle-avoiding robot",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build a wheeled robot from scratch",
          "Program motor control",
          "Add obstacle avoidance",
          "Demonstrate autonomous behavior",
        ],
      },
      3: {
        title: "Robotics Systems — 3-Day Workshop",
        subtitle: "Advanced sensing, control, and autonomous navigation",
        audience: "Classes 9–12, Engineering Year 1–2",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS Robotics Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Mechanics & Motor Control",
            desc: "Deep dive into robot kinematics and control algorithms.",
            topics: [
              "Differential drive kinematics",
              "PID controller for motor speed control",
              "Encoder feedback and odometry",
              "Servo precision control for robotic arms",
              "Power management and battery systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Sensing & Perception",
            desc: "Multi-sensor fusion and environment mapping.",
            topics: [
              "IMU — accelerometer and gyroscope",
              "Sensor fusion with complementary filter",
              "LIDAR basics with RPLIDAR A1",
              "Ultrasonic array for 360 detection",
              "Camera module basics — OV7670",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Autonomous Behavior",
            desc: "Path planning, line following, and maze solving.",
            topics: [
              "Line following with PID",
              "Maze solving algorithms — left-hand rule",
              "Bluetooth remote control integration",
              "Introduction to ROS — nodes and topics",
              "Capstone: Autonomous line-follower and mapper",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Implement PID control",
          "Fuse multiple sensors",
          "Program path planning",
          "Demonstrate ROS basics",
          "Build autonomous robot",
        ],
      },
      5: {
        title: "Advanced Robotics — 5-Day Workshop",
        subtitle: "ROS, computer vision, and robotic arm control",
        audience: "Engineering Year 3–4, Robotics enthusiasts",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified Robotics Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "Robot Operating System",
            desc: "ROS2 fundamentals and robot description.",
            topics: [
              "ROS2 architecture — nodes, topics, services",
              "URDF robot description language",
              "RViz visualization",
              "Gazebo simulation setup",
              "tf2 transform library",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Navigation Stack",
            desc: "Autonomous navigation with SLAM and path planning.",
            topics: [
              "SLAM with gmapping",
              "ROS2 Nav2 navigation stack",
              "AMCL localization",
              "Costmap configuration",
              "Behavior trees for task execution",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Robotic Arm & Manipulation",
            desc: "Forward/inverse kinematics and MoveIt.",
            topics: [
              "Forward and inverse kinematics math",
              "MoveIt motion planning framework",
              "Servo control for 6-DOF arm",
              "Gripper design and force control",
              "Pick and place task programming",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Computer Vision for Robots",
            desc: "Object detection and vision-guided manipulation.",
            topics: [
              "OpenCV with ROS integration",
              "YOLOv8 object detection on Raspberry Pi",
              "Depth camera — Intel RealSense basics",
              "Visual servoing fundamentals",
              "Color-based object tracking",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Integrated Robot Capstone",
            desc: "Full autonomous robot with vision and navigation.",
            topics: [
              "System integration planning",
              "Multi-node ROS2 application",
              "Testing and tuning navigation parameters",
              "Object pick-and-place demonstration",
              "Certification assessment and presentation",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build ROS2 applications",
          "Implement SLAM navigation",
          "Program robotic arm manipulation",
          "Integrate computer vision",
          "Deploy autonomous robot",
          "Earn ARC LABS Certification",
        ],
      },
    },
  },
  {
    id: "iort",
    name: "IoT & Robotics (IoRT)",
    abbr: "IoRT",
    color: "var(--accent)",
    iconLabel: "IoT+R",
    iconBg: "var(--tag-bg)",
    level: "ADVANCED",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--accent)",
    desc: "Robots connected to the internet. Remote monitoring, cloud-controlled autonomy, and swarm communication.",
    tools: ["ROS", "MQTT", "AWS IoT", "ESP32", "OpenCV", "Raspberry Pi"],
    tagline: "Where robots meet the cloud.",
    fullDesc:
      "IoRT is ARC LABS' flagship specialization. Students build connected robots that report telemetry, receive commands from the cloud, and operate autonomously with remote override — the defining skill for Industry 4.0 automation roles.",
    workshops: {
      2: {
        title: "IoRT Introduction — 2-Day Workshop",
        subtitle: "Connect your robot to the cloud",
        audience: "Engineering Year 2–3 with IoT or Robotics background",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS IoRT Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Connected Robot Architecture",
            desc: "IoT + Robotics system design and hardware setup.",
            topics: [
              "IoRT system architecture overview",
              "Raspberry Pi as robot brain + IoT gateway",
              "ESP32 for sensor aggregation",
              "SSH and remote access setup",
              "MQTT broker setup on cloud (HiveMQ)",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Remote Control & Telemetry",
            desc: "Control a robot from a web interface and stream its sensor data.",
            topics: [
              "MQTT-based robot command channel",
              "Real-time telemetry — battery, position, sensors",
              "Web dashboard for robot monitoring",
              "Failsafe and watchdog design",
              "Capstone: Cloud-controlled robot with live dashboard",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Connect robot to cloud",
          "Implement remote control via MQTT",
          "Stream robot telemetry",
          "Build web monitoring dashboard",
        ],
      },
      3: {
        title: "IoRT Systems — 3-Day Workshop",
        subtitle: "Cloud robotics, swarm communication, remote autonomy",
        audience: "Engineering Year 3–4 with prior IoT + Robotics",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS IoRT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "IoRT Architecture & Edge",
            desc: "System design for connected robot fleets.",
            topics: [
              "IoRT reference architecture",
              "Edge computing on robot vs cloud offload",
              "ROS2 + MQTT bridge configuration",
              "Security model for connected robots",
              "Fleet management concepts",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Multi-Robot Coordination",
            desc: "Two or more robots communicating and cooperating.",
            topics: [
              "Multi-robot MQTT namespacing",
              "Shared map and resource negotiation",
              "Leader-follower behavior",
              "Conflict avoidance in shared space",
              "Centralized task distribution server",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Cloud Intelligence & Capstone",
            desc: "Cloud-side logic, analytics, and full system demo.",
            topics: [
              "Cloud-side path planning and assignment",
              "Robot state machine over MQTT",
              "Anomaly detection for robot health",
              "OTA update for robot firmware",
              "Capstone: Multi-robot cloud-controlled fleet",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design IoRT system architecture",
          "Coordinate multi-robot systems",
          "Implement cloud intelligence",
          "Deploy secure connected robots",
        ],
      },
      5: {
        title: "IoRT Engineering — 5-Day Workshop",
        subtitle: "Production-grade connected robotic systems",
        audience: "Final year engineers, Robotics professionals",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified IoRT Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "System Architecture",
            desc: "Production IoRT architecture design.",
            topics: [
              "Cloud robotics architecture patterns",
              "AWS RoboMaker overview",
              "Digital twin for robots",
              "5G and edge latency considerations",
              "Fleet database schema design",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "ROS2 + Cloud Integration",
            desc: "Full ROS2 to cloud bridge implementation.",
            topics: [
              "ROS2 DDS vs MQTT comparison",
              "rosbridge_suite for web integration",
              "AWS IoT Greengrass V2 for robots",
              "SLAM map sharing across fleet",
              "Cloud-based path planning service",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Vision & AI in the Cloud",
            desc: "Offloading vision processing to the cloud.",
            topics: [
              "Camera stream to AWS Kinesis",
              "Cloud-based YOLO inference",
              "Results returned to robot in real-time",
              "Bandwidth and latency trade-offs",
              "Hybrid edge-cloud vision pipeline",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Security & Reliability",
            desc: "Hardening connected robots for production.",
            topics: [
              "X.509 certificate per robot",
              "Mutual TLS authentication",
              "Geo-fencing and virtual perimeters",
              "Failover and reconnect logic",
              "Intrusion detection for robot networks",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Fleet Deployment Capstone",
            desc: "Deploy and operate a connected robot fleet.",
            topics: [
              "Fleet provisioning automation",
              "CI/CD pipeline for robot software",
              "SLA and monitoring KPIs",
              "Business case for IoRT deployment",
              "Capstone: Full fleet demo and assessment",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design production IoRT systems",
          "Integrate ROS2 with cloud",
          "Deploy secure robot fleets",
          "Implement cloud vision pipelines",
          "Present IoRT business case",
          "Earn ARC LABS Certification",
        ],
      },
    },
  },
  {
    id: "aiot",
    name: "Artificial Intelligence of Things",
    abbr: "AIoT",
    color: "var(--tag-text)",
    iconLabel: "AIoT",
    iconBg: "var(--tag-bg)",
    level: "ADVANCED",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "AI models running on IoT hardware. TinyML, edge inference, anomaly detection, and intelligent sensing.",
    tools: [
      "TensorFlow Lite",
      "Edge Impulse",
      "ESP32",
      "Raspberry Pi",
      "Python",
      "ONNX",
    ],
    tagline: "Intelligence at the sensor level.",
    fullDesc:
      "AIoT brings machine learning directly to edge hardware — enabling smart devices that classify, predict, and detect without cloud round-trips. Students build and deploy ML models on microcontrollers and single-board computers using TinyML and Edge Impulse.",
    workshops: {
      2: {
        title: "AIoT Starter — 2-Day Workshop",
        subtitle: "Run your first AI model on an IoT device",
        audience: "Engineering Year 2–3 with Python basics",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS AIoT Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Edge AI Concepts & Tools",
            desc: "TinyML fundamentals and Edge Impulse platform.",
            topics: [
              "AIoT architecture — cloud vs edge intelligence",
              "TinyML — what fits on a microcontroller",
              "Edge Impulse platform walkthrough",
              "Data collection from sensors for ML",
              "Feature engineering for embedded ML",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Model Deployment",
            desc: "Train, quantize, and deploy on real hardware.",
            topics: [
              "Train a classifier on Edge Impulse",
              "Model quantization — INT8 vs FP32",
              "Deploy to ESP32 or Arduino Nano BLE",
              "Real-time inference from live sensor data",
              "Capstone: Gesture or keyword recognition device",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand TinyML constraints",
          "Use Edge Impulse platform",
          "Deploy ML model on microcontroller",
          "Run real-time inference on edge",
        ],
      },
      3: {
        title: "AIoT Systems — 3-Day Workshop",
        subtitle: "End-to-end intelligent IoT systems",
        audience: "Engineering Year 3–4 with ML exposure",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS AIoT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "ML for IoT Data",
            desc: "Building ML pipelines for time-series sensor data.",
            topics: [
              "Time-series sensor data characteristics",
              "Feature extraction — FFT, statistical features",
              "Anomaly detection with Isolation Forest",
              "Classification vs regression for IoT",
              "Dataset collection and labeling strategy",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "TinyML Deep Dive",
            desc: "Model optimization for microcontrollers.",
            topics: [
              "Neural network quantization techniques",
              "Pruning and knowledge distillation",
              "TensorFlow Lite for Microcontrollers (TFLM)",
              "ONNX model export and conversion",
              "Benchmarking inference latency and accuracy",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "AIoT Pipeline & Capstone",
            desc: "Full AIoT system — sensing to cloud analytics.",
            topics: [
              "Hybrid edge-cloud inference architecture",
              "Cloud model retraining pipeline",
              "Federated learning concept for IoT",
              "OTA model updates",
              "Capstone: Smart predictive maintenance device",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build ML pipelines for sensor data",
          "Quantize and deploy TinyML models",
          "Design hybrid edge-cloud AI",
          "Implement anomaly detection on device",
        ],
      },
      5: {
        title: "AIoT Engineering — 5-Day Workshop",
        subtitle: "Intelligent edge systems at production scale",
        audience: "Final year, AI/ML + IoT professionals",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified AIoT Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "AI System Design for IoT",
            desc: "Architecting intelligent IoT products.",
            topics: [
              "AIoT architecture patterns",
              "Hardware selection for AI workloads",
              "NPU and GPU options for edge",
              "Model zoo — pre-trained models for IoT",
              "Latency and energy budget planning",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Advanced TinyML",
            desc: "Production model compression and deployment.",
            topics: [
              "Quantization-aware training (QAT)",
              "Neural architecture search for MCUs",
              "Multi-model inference pipelines",
              "CMSIS-NN for ARM acceleration",
              "MCUNet architecture",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Computer Vision on Edge",
            desc: "Image classification and object detection at the edge.",
            topics: [
              "MobileNetV3 for edge inference",
              "YOLOv5 nano on Raspberry Pi",
              "OpenMV camera for embedded vision",
              "Face detection without cloud",
              "Edge video analytics pipeline",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "NLP & Audio on Edge",
            desc: "Keyword spotting, NLU, and audio intelligence.",
            topics: [
              "Wake word detection — DS-CNN model",
              "Speech command recognition on MCU",
              "Audio feature extraction — MFCCs",
              "Multilingual support for Indian languages",
              "On-device NLU for simple commands",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Production AIoT System",
            desc: "Build, deploy, and evaluate a complete AIoT product.",
            topics: [
              "Full system integration",
              "MLOps for edge — model versioning",
              "A/B testing at the edge",
              "Business case and ROI for AIoT",
              "Capstone: Complete AIoT product demo",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design production AIoT architectures",
          "Deploy vision and audio ML on edge",
          "Implement MLOps for edge devices",
          "Build complete intelligent IoT products",
          "Understand AIoT business applications",
          "Earn ARC LABS Certification",
        ],
      },
    },
  },
  {
    id: "aiort",
    name: "AI + IoT & Robotics (AIoRT)",
    abbr: "AIoRT",
    color: "var(--tag-text)",
    iconLabel: "AI+R",
    iconBg: "var(--tag-bg)",
    level: "EXPERT",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "AI-powered connected robots. Autonomous decision-making, cloud intelligence, vision-guided manipulation at scale.",
    tools: [
      "ROS2",
      "YOLOv8",
      "AWS IoT",
      "TensorFlow",
      "MoveIt",
      "Edge Impulse",
    ],
    tagline: "Autonomous robots with cloud intelligence.",
    fullDesc:
      "AIoRT is the pinnacle of ARC LABS' technical curriculum — combining AI, IoT, and Robotics into one integrated system. Students build robots that perceive their environment with AI, make autonomous decisions, and report to the cloud. This is the future of industrial automation.",
    workshops: {
      2: {
        title: "AIoRT Overview — 2-Day Workshop",
        subtitle: "Where AI, IoT, and Robotics meet",
        audience: "Engineering final year with prior AI or Robotics exposure",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS AIoRT Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Integrated System Architecture",
            desc: "Designing a system where AI, IoT, and robots work together.",
            topics: [
              "AIoRT reference architecture",
              "Hardware stack — Raspberry Pi + ESP32 + camera",
              "ROS2 for robot control layer",
              "MQTT for cloud communication",
              "AI inference pipeline overview",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Vision-Guided Robot with Cloud Reporting",
            desc: "Build a robot that sees, decides, and reports.",
            topics: [
              "YOLOv8 nano for on-board object detection",
              "Decision logic based on detected objects",
              "Robot action execution via ROS2",
              "Cloud reporting of robot decisions via MQTT",
              "Capstone: Vision-guided sorting robot",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand AIoRT architecture",
          "Integrate AI with robot control",
          "Connect robot to cloud",
          "Build vision-guided robot",
        ],
      },
      3: {
        title: "AIoRT Systems — 3-Day Workshop",
        subtitle: "Autonomous AI robots with cloud intelligence",
        audience: "Final year engineers with multi-domain background",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS AIoRT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "AI-Powered Perception",
            desc: "Advanced vision and sensor fusion for robot intelligence.",
            topics: [
              "Multi-sensor fusion — camera + LIDAR + IMU",
              "Depth-based object detection",
              "Semantic segmentation basics",
              "Real-time AI pipeline on Raspberry Pi",
              "Latency optimization for robotics",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Autonomous Decision Making",
            desc: "AI-driven behavior trees and cloud coordination.",
            topics: [
              "Behavior trees with AI conditions",
              "Reinforcement learning concepts for robots",
              "Cloud-side mission planning and dispatch",
              "Robot task queue from cloud AI engine",
              "Multi-robot AI coordination",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Full AIoRT System Capstone",
            desc: "Build, integrate, and demonstrate a complete AIoRT system.",
            topics: [
              "Full system integration — AI + ROS2 + Cloud",
              "Safety and failsafe AI behavior",
              "Cloud monitoring dashboard for AI robot fleet",
              "Performance metrics — detection speed, mission success rate",
              "Capstone: Autonomous AI robot system demo",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build AI perception pipeline",
          "Design autonomous decision systems",
          "Coordinate robots via cloud AI",
          "Deploy full AIoRT system",
        ],
      },
      5: {
        title: "AIoRT Engineering — 5-Day Workshop",
        subtitle: "Expert-level autonomous AI robotic systems",
        audience: "Professionals, Researchers, Final year (top students)",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified AIoRT Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "System Architecture & Design",
            desc: "Full AIoRT system design from requirements to architecture.",
            topics: [
              "AIoRT design patterns and reference architectures",
              "Hardware platform selection for AI robotics",
              "Latency budget analysis across the stack",
              "Safety and reliability requirements",
              "Scalability design for robot fleets",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Advanced AI for Robotics",
            desc: "Computer vision, NLP, and reinforcement learning for robots.",
            topics: [
              "Foundation models for robot perception",
              "Vision-language models (VLMs) overview",
              "SAM (Segment Anything Model) for robotics",
              "RL with ROS2 — Gymnasium integration",
              "Sim-to-real transfer fundamentals",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Cloud AI Orchestration",
            desc: "Cloud-side AI services for robot fleet intelligence.",
            topics: [
              "AWS Rekognition for cloud vision",
              "Cloud mission planning with optimization",
              "Digital twin synchronization",
              "Predictive fleet maintenance with ML",
              "CI/CD for AI models in robotics",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Security & Compliance",
            desc: "Securing AI robotic systems in production.",
            topics: [
              "Adversarial attacks on robot vision",
              "Model integrity verification",
              "Regulatory compliance for autonomous robots",
              "Audit logging for AI decisions",
              "Ethical AI in autonomous systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Expert Capstone Project",
            desc: "Design and deliver a production-ready AIoRT system.",
            topics: [
              "Full system build sprint",
              "Integration testing under stress",
              "Investor/client pitch preparation",
              "Technical documentation",
              "Certification assessment and presentation",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Master AIoRT system design",
          "Deploy advanced AI models in robots",
          "Architect cloud AI orchestration",
          "Implement secure autonomous systems",
          "Present and defend technical decisions",
          "Earn ARC LABS Expert AIoRT Certification",
        ],
      },
    },
  },
  {
    id: "advanced-iot",
    name: "Advanced IoT",
    abbr: "Adv. IoT",
    color: "var(--tag-text)",
    iconLabel: "A-IoT",
    iconBg: "var(--tag-bg)",
    level: "EXPERT",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "Production IoT engineering. Large-scale deployments, mesh networks, digital twins, and cloud-native architectures.",
    tools: ["AWS IoT", "Azure IoT", "InfluxDB", "Kafka", "Terraform", "Docker"],
    tagline: "IoT at scale — production grade.",
    fullDesc:
      "Advanced IoT takes students beyond prototyping into the world of production deployments. Thousands of devices, mesh networks, time-series databases, digital twins, and cloud-native architectures. This is what enterprise IoT looks like.",
    workshops: {
      2: {
        title: "Advanced IoT Concepts — 2-Day",
        subtitle: "Production patterns and scalable IoT design",
        audience: "Engineering professionals with IoT experience",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS Advanced IoT Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Scalable IoT Architecture",
            desc: "Design IoT systems that handle thousands of devices.",
            topics: [
              "Multi-region AWS IoT Core setup",
              "Device provisioning at scale — fleet provisioning",
              "IoT device registry design",
              "Time-series database selection — InfluxDB vs TimescaleDB",
              "Message partitioning with Apache Kafka basics",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Digital Twins & Analytics",
            desc: "Shadow devices, analytics pipelines, and business intelligence.",
            topics: [
              "Digital twin architecture — AWS IoT TwinMaker",
              "Device shadow state management",
              "Stream processing — AWS Kinesis",
              "Real-time analytics dashboards — Grafana",
              "Capstone: Digital twin for a smart building",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design scalable IoT systems",
          "Implement digital twins",
          "Use time-series databases",
          "Build real-time analytics",
        ],
      },
      3: {
        title: "Advanced IoT Systems — 3-Day",
        subtitle: "Enterprise IoT architecture and operations",
        audience: "IoT professionals and senior engineers",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS Advanced IoT Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Mesh & LPWAN Networks",
            desc: "Long-range and self-healing IoT networks.",
            topics: [
              "LoRaWAN network architecture — gateway, NS, AS",
              "Thread and Zigbee mesh networks",
              "Wi-Fi Mesh — ESP-NOW and ESP-MESH",
              "Network planning for large deployments",
              "Frequency planning and interference mitigation",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Data Engineering for IoT",
            desc: "Production data pipelines at IoT scale.",
            topics: [
              "Lambda vs Kappa architecture for IoT",
              "Apache Kafka producer/consumer for IoT",
              "Data lake design on AWS S3",
              "Schema Registry and data contracts",
              "Data quality and validation pipelines",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Operations & DevOps",
            desc: "Managing IoT systems in production.",
            topics: [
              "IoT DevOps — CI/CD for firmware",
              "Remote device management and OTA",
              "Monitoring IoT systems — Prometheus + Grafana",
              "Incident response for IoT outages",
              "Capstone: Production IoT operations simulation",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Design LPWAN deployments",
          "Build IoT data pipelines",
          "Implement IoT DevOps",
          "Manage production IoT systems",
        ],
      },
      5: {
        title: "Advanced IoT Mastery — 5-Day",
        subtitle: "Enterprise IoT from architecture to operations",
        audience: "Senior engineers, architects, IoT leads",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified Advanced IoT Architect",
        modules: [
          {
            day: "DAY 1",
            title: "Enterprise Architecture",
            desc: "Full enterprise IoT architecture design.",
            topics: [
              "TOGAF-inspired IoT architecture framework",
              "Multi-cloud IoT strategy",
              "Hybrid edge-cloud deployment models",
              "Cost modeling for large IoT deployments",
              "Vendor lock-in and open standards",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Advanced Networking",
            desc: "Private 5G, LoRaWAN, and mesh at scale.",
            topics: [
              "Private 5G for industrial IoT",
              "LoRaWAN advanced — ADR, roaming",
              "Mesh networking algorithms — AODV, OLSR",
              "SD-WAN for IoT connectivity",
              "Network slicing concepts",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Data at Scale",
            desc: "Handling billions of IoT messages.",
            topics: [
              "Apache Kafka — partitioning strategy for IoT",
              "Apache Flink for stream processing",
              "Distributed time-series storage at scale",
              "Data retention and archival policies",
              "Multi-tenant data isolation",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "Security Architecture",
            desc: "Zero trust and PKI for large IoT fleets.",
            topics: [
              "Zero trust for IoT — BeyondCorp model",
              "PKI infrastructure for millions of devices",
              "Hardware security module (HSM) integration",
              "SIEM integration for IoT",
              "Regulatory compliance — GDPR, IEC 62443",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Architecture Capstone",
            desc: "Design and defend a complete enterprise IoT architecture.",
            topics: [
              "Architecture decision records (ADRs)",
              "Total cost of ownership analysis",
              "Risk assessment and mitigation",
              "Stakeholder presentation",
              "Certification assessment and review",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Architect enterprise IoT systems",
          "Design private 5G + LoRaWAN deployments",
          "Handle IoT data at scale",
          "Implement zero trust security",
          "Lead IoT architecture decisions",
          "Earn ARC LABS Expert Certification",
        ],
      },
    },
  },
  {
    id: "drone",
    name: "Drone Technology",
    abbr: "UAV",
    color: "var(--tag-text)",
    iconLabel: "UAV",
    iconBg: "var(--tag-bg)",
    level: "INTERMEDIATE",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "Design and build drones with flight control, GPS navigation, and real-time aerial applications.",
    tools: ["PX4", "ArduPilot", "GPS", "Telemetry", "Mission Planner", "Python"],
    tagline: "Take your skills to the skies.",
    fullDesc:
      "Drone Technology focuses on UAV design, flight control systems, GPS navigation, and real-time aerial data processing. Students learn how drones are used in agriculture, surveillance, mapping, and automation.",
    workshops: {
      2: {
        title: "Drone Basics — 2-Day Workshop",
        subtitle: "Build and fly your first drone",
        audience: "Beginners, Engineering Year 1",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS Drone Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Drone Hardware & Flight Basics",
            desc: "Understand drone components and flight principles.",
            topics: [
              "Drone anatomy — frame, motors, ESC",
              "Flight controller basics",
              "Battery and power systems",
              "Assembly of drone kit",
              "Basic flight principles",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Flight & Control",
            desc: "Learn to control and fly drones safely.",
            topics: [
              "Remote controller calibration",
              "Flight modes and stabilization",
              "Basic drone flying practice",
              "Introduction to GPS module",
              "Mini project: Controlled drone flight",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand drone components",
          "Assemble a drone",
          "Perform basic flight control",
          "Understand safety guidelines",
        ],
      },
      3: {
        title: "Drone Systems — 3-Day Workshop",
        subtitle: "Flight control and GPS navigation",
        audience: "Engineering students",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS Drone Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Drone Hardware Deep Dive",
            desc: "Detailed understanding of UAV systems.",
            topics: [
              "Motors and ESC working",
              "Flight controller configuration",
              "Sensors — gyroscope, accelerometer",
              "Power distribution board",
              "Firmware flashing (PX4/ArduPilot)",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Navigation & GPS",
            desc: "Autonomous navigation techniques.",
            topics: [
              "GPS module integration",
              "Waypoint navigation",
              "Mission Planner software",
              "Telemetry communication",
              "Failsafe mechanisms",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Drone Applications",
            desc: "Real-world drone applications.",
            topics: [
              "Aerial mapping basics",
              "Agriculture spraying drones",
              "Surveillance systems",
              "Obstacle avoidance intro",
              "Capstone project",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Configure drone systems",
          "Implement GPS navigation",
          "Use mission planning tools",
          "Build real-world applications",
        ],
      },
      5: {
        title: "Advanced Drone Engineering — 5-Day",
        subtitle: "Autonomous drones & AI integration",
        audience: "Advanced learners",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified Drone Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "Drone Architecture",
            desc: "Advanced UAV system design.",
            topics: [
              "Drone system architecture",
              "Sensor fusion basics",
              "PID control",
              "Flight stabilization",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Autonomous Navigation",
            desc: "Self-flying drones.",
            topics: [
              "Waypoint automation",
              "Path planning",
              "Obstacle avoidance basics",
              "Failsafe systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Computer Vision",
            desc: "Drone vision systems.",
            topics: [
              "OpenCV basics",
              "Object detection",
              "Camera integration",
              "Tracking systems",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "AI Integration",
            desc: "Smart drones with AI.",
            topics: [
              "YOLO basics",
              "Edge AI for drones",
              "Autonomous decision making",
              "Data processing",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Capstone Project",
            desc: "Complete drone system.",
            topics: [
              "Full system integration",
              "Testing & debugging",
              "Final demo",
              "Certification",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build autonomous drones",
          "Implement AI in drones",
          "Work with computer vision",
          "Develop real-world UAV systems",
        ],
      },
    },
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    abbr: "AI",
    color: "var(--tag-text)",
    iconLabel: "AI",
    iconBg: "var(--tag-bg)",
    level: "FOUNDATIONAL",
    levelBg: "var(--tag-bg)",
    levelColor: "var(--tag-text)",
    desc: "Build intelligent systems using machine learning, deep learning, and real-world AI applications.",
    tools: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "OpenCV", "NLP"],
    tagline: "Teach machines to think.",
    fullDesc:
      "Artificial Intelligence enables machines to learn from data and make decisions. Students explore machine learning, deep learning, and AI applications across industries.",
    workshops: {
      2: {
        title: "AI Basics — 2-Day Workshop",
        subtitle: "Introduction to AI and ML",
        audience: "Beginners",
        totalHours: "14 hrs",
        sessions: "6 sessions",
        certification: "ARC LABS AI Starter Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "AI Fundamentals",
            desc: "Basics of AI and ML.",
            topics: [
              "Introduction to AI",
              "Machine learning basics",
              "Types of ML",
              "Python basics",
              "Data handling",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "ML Models",
            desc: "Build simple models.",
            topics: [
              "Regression",
              "Classification",
              "Model training",
              "Prediction",
              "Mini project",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Understand AI concepts",
          "Build ML models",
          "Work with datasets",
          "Create basic AI project",
        ],
      },
      3: {
        title: "AI Systems — 3-Day Workshop",
        subtitle: "Machine learning & applications",
        audience: "Intermediate learners",
        totalHours: "21 hrs",
        sessions: "9 sessions",
        certification: "ARC LABS AI Systems Certificate",
        modules: [
          {
            day: "DAY 1",
            title: "Data & ML",
            desc: "Working with datasets.",
            topics: [
              "Data preprocessing",
              "Feature engineering",
              "Supervised learning",
              "Model evaluation",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Deep Learning",
            desc: "Neural networks.",
            topics: [
              "Neural networks",
              "TensorFlow basics",
              "Model building",
              "Training models",
            ],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "AI Applications",
            desc: "Real-world AI.",
            topics: [
              "Computer vision",
              "NLP basics",
              "Chatbots",
              "Capstone project",
            ],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build ML & DL models",
          "Work on AI applications",
          "Understand deep learning",
          "Deploy AI solutions",
        ],
      },
      5: {
        title: "Advanced AI Engineering — 5-Day",
        subtitle: "Deep learning & real-world AI systems",
        audience: "Advanced learners",
        totalHours: "35 hrs",
        sessions: "15 sessions",
        certification: "ARC LABS Certified AI Engineer",
        modules: [
          {
            day: "DAY 1",
            title: "ML Foundations",
            desc: "Advanced ML.",
            topics: ["Regression", "Classification", "Model tuning"],
            duration: "7 hrs",
          },
          {
            day: "DAY 2",
            title: "Deep Learning",
            desc: "Neural networks.",
            topics: ["CNN", "RNN", "Training"],
            duration: "7 hrs",
          },
          {
            day: "DAY 3",
            title: "Computer Vision",
            desc: "Image processing.",
            topics: ["OpenCV", "Object detection", "YOLO"],
            duration: "7 hrs",
          },
          {
            day: "DAY 4",
            title: "NLP",
            desc: "Text processing.",
            topics: ["NLP basics", "Chatbots", "Transformers"],
            duration: "7 hrs",
          },
          {
            day: "DAY 5",
            title: "Capstone",
            desc: "Full AI system.",
            topics: ["Project", "Deployment", "Presentation"],
            duration: "7 hrs",
          },
        ],
        outcomes: [
          "Build AI systems",
          "Work with DL models",
          "Develop CV & NLP apps",
          "Deploy AI solutions",
        ],
      },
    },
  },
  {
  id: "packettracer",
  name: "Cisco Packet Tracer",
  abbr: "CPT",
  color: "#1ba0d7",
  iconLabel: "CPT",
  iconBg: "var(--tag-bg)",
  level: "ADVANCED",
  levelBg: "var(--tag-bg)",
  levelColor: "#1ba0d7",

  desc: "Design, configure, and troubleshoot computer networks using Cisco Packet Tracer.",

  tools: [
    "Packet Tracer",
    "Cisco IOS",
    "Routing",
    "Switching",
    "VLANs",
    "Network Security"
  ],

  tagline: "Learn networking through simulation.",

  fullDesc:
    "Cisco Packet Tracer enables students to build, configure, and troubleshoot enterprise-grade network topologies. Students learn routing, switching, VLANs, network security, wireless networking, and troubleshooting skills aligned with CCNA fundamentals.",

  workshops: {

    2: {
      title: "Cisco Packet Tracer Essentials — 2-Day Workshop",
      subtitle: "Build and simulate your first network",
      audience: "Diploma, Engineering Year 1–2",
      totalHours: "14 hrs",
      sessions: "6 sessions",
      certification: "ARC LABS Packet Tracer Fundamentals Certificate",

      modules: [
        {
          day: "DAY 1",
          title: "Networking Fundamentals",
          desc: "Understanding network devices and topology creation.",
          topics: [
            "Introduction to Computer Networks",
            "OSI & TCP/IP Models",
            "Network Devices & Functions",
            "IP Addressing Basics",
            "Creating Network Topologies"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Routing & Switching",
          desc: "Configure routers and switches using Packet Tracer.",
          topics: [
            "Switch Configuration",
            "Router Configuration",
            "Static Routing",
            "Network Testing & Troubleshooting",
            "Mini Project: Office Network Design"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Create network topologies",
        "Configure routers and switches",
        "Assign IP addresses",
        "Troubleshoot basic networks"
      ]
    },

    3: {
      title: "Cisco Packet Tracer Professional — 3-Day Workshop",
      subtitle: "Routing, VLANs, and enterprise networking",
      audience: "Engineering Year 2–3",
      totalHours: "21 hrs",
      sessions: "9 sessions",
      certification: "ARC LABS Networking Professional Certificate",

      modules: [
        {
          day: "DAY 1",
          title: "Network Foundations",
          desc: "Advanced IP addressing and topology design.",
          topics: [
            "Subnetting Techniques",
            "VLSM Concepts",
            "Network Design Principles",
            "Topology Planning",
            "Packet Flow Analysis"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Switching Technologies",
          desc: "Enterprise switching concepts.",
          topics: [
            "VLAN Configuration",
            "Trunking",
            "Inter-VLAN Routing",
            "STP Fundamentals",
            "Switch Security"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 3",
          title: "Routing & Troubleshooting",
          desc: "Implement and troubleshoot routed networks.",
          topics: [
            "Static Routing",
            "RIP Configuration",
            "OSPF Introduction",
            "Troubleshooting Tools",
            "Enterprise Network Project"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Configure VLANs",
        "Implement routing protocols",
        "Design enterprise networks",
        "Troubleshoot network issues"
      ]
    },

    5: {
      title: "Cisco Packet Tracer Advanced Networking — 5-Day Workshop",
      subtitle: "CCNA-oriented networking and security",
      audience: "Engineering Year 3–4, Professionals",
      totalHours: "35 hrs",
      sessions: "15 sessions",
      certification: "ARC LABS Certified Network Engineer",

      modules: [
        {
          day: "DAY 1",
          title: "Network Architecture",
          desc: "Enterprise network design principles.",
          topics: [
            "Enterprise Network Models",
            "IP Address Planning",
            "Network Documentation",
            "Topology Design",
            "Device Selection"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Advanced Switching",
          desc: "Enterprise switching technologies.",
          topics: [
            "Advanced VLAN Design",
            "EtherChannel",
            "Rapid STP",
            "Switch Security",
            "Troubleshooting"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 3",
          title: "Routing Protocols",
          desc: "Dynamic routing implementation.",
          topics: [
            "RIP Configuration",
            "OSPF Configuration",
            "Route Summarization",
            "Default Routing",
            "Verification Techniques"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 4",
          title: "Network Security",
          desc: "Protecting network infrastructure.",
          topics: [
            "ACL Configuration",
            "Port Security",
            "DHCP Security",
            "Wireless Security",
            "Security Best Practices"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 5",
          title: "Capstone Project",
          desc: "Complete enterprise network deployment.",
          topics: [
            "Campus Network Design",
            "Routing & Switching Integration",
            "Security Implementation",
            "Network Testing",
            "Final Project Presentation"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Design enterprise networks",
        "Implement VLANs and OSPF",
        "Apply network security",
        "Troubleshoot complex networks",
        "Prepare for CCNA concepts",
        "Earn ARC LABS Certification"
      ]
    }

  }
},
{
  id: "appdev",
  name: "Mobile App Development",
  abbr: "APP",
  color: "var(--tag-text)",
  iconLabel: "APP",
  iconBg: "var(--tag-bg)",

  level: "FOUNDATIONAL",
  levelBg: "var(--tag-bg)",
  levelColor: "var(--tag-text)",

  desc: "Build Android applications using MIT App Inventor, Firebase, APIs, sensors, and real-world project development.",

  tools: [
    "MIT App Inventor",
    "Firebase",
    "Google Maps",
    "REST APIs",
    "TinyDB",
    "AI Extensions"
  ],

  tagline: "Transform ideas into mobile applications.",

  fullDesc:
    "This program teaches students to design, develop, and deploy Android applications using MIT App Inventor. Participants learn UI design, databases, cloud connectivity, GPS integration, IoT connectivity, and AI-powered applications through hands-on projects.",

  workshops: {

    2: {
      title: "MIT App Inventor Starter Workshop",
      subtitle: "Build your first Android app",
      audience: "Classes 8–12, Diploma, Engineering",
      totalHours: "14 hrs",
      sessions: "6 sessions",
      certification: "ARC LABS Mobile App Development Certificate",

      modules: [
        {
          day: "DAY 1",
          title: "App Design Fundamentals",
          desc: "Create Android applications visually.",
          topics: [
            "Introduction to MIT App Inventor",
            "User Interface Design",
            "Buttons, Labels and Layouts",
            "Variables and Logic Blocks",
            "Building Interactive Apps"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Data & Deployment",
          desc: "Store and manage application data.",
          topics: [
            "TinyDB Storage",
            "Lists and Data Handling",
            "Image and Media Components",
            "APK Generation",
            "Project: Student Information App"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Build Android applications",
        "Design user interfaces",
        "Store application data",
        "Deploy APK files"
      ]
    },

    3: {
      title: "App Development Professional Workshop",
      subtitle: "Cloud-connected Android applications",
      audience: "Classes 10–12, Diploma, Engineering",
      totalHours: "21 hrs",
      sessions: "9 sessions",
      certification: "ARC LABS App Development Professional Certificate",

      modules: [
        {
          day: "DAY 1",
          title: "Advanced UI Design",
          desc: "Professional mobile interface development.",
          topics: [
            "Responsive Layout Design",
            "Advanced Components",
            "User Experience Design",
            "Navigation Systems",
            "Material Design Concepts"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Firebase Integration",
          desc: "Connect apps with cloud databases.",
          topics: [
            "Firebase Setup",
            "Realtime Database",
            "User Authentication",
            "Cloud Storage",
            "Live Data Synchronization"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 3",
          title: "Maps & APIs",
          desc: "Integrate real-world services.",
          topics: [
            "Google Maps Integration",
            "Location Services",
            "REST API Consumption",
            "JSON Data Handling",
            "Project: Smart Location Tracker"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Develop cloud-connected apps",
        "Integrate Firebase",
        "Use Google Maps",
        "Work with APIs",
        "Build real-world applications"
      ]
    },

    5: {
      title: "Advanced Mobile App Development",
      subtitle: "IoT, AI and Smart Application Development",
      audience: "Engineering Students & Professionals",
      totalHours: "35 hrs",
      sessions: "15 sessions",
      certification: "ARC LABS Certified Mobile App Developer",

      modules: [
        {
          day: "DAY 1",
          title: "Professional App Architecture",
          desc: "Design scalable mobile applications.",
          topics: [
            "App Planning",
            "UI/UX Design",
            "Component Architecture",
            "Data Models",
            "Project Setup"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 2",
          title: "Cloud & Database Systems",
          desc: "Advanced Firebase implementation.",
          topics: [
            "Firebase Authentication",
            "Realtime Database",
            "Cloud Functions Overview",
            "Storage Integration",
            "User Management"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 3",
          title: "IoT App Development",
          desc: "Control IoT devices from mobile apps.",
          topics: [
            "ESP32 Communication",
            "MQTT Integration",
            "ThingSpeak Dashboard",
            "Device Monitoring",
            "IoT Mobile Dashboard"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 4",
          title: "AI-Powered Applications",
          desc: "Integrate artificial intelligence features.",
          topics: [
            "AI Extensions",
            "Speech Recognition",
            "Chatbot Integration",
            "Image Recognition",
            "Smart Assistant Apps"
          ],
          duration: "7 hrs"
        },
        {
          day: "DAY 5",
          title: "Capstone Project",
          desc: "Build and present a complete application.",
          topics: [
            "Project Planning",
            "Development",
            "Testing",
            "Deployment",
            "Final Presentation"
          ],
          duration: "7 hrs"
        }
      ],

      outcomes: [
        "Build professional Android apps",
        "Integrate Firebase services",
        "Develop IoT mobile dashboards",
        "Implement AI features",
        "Deploy complete applications",
        "Earn ARC LABS Certification"
      ]
    }

  }
}
];

export const DURATION_OPTIONS = [
  { days: 2, label: "Workshop", color: "var(--accent)" },
  { days: 3, label: "Intensive", color: "var(--tag-text)" },
  { days: 5, label: "Bootcamp", color: "var(--tag-text)" },
];

const LEAD_EMAIL = "hello@arclabs.in";
const WHATSAPP_DISPLAY = "+91 7815809412";

const getDurationLabel = (duration) =>
  duration === 2
    ? "Workshop"
    : duration === 3
    ? "Intensive"
    : duration === 5
    ? "Bootcamp"
    : duration === 10
    ? "Internship"
    : duration === 15
    ? "Internship Plus"
    : duration === 20
    ? "Internship Pro"
    : "Program";

const safeFileName = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const generateCurriculumPdf = (tech, duration) => {
  const workshop = tech.workshops[duration];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (height = 48) => {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  const addText = (text, x, size, options = {}) => {
    const { color = [55, 65, 81], style = "normal", gap = 1.35 } = options;
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.splitTextToSize(String(text), maxWidth - (x - margin)).forEach((line) => {
      addPageIfNeeded(size * gap);
      doc.text(line, x, y);
      y += size * gap;
    });
  };

  doc.setFillColor(8, 15, 28);
  doc.rect(0, 0, pageWidth, 132, "F");
  doc.setTextColor(0, 212, 170);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ARC LABS", margin, 48);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(`${tech.name} Curriculum`, margin, 82);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `${workshop.durationLabel || `${duration}-Day ${getDurationLabel(duration)}`} | ${workshop.totalHours}`,
    margin,
    108
  );
  y = 168;

  addText(workshop.title, margin, 18, { color: [17, 24, 39], style: "bold" });
  y += 8;
  addText(workshop.subtitle, margin, 11, { color: [75, 85, 99] });
  y += 16;

  [
    ["Audience", workshop.audience],
    ["Sessions", workshop.sessions],
    ["Certification", workshop.certification],
  ].forEach(([label, value]) => {
    addPageIfNeeded(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(String(value), margin + 82, y);
    y += 18;
  });

  y += 18;
  workshop.modules.forEach((mod, index) => {
    addPageIfNeeded(112);
    doc.setDrawColor(0, 212, 170);
    doc.setLineWidth(2);
    doc.line(margin, y, margin, y + 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(`${mod.day} / Module ${index + 1}: ${mod.title}`, margin + 14, y + 4);
    y += 24;
    addText(mod.desc, margin + 14, 10, { color: [75, 85, 99] });
    y += 6;

    mod.topics.forEach((topic) => {
      doc.splitTextToSize(`- ${topic}`, maxWidth - 22).forEach((line) => {
        addPageIfNeeded(14);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(55, 65, 81);
        doc.text(line, margin + 22, y);
        y += 13;
      });
    });
    y += 6;
    addText(`Duration: ${mod.duration}`, margin + 14, 9, {
      color: [0, 140, 112],
      style: "bold",
    });
    y += 18;
  });

  addPageIfNeeded(90);
  addText("Learning Outcomes", margin, 14, { color: [17, 24, 39], style: "bold" });
  y += 6;
  workshop.outcomes.forEach((outcome) => {
    addText(`- ${outcome}`, margin + 16, 10);
  });

  doc.save(`arc-labs-${safeFileName(tech.abbr)}-${duration}-day-curriculum.pdf`);
};

// Leads are persisted to Firestore ("programCurriculumLeads"); notification is handled
// server-side. We intentionally do NOT open a mailto: client here, because that pops up
// the OS "choose an app for this mailto link" dialog after every curriculum download.
const sendLeadEmail = (_lead) => {
  /* no-op: see note above */
};

// ─── LEAD MODAL ───────────────────────────────────────────────────────────────
function LeadModal({ tech, duration, anchorY, onClose }) {
  useBodyScrollLock(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
    role: "",
    city: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!validateRequiredFields(e.currentTarget)) return;
    setLoading(true);
    setError("");

    const workshop = tech.workshops[duration];
    const lead = {
      ...form,
      programId: tech.id,
      programName: tech.name,
      programAbbr: tech.abbr,
      duration,
      durationLabel: getDurationLabel(duration),
      workshopTitle: workshop.title,
      totalHours: workshop.totalHours,
      source: "program_curriculum_pdf_download",
      notificationEmail: LEAD_EMAIL,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "programCurriculumLeads"), lead);
      generateCurriculumPdf(tech, duration);
      sendLeadEmail(lead);
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Unable to save program curriculum lead", err);
      setError(
        "We could not save your details right now. Please try again or contact ARC LABS directly."
      );
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="modal-overlay"
      style={{ "--modal-anchor-y": `${Math.round(anchorY || 120)}px` }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          x
        </button>
        {submitted ? (
          <div className="modal-success">
            <div className="success-check">&#10003;</div>
            <h3>Curriculum downloaded</h3>
            <p>
              Thank you. Your details have been received and the curriculum PDF
              download has started. Our team will contact you within{" "}
              <strong style={{ color: "var(--text)" }}>24 hours</strong> with
              complete implementation details for the{" "}
              <strong style={{ color: "var(--text)" }}>
                {tech.abbr} — {duration}-Day{" "}
                {getDurationLabel(duration)}
              </strong>
              .
              <br />
              <br />
              WhatsApp us directly for faster response:
              <br />
              <strong style={{ color: "var(--accent)" }}>{WHATSAPP_DISPLAY}</strong>
            </p>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h3>Download Curriculum PDF</h3>
              <p>
                Share your contact and organization details to download the
                complete curriculum PDF for this program.
              </p>
              <div className="modal-selected">
                <span className="modal-sel-tag">{tech.abbr}</span>
                <span className="modal-sel-tag">
                  {duration}-Day{" "}
                  {getDurationLabel(duration)}
                </span>
                <span className="modal-sel-tag">
                  {tech.workshops[duration].totalHours}
                </span>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={submit}>
                <div className="form-row-2">
                  <div className="form-row">
                    <label>Full Name *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handle}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label>Phone *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handle}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handle}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-row-2">
                  <div className="form-row">
                    <label>You Are *</label>
                    <select name="role" value={form.role} onChange={handle} required>
                      <option value="">Select role</option>
                      <option>School Principal / Administrator</option>
                      <option>College HOD / Faculty</option>
                      <option>Engineering Student</option>
                      <option>School Student (Class 9-12)</option>
                      <option>Working Professional</option>
                      <option>CSR / Corporate Representative</option>
                      <option>Government Official</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handle}
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <label>Institution / Organization *</label>
                  <input
                    name="org"
                    value={form.org}
                    onChange={handle}
                    placeholder="School, college, or company name"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Message (optional)</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handle}
                    placeholder="Batch size, preferred dates, any specific requirements..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary form-submit"
                  disabled={loading}
                >
                  {loading ? "Saving Details..." : "Submit & Download PDF"}
                </button>
                {error && (
                  <p className="form-note" style={{ color: "var(--tag-text)" }}>
                    {error}
                  </p>
                )}
                <p className="form-note">
                  By submitting, you agree to be contacted by ARC LABS. We do
                  not share your data.
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document === "undefined" ? modal : createPortal(modal, document.body);
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
export function DetailPanel({ tech, onClose, durationOptions = DURATION_OPTIONS }) {
  const [activeDur, setActiveDur] = useState(durationOptions[0].days);
  const [showLead, setShowLead] = useState(false);
  const [leadAnchorY, setLeadAnchorY] = useState(120);
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const workshop = tech.workshops[activeDur];

  return (
    <>
      <div className="detail-panel" ref={panelRef}>
        {/* Header */}
        <div className="dp-header">
          <div className="dp-header-left">
            <div className="dp-tag" style={{ color: tech.color }}>
              <span className="dp-tag-dot" style={{ background: tech.color }} />
              {tech.abbr} — {tech.level}
            </div>
            <h2>{tech.name}</h2>
            <p>{tech.fullDesc}</p>
          </div>
          <div className="dp-header-right">
            <div className="dur-tabs">
              {durationOptions.map((d) => (
                <button
                  key={d.days}
                  className={`dur-tab${activeDur === d.days ? " active" : ""}`}
                  style={{ "--tab-active-color": tech.color }}
                  onClick={() => setActiveDur(d.days)}
                >
                  <span className="dt-days">{d.top ?? d.days}</span>
                  <span className="dt-label">{d.sub ?? `Day ${d.label}`}</span>
                </button>
              ))}
            </div>
            <button className="btn-close-panel" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {/* Curriculum */}
        <div className="dp-body">
          <div className="curriculum-header">
            <h3>{workshop.title}</h3>
            <div className="curr-meta">
              {[
                workshop.totalHours,
                workshop.sessions,
                workshop.audience,
                workshop.certification,
              ].map((m) => (
                <span
                  key={m}
                  className="curr-badge"
                  style={{ color: tech.color, borderColor: `${tech.color}40` }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="modules-grid">
            {workshop.modules.map((mod, i) => (
              <div
                className="module-card"
                key={i}
                style={{ "--mc-color": tech.color }}
              >
                <div className="mod-num">
                  {mod.day} / MODULE {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mod-title">{mod.title}</div>
                <div className="mod-desc">{mod.desc}</div>
                <ul className="mod-topics">
                  {mod.topics.map((t, j) => (
                    <li key={j}>{t}</li>
                  ))}
                </ul>
                <div className="mod-duration">{mod.duration}</div>
              </div>
            ))}
          </div>

          <div className="outcomes-strip">
            <h4>What you'll achieve</h4>
            <div className="outcomes-list">
              {workshop.outcomes.map((o) => (
                <span className="outcome-pill" key={o}>
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="dp-footer">
          <div className="dp-footer-note">
            <strong>Interested in this program?</strong> Our team will reach out
            within 24 hrs with batch dates, fees, and group pricing.
          </div>
          <div className="dp-cta-row">
            <button
              className="btn btn-secondary"
              onClick={() =>
                window.open("https://wa.me/918699929532", "_blank")
              }
            >
              WhatsApp Us
            </button>
            <button
              className="btn btn-primary"
              onClick={(event) => {
                setLeadAnchorY(event.currentTarget.getBoundingClientRect().top);
                setShowLead(true);
              }}
            >
              Download Curriculum
            </button>
          </div>
        </div>
      </div>

      {showLead && (
        <LeadModal
          tech={tech}
          duration={activeDur}
          anchorY={leadAnchorY}
          onClose={() => setShowLead(false)}
        />
      )}
    </>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export const PROGRAM_LEVELS = [
  { id: "ALL", label: "All", color: "#00DC82" },
  { id: "FOUNDATIONAL", label: "Foundational", color: "#00DC82" },
  { id: "INTERMEDIATE", label: "Intermediate", color: "#22D3EE" },
  { id: "ADVANCED", label: "Advanced", color: "#3B82F6" },
  { id: "EXPERT", label: "Expert", color: "#A855F7" },
];

export const getLevelMeta = (level) =>
  PROGRAM_LEVELS.find((item) => item.id === level) || PROGRAM_LEVELS[0];

const INTERNSHIP_TECHNOLOGIES = buildInternshipTechnologies(TECHNOLOGIES).filter(
  (tech) => tech.id !== "robotics"
);

export default function ProgramsPage() {

  const [activeTech, setActiveTech] = useState(null);
  const [activeLevel, setActiveLevel] = useState("ALL");
  const [trackMode, setTrackMode] = useState("programs");
  const isInternshipMode = trackMode === "internships";
  const visibleTechnologies = isInternshipMode
    ? INTERNSHIP_TECHNOLOGIES
    : activeLevel === "ALL"
      ? TECHNOLOGIES
      : TECHNOLOGIES.filter((tech) => tech.level === activeLevel);
  const durationOptions = isInternshipMode ? INTERNSHIP_DURATIONS : DURATION_OPTIONS;
  const sectionCopy = isInternshipMode
    ? {
        label: "Internship Tracks",
        title: "Choose your internship track.",
        accent: "Build a portfolio-ready capstone.",
        desc: "Project-based internships run for 2-3, 3-4, or 4-5 weeks with mentor review, lab practice, documentation, and certification.",
      }
    : {
        label: "Technology Tracks",
        title: "Choose your domain.",
        accent: "See the curriculum.",
        desc: "Click any technology card to expand the full curriculum - choose between 2-day, 3-day, or 5-day formats.",
      };

  const handleTechClick = (tech) => {
    if (activeTech?.id === tech.id) {
      setActiveTech(null);
      return;
    }
    setActiveTech(tech);
  };

  const switchTrackMode = (mode) => {
    setTrackMode(mode);
    setActiveTech(null);
  };

  return (
    <>
      <Helmet>
        <title>IoT, Robotics AI, Drones Trainings &amp; College Workshops | ARC LABS</title>
        <meta name="description" content="Upskill with ARC LABS' industry-aligned training programs and hands-on workshops in IoT, Robotics, AI, Drones, and Embedded Systems for engineering students and faculty." />
        <link rel="canonical" href="https://arclabs.in/programs" />
        <meta property="og:url" content="https://arclabs.in/programs" />
        <meta property="og:title" content="IoT, Robotics AI &amp; Drones Workshops &amp; College Trainings | ARC LABS" />
        <meta property="og:description" content="Hands-on course curriculum in IoT, AI, Drones, Robotics, and Embedded Systems training programs for colleges and corporates." />
      </Helmet>
      <style>{pageStyles}</style>

      {/* HERO */}
      <div className="prog-hero">
        <div className="prog-hero-panel">
          <div className="prog-hero-inner">
            <div className="section-label">
              10 Technology Tracks / 3 Workshop Formats
            </div>
            <h1>
              AI, IoT &amp; Robotics
              <br />
              <em>Training Programs &amp; Workshops</em>
            </h1>
            <p>
              Pick a technology track. Choose your workshop duration. Click to see
              exactly what we teach, session by session.
            </p>
            <div className="prog-stats-row">
              {[
                { n: "10", l: "Technology Tracks" },
                { n: "3", l: "Workshop Formats" },
                { n: "35hrs", l: "Max per Bootcamp" },
                { n: "100%", l: "Hands-On Delivery" },
              ].map((s) => (
                <div className="prog-stat" key={s.l}>
                  <div className="prog-stat-n">{s.n}</div>
                  <div className="prog-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="prog-hero-system">
            <div className="prog-robot-stage">
              <RobotPreviewFrame
                className="prog-robot-frame"
                title="Interactive ARC LABS training robot"
                loading="eager"
                view="programs"
              />
              <i className="prog-robot-corner prog-robot-corner-tl" aria-hidden="true" />
              <i className="prog-robot-corner prog-robot-corner-br" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* TECH GRID */}
      <div className="tech-section">
        <div className="section-label">{sectionCopy.label}</div>
        <h2 className="section-heading">
          {sectionCopy.title}
          <br />
          <span style={{ color: "var(--accent)" }}>{sectionCopy.accent}</span>
        </h2>
        <p className="sec-sub">{sectionCopy.desc}</p>

        <div className="track-mode-switch" aria-label="Track type">
          {[
            { id: "programs", label: "Program Tracks" },
            { id: "internships", label: "Internship Tracks" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`track-mode-btn${trackMode === mode.id ? " active" : ""}`}
              onClick={() => switchTrackMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {!isInternshipMode && (
        <div className="level-filter" aria-label="Filter technology tracks by level">
          {PROGRAM_LEVELS.map((level) => (
            <button
              key={level.id}
              type="button"
              className={`level-filter-btn${activeLevel === level.id ? " active" : ""}`}
              style={{ "--level-color": level.color }}
              onClick={() => {
                setActiveLevel(level.id);
                setActiveTech(null);
              }}
            >
              {level.label}
            </button>
          ))}
        </div>
        )}

        <div className="tech-grid">
          {visibleTechnologies.map((tech) => {
            const levelMeta = getLevelMeta(tech.level);
            return (
            <Fragment key={tech.id}>
            <div
              className={`tech-card${activeTech?.id === tech.id ? " active" : ""}`}
              style={{ "--tc-color": levelMeta.color }}
              onClick={() => handleTechClick(tech)}
            >
              <div className="tc-top">
                <div
                  className="tc-icon"
                  style={{ background: tech.iconBg, color: levelMeta.color }}
                >
                  {tech.iconLabel}
                </div>
              </div>
              <h3>
                {tech.abbr} — {tech.name}
              </h3>
              <p>{tech.desc}</p>
              <div className="tc-tools">
                {tech.tools.slice(0, 4).map((t) => (
                  <span className="tc-tool" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="tc-cta">
                {activeTech?.id === tech.id
                  ? "Close curriculum"
                  : "View curriculum"}{" "}
                <span style={{ fontSize: "0.9rem" }}>&rarr;</span>
              </div>
            </div>
            {activeTech?.id === tech.id && (
              <DetailPanel
                key={`detail-${tech.id}`}
                tech={tech}
                durationOptions={durationOptions}
                onClose={() => setActiveTech(null)}
              />
            )}
            </Fragment>
          )})}
        </div>

        {false && activeTech && (
          <DetailPanel
            key={activeTech.id}
            tech={activeTech}
            durationOptions={durationOptions}
            onClose={() => setActiveTech(null)}
          />
        )}
      </div>

      {/* BOTTOM CTA */}
      <div className="prog-bottom-cta">
        <h2>
          Not sure which program
          <br />
          fits your institution?
        </h2>
        <p>
          Talk to us. We'll map the right technology track and format for your
          school, college, or CSR initiative.
        </p>
        <div className="cta-row">
          <a href="tel:+917815809412" className="btn btn-primary">
            Call Us Now
          </a>
          <a
            href="https://wa.me/917815809412"
            className="btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a href="mailto:hello@arclabs.in" className="btn btn-secondary">
            Email Us
          </a>
        </div>
      </div>
    </>
  );
}
