import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Cpu,
  Database,
  Gauge,
  LineChart,
  ShieldAlert,
  Network,
  Settings,
  Wrench,
  Zap,
  Eye,
  Activity,
  HardDrive,
  Cloud,
  Layers,
  Signal,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Mail,
  Globe,
  Lock,
  ChevronDown,
  Factory
} from "lucide-react";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Sparkline component for solutions cards
function Sparkline({ points, stroke = ARC_ACCENT, animate = true, w = 160, h = 40 }) {
  const width = w;
  const height = h;
  const padding = 2;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  
  const mappedPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((p - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      {animate ? (
        <motion.polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          points={mappedPoints}
          strokeDasharray={width * 2}
          initial={{ strokeDashoffset: width * 2 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ) : (
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={mappedPoints} />
      )}
      <circle
        cx={(points.length - 1) * (width / (points.length - 1))}
        cy={height - ((points[points.length - 1] - min) / range) * height}
        r="3"
        fill={stroke}
        className="animate-ping"
      />
    </svg>
  );
}

const SECTOR_STYLE = {
  "Real-Time Machine Monitoring": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Machine telemetry" },
  "Predictive Maintenance Systems": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Failure prediction" },
  "Smart Energy Monitoring": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Energy balance" },
  "Industrial Telemetry Systems": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Signal fabric" },
  "AI-Based Surveillance": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Vision safety" },
  "Edge AI Infrastructure": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Edge compute" },
  "Remote Asset Monitoring": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Asset tracking" },
  "Smart Sensor Networks": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Mesh health" },
  "Industrial Dashboard Systems": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Control UI" },
  "Cloud + Edge IoT Integration": { accent: "#00DC82", dim: "rgba(0,220,130,0.08)", border: "rgba(0,220,130,0.34)", label: "Secure pipeline" },
};
const DEFAULT_SECTOR_STYLE = SECTOR_STYLE["Real-Time Machine Monitoring"];
const ARC_ACCENT = "#00DC82";
const STATUS_WARNING = "#F59E0B";
const STATUS_CRITICAL = "#EF4444";
const TRACK_DARK = "#27272A";
const TRACK_LIGHT = "#E4E4E7";

function SectorCardViz({ title, accent, points = [] }) {
  const bars = points.length ? points.slice(0, 9) : [42, 58, 48, 72, 64, 82, 66, 74, 90];
  const normalize = (v) => {
    const min = Math.min(...bars);
    const max = Math.max(...bars);
    return 20 + ((v - min) / ((max - min) || 1)) * 72;
  };

  if (title === "Predictive Maintenance Systems") {
    return (
      <div className="sector-viz">
        <div className="sector-viz-bars">
          {bars.map((v, i) => <span key={i} style={{ height: `${normalize(v)}%`, background: i === 5 ? STATUS_WARNING : `${accent}66` }} />)}
        </div>
        <div className="sector-viz-meta"><span>FFT drift</span><span>RUL model</span></div>
      </div>
    );
  }

  if (title === "Smart Energy Monitoring") {
    return (
      <div className="sector-viz sector-viz-energy">
        {["L1", "L2", "L3"].map((p, i) => (
          <div key={p}><span>{p}</span><strong style={{ width: `${72 + i * 7}%`, background: accent }} /></div>
        ))}
        <em>PF 0.94</em>
      </div>
    );
  }

  if (title === "Industrial Telemetry Systems" || title === "Smart Sensor Networks") {
    return (
      <div className="sector-viz sector-viz-mesh">
        {[0, 1, 2, 3, 4].map((n) => <span key={n} style={{ borderColor: accent, boxShadow: `0 0 ${10 + n * 2}px ${accent}33` }} />)}
        <em style={{ color: accent }}>mesh link stable</em>
      </div>
    );
  }

  if (title === "AI-Based Surveillance") {
    return (
      <div className="sector-viz sector-viz-camera">
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className="scan-feed" style={{ borderColor: n === 2 ? accent : "#3f3f46", "--scan-accent": accent }} />
        ))}
        <em style={{ color: accent }}>PPE 97%</em>
      </div>
    );
  }

  if (title === "Edge AI Infrastructure") {
    return (
      <div className="sector-viz sector-viz-pipeline">
        {["sensor", "edge", "model", "alert"].map((p, i) => (
          <span key={p} style={{ "--sector-accent": accent }}>
            <strong>{String(i + 1).padStart(2, "0")}</strong>
            {p}
          </span>
        ))}
      </div>
    );
  }

  if (title === "Remote Asset Monitoring") {
    return (
      <div className="sector-viz sector-viz-route">
        <svg viewBox="0 0 180 42" preserveAspectRatio="none">
          <polyline points="4,34 36,24 72,29 106,13 144,20 176,8" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="176" cy="8" r="4" fill={accent} />
        </svg>
        <em style={{ color: accent }}>GPS locked</em>
      </div>
    );
  }

  if (title === "Industrial Dashboard Systems") {
    return (
      <div className="sector-viz sector-viz-dashboard">
        <span><em /></span>
        <span><b /></span>
        <span><i /><i /><i /></span>
        <strong style={{ background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />
      </div>
    );
  }

  if (title === "Cloud + Edge IoT Integration") {
    return (
      <div className="sector-viz sector-viz-cloud">
        {["edge", "tls", "cloud"].map((p, i) => (
          <span key={p} style={{ "--sector-accent": accent }}>
            <strong>{i === 1 ? "lock" : "node"}</strong>
            {p}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="sector-viz">
      <div className="sector-viz-bars">
        {bars.map((v, i) => <span key={i} style={{ height: `${normalize(v)}%`, background: i === bars.length - 1 ? accent : `${accent}66` }} />)}
      </div>
      <div className="sector-viz-meta"><span>OEE live</span><span>PLC sync</span></div>
    </div>
  );
}

const factoryFeatureStyles = `
.factory-feature-card {
  position: relative;
  overflow: hidden;
  display: flex;
  min-height: 190px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #27272A;
  border-radius: 0.5rem;
  background: #18181B;
  padding: 1.1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  transition:
    background-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    border-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.factory-feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 0%;
  height: 2px;
  background: #00DC82;
  transition: width 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.factory-feature-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0 42%, rgba(0,220,130,0.085) 48%, transparent 56%),
    radial-gradient(circle at 18% 12%, rgba(250,250,250,0.04), transparent 34%);
  background-size: 220% 100%, 100% 100%;
  background-position: 120% 0, 0 0;
  transition:
    opacity 300ms cubic-bezier(0.25, 1, 0.5, 1),
    background-position 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.factory-feature-card:hover {
  background: #27272A;
  border-color: #27272A;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.025),
    0 18px 38px rgba(0,0,0,0.22);
}
.factory-feature-card:hover::before {
  width: 100%;
}
.factory-feature-card:hover::after {
  opacity: 1;
  background-position: -20% 0, 0 0;
}
.factory-feature-icon {
  width: 1.75rem;
  height: 1.75rem;
  margin-bottom: 1rem;
  color: #71717A;
  transform-origin: center;
  position: relative;
  z-index: 2;
  transition:
    color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.factory-feature-card:hover .factory-feature-icon {
  color: #00DC82;
}
.factory-feature-card:hover .factory-feature-icon[data-motion="gear"] {
  transform: rotate(90deg);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="microchip"],
.factory-feature-card:hover .factory-feature-icon[data-motion="signal"] {
  transform: scale(1.1);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="network"] {
  transform: translateY(-4px);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="chart"] {
  transform: scaleX(1.1);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="pulse"] {
  transform: translateX(4px);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="gauge"] {
  transform: rotate(15deg);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="stack"] {
  transform: scaleY(1.1);
}
.factory-feature-card:hover .factory-feature-icon[data-motion="wrench"] {
  transform: rotate(-25deg);
}
.factory-feature-title,
.factory-feature-copy {
  position: relative;
  z-index: 2;
  transform: none;
  transition: none;
}
.factory-feature-title {
  color: #FAFAFA;
}
.factory-feature-copy {
  color: #A1A1AA;
}
@media (min-width: 1024px) {
  .factory-feature-card {
    min-height: 178px;
    padding: 1rem;
  }
  .factory-feature-icon {
    width: 1.6rem;
    height: 1.6rem;
    margin-bottom: 0.9rem;
  }
}
.industry-sector-card {
  position: relative;
  overflow: hidden;
  min-height: 178px;
  border: 1px solid #27272A;
  border-radius: 0.5rem;
  background: #18181B;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  transition:
    background-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    border-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.industry-sector-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 0%;
  height: 2px;
  background: #00DC82;
  transition: width 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.industry-sector-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0 42%, rgba(0,220,130,0.075) 48%, transparent 56%),
    radial-gradient(circle at 85% 12%, rgba(0,220,130,0.08), transparent 30%);
  background-size: 220% 100%, 100% 100%;
  background-position: 120% 0, 0 0;
  transition:
    opacity 300ms cubic-bezier(0.25, 1, 0.5, 1),
    background-position 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.industry-sector-card:hover {
  background: #27272A;
  border-color: #27272A;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.025),
    0 18px 38px rgba(0,0,0,0.22);
}
.industry-sector-card:hover::before {
  width: 100%;
}
.industry-sector-card:hover::after {
  opacity: 1;
  background-position: -20% 0, 0 0;
}
.industry-sector-icon {
  position: relative;
  z-index: 2;
  width: 1.6rem;
  height: 1.6rem;
  margin-bottom: 0.9rem;
  color: #71717A;
  transform-origin: center;
  transition:
    color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.industry-sector-card:hover .industry-sector-icon {
  color: #00DC82;
}
.industry-sector-card:hover .industry-sector-icon[data-motion="gear"] {
  transform: rotate(90deg);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="microchip"],
.industry-sector-card:hover .industry-sector-icon[data-motion="signal"] {
  transform: scale(1.1);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="network"] {
  transform: translateY(-4px);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="chart"] {
  transform: scaleX(1.1);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="pulse"] {
  transform: translateX(4px);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="gauge"] {
  transform: rotate(15deg);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="stack"] {
  transform: scaleY(1.1);
}
.industry-sector-card:hover .industry-sector-icon[data-motion="wrench"] {
  transform: rotate(-25deg);
}
.industry-sector-title,
.industry-sector-copy,
.industry-sector-meta {
  position: relative;
  z-index: 2;
  transform: none;
  transition: none;
}
.industry-sector-title {
  color: #FAFAFA;
}
.industry-sector-copy {
  color: #A1A1AA;
}
.industry-sector-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1rem;
  color: #D4D4D8;
  font-size: 0.62rem;
  line-height: 1;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.industry-sector-meta::before {
  content: "";
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: #00DC82;
  box-shadow: 0 0 14px rgba(0,220,130,0.35);
}
.solution-sector-card {
  position: relative;
  overflow: hidden;
  display: flex;
  min-height: 360px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--sector-border, #27272A);
  border-radius: 0.75rem;
  background:
    radial-gradient(circle at 18% 0%, var(--sector-dim, rgba(0,220,130,0.08)), transparent 34%),
    #18181B;
  padding: 1.35rem;
  cursor: pointer;
  transition:
    background-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    border-color 300ms cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 300ms cubic-bezier(0.25, 1, 0.5, 1),
    transform 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.solution-sector-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: var(--sector-accent, #00DC82);
  transition: width 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.solution-sector-card:hover,
.solution-sector-card.is-active {
  background:
    radial-gradient(circle at 18% 0%, var(--sector-dim, rgba(0,220,130,0.08)), transparent 38%),
    #27272A;
  border-color: var(--sector-border, #27272A);
  box-shadow: 0 18px 42px rgba(0,0,0,0.24);
  transform: translateY(-2px);
}
.solution-sector-card:hover::before,
.solution-sector-card.is-active::before {
  width: 100%;
}
.solution-sector-icon {
  display: inline-flex;
  width: 2.65rem;
  height: 2.65rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sector-border, #27272A);
  border-radius: 0.55rem;
  background: rgba(9,9,11,0.55);
  color: var(--sector-accent, #00DC82);
  transition:
    transform 300ms cubic-bezier(0.25, 1, 0.5, 1),
    background-color 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.solution-sector-card:hover .solution-sector-icon {
  transform: translateY(-3px) scale(1.04);
  background: rgba(9,9,11,0.76);
}
.sector-viz {
  width: 100%;
  min-height: 74px;
}
.sector-viz-bars {
  display: flex;
  height: 46px;
  align-items: flex-end;
  gap: 4px;
}
.sector-viz-bars span {
  flex: 1;
  min-width: 0;
  border-radius: 3px 3px 0 0;
}
.sector-viz-meta {
  margin-top: 0.45rem;
  display: flex;
  justify-content: space-between;
  color: #71717A;
  font-family: var(--font-body);
  font-size: 0.56rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.sector-viz-energy {
  display: grid;
  gap: 0.42rem;
}
.sector-viz-energy div {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  gap: 0.5rem;
  color: #71717A;
  font-size: 0.58rem;
}
.sector-viz-energy strong {
  display: block;
  height: 0.42rem;
  border-radius: 99px;
}
.sector-viz-energy em,
.sector-viz-mesh em,
.sector-viz-camera em,
.sector-viz-route em {
  color: #A1A1AA;
  font-size: 0.58rem;
  font-style: normal;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.sector-viz-mesh {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sector-viz-mesh span {
  width: 0.9rem;
  height: 0.9rem;
  border: 1px solid;
  border-radius: 50%;
  background: #18181B;
}
.sector-viz-camera {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  align-items: center;
}
.sector-viz-camera span {
  position: relative;
  overflow: hidden;
  height: 2.1rem;
  border: 1px solid;
  border-radius: 0.35rem;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.05), transparent 45%),
    rgba(9,9,11,0.55);
}
.scan-feed::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -35%;
  height: 32%;
  background: linear-gradient(180deg, transparent, var(--scan-accent, #00DC82), transparent);
  opacity: 0.75;
  animation: scanSweep 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}
@keyframes scanSweep {
  0% { transform: translateY(-120%); opacity: 0; }
  18% { opacity: 0.8; }
  72% { opacity: 0.65; }
  100% { transform: translateY(520%); opacity: 0; }
}
.sector-viz-camera em {
  grid-column: 1 / -1;
}
.sector-viz-pipeline,
.sector-viz-cloud {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
}
.sector-viz-cloud {
  grid-template-columns: repeat(3, 1fr);
}
.sector-viz-pipeline span,
.sector-viz-cloud span {
  display: grid;
  place-items: center;
  min-height: 3.4rem;
  border: 1px solid #27272A;
  border-radius: 0.4rem;
  padding: 0.45rem 0.25rem;
  color: #D4D4D8;
  text-align: center;
  font-size: 0.56rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background:
    radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--sector-accent, #00DC82) 18%, transparent), transparent 42%),
    rgba(9,9,11,0.32);
}
.sector-viz-pipeline span strong,
.sector-viz-cloud span strong {
  display: block;
  color: var(--sector-accent, #00DC82);
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.sector-viz-route svg {
  width: 100%;
  height: 46px;
  display: block;
}
.sector-viz-dashboard {
  display: grid;
  grid-template-columns: 1.1fr 0.8fr;
  grid-template-rows: repeat(2, 1fr);
  gap: 0.45rem;
}
.sector-viz-dashboard span,
.sector-viz-dashboard strong {
  position: relative;
  overflow: hidden;
  min-height: 1.6rem;
  border-radius: 0.35rem;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.055), transparent),
    #27272A;
}
.sector-viz-dashboard span em,
.sector-viz-dashboard span b {
  position: absolute;
  inset: auto 0.4rem 0.4rem 0.4rem;
  display: block;
  height: 0.32rem;
  border-radius: 99px;
  background: var(--sector-accent, #00DC82);
}
.sector-viz-dashboard span b {
  width: 58%;
}
.sector-viz-dashboard span i {
  display: inline-block;
  width: 0.28rem;
  height: 1rem;
  margin: 0.35rem 0.12rem 0;
  border-radius: 99px;
  background: var(--sector-accent, #00DC82);
}
:root {
  --iiot-track: #27272A;
  --iiot-track-strong: #3F3F46;
}
.iiot-page {
  --iiot-bg: #09090B;
  --iiot-surface: #18181B;
  --iiot-border: #27272A;
  --iiot-text: #FAFAFA;
  --iiot-muted: #A1A1AA;
}
:root[data-theme="light"] {
  --iiot-track: #E4E4E7;
  --iiot-track-strong: #D4D4D8;
}
:root[data-theme="light"] .iiot-page {
  --iiot-bg: #FAFAFA;
  --iiot-surface: #FFFFFF;
  --iiot-border: #E4E4E7;
  --iiot-text: #09090B;
  --iiot-muted: #52525B;
  background: #FAFAFA !important;
  color: #09090B !important;
}
:root[data-theme="light"] .iiot-page section,
:root[data-theme="light"] .iiot-page [class*="bg-[#070"],
:root[data-theme="light"] .iiot-page [class*="bg-[#090"],
:root[data-theme="light"] .iiot-page [class*="bg-[#0a"],
:root[data-theme="light"] .iiot-page [class*="bg-zinc-9"],
:root[data-theme="light"] .iiot-page [class*="bg-black"] {
  background-color: #FAFAFA !important;
}
:root[data-theme="light"] .iiot-page article,
:root[data-theme="light"] .iiot-page [class*="bg-zinc-950"],
:root[data-theme="light"] .iiot-page [class*="bg-zinc-900"],
:root[data-theme="light"] .iiot-page .factory-feature-card,
:root[data-theme="light"] .iiot-page .industry-sector-card,
:root[data-theme="light"] .iiot-page .solution-sector-card,
:root[data-theme="light"] .iiot-page .rounded-xl,
:root[data-theme="light"] .iiot-page .rounded-2xl {
  background-color: #FFFFFF !important;
  border-color: #E4E4E7 !important;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
:root[data-theme="light"] .iiot-page .text-white,
:root[data-theme="light"] .iiot-page .text-zinc-100,
:root[data-theme="light"] .iiot-page .text-zinc-200,
:root[data-theme="light"] .iiot-page h1,
:root[data-theme="light"] .iiot-page h2,
:root[data-theme="light"] .iiot-page h3,
:root[data-theme="light"] .iiot-page h4,
:root[data-theme="light"] .iiot-page strong {
  color: #09090B !important;
}
:root[data-theme="light"] .iiot-page .text-zinc-300,
:root[data-theme="light"] .iiot-page .text-zinc-400,
:root[data-theme="light"] .iiot-page .text-zinc-500,
:root[data-theme="light"] .iiot-page p,
:root[data-theme="light"] .iiot-page td,
:root[data-theme="light"] .iiot-page li {
  color: #52525B !important;
}
:root[data-theme="light"] .iiot-page .border-zinc-900,
:root[data-theme="light"] .iiot-page .border-zinc-800,
:root[data-theme="light"] .iiot-page .border-zinc-700 {
  border-color: #E4E4E7 !important;
}
:root[data-theme="light"] .iiot-page .bg-cyan-500,
:root[data-theme="light"] .iiot-page .bg-cyan-400,
:root[data-theme="light"] .iiot-page .bg-emerald-500,
:root[data-theme="light"] .iiot-page .bg-emerald-400 {
  background-color: #00DC82 !important;
}
:root[data-theme="light"] .iiot-page .text-cyan-400,
:root[data-theme="light"] .iiot-page .text-cyan-300,
:root[data-theme="light"] .iiot-page .text-emerald-400,
:root[data-theme="light"] .iiot-page .text-emerald-300 {
  color: #00DC82 !important;
}
:root[data-theme="light"] .iiot-page .text-amber-400,
:root[data-theme="light"] .iiot-page .text-amber-300 {
  color: #F59E0B !important;
}
:root[data-theme="light"] .iiot-page .text-rose-400,
:root[data-theme="light"] .iiot-page .text-rose-300 {
  color: #EF4444 !important;
}
:root[data-theme="light"] .iiot-page .solution-sector-icon,
:root[data-theme="light"] .iiot-page .sector-viz-mesh span,
:root[data-theme="light"] .iiot-page .scan-feed,
:root[data-theme="light"] .iiot-page .sector-viz-pipeline span,
:root[data-theme="light"] .iiot-page .sector-viz-cloud span,
:root[data-theme="light"] .iiot-page .sector-viz-dashboard span {
  background-color: #F4F4F5 !important;
}
`;

const FACTORY_FEATURES = [
  { title: "End-to-End Deployment", desc: "From physical sensor installations and PLC mapping to dashboard terminals.", icon: Settings, motionType: "gear" },
  { title: "Embedded Firmware Expertise", desc: "Deterministic microcontrollers, real-time operating systems (RTOS), and safety fail-safes.", icon: Cpu, motionType: "microchip" },
  { title: "AI + IoT Integration", desc: "Running predictive diagnostic algorithms directly on secure cloud logic clusters.", icon: Network, motionType: "network" },
  { title: "Industrial Dashboards", desc: "Clean SCADA-inspired control room panels built with React for performance and responsiveness.", icon: LineChart, motionType: "chart" },
  { title: "Edge AI Architectures", desc: "Running deep learning and computer vision on NVIDIA Jetson modules at the site.", icon: Activity, motionType: "pulse" },
  { title: "Telemetry Pipelines", desc: "Highly stable MQTT broker queues capable of handling thousands of sensor packets.", icon: Gauge, motionType: "gauge" },
  { title: "Hardware Integration", desc: "Direct hardware-software loop validation preventing physical interface errors.", icon: Database, motionType: "stack" },
  { title: "Real-Time Monitoring", desc: "High-resolution telemetry graphs with sub-second transmission delay.", icon: Signal, motionType: "signal" },
  { title: "Industrial Automation", desc: "Modbus/TCP, Profinet, and OPC-UA bridge setups connecting old manufacturing bays.", icon: Wrench, motionType: "wrench" },
  { title: "Custom PCB Development", desc: "Designing dedicated multi-sensor boards tailored for specific industrial enclosures.", icon: HardDrive, motionType: "microchip" },
];

const INDUSTRY_SECTORS = [
  { id: "manufacturing", name: "Manufacturing", desc: "Machine uptime monitoring, vibration diagnostics, and PLC integration.", icon: Factory, motionType: "gear", meta: "Plant telemetry" },
  { id: "agriculture", name: "Smart Agriculture", desc: "Automated micro-irrigation, soil moisture matrices, and weather telemetry.", icon: Globe, motionType: "network", meta: "Field intelligence" },
  { id: "warehousing", name: "Warehousing", desc: "RFID inventory pipelines, environmental logs, and autonomous routing.", icon: Database, motionType: "stack", meta: "Asset flow" },
  { id: "cold_storage", name: "Cold Storage", desc: "Multi-tier temperature monitoring, sensor logs, and anomaly cooling triggers.", icon: ShieldAlert, motionType: "pulse", meta: "Cold-chain SLA" },
  { id: "smart_cities", name: "Smart Cities", desc: "Acoustic noise matrices, ambient air telemetry, and lighting grid controls.", icon: Network, motionType: "network", meta: "Urban grid" },
  { id: "water", name: "Water Management", desc: "Flow telemetry, water level analytics, and valve actuator loops.", icon: Activity, motionType: "pulse", meta: "Utility control" },
  { id: "logistics", name: "Logistics", desc: "Real-time transport telematics, refrigeration logs, and route optimization.", icon: Signal, motionType: "signal", meta: "Fleet visibility" },
  { id: "pharma", name: "Pharma", desc: "SLA-compliant batch environment logging and clean room air flow matrices.", icon: Lock, motionType: "gauge", meta: "Compliance layer" },
  { id: "automation", name: "Industrial Automation", desc: "Modbus conversions, SCADA linking, and pneumatic valve automation.", icon: Settings, motionType: "gear", meta: "Controls bridge" },
  { id: "energy", name: "Energy Monitoring", desc: "Direct grid sub-metering, harmonic current tracking, and load analysis.", icon: Zap, motionType: "wrench", meta: "Power insight" },
];

function FactoryFeatureCard({ title, desc, icon: Icon, motionType }) {
  return (
    <article className="factory-feature-card">
      <div>
        <Icon className="factory-feature-icon" data-motion={motionType} aria-hidden="true" />
        <h3 className="factory-feature-title text-sm font-bold mb-2 leading-snug">
          {title}
        </h3>
        <p className="factory-feature-copy text-xs leading-relaxed font-sans">
          {desc}
        </p>
      </div>
    </article>
  );
}

function IndustrySectorCard({ name, desc, icon: Icon, motionType, meta }) {
  return (
    <article className="industry-sector-card">
      <Icon className="industry-sector-icon" data-motion={motionType} aria-hidden="true" />
      <h3 className="industry-sector-title text-sm font-bold mb-2 font-syne">{name}</h3>
      <p className="industry-sector-copy text-xs leading-relaxed font-sans">{desc}</p>
      <div className="industry-sector-meta">{meta}</div>
    </article>
  );
}

/* â”€â”€â”€ LIVE PROJECT DASHBOARD MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Opens when a user clicks any of the 10 Core Engineering Capability
   project cards. Shows a real-time dashboard with random telemetry
   values that update every second + a live-streaming chart. The
   parameters displayed and the tech badges are tailored per project. */
function DashboardKpi({ label, value, unit, accent, min = 0, max = 100 }) {
  const numeric = Number(value);
  const pct = Number.isFinite(numeric)
    ? Math.min(100, Math.max(0, ((numeric - min) / ((max - min) || 1)) * 100))
    : 0;

  return (
    <div className="bg-zinc-900/45 border border-zinc-800 p-4 rounded-lg">
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-mono font-bold" style={{ color: accent }}>
        {Number.isFinite(numeric) ? value : "--"}{" "}
        <span className="text-xs text-zinc-500 font-normal">{unit}</span>
      </div>
      <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>
    </div>
  );
}

function DashboardPanel({ title, children, accent }) {
  return (
    <div className="bg-zinc-900/45 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{title}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
      {children}
    </div>
  );
}

function MachineStatusGauge({ label, value, unit, accent, min, max }) {
  const numeric = Number(value);
  const pct = Number.isFinite(numeric)
    ? Math.min(100, Math.max(0, ((numeric - min) / ((max - min) || 1)) * 100))
    : 0;
  const angle = -118 + pct * 236 / 100;
  const arcLength = 176;

  return (
    <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 16px ${accent}` }} />
      </div>
      <div className="relative mx-auto h-32 w-32 overflow-hidden">
        <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
          <circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke="#27272A"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} 264`}
            transform="rotate(132 60 60)"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="42"
            fill="none"
            stroke={accent}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * arcLength} 264`}
            transform="rotate(132 60 60)"
            initial={false}
            animate={{ strokeDasharray: `${(pct / 100) * arcLength} 264` }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          />
          <circle cx="60" cy="60" r="31" fill="#0a0a0e" stroke="#27272A" />
          <motion.g
            initial={false}
            animate={{ rotate: angle }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformOrigin: "60px 60px" }}
          >
            <line x1="60" y1="60" x2="60" y2="34" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          </motion.g>
          <circle cx="60" cy="60" r="4" fill={accent} />
        </svg>
        <div className="absolute inset-0 grid place-items-center pt-9 text-center">
          <strong className="block font-mono text-xl text-white">{Number.isFinite(numeric) ? value : "--"}</strong>
          <span className="font-mono text-[10px] text-zinc-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function SectorDashboardBody({ project, channels, values, history, logs }) {
  const style = SECTOR_STYLE[project?.title] || DEFAULT_SECTOR_STYLE;
  const accent = style.accent;

  const logPanel = (
    <DashboardPanel title="System Event Stream" accent={accent}>
      <div className="bg-black/50 border border-zinc-900 rounded-lg p-3 font-mono text-[11px] text-zinc-400 max-h-44 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-zinc-600">Waiting for telemetry...</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="flex gap-3 py-1 border-b border-zinc-900/60 last:border-0">
              <span style={{ color: accent }}>[{l.t}]</span>
              <span>{l.msg}</span>
            </div>
          ))
        )}
      </div>
    </DashboardPanel>
  );

  const kpiGrid = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {channels.map((c) => (
        <DashboardKpi
          key={c.key}
          label={c.label}
          value={values[c.key]}
          unit={c.unit}
          accent={c.accent || accent}
          min={c.min}
          max={c.max}
        />
      ))}
    </div>
  );

  if (project?.title === "Predictive Maintenance Systems") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Failure Risk Analyzer" accent={accent}>
            <div className="space-y-4">
              {[
                ["Bearing envelope", "LOW", 34],
                ["Lubrication drift", "WATCH", 62],
                ["Rotor imbalance", "LOW", 28],
                ["Thermal fatigue", "NORMAL", 45],
              ].map(([label, state, risk]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span>{label}</span>
                    <span style={{ color: state === "WATCH" ? STATUS_WARNING : accent }}>{state}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: state === "WATCH" ? STATUS_WARNING : accent }}
                      animate={{ width: `${risk}%` }}
                      transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Maintenance Planning Window" accent={accent}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ["Inspect", "48 hrs", "bearing"],
                ["Service", "12 days", "belt"],
                ["Replace", "56 days", "rotor"],
              ].map(([action, eta, part], i) => (
                <div key={action} className="rounded-lg border border-zinc-800 bg-black/25 p-4">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{action}</span>
                  <strong className="mt-3 block text-2xl font-mono text-white">{eta}</strong>
                  <div className="mt-4 h-1 rounded-full" style={{ background: i === 0 ? STATUS_WARNING : accent }} />
                  <span className="mt-2 block text-[10px] font-mono uppercase text-zinc-500">{part}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Smart Energy Monitoring") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Three Phase Load Balance" accent={accent}>
            {["L1", "L2", "L3"].map((phase, i) => (
              <div key={phase} className="mb-4 last:mb-0">
                <div className="mb-1 flex justify-between font-mono text-[10px] text-zinc-500"><span>{phase}</span><span>{82 + i * 4}%</span></div>
                <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: accent }} animate={{ width: `${82 + i * 4}%` }} />
                </div>
              </div>
            ))}
          </DashboardPanel>
          <DashboardPanel title="Power Quality Board" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["THD", "2.8%", "clean"],
                ["Peak Demand", "186 kW", "stable"],
                ["Neutral", "4.2 A", "balanced"],
                ["Tariff Slot", "Off-peak", "optimized"],
              ].map(([label, value, state]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                  <strong className="mt-2 block text-lg font-mono text-white">{value}</strong>
                  <span className="mt-1 block text-[10px] font-mono uppercase" style={{ color: accent }}>{state}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Industrial Telemetry Systems") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="RF Gateway Rack" accent={accent}>
            <div className="space-y-3">
              {["LoRaWAN CH-01", "RS485 trunk", "MQTT uplink", "Edge buffer"].map((label, i) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="h-8 w-8 rounded border" style={{ borderColor: accent, background: `${accent}14` }} />
                  <div className="flex-1">
                    <strong className="block text-sm text-white">{label}</strong>
                    <span className="font-mono text-[10px] uppercase text-zinc-500">{i === 3 ? "queue depth 04" : "handshake stable"}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase" style={{ color: accent }}>online</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Packet Integrity Matrix" accent={accent}>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i} className="h-7 rounded border border-zinc-800" style={{ background: i % 11 === 0 ? "#27272A" : `${accent}${i % 4 === 0 ? "88" : "44"}` }} />
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Smart Sensor Networks") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Self-Healing Mesh Map" accent={accent}>
            <svg viewBox="0 0 520 210" className="h-48 w-full">
              {[[80, 110], [185, 56], [252, 142], [360, 74], [436, 148]].map(([x, y], i, arr) => (
                <g key={i}>
                  {arr.slice(i + 1).map(([x2, y2], j) => (
                    <line key={j} x1={x} y1={y} x2={x2} y2={y2} stroke={accent} strokeOpacity="0.18" />
                  ))}
                  <circle cx={x} cy={y} r="16" fill="#18181B" stroke={accent} strokeWidth="2" />
                  <circle cx={x} cy={y} r="4" fill={accent} />
                </g>
              ))}
            </svg>
          </DashboardPanel>
          <DashboardPanel title="Node Maintenance Board" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Yard A", "18 nodes", "healthy"],
                ["Boiler bay", "07 nodes", "routing"],
                ["Tank farm", "11 nodes", "healthy"],
                ["Gate link", "04 nodes", "backup"],
              ].map(([zone, nodes, state]) => (
                <div key={zone} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <strong className="block text-sm text-white">{zone}</strong>
                  <span className="mt-2 block font-mono text-lg" style={{ color: accent }}>{nodes}</span>
                  <span className="mt-1 block text-[10px] font-mono uppercase text-zinc-500">{state}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "AI-Based Surveillance") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Camera Inference Grid" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {["Gate 01", "Line A", "Packing", "Dock"].map((cam, i) => (
                <div
                  key={cam}
                  className="scan-feed relative h-28 overflow-hidden rounded-lg border border-zinc-800 bg-black/40 p-3"
                  style={{ "--scan-accent": accent }}
                >
                  <div className="relative z-10 mb-4 flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>{cam}</span>
                    <span style={{ color: i === 2 ? accent : ARC_ACCENT }}>{i === 2 ? "SCAN" : "LIVE"}</span>
                  </div>
                  <div className="relative z-10 grid grid-cols-3 gap-2">
                    <span className="h-8 rounded border border-zinc-700 bg-zinc-900/80" />
                    <span className="h-8 rounded border bg-zinc-900/80" style={{ borderColor: i === 2 ? accent : "#3f3f46" }} />
                    <span className="h-8 rounded border border-zinc-700 bg-zinc-900/80" />
                  </div>
                  <div className="relative z-10 mt-3 h-1 rounded-full" style={{ background: i === 2 ? accent : ARC_ACCENT }} />
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Safety Compliance" accent={accent}>
            <div className="space-y-3">
              {["Helmet", "Vest", "Restricted Zone", "Fall Risk"].map((label, i) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-black/30 border border-zinc-800 p-3">
                  <span className="text-sm text-zinc-300">{label}</span>
                  <span className="font-mono text-sm" style={{ color: i === 2 ? accent : ARC_ACCENT }}>{i === 2 ? "WATCH" : "CLEAR"}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Edge AI Infrastructure") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
          <DashboardPanel title="Inference Pipeline" accent={accent}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {["Sensor", "Tensor", "Model", "Action"].map((step, i) => (
                <div key={step} className="rounded-lg border border-zinc-800 bg-black/25 p-4">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500">0{i + 1}</div>
                  <div className="text-sm font-bold text-white">{step}</div>
                  <div className="mt-4 h-1 rounded-full" style={{ background: i <= 2 ? accent : "#3f3f46" }} />
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Edge Compute Rack" accent={accent}>
            <div className="space-y-3">
              {[
                ["Jetson Orin", "GPU 72%", "thermal normal"],
                ["TFLite runtime", "4.8 ms", "low latency"],
                ["Frame buffer", "128 MB", "stable"],
                ["Fallback rule", "armed", "local control"],
              ].map(([label, value, state]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <div>
                    <strong className="block text-sm text-white">{label}</strong>
                    <span className="font-mono text-[10px] uppercase text-zinc-500">{state}</span>
                  </div>
                  <span className="font-mono text-sm" style={{ color: accent }}>{value}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Remote Asset Monitoring") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <DashboardPanel title="GPS Route And Cold Chain Guard" accent={accent}>
            <svg viewBox="0 0 760 210" className="h-48 w-full">
              <path d="M40 150 C150 42 230 178 330 92 S530 42 700 122" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
              {[40, 190, 330, 510, 700].map((x, i) => (
                <g key={x}>
                  <circle cx={x} cy={i % 2 ? 88 : 140} r="13" fill="#18181B" stroke={accent} />
                  <circle cx={x} cy={i % 2 ? 88 : 140} r="4" fill={accent} />
                </g>
              ))}
            </svg>
          </DashboardPanel>
          <DashboardPanel title="Asset Exception Board" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Geo Fence", "inside", "ok"],
                ["Door", "sealed", "ok"],
                ["Cargo Temp", "4.8°C", "ok"],
                ["Shock Event", "0", "clear"],
              ].map(([label, value, state]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                  <strong className="mt-2 block text-lg font-mono text-white">{value}</strong>
                  <span className="mt-1 block text-[10px] font-mono uppercase" style={{ color: accent }}>{state}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Industrial Dashboard Systems") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Operator View Throughput" accent={accent}>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Screens", "18", "active"],
                ["Panels", "42", "bound"],
                ["Alerts", "0", "clear"],
                ["Refresh", "250 ms", "live"],
                ["TSDB", "4 ms", "writing"],
                ["Users", "12", "online"],
              ].map(([label, value, state]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                  <strong className="mt-2 block font-mono text-base text-white">{value}</strong>
                  <span className="mt-1 block text-[10px] font-mono uppercase" style={{ color: accent }}>{state}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Control Room Sessions" accent={accent}>
            <div className="space-y-3">
              {["Shift supervisor", "Maintenance", "Plant manager", "Remote OEM"].map((label, i) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/25 px-3 py-2">
                  <span className="text-sm text-zinc-300">{label}</span>
                  <span className="font-mono text-xs" style={{ color: i < 3 ? accent : "#a1a1aa" }}>{i < 3 ? "VIEWING" : "STANDBY"}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  if (project?.title === "Cloud + Edge IoT Integration") {
    return (
      <div className="px-6 py-5 space-y-4">
        {kpiGrid}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardPanel title="Secure Ingestion Pipeline" accent={accent}>
            <div className="space-y-3">
              {["Gateway", "X.509 Auth", "MQTT Broker", "Rules Engine", "Cloud Storage"].map((label, i) => (
                <div key={label} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="grid h-8 w-8 place-items-center rounded border font-mono text-xs" style={{ borderColor: accent, color: accent }}>{i + 1}</span>
                  <div className="flex-1">
                    <strong className="block text-sm text-white">{label}</strong>
                    <span className="font-mono text-[10px] uppercase text-zinc-500">{i === 1 ? "certificate valid" : "handshake ok"}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>
          <DashboardPanel title="Cloud Session State" accent={accent}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["TLS", "1.3", "locked"],
                ["Ingest", "680 msg/s", "healthy"],
                ["Retry Queue", "0", "empty"],
                ["Failover", "armed", "ready"],
              ].map(([label, value, state]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-black/25 p-3">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                  <strong className="mt-2 block text-lg font-mono text-white">{value}</strong>
                  <span className="mt-1 block text-[10px] font-mono uppercase" style={{ color: accent }}>{state}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
        {logPanel}
      </div>
    );
  }

  return (
    <div className="px-6 py-5 space-y-4">
      {kpiGrid}
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
        <DashboardPanel title="Machine Cell Overview" accent={accent}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {channels.slice(0, 3).map((c) => (
              <MachineStatusGauge
                key={c.key}
                label={c.label}
                value={values[c.key]}
                unit={c.unit}
                accent={c.accent || accent}
                min={c.min}
                max={c.max}
              />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Production Line State</span>
              <span className="text-[10px] font-mono uppercase" style={{ color: accent }}>Auto mode</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["PLC", "Drive", "Sensor", "MQTT"].map((label, i) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-[#0a0a0e] p-3 text-center">
                  <span className="mx-auto mb-2 block h-2 w-2 rounded-full" style={{ background: i === 2 ? STATUS_WARNING : accent }} />
                  <strong className="block text-xs text-white">{label}</strong>
                  <span className="mt-1 block text-[9px] font-mono uppercase text-zinc-500">{i === 2 ? "watch" : "linked"}</span>
                </div>
              ))}
            </div>
          </div>
        </DashboardPanel>
        <DashboardPanel title="PLC Loop Status" accent={accent}>
          <div className="space-y-3">
            {[
              ["Cycle Time", "18.4 sec", "within takt"],
              ["Reject Rate", "0.42%", "stable"],
              ["Gateway", "IIOT-GW-656", "locked"],
              ["Safety Relay", "Closed", "safe"],
            ].map(([label, value, state]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/25 p-3">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                  <strong className="mt-1 block font-mono text-sm text-white">{value}</strong>
                </div>
                <span className="rounded-full border px-2 py-1 text-[10px] font-mono uppercase" style={{ color: accent, borderColor: `${accent}66`, background: `${accent}16` }}>
                  {state}
                </span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
      {logPanel}
    </div>
  );
}

function LiveProjectDashboard({ project, onClose }) {
  // Per-project telemetry channel definitions â€” each project shows
  // realistic-looking variables for the tech stack it represents.
  const PROJECT_TELEMETRY = {
    "Real-Time Machine Monitoring": [
      { key: "rpm", label: "Spindle RPM", unit: "RPM", min: 1200, max: 1800, decimals: 0, accent: ARC_ACCENT },
      { key: "load", label: "Motor Load", unit: "%", min: 40, max: 95, decimals: 1, accent: ARC_ACCENT },
      { key: "cycles", label: "Cycle Count", unit: "pcs", min: 4820, max: 4920, decimals: 0, accent: ARC_ACCENT },
      { key: "uptime", label: "OEE Score", unit: "%", min: 88, max: 99, decimals: 1, accent: ARC_ACCENT },
    ],
    "Predictive Maintenance Systems": [
      { key: "vib", label: "Vibration", unit: "mm/s", min: 0.8, max: 4.5, decimals: 2, accent: ARC_ACCENT },
      { key: "bearing", label: "Bearing Temp", unit: "°C", min: 52, max: 78, decimals: 1, accent: ARC_ACCENT },
      { key: "fft", label: "FFT Dominant", unit: "Hz", min: 48, max: 62, decimals: 1, accent: ARC_ACCENT },
      { key: "rul", label: "Remaining Life", unit: "days", min: 42, max: 58, decimals: 0, accent: ARC_ACCENT },
    ],
    "Smart Energy Monitoring": [
      { key: "voltage", label: "Line Voltage", unit: "V", min: 408, max: 422, decimals: 1, accent: ARC_ACCENT },
      { key: "current", label: "Line Current", unit: "A", min: 145, max: 195, decimals: 1, accent: ARC_ACCENT },
      { key: "pf", label: "Power Factor", unit: "", min: 0.88, max: 0.99, decimals: 2, accent: ARC_ACCENT },
      { key: "kwh", label: "Energy Today", unit: "kWh", min: 1240, max: 1380, decimals: 0, accent: ARC_ACCENT },
    ],
    "Industrial Telemetry Systems": [
      { key: "rssi", label: "LoRa RSSI", unit: "dBm", min: -110, max: -70, decimals: 0, accent: ARC_ACCENT },
      { key: "snr", label: "Signal SNR", unit: "dB", min: 6, max: 14, decimals: 1, accent: ARC_ACCENT },
      { key: "batt", label: "Node Battery", unit: "V", min: 3.4, max: 4.1, decimals: 2, accent: ARC_ACCENT },
      { key: "pkts", label: "Packets/min", unit: "pkt", min: 12, max: 36, decimals: 0, accent: ARC_ACCENT },
    ],
    "AI-Based Surveillance": [
      { key: "fps", label: "Inference FPS", unit: "fps", min: 24, max: 42, decimals: 0, accent: ARC_ACCENT },
      { key: "ppl", label: "PPE Compliance", unit: "%", min: 88, max: 99, decimals: 1, accent: ARC_ACCENT },
      { key: "alerts", label: "Active Alerts", unit: "", min: 0, max: 4, decimals: 0, accent: ARC_ACCENT },
      { key: "gpu", label: "Jetson GPU Load", unit: "%", min: 55, max: 88, decimals: 0, accent: ARC_ACCENT },
    ],
    "Edge AI Infrastructure": [
      { key: "lat", label: "Inference Latency", unit: "ms", min: 1.8, max: 6.4, decimals: 2, accent: ARC_ACCENT },
      { key: "cpu", label: "Edge CPU", unit: "%", min: 22, max: 68, decimals: 0, accent: ARC_ACCENT },
      { key: "ram", label: "RAM Used", unit: "MB", min: 120, max: 260, decimals: 0, accent: ARC_ACCENT },
      { key: "acc", label: "Model Accuracy", unit: "%", min: 94, max: 99, decimals: 2, accent: ARC_ACCENT },
    ],
    "Remote Asset Monitoring": [
      { key: "speed", label: "Asset Speed", unit: "km/h", min: 0, max: 78, decimals: 1, accent: ARC_ACCENT },
      { key: "temp", label: "Cargo Temp", unit: "°C", min: -4, max: 8, decimals: 1, accent: ARC_ACCENT },
      { key: "fuel", label: "Fuel Level", unit: "%", min: 22, max: 92, decimals: 0, accent: ARC_ACCENT },
      { key: "tilt", label: "Tilt Vector", unit: "°", min: 0, max: 12, decimals: 1, accent: ARC_ACCENT },
    ],
    "Smart Sensor Networks": [
      { key: "nodes", label: "Active Nodes", unit: "", min: 38, max: 42, decimals: 0, accent: ARC_ACCENT },
      { key: "hops", label: "Avg Mesh Hops", unit: "", min: 1, max: 4, decimals: 1, accent: ARC_ACCENT },
      { key: "drop", label: "Drop Rate", unit: "%", min: 0, max: 1.2, decimals: 2, accent: ARC_ACCENT },
      { key: "thr", label: "Mesh Throughput", unit: "kbps", min: 280, max: 420, decimals: 0, accent: ARC_ACCENT },
    ],
    "Industrial Dashboard Systems": [
      { key: "ws", label: "WS Clients", unit: "", min: 80, max: 140, decimals: 0, accent: ARC_ACCENT },
      { key: "msgs", label: "Msgs/sec", unit: "", min: 240, max: 380, decimals: 0, accent: ARC_ACCENT },
      { key: "tsdb", label: "TSDB Write", unit: "ms", min: 3, max: 14, decimals: 1, accent: ARC_ACCENT },
      { key: "view", label: "Active Views", unit: "", min: 12, max: 28, decimals: 0, accent: ARC_ACCENT },
    ],
    "Cloud + Edge IoT Integration": [
      { key: "rtt", label: "Cloud RTT", unit: "ms", min: 32, max: 92, decimals: 0, accent: ARC_ACCENT },
      { key: "tls", label: "TLS Sessions", unit: "", min: 18, max: 44, decimals: 0, accent: ARC_ACCENT },
      { key: "ingest", label: "Ingestion Rate", unit: "msg/s", min: 420, max: 680, decimals: 0, accent: ARC_ACCENT },
      { key: "fail", label: "Fail Rate", unit: "%", min: 0, max: 0.4, decimals: 3, accent: ARC_ACCENT },
    ],
  };

  const channels = (project && PROJECT_TELEMETRY[project.title]) || [
    { key: "v1", label: "Channel A", unit: "u", min: 0, max: 100, decimals: 1, accent: ARC_ACCENT },
    { key: "v2", label: "Channel B", unit: "u", min: 0, max: 100, decimals: 1, accent: ARC_ACCENT },
    { key: "v3", label: "Channel C", unit: "u", min: 0, max: 100, decimals: 1, accent: ARC_ACCENT },
    { key: "v4", label: "Channel D", unit: "u", min: 0, max: 100, decimals: 1, accent: ARC_ACCENT },
  ];

  const rand = (min, max, d) => {
    const v = Math.random() * (max - min) + min;
    return Number(v.toFixed(d));
  };

  const initial = () => {
    const o = {};
    channels.forEach(c => { o[c.key] = rand(c.min, c.max, c.decimals); });
    return o;
  };

  const [values, setValues] = useState(initial);
  const [history, setHistory] = useState(() => Array.from({ length: 30 }, () => rand(channels[0].min, channels[0].max, channels[0].decimals)));
  const [logs, setLogs] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Re-seed when project switches
    setValues(initial());
    setHistory(Array.from({ length: 30 }, () => rand(channels[0].min, channels[0].max, channels[0].decimals)));
    setLogs([
      { t: new Date().toLocaleTimeString(), msg: `Stream initialised for ${project?.title || "project"}` },
      { t: new Date().toLocaleTimeString(), msg: `Gateway IIOT-GW-${Math.floor(100 + Math.random() * 900)} acquired lock` },
    ]);
    setTick(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.title]);

  // Live telemetry tick â€” every 1s, regenerate values + extend chart
  useEffect(() => {
    if (!project) return;
    const id = setInterval(() => {
      const next = {};
      channels.forEach(c => { next[c.key] = rand(c.min, c.max, c.decimals); });
      setValues(next);
      setHistory(prev => {
        const arr = [...prev, next[channels[0].key]];
        return arr.slice(-30);
      });
      setTick(t => t + 1);
      // Occasional system log entry
      if (Math.random() < 0.18) {
        const lib = [
          "Edge inference cycle completed",
          "Modbus poll OK",
          "MQTT topic /telemetry pushed",
          "Heartbeat received",
          "Schema validated against contract",
          "Anomaly score below threshold",
          "Cloud sync delta queued",
        ];
        setLogs(prev => [
          { t: new Date().toLocaleTimeString(), msg: lib[Math.floor(Math.random() * lib.length)] },
          ...prev,
        ].slice(0, 8));
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.title]);

  if (!project) return null;
  const sectorStyle = SECTOR_STYLE[project.title] || DEFAULT_SECTOR_STYLE;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pb-6 pt-28 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-[#0a0a0e] border rounded-2xl shadow-2xl relative"
        style={{ borderColor: sectorStyle.border, boxShadow: `0 24px 80px ${sectorStyle.dim}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-900"
          style={{ background: `linear-gradient(90deg, ${sectorStyle.dim}, transparent)` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 bg-zinc-900 border rounded"
              style={{ color: sectorStyle.accent, borderColor: sectorStyle.border }}
            >
              {project.icon ? <project.icon className="w-6 h-6" /> : null}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">LIVE · STREAMING</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-syne">{project.title}</h3>
              <p className="text-[11px] font-mono text-zinc-500">Real-time dashboard · tick #{tick}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded px-3 py-1 text-sm font-mono"
            aria-label="Close dashboard"
          >
            × CLOSE
          </button>
        </div>

        {/* Tech badges */}
        <div className="px-6 py-4 border-b border-zinc-900 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-2">Tech Stack:</span>
          {(project.tech || []).map((t, i) => (
            <span
              key={i}
              className="text-[10px] font-mono border px-2.5 py-1 rounded"
              style={{ color: sectorStyle.accent, background: sectorStyle.dim, borderColor: sectorStyle.border }}
            >
              {t}
            </span>
          ))}
        </div>

        <SectorDashboardBody project={project} channels={channels} values={values} history={history} logs={logs} />

        <p className="px-6 pb-6 text-[10px] font-mono text-zinc-600">
          Simulated values for demonstration. Production gateways push real OPC-UA, Modbus, MQTT, and TLS-secured telemetry.
        </p>
      </div>
    </div>
  );
}

export default function IndustrialIoTSolutions() {
  const containerRef = useRef(null);

  // States
  const [activeSolution, setActiveSolution] = useState(0);
  const [activeDeployment, setActiveDeployment] = useState("hybrid");
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [faqOpen, setFaqOpen] = useState(Array(8).fill(false));

  // Selected project for the live dashboard modal
  const [selectedProject, setSelectedProject] = useState(null);

  // Live Telemetry Showcase States
  const [dashboardStatus, setDashboardStatus] = useState("NOMINAL"); // NOMINAL, WARNING, ALERT
  const [sensorValues, setSensorValues] = useState({
    rpm: 1445,
    vibration: 1.6,
    power: 12.6,
    temp: 56.8,
    pressure: 4.3,
    h: 342,
    m: 18,
    s: 45
  });
  const [telemetryHistory, setTelemetryHistory] = useState([1.6, 1.7, 1.5, 1.6, 1.8, 1.6, 1.5, 1.7, 1.6]);
  const [alarmLogs, setAlarmLogs] = useState([
    { time: "21:10:04", type: "system", msg: "Modbus connection established with PLC-04" },
    { time: "21:05:12", type: "ai", msg: "Edge predictive maintenance model synchronized" }
  ]);

  // Telemetry loop simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorValues(prev => {
        // Increment uptime seconds
        let nextS = prev.s + 1;
        let nextM = prev.m;
        let nextH = prev.h;
        if (nextS >= 60) {
          nextS = 0;
          nextM += 1;
        }
        if (nextM >= 60) {
          nextM = 0;
          nextH += 1;
        }

        // Add minor industrial jitter to readings
        const speedNoise = (Math.random() - 0.5) * 8;
        const tempNoise = (Math.random() - 0.5) * 0.4;
        const pressNoise = (Math.random() - 0.5) * 0.1;
        const powerNoise = (Math.random() - 0.5) * 0.2;
        
        let targetVibration = prev.vibration;
        if (dashboardStatus === "NOMINAL") {
          targetVibration = 1.5 + (Math.random() - 0.5) * 0.3;
        } else if (dashboardStatus === "WARNING") {
          targetVibration = 4.2 + (Math.random() - 0.5) * 0.5;
        } else {
          targetVibration = 8.6 + (Math.random() - 0.5) * 1.2;
        }

        return {
          rpm: Math.round(1445 + speedNoise),
          vibration: parseFloat(targetVibration.toFixed(2)),
          power: parseFloat((12.6 + powerNoise).toFixed(2)),
          temp: parseFloat((56.8 + tempNoise).toFixed(1)),
          pressure: parseFloat((4.3 + pressNoise).toFixed(2)),
          h: nextH,
          m: nextM,
          s: nextS
        };
      });

      // Update history graph
      setTelemetryHistory(prev => {
        const next = [...prev.slice(1)];
        let val = 1.6;
        if (dashboardStatus === "NOMINAL") val = 1.5 + (Math.random() - 0.5) * 0.3;
        else if (dashboardStatus === "WARNING") val = 4.2 + (Math.random() - 0.5) * 0.5;
        else val = 8.6 + (Math.random() - 0.5) * 1.2;
        next.push(parseFloat(val.toFixed(2)));
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [dashboardStatus]);

  // Handler to simulate an anomaly
  const triggerSimulation = (type) => {
    if (type === "warning") {
      setDashboardStatus("WARNING");
      setAlarmLogs(prev => [
        { time: new Date().toLocaleTimeString(), type: "warning", msg: "Vibration threshold exceeded (4.2 mm/s) on Drive Axle B" },
        ...prev.slice(0, 4)
      ]);
    } else if (type === "alert") {
      setDashboardStatus("ALERT");
      setAlarmLogs(prev => [
        { time: new Date().toLocaleTimeString(), type: "alert", msg: "CRITICAL: Severe vibration peak (8.6 mm/s). Predictive bearing failure risk 88%." },
        ...prev.slice(0, 4)
      ]);
    } else {
      setDashboardStatus("NOMINAL");
      setAlarmLogs(prev => [
        { time: new Date().toLocaleTimeString(), type: "system", msg: "Diagnostic reset. All telemetry parameters restored to nominal limits." },
        ...prev.slice(0, 4)
      ]);
    }
  };

  // GSAP Scroll Animation Effects
  useEffect(() => {
    // Reveal animation for headers and cards
    const revealElements = document.querySelectorAll(".gsap-reveal");
    revealElements.forEach(el => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Simple background canvas particles representing IoT node connections
  useEffect(() => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 700;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle nodes
    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid overlay background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update nodes
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();

        // Connect near particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Toggle single FAQ accordion index
  const toggleFaq = (index) => {
    setFaqOpen(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <>
      <Helmet>
        <title>Industrial IoT, AI &amp; Smart Automation Solutions | ARC LABS</title>
        <meta name="description" content="ARC LABS delivers enterprise-grade Industrial IoT (IIoT), AI + IoT systems, predictive maintenance, remote telemetry, edge AI, and smart factory solutions for factories, MSMEs, and infrastructure in India." />
        <link rel="canonical" href="https://arclabs.in/industrial-iot-solutions" />
        <meta property="og:url" content="https://arclabs.in/industrial-iot-solutions" />
        <meta property="og:title" content="Industry 4.0, Industrial IoT &amp; Edge AI Solutions | ARC LABS" />
        <meta property="og:description" content="Deploy factory-wide real-time monitoring, predictive diagnostics, Modbus/PLC gateways, and AI surveillance systems with ARC LABS." />
        <meta property="og:image" content="https://arclabs.in/images/og-industrial-iot.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Enterprise Industry 4.0 Solutions | ARC LABS" />
        <meta name="twitter:description" content="Scalable telemetry pipelines, edge computing interfaces, and smart machine diagnostics designed for modern industrial manufacturing." />
        
        {/* Structured Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "LocalBusiness",
                "@id": "https://arclabs.in/#organization",
                "name": "ARC LABS",
                "url": "https://arclabs.in/",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "4-7-138/1, Narendra Nagar, Habsiguda",
                  "addressLocality": "Hyderabad",
                  "addressRegion": "Telangana",
                  "postalCode": "500007",
                  "addressCountry": "IN"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+917815809412",
                  "contactType": "sales",
                  "email": "sales@arclabs.in"
                }
              },
              {
                "@type": "Service",
                "name": "Industrial IoT & AI Solutions",
                "provider": {
                  "@type": "LocalBusiness",
                  "@id": "https://arclabs.in/#organization"
                },
                "description": "Deploy telemetry networks, edge intelligence gateways, predictive maintenance models, and live SCADA integrations for factory automation.",
                "areaServed": "IN"
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  { "@type": "Question", "name": "What is Industrial IoT (IIoT)?", "acceptedAnswer": { "@type": "Answer", "text": "Industrial IoT refers to the extension and use of the Internet of Things (IoT) in industrial sectors and applications. It focuses heavily on machine-to-machine (M2M) communication, big data analytics, and machine learning, enabling factories and infrastructure sites to gain high operational efficiency and stability." }},
                  { "@type": "Question", "name": "How does AI improve industrial systems?", "acceptedAnswer": { "@type": "Answer", "text": "Artificial Intelligence processes massive streams of high-frequency sensor readings directly at the edge or on site servers. AI models identify warning signals, track operational drift, and predict equipment failures weeks before they happen, replacing reactive repairs with planned maintenance cycles." }},
                  { "@type": "Question", "name": "What communication protocols do your systems support?", "acceptedAnswer": { "@type": "Answer", "text": "Our hardware gateways natively map Modbus TCP, Modbus RTU, RS485 interfaces, OPC-UA servers, and cellular backhauls (4G LTE/GSM). For wireless telemetry arrays, we implement LoRaWAN RF links, BLE tags, and self-healing ESP-NOW mesh topologies." }},
                  { "@type": "Question", "name": "Can older legacy machinery become smart systems?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We specialize in retrofitting legacy CNC lathes, injection molding presses, and old pumping setups by placing external split-core current transducers, vibration probes, and temperature sensors, bridging raw signals to Modbus relays into modern dashboards." }},
                  { "@type": "Question", "name": "Do you provide customizable cloud dashboards?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We design and build dedicated React-based dashboard systems tailored for factory displays. Dashboards can run locally inside your plant network (air-gapped) or sync securely with cloud infrastructures (AWS IoT Core) with permission controls and email/SMS alerts." }},
                  { "@type": "Question", "name": "Can you design custom IoT sensor hardware?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we handle custom PCB design, schematic layouts, component sourcing, and enclosure drafting. We configure specific sensor boards that match unique size limits or environmental standards (IP67 enclosures)." }},
                  { "@type": "Question", "name": "Which industries benefit the most from IIoT integration?", "acceptedAnswer": { "@type": "Answer", "text": "Manufacturing plants (OEE improvement), cold chain logistics companies (spoiled goods prevention), smart agriculture zones (water saving), water processing grids (level telemetry), and energy-intensive manufacturing setups (utility cost cutting)." }},
                  { "@type": "Question", "name": "Do you support Edge AI deployment?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We deploy localized neural networks using TensorFlow Lite on ESP32-S3 boards and run real-time computer vision models using NVIDIA Jetson edge systems installed directly on factory floors." }}
                ]
              }
            ]
          })}
        </script>
      </Helmet>
      <style>{factoryFeatureStyles}</style>

      {/* Global Wrapper (Dark Matte theme) */}
      <div className="iiot-page bg-[#09090b] text-[#f4f4f5] min-h-screen font-sans selection:bg-cyan-500 selection:text-[#09090b] relative overflow-hidden" ref={containerRef}>
        
        {/* Subtle grid background globally */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.06),rgba(255,255,255,0))]" />
        
        {/* SECTION 1 â€” CINEMATIC HERO */}
        <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6 lg:px-16 border-b border-zinc-900 z-10">
          <canvas id="particles-canvas" className="absolute inset-0 w-full h-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
            {/* Left text column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Strategic visual tag communicating enterprise transition */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-wider text-cyan-400 mb-8 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ENTERPRISE SYSTEM DIVISION
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-syne leading-none mb-6">
                Industrial IoT, AI & <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Smart Automation
                </span> Solutions
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed font-sans font-light">
                Transforming manufacturing processes and factory workflows with real-time hardware telemetry, edge AI processing, industrial diagnostics, and enterprise integration.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <a href="#contact" className="px-7 py-3.5 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-950/40 flex items-center gap-2">
                  Schedule Consultation <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#solutions" className="px-7 py-3.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                  Explore Solutions
                </a>
              </div>

              {/* Protocol status bar */}
              <div className="flex flex-wrap gap-6 items-center border-t border-zinc-900 pt-6 w-full text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Modbus TCP/RTU</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> OPC-UA</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> MQTT / LoRaWAN</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> AWS IoT CORE</span>
              </div>
            </div>

            {/* Right preview column (Simulated hardware & real-time telemetry card) */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
              <div className="w-full max-w-[460px] bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-6 shadow-2xl relative backdrop-blur-md overflow-hidden">
                {/* Visual glow backdrop inside */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Console header */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">LIVE EDGE TELEMETRY</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">GATEWAY ID: IIOT-GW-841</span>
                </div>

                {/* Simulated variables */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-900/40 border border-zinc-800/30 p-3.5 rounded flex flex-col items-start">
                    <span className="text-[10px] text-zinc-500 font-mono">MOTOR DRIVE SPEED</span>
                    <span className="text-xl font-mono text-cyan-400 mt-1">{sensorValues.rpm} <span className="text-xs text-zinc-500">RPM</span></span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/30 p-3.5 rounded flex flex-col items-start">
                    <span className="text-[10px] text-zinc-500 font-mono">AXIAL VIBRATION</span>
                    <span className={`text-xl font-mono mt-1 ${sensorValues.vibration > 4 ? "text-amber-400" : "text-emerald-400"}`}>{sensorValues.vibration} <span className="text-xs text-zinc-500">mm/s</span></span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/30 p-3.5 rounded flex flex-col items-start">
                    <span className="text-[10px] text-zinc-500 font-mono">CORE TEMPERATURE</span>
                    <span className="text-xl font-mono text-zinc-300 mt-1">{sensorValues.temp} <span className="text-xs text-zinc-500">°C</span></span>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800/30 p-3.5 rounded flex flex-col items-start">
                    <span className="text-[10px] text-zinc-500 font-mono">ENERGY DEMAND</span>
                    <span className="text-xl font-mono text-zinc-300 mt-1">{sensorValues.power} <span className="text-xs text-zinc-500">kW</span></span>
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Vibration Trend Pipeline</span>
                    <span className="text-[9px] font-mono text-zinc-500">1200ms INTERVAL</span>
                  </div>
                  <div className="bg-zinc-900/60 h-20 rounded border border-zinc-900/80 flex items-center justify-center p-2">
                    <Sparkline points={telemetryHistory} stroke={ARC_ACCENT} animate={false} />
                  </div>
                </div>

                {/* AI Diagnostics Status */}
                <div className="bg-cyan-950/20 border border-cyan-900/30 p-3.5 rounded">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>EDGE DIAGNOSTICS DETECTOR</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Model anomaly index: 1.2% (Nominal). No predictive maintenance flags triggered for local parameters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 â€” WHY ARC LABS */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10 bg-zinc-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Enterprise Trust</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Engineered for Factory Scales
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Why industrial clients, factory engineers, and automation consultants partner with ARC LABS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {FACTORY_FEATURES.map((item) => (
                <FactoryFeatureCard
                  key={item.title}
                  title={item.title}
                  desc={item.desc}
                  icon={item.icon}
                  motionType={item.motionType}
                />
              ))}
            </div>

            {/* Metrics sub-band */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-zinc-900/80 max-w-5xl mx-auto text-center">
              <div>
                <div className="text-3xl font-mono font-bold text-white">50+</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">IoT Deployments</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white">100+</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Systems Designed</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white">20+</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Enterprise Partners</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white">99.98%</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Data Transmission SLA</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 â€” INDUSTRIES WE SERVE */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gsap-reveal">
              <div>
                <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Target Sectors</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2">
                  Industries We Transform
                </h2>
              </div>
              <p className="text-zinc-400 font-sans text-sm font-light max-w-md mt-4 md:mt-0">
                Delivering tailored telemetry architectures and edge processing modules for specialized environments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {INDUSTRY_SECTORS.map((sector) => (
                <IndustrySectorCard
                  key={sector.id}
                  name={sector.name}
                  desc={sector.desc}
                  icon={sector.icon}
                  motionType={sector.motionType}
                  meta={sector.meta}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 â€” INDUSTRIAL SOLUTIONS */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 bg-zinc-950/20 relative z-10" id="solutions">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Solutions Suite</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Core Engineering Capabilities
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Production-ready Industrial IoT packages fully compatible with existing legacy factory systems.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  title: "Real-Time Machine Monitoring",
                  desc: "Connect legacy and modern CNCs, Injection Molding, and Extruder machinery. Map operational variables directly into digital twins to count pieces, measure performance logs, and map machine states.",
                  tech: ["Modbus TCP", "ESP32 Gateway", "Node-RED Core"],
                  val: "99.8% Connectivity",
                  icon: Settings,
                  p: [4, 4, 3, 5, 4, 4, 4, 5, 4]
                },
                {
                  title: "Predictive Maintenance Systems",
                  desc: "Vibration sensors (piezoelectric and MEMS accelerometer nodes) combined with thermal tracking logs. Identify bearing degradation, imbalance patterns, and shaft misalignment weeks before catastrophic failure.",
                  tech: ["Fourier Transform (FFT)", "STM32 Edge Node", "AI Diagnostics"],
                  val: "Vibration & Temp Matrix",
                  icon: Wrench,
                  p: [1.2, 1.3, 1.2, 1.4, 1.3, 1.5, 1.2, 1.3, 1.2]
                },
                {
                  title: "Smart Energy Monitoring",
                  desc: "Sub-metering networks utilizing split-core CT sensors. Monitor voltage spikes, reactive power, power factors, and phase imbalances. Directly analyze carbon offsets and factory power usage patterns.",
                  tech: ["Modbus RTU", "Power Analyzers", "Energy Dashboard"],
                  val: "Load imbalance mapping",
                  icon: Zap,
                  p: [415, 417, 412, 416, 414, 419, 415, 416, 415]
                },
                {
                  title: "Industrial Telemetry Systems",
                  desc: "Highly robust telemetry networks for distributed assets. Ideal for pumping stations, pipeline networks, and long-range environmental matrices. Implements ultra-low-power nodes with battery operations.",
                  tech: ["LoRaWAN Class A/C", "GSM/4G Failover", "MQTT Bridge"],
                  val: "15km Line of Sight Range",
                  icon: Gauge,
                  p: [85, 87, 86, 84, 88, 85, 84, 86, 85]
                },
                {
                  title: "AI-Based Surveillance",
                  desc: "Analyze safety video streams in real-time. Automatically detect missing PPE (helmets, vests, protective glasses), boundary intrusions in dangerous robot bays, and factory fire indicators at the local gateway level.",
                  tech: ["NVIDIA Jetson Core", "YOLOv8 Edge Models", "RTSP Streams"],
                  val: "Real-time safety triggers",
                  icon: Eye,
                  p: [98, 97, 99, 98, 97, 98, 98, 99, 98]
                },
                {
                  title: "Edge AI Infrastructure",
                  desc: "Process sensor pipelines locally without relying on external cloud latencies. Our gateways filter data anomalies, run localized inference regressions, and control machinery loops directly at the boundary.",
                  tech: ["TensorFlow Lite", "ESP32-S3 Edge", "Local Feedback Loops"],
                  val: "< 5ms Inference Latency",
                  icon: Cpu,
                  p: [2, 3, 2, 2, 4, 2, 3, 2, 2]
                },
                {
                  title: "Remote Asset Monitoring",
                  desc: "Track mobile and stationary assets across logistics networks. Monitor GPS locations, temperature limits of cold cargo, tilt vectors, and humidity profiles with secure cellular modules.",
                  tech: ["BLE Tag Network", "GSM Gateway", "Geofencing Engine"],
                  val: "Asset temperature metrics",
                  icon: Signal,
                  p: [5, 4, 6, 5, 5, 4, 5, 6, 5]
                },
                {
                  title: "Smart Sensor Networks",
                  desc: "Deploy custom mesh arrays across complex chemical processing yards, agricultural zones, and large factories. Sensors communicate in a self-healing grid topology to ensure zero data dropouts.",
                  tech: ["ESP-NOW Mesh", "RS485 Interfaces", "Industrial Enclosures"],
                  val: "Self-healing mesh matrix",
                  icon: Network,
                  p: [12, 12, 13, 12, 11, 13, 12, 12, 12]
                },
                {
                  title: "Industrial Dashboard Systems",
                  desc: "Interactive, dashboard web control interfaces. Optimized for display screens on factory floors. Clean visualizations, interactive widgets, customizable alerting rules, and detailed history tracking.",
                  tech: ["React Frontend", "WebSockets Data", "Time-series Database"],
                  val: "SCADA overlay console",
                  icon: LineChart,
                  p: [120, 125, 122, 128, 124, 132, 129, 128]
                },
                {
                  title: "Cloud + Edge IoT Integration",
                  desc: "Create secure connections between physical gateways and industrial platforms. Sync data pipelines with AWS IoT Core or local on-premise servers utilizing strict cryptographic handshakes.",
                  tech: ["X.509 Certificates", "TLS 1.3 Encryption", "AWS IoT SDK"],
                  val: "Secure TLS telemetry",
                  icon: Database,
                  p: [45, 48, 52, 49, 47, 53, 50, 48]
                }
              ].map((sol, index) => {
                const ss = SECTOR_STYLE[sol.title] || DEFAULT_SECTOR_STYLE;

                return (
                  <article
                    key={index}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProject(sol)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedProject(sol); }}
                    className={`group solution-sector-card ${activeSolution === index ? "is-active" : ""}`}
                    style={{
                      "--sector-accent": ss.accent,
                      "--sector-dim": ss.dim,
                      "--sector-border": ss.border,
                    }}
                    onMouseEnter={() => setActiveSolution(index)}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="solution-sector-icon">
                          <sol.icon className="w-6 h-6" />
                        </div>
                        <span
                          className="text-[10px] font-mono px-2.5 py-1 rounded border tracking-wider uppercase text-right"
                          style={{ color: ss.accent, background: ss.dim, borderColor: ss.border }}
                        >
                          {ss.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-3 font-syne">{sol.title}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-6 font-light">{sol.desc}</p>
                    </div>

                    <div className="pt-5 border-t border-zinc-800/80">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {sol.tech.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <SectorCardViz title={sol.title} accent={ss.accent} points={sol.p} />

                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest" style={{ color: ss.accent }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ss.accent }} />
                          Live Dashboard
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 transition-colors flex items-center gap-1 group-hover:text-zinc-200">
                          Open Telemetry <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5 â€” AI + IoT INTELLIGENCE */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 bg-[#070709] relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: AI visual simulations */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Node visualization */}
                <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-white tracking-widest">ANOMALY MATRIX PARSER</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">MODEL: IIOT-NODE-V4</span>
                </div>

                {/* Neural net nodes simulation using SVGs */}
                <div className="relative h-60 bg-zinc-900/40 rounded border border-zinc-900 flex items-center justify-center overflow-hidden mb-6 p-4">
                  <svg className="w-full h-full text-zinc-800" viewBox="0 0 400 200">
                    {/* Connections */}
                    <line x1="40" y1="100" x2="140" y2="50" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="40" y1="100" x2="140" y2="150" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="140" y1="50" x2="260" y2="40" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="140" y1="50" x2="260" y2="100" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="140" y1="150" x2="260" y2="100" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="140" y1="150" x2="260" y2="160" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                    <line x1="260" y1="40" x2="360" y2="100" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1.5" />
                    <line x1="260" y1="100" x2="360" y2="100" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1.5" className="stroke-dasharray-4 animate-dash" />
                    <line x1="260" y1="160" x2="360" y2="100" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />

                    {/* Left node (Input) */}
                    <circle cx="40" cy="100" r="10" fill="#18181b" stroke={ARC_ACCENT} strokeWidth="2" />
                    <text x="40" y="85" fill="#a1a1aa" fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">SENSOR INPUT</text>

                    {/* Hidden layer nodes */}
                    <circle cx="140" cy="50" r="8" fill="#18181b" stroke={ARC_ACCENT} strokeWidth="1.5" />
                    <circle cx="140" cy="150" r="8" fill="#18181b" stroke={ARC_ACCENT} strokeWidth="1.5" />

                    {/* Second hidden layer nodes */}
                    <circle cx="260" cy="40" r="8" fill="#18181b" stroke={ARC_ACCENT} strokeWidth="1.5" />
                    <circle cx="260" cy="100" r="8" fill="#18181b" stroke={STATUS_WARNING} strokeWidth="1.5" className="animate-pulse" />
                    <circle cx="260" cy="160" r="8" fill="#18181b" stroke={ARC_ACCENT} strokeWidth="1.5" />

                    {/* Output node */}
                    <circle cx="360" cy="100" r="12" fill="#18181b" stroke={STATUS_WARNING} strokeWidth="2.5" />
                    <text x="360" y="80" fill={STATUS_WARNING} fontSize="9" fontFamily="Inter, sans-serif" textAnchor="middle">ANOMALY ALERT</text>
                  </svg>

                  <div className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[9px] font-mono text-zinc-400">DECISION PATHWAY ACTIVE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-zinc-900/60 p-3 rounded border border-zinc-900">
                    <span className="text-zinc-500 block mb-1">INFERENCE VALUE</span>
                    <span className="text-zinc-300 font-bold">0.892 (HIGH DEV)</span>
                  </div>
                  <div className="bg-zinc-900/60 p-3 rounded border border-zinc-900">
                    <span className="text-zinc-500 block mb-1">DETECTION SPEED</span>
                    <span className="text-emerald-400 font-bold">1.4ms GATEWAY</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="flex flex-col items-start text-left">
                <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Edge Machine Learning</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-6">
                  AI-Powered Industrial Intelligence
                </h2>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-light">
                  Process vast telemetry streams at the machine boundary. Instead of sending raw parameters to the cloud, ARC LABS systems process high-frequency signals at the edge to detect warning signs and schedule maintenance prompts automatically.
                </p>

                <div className="space-y-6 w-full">
                  {[
                    { title: "Predictive Analytics Engine", desc: "Monitors drive shafts and hydraulic pressure to predict mechanical wear and prevent damage." },
                    { title: "Localized Anomaly Detection", desc: "Compares current telemetry vectors against baseline signatures to highlight abnormal parameters instantly." },
                    { title: "Computer Vision CCTV Analytics", desc: "Integrates with camera feeds to verify safety parameters and ensure worker protection." },
                    { title: "Pattern Regression Matrix", desc: "Recognizes micro-vibrations and current harmonics to trace load changes." }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-zinc-900 last:border-b-0">
                      <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded mt-0.5 text-cyan-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 font-syne">{feat.title}</h4>
                        <p className="text-xs text-zinc-500 leading-normal font-sans">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 6 â€” TECHNOLOGY STACK WALL */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">IIoT Tech Matrix</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Enterprise Industrial Ecosystem
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Built on industry-standard communication technologies, controllers, and database systems.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {[
                { name: "ESP32 Microcontrollers", type: "hardware" },
                { name: "STM32 Architectures", type: "hardware" },
                { name: "Raspberry Pi Gateways", type: "hardware" },
                { name: "NVIDIA Jetson Edge", type: "hardware" },
                { name: "MQTT Broker Pipelines", type: "protocol" },
                { name: "Modbus TCP/RTU Bridges", type: "protocol" },
                { name: "LoRaWAN long-range RF", type: "protocol" },
                { name: "OPC-UA Server Arrays", type: "protocol" },
                { name: "BLE Telemetry Tags", type: "protocol" },
                { name: "GSM / 4G Cellular Backhaul", type: "protocol" },
                { name: "Node-RED Process Engines", type: "software" },
                { name: "AWS IoT Core Integration", type: "software" },
                { name: "TensorFlow Lite Inference", type: "software" },
                { name: "PLC Modbus Mapping", type: "hardware" },
                { name: "Edge AI Analytics Node", type: "software" }
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className={`px-5 py-3 rounded-lg border font-mono text-xs transition-all duration-300 flex items-center gap-3 ${
                    tech.type === "hardware"
                      ? "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300"
                      : tech.type === "protocol"
                      ? "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    tech.type === "hardware" ? "bg-cyan-500" : tech.type === "protocol" ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                  {tech.name}
                </div>
              ))}
            </div>

            {/* Visual connector representation */}
            <div className="mt-16 relative h-16 max-w-2xl mx-auto flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full text-zinc-900 opacity-60 animate-pulse" viewBox="0 0 600 60">
                <path d="M10,30 Q150,10 300,30 T590,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
                <path d="M10,30 Q150,50 300,30 T590,30" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="300" cy="30" r="4" fill={ARC_ACCENT} className="animate-ping" />
              </svg>
            </div>
          </div>
        </section>

        {/* SECTION 7 â€” DEPLOYMENT MODELS */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 bg-zinc-950/10 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Architectures</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Enterprise Deployment Models
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Adaptable hosting and communication models designed to align with strict factory security audits.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {[
                {
                  id: "cloud",
                  title: "Cloud Deployment",
                  desc: "Telemetry data is routed securely to AWS IoT Core, generating interactive analytics panels and batch logs accessible from anywhere.",
                  traffic: "GATEWAY âž” MQTT âž” AWS CLOUD âž” CLIENT SCREEN",
                  icon: Cloud
                },
                {
                  id: "onprem",
                  title: "On-Premise Systems",
                  desc: "Host all database structures and web server instances locally inside the factory network boundary. Keeps machinery data air-gapped.",
                  traffic: "GATEWAY âž” LOCAL ROUTER âž” LOCAL SERVER âž” SCADA PANEL",
                  icon: HardDrive
                },
                {
                  id: "hybrid",
                  title: "Hybrid Edge AI",
                  desc: "Localized diagnostics engines analyze parameter thresholds instantly at the site, syncing summarized logs with external nodes periodically.",
                  traffic: "GATEWAY âž” EDGE AI INFERENCE âž” SUMMARIZED CLOUD SYNC",
                  icon: Layers
                },
                {
                  id: "offline",
                  title: "Offline Systems",
                  desc: "Air-gapped telemetry networks running on local RF (LoRa/mesh). Telemetry is stored directly on physical storage boards for manual checks.",
                  traffic: "GATEWAY âž” LOCAL RF âž” MICROSD LOGGER âž” OPERATOR TERMINAL",
                  icon: Lock
                },
                {
                  id: "remote",
                  title: "Remote Telemetry",
                  desc: "Designed for sites lacking Wi-Fi or Ethernet. Uses GSM/4G cellular backup modules to bridge data channels to client servers.",
                  traffic: "GATEWAY âž” GSM MODEM âž” SECURE APN âž” WEB APP DATABASE",
                  icon: Signal
                }
              ].map((model) => (
                <div
                  key={model.id}
                  className={`p-6 border rounded-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    activeDeployment === model.id
                      ? "border-cyan-500/60 bg-zinc-950/80 shadow-lg shadow-cyan-950/20"
                      : "border-zinc-800/80 bg-zinc-950/20 hover:border-zinc-700/60"
                  }`}
                  onClick={() => setActiveDeployment(model.id)}
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <model.icon className={`w-6 h-6 ${activeDeployment === model.id ? "text-cyan-400" : "text-zinc-500"}`} />
                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                        activeDeployment === model.id ? "bg-cyan-950 text-cyan-400" : "bg-zinc-900 text-zinc-500"
                      }`}>
                        {model.id.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 font-syne">{model.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light mb-6">{model.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-zinc-900">
                    <span className="text-[8px] font-mono text-zinc-500 block mb-1">SIGNAL ROUTING DIAGRAM</span>
                    <span className="text-[9px] font-mono text-zinc-400 leading-snug">{model.traffic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 â€” HOW WE WORK */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Structured Deployment Pipeline
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                From initially defining requirements to executing site support audits, we follow an engineering-first roadmap.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 relative">
              
              {/* Connector line for large screens */}
              <div className="hidden lg:block absolute top-[52px] left-[5%] right-[5%] h-0.5 bg-zinc-900 z-0 pointer-events-none" />

              {[
                { step: "01", name: "Requirement Analysis", desc: "Document variables, communication protocols, and installation constraints." },
                { step: "02", name: "Site Survey", desc: "Audit RF signal coverage, network structures, and electrical cabinet layouts." },
                { step: "03", name: "Hardware Design", desc: "Select components, design custom PCBs, and draft enclosures." },
                { step: "04", name: "Embedded Dev", desc: "Compile firmware loop controls and configure protocol translation buffers." },
                { step: "05", name: "Dashboard Dev", desc: "Build responsive control panels and configure alarm criteria." },
                { step: "06", name: "AI Integration", desc: "Train diagnostic models and configure inference criteria at the edge." },
                { step: "07", name: "Deployment", desc: "Install sensor channels, configure gateways, and establish client loops." },
                { step: "08", name: "Support Audit", desc: "Perform periodic checks, calibration tests, and firmware updates." }
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-lg text-left relative z-10 flex flex-col justify-between h-[210px] group hover:border-zinc-800 transition-colors duration-300">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 block mb-3">{item.step}</span>
                    <h4 className="text-xs font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-300 font-syne">{item.name}</h4>
                    <p className="text-[10px] text-zinc-500 leading-normal font-sans">{item.desc}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-cyan-500 transition-colors duration-300 mt-4" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9 â€” INDUSTRIAL USE CASES */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 bg-zinc-950/20 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gsap-reveal">
              <div>
                <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Deployments In Action</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2">
                  Industrial Use Cases
                </h2>
              </div>
              <p className="text-zinc-400 font-sans text-sm font-light max-w-md mt-4 md:mt-0">
                Real-world examples of how ARC LABS hardware and telemetry software increase efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Use cases switcher */}
              <div className="lg:col-span-4 space-y-3">
                {[
                  { id: 0, title: "Smart Dustbin Telemetry", client: "Municipal Smart City Grid" },
                  { id: 1, title: "Factory Machine Monitoring", client: "Automotive Parts Assembly" },
                  { id: 2, title: "Water Tank Monitoring", client: "Chemical Processing Plant" },
                  { id: 3, title: "Smart Energy Analytics", client: "Metal Casting Facility" },
                  { id: 4, title: "AI CCTV Safety Monitoring", client: "Construction Yard Site" },
                  { id: 5, title: "Cold Storage Logistics", client: "Pharmaceutical Supply Chain" },
                  { id: 6, title: "Warehouse Asset Tracking", client: "E-Commerce Fulfilment Hub" },
                  { id: 7, title: "Remote Pump Telemetry", client: "Agricultural Irrigation Yard" }
                ].map((uc) => (
                  <button
                    key={uc.id}
                    className={`w-full text-left p-4 rounded border transition-all duration-300 font-mono text-xs flex flex-col items-start ${
                      activeUseCase === uc.id
                        ? "border-cyan-500 bg-zinc-900/60 text-white"
                        : "border-zinc-900 bg-zinc-900/20 text-zinc-500 hover:border-zinc-800"
                    }`}
                    onClick={() => setActiveUseCase(uc.id)}
                  >
                    <span className="font-bold">{uc.title}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{uc.client}</span>
                  </button>
                ))}
              </div>

              {/* Right Column: Case study details */}
              <div className="lg:col-span-8 bg-zinc-950/80 border border-zinc-800 p-8 rounded-xl relative min-h-[420px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {[
                    {
                      id: 0,
                      title: "Smart Dustbin Telemetry Platform",
                      challenge: "Municipal team needed to prevent city-wide bin overflow and map collection trucks dynamically to save fuel.",
                      solution: "Deployed 200+ ultrasonic fill-level sensors linked with low-power battery nodes communicating via LoRaWAN gateways.",
                      tech: "Ultrasonic rangefinders, ESP-32, LoRaWAN gateways, GIS Mapping Engine.",
                      outcome: "Fuel consumption dropped by 34% due to dynamic path routing; bin overflows eliminated.",
                      metrics: { val: "34% Fuel Saved", rate: "99.2% Uptime" }
                    },
                    {
                      id: 1,
                      title: "Factory Machine Status Tracking",
                      challenge: "Automotive tier-1 contractor suffered high downtime and lacked actual machine production numbers.",
                      solution: "Wired Modbus sensor lines to electrical panels to log RPM, current demand, and tool vibrations.",
                      tech: "Current Transformers, RS485-Modbus converter, local WebSockets server.",
                      outcome: "Immediate detection of spindle imbalances. Overall Equipment Effectiveness (OEE) improved by 14%.",
                      metrics: { val: "14% OEE Increase", rate: "Zero downtime alerts" }
                    },
                    {
                      id: 2,
                      title: "Water Tank Level & Valve Control",
                      challenge: "Chemical production line experienced dry-pump damage because tank level drops went unnoticed.",
                      solution: "Installed IP67 pressure-transducer level sensors with automated relay controls to cut pump power when levels drop below 10%.",
                      tech: "Piezoresistive pressure transmitter, PLC relay board, Modbus gateway.",
                      outcome: "Prevented dry-run impeller damage completely, preserving equipment life.",
                      metrics: { val: "100% Impeller Protection", rate: "Sub-second safety cuts" }
                    },
                    {
                      id: 3,
                      title: "Smart Energy Analytics & Sub-metering",
                      challenge: "Metal foundry faced huge utility fines due to low power factors and peak usage spikes.",
                      solution: "Deployed sub-meter channels tracking voltage, power factor, and harmonics to notify operators to load induction ovens sequentially.",
                      tech: "CT clamps, ESP32, Modbus analyzers, MQTT dashboard.",
                      outcome: "Eliminated peak power utility penalties, reducing monthly utility bills by 18%.",
                      metrics: { val: "18% Utility Cost Cut", rate: "Power Factor at 0.98" }
                    },
                    {
                      id: 4,
                      title: "AI CCTV Security & Boundary Controls",
                      challenge: "Heavy equipment construction yard faced safety audits because workers entered active crane zones without helmets.",
                      solution: "Deployed AI CCTV cameras running YOLO object classification at the site level to trigger audio warning lines on site.",
                      tech: "NVIDIA Jetson gateway, RTSP IP cameras, YOLO edge models.",
                      outcome: "Compliance with PPE rules reached 99.4% within 14 days of system installation.",
                      metrics: { val: "99.4% PPE Compliance", rate: "< 100ms classification delay" }
                    },
                    {
                      id: 5,
                      title: "Cold Storage Temperature Matrix",
                      challenge: "Pharma distributor had batches rejected due to unrecognized temperature spikes in transport vehicles.",
                      solution: "Installed digital temperature probes communicating via cellular gateways to upload temperature trends continuously.",
                      tech: "DS18B20 digital probes, GSM module, cloud data server.",
                      outcome: "Alert logs trigger automatically when cargo drifts near limits, preventing vaccine spoilage.",
                      metrics: { val: "Zero cargo spoilage", rate: "0.1°C probe precision" }
                    },
                    {
                      id: 6,
                      title: "Warehouse Asset Positioning Array",
                      challenge: "Fulfilment hub wasted hours locating heavy custom parts carts across an 80,000 sq ft facility.",
                      solution: "Wired low-power Bluetooth beacon tags to all parts carts with receiver nodes mapped around structural columns.",
                      tech: "Bluetooth BLE trackers, ESP32 BLE receiver grids, triangulation server.",
                      outcome: "Reduced parts retrieval times from 25 minutes down to under 2 minutes.",
                      metrics: { val: "92% Search Time Reduction", rate: "2m tracking resolution" }
                    },
                    {
                      id: 7,
                      title: "Remote Pump System Telemetry",
                      challenge: "Agricultural district pump bays failed due to dry-running and over-voltage issues in rural grids.",
                      solution: "Wired telemetry gateways measuring line voltage and flow speeds, utilizing GSM networks to transmit system status to district dashboards.",
                      tech: "Flow sensors, GSM gateways, Modbus monitors.",
                      outcome: "District operators detect system faults immediately, reducing repair lag from days to hours.",
                      metrics: { val: "88% Fault Detection Lag Cut", rate: "4G cellular backhaul" }
                    }
                  ].filter(uc => uc.id === activeUseCase).map((study) => (
                    <motion.div
                      key={study.id}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col justify-between h-full space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white font-syne mb-4">{study.title}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">THE CHALLENGE</span>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{study.challenge}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">DEPLOYED ARCHITECTURE</span>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{study.solution}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">INTEGRATED TECHNOLOGIES</span>
                            <p className="text-xs font-mono text-cyan-400">{study.tech}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-zinc-900 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-8">
                          <div>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">DEPLOYMENT IMPACT</span>
                            <span className="text-base font-mono font-bold text-emerald-400">{study.metrics.val}</span>
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block mb-0.5">NETWORK SLA RATE</span>
                            <span className="text-base font-mono font-bold text-cyan-400">{study.metrics.rate}</span>
                          </div>
                        </div>
                        <a href="#contact" className="px-5 py-2.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs transition-colors duration-300 flex items-center gap-2">
                          Request Full Case Study <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10 â€” LIVE DASHBOARD SHOWCASE */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Interactive Console</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Operational Telemetry Dashboard
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Interact with our mock telemetry gateway to simulate variable thresholds and observe the reactive diagnostics loop.
              </p>
            </div>

            {/* Dashboard Console Container */}
            <div className="bg-[#0c0c10] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
              
              {/* Top Controls Bar */}
              <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">LIVE TELEMETRY STREAM</span>
                </div>
                
                {/* Simulation Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500 mr-2 uppercase">SIMULATE FAULTS:</span>
                  <button
                    onClick={() => triggerSimulation("nominal")}
                    className={`px-3 py-1.5 rounded font-mono text-[10px] font-semibold border transition-all duration-300 ${
                      dashboardStatus === "NOMINAL"
                        ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-400 shadow-sm"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    NOMINAL
                  </button>
                  <button
                    onClick={() => triggerSimulation("warning")}
                    className={`px-3 py-1.5 rounded font-mono text-[10px] font-semibold border transition-all duration-300 ${
                      dashboardStatus === "WARNING"
                        ? "bg-amber-950/40 border-amber-500/60 text-amber-400 shadow-sm"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    AXIAL JITTER
                  </button>
                  <button
                    onClick={() => triggerSimulation("alert")}
                    className={`px-3 py-1.5 rounded font-mono text-[10px] font-semibold border transition-all duration-300 ${
                      dashboardStatus === "ALERT"
                        ? "bg-rose-950/40 border-rose-500/60 text-rose-400 shadow-sm"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    BEARING FAILURE
                  </button>
                </div>
              </div>

              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Panel: Charts & Stats (8 cols) */}
                <div className="lg:col-span-8 p-6 border-r border-zinc-900">
                  {/* Status Banner */}
                  <div className={`p-4 rounded border mb-6 flex justify-between items-center transition-colors duration-300 ${
                    dashboardStatus === "NOMINAL"
                      ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-400"
                      : dashboardStatus === "WARNING"
                      ? "bg-amber-950/10 border-amber-900/30 text-amber-400"
                      : "bg-rose-950/10 border-rose-900/30 text-rose-400"
                  }`}>
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5" />
                      <div>
                        <div className="text-xs font-bold font-syne uppercase">SYSTEM STATUS: {dashboardStatus}</div>
                        <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                          {dashboardStatus === "NOMINAL" ? "All machinery telemetry running within baseline metrics." : 
                           dashboardStatus === "WARNING" ? "Predictive warnings registered. Vibration harmonics slightly out of spec." : 
                           "CRITICAL ALERT: Bearing failure risk threshold exceeded. Action suggested."}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs">Uptime: {sensorValues.h}h {sensorValues.m}m</span>
                  </div>

                  {/* Core variables grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded">
                      <span className="text-[10px] text-zinc-500 font-mono block">MOTOR DRIVE SPEED</span>
                      <span className="text-2xl font-mono font-bold text-white mt-1 block">{sensorValues.rpm} <span className="text-xs text-zinc-500">RPM</span></span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-2 block">LIMIT: 1800 RPM MAX</span>
                    </div>
                    <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded">
                      <span className="text-[10px] text-zinc-500 font-mono block">VIBRATION MATRIX</span>
                      <span className={`text-2xl font-mono font-bold mt-1 block ${
                        sensorValues.vibration > 7 ? "text-rose-400" : sensorValues.vibration > 3 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {sensorValues.vibration} <span className="text-xs text-zinc-500">mm/s</span>
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-2 block">LIMIT: 3.5 mm/s MAX</span>
                    </div>
                    <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded">
                      <span className="text-[10px] text-zinc-500 font-mono block">OPERATIONAL TEMP</span>
                      <span className="text-2xl font-mono font-bold text-white mt-1 block">{sensorValues.temp} <span className="text-xs text-zinc-500">°C</span></span>
                      <span className="text-[9px] font-mono text-zinc-500 mt-2 block">LIMIT: 85.0°C MAX</span>
                    </div>
                  </div>

                  {/* High fidelity telemetry chart */}
                  <div className="bg-zinc-950/80 border border-zinc-800 p-5 rounded">
                    <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-3">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">High Frequency Jitter Pipeline</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Parameter: Acceleration (mm/s)</span>
                    </div>
                    
                    <div className="h-44 w-full flex items-center justify-center relative bg-[#09090b]/80 rounded border border-zinc-900 p-4">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-[0.03]">
                        {Array(24).fill(0).map((_, i) => <div key={i} className="border border-white" />)}
                      </div>

                      <Sparkline points={telemetryHistory} stroke={dashboardStatus === "ALERT" ? STATUS_CRITICAL : dashboardStatus === "WARNING" ? STATUS_WARNING : ARC_ACCENT} animate={true} w={560} h={140} />
                    </div>
                  </div>
                </div>

                {/* Right Panel: Alarms & Logs (4 cols) */}
                <div className="lg:col-span-4 p-6 bg-zinc-950/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">DIAGNOSTIC ALARM LOG</span>
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {alarmLogs.map((log, i) => (
                        <div key={i} className="p-3 bg-zinc-950 border border-zinc-900 rounded font-mono text-[10px] leading-relaxed">
                          <div className="flex justify-between items-center mb-1 text-zinc-500">
                            <span>{log.time}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              log.type === "alert" ? "bg-rose-950 text-rose-400" :
                              log.type === "warning" ? "bg-amber-950 text-amber-400" : "bg-zinc-900 text-zinc-400"
                            }`}>
                              {log.type.toUpperCase()}
                            </span>
                          </div>
                          <p className={
                            log.type === "alert" ? "text-rose-300" :
                            log.type === "warning" ? "text-amber-300" : "text-zinc-400"
                          }>
                            {log.msg}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900">
                    <div className="text-[9px] font-mono text-zinc-500 block mb-2 uppercase">CONNECTED PLCS:</div>
                    <div className="flex gap-2">
                      <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-1 rounded">PLC-01: OK</span>
                      <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-1 rounded">PLC-02: OK</span>
                      <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 px-2 py-1 rounded">PLC-04: OK</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11 â€” ENGINEERING CAPABILITY MATRIX */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10 bg-zinc-950/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Engineering Capability Matrix
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Comparing our solutions division competencies across development stages.
              </p>
            </div>

            {/* Matrix Table */}
            <div className="max-w-4xl mx-auto border border-zinc-800 rounded-xl overflow-hidden shadow-xl bg-zinc-950/60 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase tracking-widest text-[10px]">
                      <th className="p-5 font-bold">CAPABILITY SPECIFICATION</th>
                      <th className="p-5 font-bold">ARC LABS CORE</th>
                      <th className="p-5 font-bold text-center">INTEGRATION RATE</th>
                      <th className="p-5 font-bold text-right">PROTOCOL COMPLIANCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                    {[
                      { name: "Embedded Firmware (RTOS / Bare Metal)", value: "FreeRTOS, ESP-IDF, STM32 HAL, deterministic loops", rate: "100%", spec: "Safety compliance checked" },
                      { name: "Multi-MCU PCB Layout & Prototyping", value: "Custom schematic design, multi-layer traces, RF tuning", rate: "92%", spec: "Industrial enclosures" },
                      { name: "Protocol Conversion Middleware", value: "Modbus RTU/TCP bridging, OPC-UA mapping, raw hex parsing", rate: "98%", spec: "Industry standard mapping" },
                      { name: "Telemetry Database Architecture", value: "TimescaleDB, InfluxDB, raw MQTT queue serialization", rate: "95%", spec: "TLS 1.3 encryption standard" },
                      { name: "AI Anomaly Model Optimization", value: "TensorFlow Lite micro compilation, CNN layers on Jetson", rate: "88%", spec: "Edge inferencing" },
                      { name: "SCADA & Operational Dashboards", value: "High-speed WebSockets rendering, canvas maps, historical graphs", rate: "100%", spec: "Mobile-responsive panels" },
                      { name: "API & Cloud Backhaul Pipelines", type: "cloud", value: "AWS IoT Core, secure WebHooks, REST integration layer", rate: "96%", spec: "X.509 client cert validation" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30 transition-colors duration-200">
                        <td className="p-5 font-bold text-white font-sans">{row.name}</td>
                        <td className="p-5 text-zinc-400 font-sans">{row.value}</td>
                        <td className="p-5 text-center text-cyan-400 font-bold">{row.rate}</td>
                        <td className="p-5 text-right text-zinc-500">{row.spec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 12 â€” FAQ Accordion */}
        <section className="py-24 px-6 lg:px-16 border-b border-zinc-900 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 gsap-reveal">
              <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">Q&amp;A</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-syne mt-2 mb-4">
                Frequently Answered Parameters
              </h2>
              <p className="text-zinc-400 font-sans text-sm font-light">
                Review core technical specifications regarding our Industrial IoT and automation operations.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is Industrial IoT (IIoT)?",
                  a: "Industrial IoT refers to the extension and use of the Internet of Things (IoT) in industrial sectors and applications. It focuses heavily on machine-to-machine (M2M) communication, big data analytics, and machine learning, enabling factories and infrastructure sites to gain high operational efficiency and stability."
                },
                {
                  q: "How does AI improve industrial systems?",
                  a: "Artificial Intelligence processes massive streams of high-frequency sensor readings (such as structural vibration or power usage) directly at the edge or on site servers. AI models identify warning signals, track operational drift, and predict equipment failures weeks before they happen, replacing reactive repairs with planned maintenance cycles."
                },
                {
                  q: "What communication protocols do your systems support?",
                  a: "Our hardware gateways natively map Modbus TCP, Modbus RTU, RS485 interfaces, OPC-UA servers, and cellular backhauls (4G LTE/GSM). For wireless telemetry arrays, we implement LoRaWAN RF links, BLE tags, and self-healing ESP-NOW mesh topologies."
                },
                {
                  q: "Can older legacy machinery become smart systems?",
                  a: "Yes. We specialize in retrofitting legacy CNC lathes, injection molding presses, and old pumping setups. By placing external split-core current transducers, vibration probes, and temperature sensors on the machines, and bridging raw digital signals to Modbus relays, we integrate legacy equipment directly into modern dashboards."
                },
                {
                  q: "Do you provide customizable cloud dashboards?",
                  a: "Yes. We design and build dedicated, React-based dashboard systems tailored for factory displays. Dashboards can run locally inside your plant network (air-gapped) or sync securely with cloud infrastructures (AWS IoT Core) with permission controls and email/SMS alerts."
                },
                {
                  q: "Can you design custom IoT sensor hardware?",
                  a: "Yes, we handle custom PCB design, schematic layouts, component sourcing, and enclosure drafting. We configure specific sensor boards that match unique size limits or environmental standards (IP67 enclosures)."
                },
                {
                  q: "Which industries benefit the most from IIoT integration?",
                  a: "Manufacturing plants (OEE improvement), cold chain logistics companies (spoiled goods prevention), smart agriculture zones (water saving), water processing grids (level telemetry), and energy-intensive manufacturing setups (utility cost cutting)."
                },
                {
                  q: "Do you support Edge AI deployment?",
                  a: "Yes. We deploy localized neural networks using TensorFlow Lite on ESP32-S3 boards and run real-time computer vision models (PPE monitoring) using NVIDIA Jetson edge systems installed directly on factory floors."
                }
              ].map((faq, i) => (
                <div key={i} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/40">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-5 flex justify-between items-center transition-colors duration-200 hover:bg-zinc-900/20"
                  >
                    <span className="text-sm font-bold text-white font-syne">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-350 ${faqOpen[i] ? "transform rotate-180 text-cyan-400" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {faqOpen[i] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/60 font-sans font-light">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 13 â€” FINAL CTA */}
        <section className="py-32 px-6 lg:px-16 border-t border-zinc-900 relative z-10 bg-zinc-950/40" id="contact">
          {/* Neon mesh visual background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(6,182,212,0.06),rgba(0,0,0,0))]" />
          
          <div className="max-w-4xl mx-auto text-center relative z-20 gsap-reveal">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest block mb-4">Partner with ARC LABS</span>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white font-syne mb-6 leading-tight">
              Ready to Build the Future <br />
              of Smart Industry?
            </h2>
            
            <p className="text-zinc-400 text-base max-w-xl mx-auto mb-12 font-sans font-light leading-relaxed">
              Contact our solutions engineering division to schedule a detailed site audit, map telemetry requirements, and discuss custom automation systems.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <a href="mailto:sales@arclabs.in" className="px-7 py-3.5 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-950/40 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Request Proposal
              </a>
              <a href="tel:+917815809412" className="px-7 py-3.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-300 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" /> +91 78158 09412
              </a>
            </div>

            {/* Address Footer details */}
            <div className="border-t border-zinc-900 pt-10 text-[10px] font-mono text-zinc-500 uppercase tracking-wider space-y-2">
              <p>ARC LABS SYSTEMS DIVISION &middot; HYDERABAD, TELANGANA &middot; GST &amp; MSME REGISTERED</p>
              <p className="text-zinc-600">4-7-138/1, Narendra Nagar, Habsiguda, Hyderabad &ndash; 500007</p>
            </div>
          </div>
        </section>

        {/* LIVE PROJECT DASHBOARD MODAL â€” triggered by clicking any
            of the 10 Core Engineering Capability project cards */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              key="live-dashboard-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <LiveProjectDashboard
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
