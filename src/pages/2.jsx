import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Cpu, Database, Gauge, LineChart, ShieldAlert, Network, Settings, Wrench, Zap, Eye, Activity,
  HardDrive, Cloud, Layers, Signal, CheckCircle2, ArrowRight, PhoneCall, Mail, Globe, Lock,
  ChevronDown, Factory
} from "lucide-react";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

// ── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ points, stroke = "#06b6d4", animate = true, w = 160, h = 40 }) {
  const width = w, height = h, padding = 2;
  const max = Math.max(...points), min = Math.min(...points), range = max - min || 1;
  const mappedPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((p - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      {animate ? (
        <motion.polyline fill="none" stroke={stroke} strokeWidth="2" points={mappedPoints}
          strokeDasharray={width * 2} initial={{ strokeDashoffset: width * 2 }}
          animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} />
      ) : (
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={mappedPoints} />
      )}
      <circle
        cx={(points.length - 1) * (width / (points.length - 1))}
        cy={height - ((points[points.length - 1] - min) / range) * height}
        r="3" fill={stroke} className="animate-ping" />
    </svg>
  );
}

// ── SECTOR STYLE REGISTRY ────────────────────────────────────────────────────
const SECTOR_STYLE = {
  "Real-Time Machine Monitoring":   { accent:"#06b6d4", dim:"rgba(6,182,212,0.07)",   border:"rgba(6,182,212,0.28)",   hdr:"rgba(6,182,212,0.12)"  },
  "Predictive Maintenance Systems": { accent:"#f59e0b", dim:"rgba(245,158,11,0.07)",   border:"rgba(245,158,11,0.28)",   hdr:"rgba(245,158,11,0.12)" },
  "Smart Energy Monitoring":        { accent:"#84cc16", dim:"rgba(132,204,22,0.07)",   border:"rgba(132,204,22,0.28)",   hdr:"rgba(132,204,22,0.12)" },
  "Industrial Telemetry Systems":   { accent:"#a855f7", dim:"rgba(168,85,247,0.07)",   border:"rgba(168,85,247,0.28)",   hdr:"rgba(168,85,247,0.12)" },
  "AI-Based Surveillance":          { accent:"#f43f5e", dim:"rgba(244,63,94,0.07)",    border:"rgba(244,63,94,0.28)",    hdr:"rgba(244,63,94,0.12)"  },
  "Edge AI Infrastructure":         { accent:"#3b82f6", dim:"rgba(59,130,246,0.07)",   border:"rgba(59,130,246,0.28)",   hdr:"rgba(59,130,246,0.12)" },
  "Remote Asset Monitoring":        { accent:"#fb923c", dim:"rgba(251,146,60,0.07)",   border:"rgba(251,146,60,0.28)",   hdr:"rgba(251,146,60,0.12)" },
  "Smart Sensor Networks":          { accent:"#2dd4bf", dim:"rgba(45,212,191,0.07)",   border:"rgba(45,212,191,0.28)",   hdr:"rgba(45,212,191,0.12)" },
  "Industrial Dashboard Systems":   { accent:"#818cf8", dim:"rgba(129,140,248,0.07)",  border:"rgba(129,140,248,0.28)",  hdr:"rgba(129,140,248,0.12)"},
  "Cloud + Edge IoT Integration":   { accent:"#38bdf8", dim:"rgba(56,189,248,0.07)",   border:"rgba(56,189,248,0.28)",   hdr:"rgba(56,189,248,0.12)" },
};
const DEFAULT_SS = { accent:"#06b6d4", dim:"rgba(6,182,212,0.07)", border:"rgba(6,182,212,0.28)", hdr:"rgba(6,182,212,0.12)" };

// ── CSS STYLES ───────────────────────────────────────────────────────────────
const factoryFeatureStyles = `
.factory-feature-card {
  position: relative; overflow: hidden; display: flex; min-height: 190px;
  flex-direction: column; justify-content: space-between;
  border: 1px solid #27272A; border-radius: 0.5rem; background: #18181B;
  padding: 1.1rem; box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  transition: background-color 300ms cubic-bezier(0.25,1,0.5,1), border-color 300ms cubic-bezier(0.25,1,0.5,1), box-shadow 300ms cubic-bezier(0.25,1,0.5,1);
}
.factory-feature-card::before {
  content: ""; position: absolute; top: 0; left: 0; z-index: 1; width: 0%; height: 2px;
  background: #00DC82; transition: width 300ms cubic-bezier(0.25,1,0.5,1);
}
.factory-feature-card::after {
  content: ""; position: absolute; inset: 0; z-index: 0; opacity: 0; pointer-events: none;
  background: linear-gradient(115deg,transparent 0 42%,rgba(0,220,130,0.085) 48%,transparent 56%), radial-gradient(circle at 18% 12%,rgba(250,250,250,0.04),transparent 34%);
  background-size: 220% 100%,100% 100%; background-position: 120% 0,0 0;
  transition: opacity 300ms cubic-bezier(0.25,1,0.5,1), background-position 300ms cubic-bezier(0.25,1,0.5,1);
}
.factory-feature-card:hover { background:#27272A; border-color:#27272A; box-shadow:inset 0 0 0 1px rgba(255,255,255,0.025),0 18px 38px rgba(0,0,0,0.22); }
.factory-feature-card:hover::before { width:100%; }
.factory-feature-card:hover::after { opacity:1; background-position:-20% 0,0 0; }
.factory-feature-icon { width:1.75rem;height:1.75rem;margin-bottom:1rem;color:#71717A;transform-origin:center;position:relative;z-index:2;transition:color 300ms cubic-bezier(0.25,1,0.5,1),transform 300ms cubic-bezier(0.25,1,0.5,1); }
.factory-feature-card:hover .factory-feature-icon { color:#00DC82; }
.factory-feature-card:hover .factory-feature-icon[data-motion="gear"] { transform:rotate(90deg); }
.factory-feature-card:hover .factory-feature-icon[data-motion="microchip"],.factory-feature-card:hover .factory-feature-icon[data-motion="signal"] { transform:scale(1.1); }
.factory-feature-card:hover .factory-feature-icon[data-motion="network"] { transform:translateY(-4px); }
.factory-feature-card:hover .factory-feature-icon[data-motion="chart"] { transform:scaleX(1.1); }
.factory-feature-card:hover .factory-feature-icon[data-motion="pulse"] { transform:translateX(4px); }
.factory-feature-card:hover .factory-feature-icon[data-motion="gauge"] { transform:rotate(15deg); }
.factory-feature-card:hover .factory-feature-icon[data-motion="stack"] { transform:scaleY(1.1); }
.factory-feature-card:hover .factory-feature-icon[data-motion="wrench"] { transform:rotate(-25deg); }
.factory-feature-title,.factory-feature-copy { position:relative;z-index:2;transform:none;transition:none; }
.factory-feature-title { color:#FAFAFA; }
.factory-feature-copy { color:#A1A1AA; }
@media(min-width:1024px){.factory-feature-card{min-height:178px;padding:1rem;}.factory-feature-icon{width:1.6rem;height:1.6rem;margin-bottom:0.9rem;}}
.industry-sector-card {
  position:relative;overflow:hidden;min-height:178px;border:1px solid #27272A;border-radius:0.5rem;
  background:#18181B;padding:1rem;box-shadow:0 1px 2px rgba(0,0,0,0.18);
  transition:background-color 300ms cubic-bezier(0.25,1,0.5,1),border-color 300ms cubic-bezier(0.25,1,0.5,1),box-shadow 300ms cubic-bezier(0.25,1,0.5,1);
}
.industry-sector-card::before { content:"";position:absolute;top:0;left:0;z-index:1;width:0%;height:2px;background:#00DC82;transition:width 300ms cubic-bezier(0.25,1,0.5,1); }
.industry-sector-card::after { content:"";position:absolute;inset:0;z-index:0;opacity:0;pointer-events:none;background:linear-gradient(115deg,transparent 0 42%,rgba(0,220,130,0.075) 48%,transparent 56%),radial-gradient(circle at 85% 12%,rgba(0,220,130,0.08),transparent 30%);background-size:220% 100%,100% 100%;background-position:120% 0,0 0;transition:opacity 300ms cubic-bezier(0.25,1,0.5,1),background-position 300ms cubic-bezier(0.25,1,0.5,1); }
.industry-sector-card:hover { background:#27272A;border-color:#27272A;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.025),0 18px 38px rgba(0,0,0,0.22); }
.industry-sector-card:hover::before { width:100%; }
.industry-sector-card:hover::after { opacity:1;background-position:-20% 0,0 0; }
.industry-sector-icon { position:relative;z-index:2;width:1.6rem;height:1.6rem;margin-bottom:0.9rem;color:#71717A;transform-origin:center;transition:color 300ms cubic-bezier(0.25,1,0.5,1),transform 300ms cubic-bezier(0.25,1,0.5,1); }
.industry-sector-card:hover .industry-sector-icon { color:#00DC82; }
.industry-sector-card:hover .industry-sector-icon[data-motion="gear"] { transform:rotate(90deg); }
.industry-sector-card:hover .industry-sector-icon[data-motion="microchip"],.industry-sector-card:hover .industry-sector-icon[data-motion="signal"] { transform:scale(1.1); }
.industry-sector-card:hover .industry-sector-icon[data-motion="network"] { transform:translateY(-4px); }
.industry-sector-card:hover .industry-sector-icon[data-motion="chart"] { transform:scaleX(1.1); }
.industry-sector-card:hover .industry-sector-icon[data-motion="pulse"] { transform:translateX(4px); }
.industry-sector-card:hover .industry-sector-icon[data-motion="gauge"] { transform:rotate(15deg); }
.industry-sector-card:hover .industry-sector-icon[data-motion="stack"] { transform:scaleY(1.1); }
.industry-sector-card:hover .industry-sector-icon[data-motion="wrench"] { transform:rotate(-25deg); }
.industry-sector-title,.industry-sector-copy,.industry-sector-meta { position:relative;z-index:2;transform:none;transition:none; }
.industry-sector-title { color:#FAFAFA; }
.industry-sector-copy { color:#A1A1AA; }
.industry-sector-meta { display:inline-flex;align-items:center;gap:0.45rem;margin-top:1rem;color:#D4D4D8;font-size:0.62rem;line-height:1;letter-spacing:0.12em;text-transform:uppercase; }
.industry-sector-meta::before { content:"";width:0.38rem;height:0.38rem;border-radius:999px;background:#00DC82;box-shadow:0 0 14px rgba(0,220,130,0.35); }
`;

// ── DATA ─────────────────────────────────────────────────────────────────────
const FACTORY_FEATURES = [
  { title:"End-to-End Deployment", desc:"From physical sensor installations and PLC mapping to dashboard terminals.", icon:Settings, motionType:"gear" },
  { title:"Embedded Firmware Expertise", desc:"Deterministic microcontrollers, real-time operating systems (RTOS), and safety fail-safes.", icon:Cpu, motionType:"microchip" },
  { title:"AI + IoT Integration", desc:"Running predictive diagnostic algorithms directly on secure cloud logic clusters.", icon:Network, motionType:"network" },
  { title:"Industrial Dashboards", desc:"Clean SCADA-inspired control room panels built with React for performance and responsiveness.", icon:LineChart, motionType:"chart" },
  { title:"Edge AI Architectures", desc:"Running deep learning and computer vision on NVIDIA Jetson modules at the site.", icon:Activity, motionType:"pulse" },
  { title:"Telemetry Pipelines", desc:"Highly stable MQTT broker queues capable of handling thousands of sensor packets.", icon:Gauge, motionType:"gauge" },
  { title:"Hardware Integration", desc:"Direct hardware-software loop validation preventing physical interface errors.", icon:Database, motionType:"stack" },
  { title:"Real-Time Monitoring", desc:"High-resolution telemetry graphs with sub-second transmission delay.", icon:Signal, motionType:"signal" },
  { title:"Industrial Automation", desc:"Modbus/TCP, Profinet, and OPC-UA bridge setups connecting old manufacturing bays.", icon:Wrench, motionType:"wrench" },
  { title:"Custom PCB Development", desc:"Designing dedicated multi-sensor boards tailored for specific industrial enclosures.", icon:HardDrive, motionType:"microchip" },
];

const INDUSTRY_SECTORS = [
  { id:"manufacturing", name:"Manufacturing", desc:"Machine uptime monitoring, vibration diagnostics, and PLC integration.", icon:Factory, motionType:"gear", meta:"Plant telemetry" },
  { id:"agriculture", name:"Smart Agriculture", desc:"Automated micro-irrigation, soil moisture matrices, and weather telemetry.", icon:Globe, motionType:"network", meta:"Field intelligence" },
  { id:"warehousing", name:"Warehousing", desc:"RFID inventory pipelines, environmental logs, and autonomous routing.", icon:Database, motionType:"stack", meta:"Asset flow" },
  { id:"cold_storage", name:"Cold Storage", desc:"Multi-tier temperature monitoring, sensor logs, and anomaly cooling triggers.", icon:ShieldAlert, motionType:"pulse", meta:"Cold-chain SLA" },
  { id:"smart_cities", name:"Smart Cities", desc:"Acoustic noise matrices, ambient air telemetry, and lighting grid controls.", icon:Network, motionType:"network", meta:"Urban grid" },
  { id:"water", name:"Water Management", desc:"Flow telemetry, water level analytics, and valve actuator loops.", icon:Activity, motionType:"pulse", meta:"Utility control" },
  { id:"logistics", name:"Logistics", desc:"Real-time transport telematics, refrigeration logs, and route optimization.", icon:Signal, motionType:"signal", meta:"Fleet visibility" },
  { id:"pharma", name:"Pharma", desc:"SLA-compliant batch environment logging and clean room air flow matrices.", icon:Lock, motionType:"gauge", meta:"Compliance layer" },
  { id:"automation", name:"Industrial Automation", desc:"Modbus conversions, SCADA linking, and pneumatic valve automation.", icon:Settings, motionType:"gear", meta:"Controls bridge" },
  { id:"energy", name:"Energy Monitoring", desc:"Direct grid sub-metering, harmonic current tracking, and load analysis.", icon:Zap, motionType:"wrench", meta:"Power insight" },
];

function FactoryFeatureCard({ title, desc, icon: Icon, motionType }) {
  return (
    <article className="factory-feature-card">
      <div>
        <Icon className="factory-feature-icon" data-motion={motionType} aria-hidden="true" />
        <h3 className="factory-feature-title text-sm font-bold mb-2 leading-snug">{title}</h3>
        <p className="factory-feature-copy text-xs leading-relaxed font-sans">{desc}</p>
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

// ── SECTOR CARD MINI VISUALIZATION ───────────────────────────────────────────
// Each solution card gets a unique data visualization in its bottom section
function SectorCardViz({ title, accent: a, isActive }) {

  // 1. MACHINE MONITORING — shift production bar chart
  if (title === "Real-Time Machine Monitoring") {
    const bars = [71,84,91,78,95,88,76,93,97];
    return (
      <div className="w-full">
        <div className="flex items-end gap-[3px] h-10 mb-1.5">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all duration-700"
              style={{ height:`${h}%`, background: i === bars.length-1 ? a : `${a}50` }} />
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] font-mono" style={{ color:a }}>SHIFT CYCLE OUTPUT · 9HR</span>
          <span className="text-[8px] font-mono text-zinc-500">OEE 94.2%</span>
        </div>
      </div>
    );
  }

  // 2. PREDICTIVE MAINTENANCE — FFT waveform with threshold line
  if (title === "Predictive Maintenance Systems") {
    const wave = [1.1,1.2,1.0,1.3,1.1,1.4,1.2,1.5,3.8,4.5,2.1,1.4,1.2,1.3,1.1,1.2];
    const W=200, H=40, maxV=5;
    const pts = wave.map((v,i)=>`${(i/(wave.length-1))*W},${H-(v/maxV)*H}`).join(' ');
    const thY = H-(3.5/maxV)*H;
    return (
      <div className="w-full">
        <svg width="100%" height="40" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
          <line x1="0" y1={thY} x2={W} y2={thY} stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.7"/>
          <text x={W-2} y={thY-3} fill="#ef4444" fontSize="7" textAnchor="end" fontFamily="monospace">3.5 LIMIT</text>
          <polyline fill="none" stroke={a} strokeWidth="1.5" points={pts}/>
          <circle cx={(8/(wave.length-1))*W} cy={H-(4.5/maxV)*H} r="2.5" fill={a}/>
        </svg>
        <div className="flex justify-between mt-0.5">
          <span className="text-[8px] font-mono" style={{ color:a }}>VIBRATION SPECTRUM</span>
          <span className="text-[8px] font-mono text-red-400">SPIKE 4.5 mm/s</span>
        </div>
      </div>
    );
  }

  // 3. SMART ENERGY — 3-phase balance bars + power factor ring
  if (title === "Smart Energy Monitoring") {
    const phases = [{n:"L1",v:82},{n:"L2",v:79},{n:"L3",v:85}];
    const pf = 0.94, r = 10, circ = 2*Math.PI*r;
    return (
      <div className="w-full flex items-end gap-3">
        <div className="flex items-end gap-1.5 h-10 flex-1">
          {phases.map(p => (
            <div key={p.n} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-sm" style={{ height:`${p.v}%`, background:a, opacity:0.75 }}/>
              <span className="text-[7px] font-mono" style={{ color:a }}>{p.n}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r={r} fill="none" stroke={`${a}25`} strokeWidth="2.5"/>
            <circle cx="14" cy="14" r={r} fill="none" stroke={a} strokeWidth="2.5"
              strokeDasharray={`${pf*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 14 14)"/>
          </svg>
          <span className="text-[7px] font-mono" style={{ color:a }}>PF</span>
        </div>
        <div className="text-right pb-1">
          <div className="text-[8px] font-mono" style={{ color:a }}>3-PHASE</div>
          <div className="text-[7px] font-mono text-zinc-600">BALANCE</div>
        </div>
      </div>
    );
  }

  // 4. INDUSTRIAL TELEMETRY — LoRa signal rings + RSSI bars
  if (title === "Industrial Telemetry Systems") {
    return (
      <div className="w-full flex items-center gap-3">
        <svg width="44" height="36" viewBox="0 0 44 36" className="flex-shrink-0">
          {[3,2,1].map((_,i) => {
            const rad = 8+(i*9);
            return <path key={i} d={`M ${22-rad},30 A ${rad} ${rad} 0 0 1 ${22+rad},30`}
              fill="none" stroke={a} strokeWidth="1.5" opacity={0.2+(2-i)*0.3}/>;
          })}
          <circle cx="22" cy="30" r="2.5" fill={a}/>
        </svg>
        <div className="flex-1 space-y-1">
          {[{l:"NODE-01",v:92},{l:"NODE-02",v:78},{l:"NODE-03",v:64}].map(n => (
            <div key={n.l} className="flex items-center gap-1.5">
              <div className="h-1.5 rounded-full flex-1 bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${n.v}%`, background:a }}/>
              </div>
              <span className="text-[7px] font-mono text-zinc-500 w-6 text-right">{n.v}%</span>
            </div>
          ))}
        </div>
        <span className="text-[8px] font-mono pb-1" style={{ color:a }}>RSSI</span>
      </div>
    );
  }

  // 5. AI SURVEILLANCE — camera grid with detection overlay
  if (title === "AI-Based Surveillance") {
    return (
      <div className="w-full">
        <div className="grid grid-cols-4 gap-1 h-10 mb-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-sm relative flex items-center justify-center overflow-hidden">
              <div className="w-2 h-2 rounded-full" style={{ background: i===1 ? a : '#22c55e', opacity:0.8 }}/>
              {i === 1 && <div className="absolute inset-1 border rounded-sm" style={{ borderColor:a, opacity:0.65 }}/>}
              {i === 1 && <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full animate-ping" style={{ background:a }}/>}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] font-mono" style={{ color:a }}>4-ZONE LIVE FEEDS</span>
          <span className="text-[8px] font-mono" style={{ color:a }}>1 DETECTION ACTIVE</span>
        </div>
      </div>
    );
  }

  // 6. EDGE AI — inference pipeline stages
  if (title === "Edge AI Infrastructure") {
    const stages = ["SENS","PRE","INFER","ACT"];
    return (
      <div className="w-full">
        <div className="flex items-center gap-0.5 h-10 mb-1.5">
          {stages.map((s,i) => (
            <React.Fragment key={s}>
              <div className="flex-1 flex flex-col items-center justify-center rounded py-1"
                style={{ background:`${a}18`, border:`1px solid ${a}35` }}>
                <span className="text-[7px] font-mono" style={{ color:a }}>{s}</span>
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background:a, opacity:0.5 }}/>
              </div>
              {i < stages.length-1 && (
                <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" style={{ color:a, opacity:0.4 }}/>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] font-mono" style={{ color:a }}>INFERENCE PIPELINE</span>
          <span className="text-[8px] font-mono text-zinc-500">3.2ms LAT</span>
        </div>
      </div>
    );
  }

  // 7. REMOTE ASSET — GPS breadcrumb trail
  if (title === "Remote Asset Monitoring") {
    const wpts = [[10,28],[36,20],[62,24],[88,14],[114,18],[140,12],[166,16],[190,10]];
    return (
      <div className="w-full">
        <svg width="100%" height="36" viewBox="0 0 200 36" preserveAspectRatio="none">
          <polyline points={wpts.map(p=>p.join(',')).join(' ')} fill="none"
            stroke={`${a}45`} strokeWidth="1" strokeDasharray="4 2"/>
          {wpts.map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r={i===wpts.length-1 ? 4 : 2.2}
              fill={i===wpts.length-1 ? a : `${a}70`}/>
          ))}
          <circle cx="190" cy="10" r="7" fill="none" stroke={a} strokeWidth="0.7" opacity="0.35"/>
        </svg>
        <div className="flex justify-between mt-0.5">
          <span className="text-[8px] font-mono" style={{ color:a }}>GPS BREADCRUMB TRAIL</span>
          <span className="text-[8px] font-mono text-zinc-500">8 WAYPOINTS</span>
        </div>
      </div>
    );
  }

  // 8. SENSOR NETWORKS — mesh topology SVG
  if (title === "Smart Sensor Networks") {
    const nodes = [
      {x:10,y:12,on:true},{x:42,y:8,on:true},{x:74,y:16,on:false},{x:106,y:10,on:true},{x:138,y:14,on:true},
      {x:26,y:28,on:true},{x:58,y:24,on:true},{x:90,y:30,on:true},{x:122,y:26,on:false},{x:150,y:22,on:true}
    ];
    const edges = [[0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[6,7],[7,8],[4,9],[5,6],[8,9],[3,7]];
    return (
      <div className="w-full">
        <svg width="100%" height="38" viewBox="0 0 160 38" preserveAspectRatio="xMidYMid meet">
          {edges.map(([i,j],k) => (
            <line key={k} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y}
              stroke={`${a}28`} strokeWidth="0.8"/>
          ))}
          {nodes.map((n,i) => (
            <circle key={i} cx={n.x} cy={n.y} r="3"
              fill={n.on ? a : `${a}35`} stroke={n.on ? `${a}80` : `${a}20`} strokeWidth="0.8"/>
          ))}
        </svg>
        <div className="flex justify-between mt-0.5">
          <span className="text-[8px] font-mono" style={{ color:a }}>MESH NODE TOPOLOGY</span>
          <span className="text-[8px] font-mono text-zinc-500">8/10 ONLINE</span>
        </div>
      </div>
    );
  }

  // 9. DASHBOARD SYSTEMS — WebSocket throughput bar chart
  if (title === "Industrial Dashboard Systems") {
    const msgs = [240,280,260,310,300,355,340,375,320,365,400];
    const maxM = 400;
    return (
      <div className="w-full">
        <div className="flex items-end gap-[2px] h-10 mb-1.5">
          {msgs.map((v,i) => (
            <div key={i} className="flex-1 rounded-t-sm"
              style={{ height:`${(v/maxM)*100}%`, background: i===msgs.length-1 ? a : `${a}50` }}/>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[8px] font-mono" style={{ color:a }}>WS MESSAGES / SEC</span>
          <span className="text-[8px] font-mono text-zinc-500">PEAK 400/s</span>
        </div>
      </div>
    );
  }

  // 10. CLOUD IoT — data pipeline sync
  if (title === "Cloud + Edge IoT Integration") {
    const cnodes = ["DEVICE","GATEWAY","BROKER","CLOUD DB"];
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2 h-8">
          {cnodes.map((n,i) => (
            <React.Fragment key={n}>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full mb-0.5" style={{ background:a }}/>
                <span className="text-[6px] font-mono" style={{ color:a }}>{n}</span>
              </div>
              {i < cnodes.length-1 && (
                <div className="flex-1 flex items-start pt-0.5 justify-center">
                  <div className="w-full h-px" style={{ background:`${a}45` }}/>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width:'76%', background:a }}/>
          </div>
          <span className="text-[8px] font-mono" style={{ color:a }}>TLS 1.3 · 76%</span>
        </div>
      </div>
    );
  }

  return <Sparkline points={[1,2,3,4,5,4,3,4,5]} stroke={a} animate={false} w={160} h={40}/>;
}

// ── LIVE PROJECT DASHBOARD ────────────────────────────────────────────────────
function LiveProjectDashboard({ project, onClose }) {
  const PROJECT_TELEMETRY = {
    "Real-Time Machine Monitoring": [
      { key:"rpm",    label:"Spindle RPM",   unit:"RPM",  min:1200, max:1800, decimals:0, accent:"#06b6d4" },
      { key:"load",   label:"Motor Load",    unit:"%",    min:40,   max:95,   decimals:1, accent:"#10b981" },
      { key:"cycles", label:"Cycle Count",   unit:"pcs",  min:4820, max:4920, decimals:0, accent:"#f59e0b" },
      { key:"uptime", label:"OEE Score",     unit:"%",    min:88,   max:99,   decimals:1, accent:"#a855f7" },
    ],
    "Predictive Maintenance Systems": [
      { key:"vib",     label:"Vibration",      unit:"mm/s", min:0.8, max:4.5, decimals:2, accent:"#f59e0b" },
      { key:"bearing", label:"Bearing Temp",   unit:"°C",   min:52,  max:78,  decimals:1, accent:"#ef4444" },
      { key:"fft",     label:"FFT Dominant",   unit:"Hz",   min:48,  max:62,  decimals:1, accent:"#10b981" },
      { key:"rul",     label:"Remaining Life", unit:"days", min:42,  max:58,  decimals:0, accent:"#a855f7" },
    ],
    "Smart Energy Monitoring": [
      { key:"voltage", label:"Line Voltage",  unit:"V",  min:408,  max:422,  decimals:1, accent:"#84cc16" },
      { key:"current", label:"Line Current",  unit:"A",  min:145,  max:195,  decimals:1, accent:"#f59e0b" },
      { key:"pf",      label:"Power Factor",  unit:"",   min:0.88, max:0.99, decimals:2, accent:"#10b981" },
      { key:"kwh",     label:"Energy Today",  unit:"kWh",min:1240, max:1380, decimals:0, accent:"#a855f7" },
    ],
    "Industrial Telemetry Systems": [
      { key:"rssi", label:"LoRa RSSI",    unit:"dBm", min:-110, max:-70, decimals:0, accent:"#a855f7" },
      { key:"snr",  label:"Signal SNR",   unit:"dB",  min:6,    max:14,  decimals:1, accent:"#10b981" },
      { key:"batt", label:"Node Battery", unit:"V",   min:3.4,  max:4.1, decimals:2, accent:"#f59e0b" },
      { key:"pkts", label:"Packets/min",  unit:"pkt", min:12,   max:36,  decimals:0, accent:"#c084fc" },
    ],
    "AI-Based Surveillance": [
      { key:"fps",    label:"Inference FPS",   unit:"fps", min:24, max:42, decimals:0, accent:"#f43f5e" },
      { key:"ppl",    label:"PPE Compliance",  unit:"%",   min:88, max:99, decimals:1, accent:"#10b981" },
      { key:"alerts", label:"Active Alerts",   unit:"",    min:0,  max:4,  decimals:0, accent:"#ef4444" },
      { key:"gpu",    label:"Jetson GPU Load", unit:"%",   min:55, max:88, decimals:0, accent:"#a855f7" },
    ],
    "Edge AI Infrastructure": [
      { key:"lat", label:"Infer Latency", unit:"ms", min:1.8, max:6.4, decimals:2, accent:"#3b82f6" },
      { key:"cpu", label:"Edge CPU",      unit:"%",  min:22,  max:68,  decimals:0, accent:"#10b981" },
      { key:"ram", label:"RAM Used",      unit:"MB", min:120, max:260, decimals:0, accent:"#f59e0b" },
      { key:"acc", label:"Model Accuracy",unit:"%",  min:94,  max:99,  decimals:2, accent:"#a855f7" },
    ],
    "Remote Asset Monitoring": [
      { key:"speed", label:"Asset Speed",  unit:"km/h", min:0,  max:78, decimals:1, accent:"#fb923c" },
      { key:"temp",  label:"Cargo Temp",   unit:"°C",   min:-4, max:8,  decimals:1, accent:"#10b981" },
      { key:"fuel",  label:"Fuel Level",   unit:"%",    min:22, max:92, decimals:0, accent:"#f59e0b" },
      { key:"tilt",  label:"Tilt Vector",  unit:"°",    min:0,  max:12, decimals:1, accent:"#a855f7" },
    ],
    "Smart Sensor Networks": [
      { key:"nodes", label:"Active Nodes",   unit:"",     min:38,  max:42,  decimals:0, accent:"#2dd4bf" },
      { key:"hops",  label:"Avg Mesh Hops",  unit:"",     min:1,   max:4,   decimals:1, accent:"#10b981" },
      { key:"drop",  label:"Drop Rate",      unit:"%",    min:0,   max:1.2, decimals:2, accent:"#ef4444" },
      { key:"thr",   label:"Mesh Throughput",unit:"kbps", min:280, max:420, decimals:0, accent:"#a855f7" },
    ],
    "Industrial Dashboard Systems": [
      { key:"ws",   label:"WS Clients",   unit:"",    min:80,  max:140, decimals:0, accent:"#818cf8" },
      { key:"msgs", label:"Msgs/sec",     unit:"",    min:240, max:380, decimals:0, accent:"#10b981" },
      { key:"tsdb", label:"TSDB Write",   unit:"ms",  min:3,   max:14,  decimals:1, accent:"#f59e0b" },
      { key:"view", label:"Active Views", unit:"",    min:12,  max:28,  decimals:0, accent:"#a855f7" },
    ],
    "Cloud + Edge IoT Integration": [
      { key:"rtt",    label:"Cloud RTT",     unit:"ms",    min:32,  max:92,  decimals:0, accent:"#38bdf8" },
      { key:"tls",    label:"TLS Sessions",  unit:"",      min:18,  max:44,  decimals:0, accent:"#10b981" },
      { key:"ingest", label:"Ingestion Rate",unit:"msg/s", min:420, max:680, decimals:0, accent:"#f59e0b" },
      { key:"fail",   label:"Fail Rate",     unit:"%",     min:0,   max:0.4, decimals:3, accent:"#ef4444" },
    ],
  };

  const channels = (project && PROJECT_TELEMETRY[project.title]) || [
    { key:"v1",label:"Channel A",unit:"u",min:0,max:100,decimals:1,accent:"#06b6d4" },
    { key:"v2",label:"Channel B",unit:"u",min:0,max:100,decimals:1,accent:"#10b981" },
    { key:"v3",label:"Channel C",unit:"u",min:0,max:100,decimals:1,accent:"#f59e0b" },
    { key:"v4",label:"Channel D",unit:"u",min:0,max:100,decimals:1,accent:"#a855f7" },
  ];

  const rand = (min, max, d) => Number((Math.random()*(max-min)+min).toFixed(d));
  const initial = () => { const o={}; channels.forEach(c=>{o[c.key]=rand(c.min,c.max,c.decimals);}); return o; };

  const [values, setValues] = useState(initial);
  const [history, setHistory] = useState(() => Array.from({length:30},()=>rand(channels[0].min,channels[0].max,channels[0].decimals)));
  const [logs, setLogs] = useState([]);
  const [tick, setTick] = useState(0);

  const ss = SECTOR_STYLE[project?.title] || DEFAULT_SS;

  useEffect(() => {
    setValues(initial());
    setHistory(Array.from({length:30},()=>rand(channels[0].min,channels[0].max,channels[0].decimals)));
    setLogs([
      { t:new Date().toLocaleTimeString(), msg:`Stream initialised for ${project?.title||"project"}` },
      { t:new Date().toLocaleTimeString(), msg:`Gateway IIOT-GW-${Math.floor(100+Math.random()*900)} acquired lock` },
    ]);
    setTick(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.title]);

  useEffect(() => {
    if (!project) return;
    const lib = ["Edge inference cycle completed","Modbus poll OK","MQTT topic /telemetry pushed","Heartbeat received","Schema validated","Anomaly score below threshold","Cloud sync delta queued"];
    const id = setInterval(() => {
      const next = {}; channels.forEach(c=>{next[c.key]=rand(c.min,c.max,c.decimals);}); setValues(next);
      setHistory(prev=>{const a=[...prev,next[channels[0].key]]; return a.slice(-30);});
      setTick(t=>t+1);
      if (Math.random()<0.18) setLogs(prev=>[{t:new Date().toLocaleTimeString(),msg:lib[Math.floor(Math.random()*lib.length)]},...prev].slice(0,8));
    }, 1000);
    return ()=>clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.title]);

  if (!project) return null;

  // Shared log panel used in several dashboard layouts
  const LogPanel = () => (
    <div className="bg-black/50 border border-zinc-900 rounded-lg p-3 font-mono">
      <div className="text-[8px] text-zinc-600 uppercase tracking-widest mb-2">SYSTEM LOG</div>
      {(logs.length ? logs : [{t:"-",msg:"Waiting..."}]).slice(0,5).map((l,i) => (
        <div key={i} className="flex gap-2 py-0.5 text-[9px] border-b border-zinc-900/50 last:border-0">
          <span style={{ color:`${ss.accent}80` }}>[{l.t}]</span>
          <span className="text-zinc-400">{l.msg}</span>
        </div>
      ))}
    </div>
  );

  // Shared KPI card
  const KPI = ({label,val,unit,accent,mini=true}) => (
    <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-lg">
      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="text-xl font-mono font-bold" style={{ color:accent }}>{val} <span className="text-[10px] text-zinc-500 font-normal">{unit}</span></div>
      {mini && <div className="mt-2 h-0.5 bg-zinc-800 rounded-full"/>}
    </div>
  );

  // ── PER-SECTOR DASHBOARD LAYOUTS ─────────────────────────────────────────
  const renderContent = () => {
    switch(project.title) {

      // ── 1. MACHINE MONITORING ──────────────────────────────────────────────
      case "Real-Time Machine Monitoring": {
        const prodBars = [68,82,91,78,95,88,76,93,Number(values[channels[2]?.key]%100||90)];
        return (
          <div className="p-5 space-y-4">
            {/* Status banner */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ background:ss.dim, border:`1px solid ${ss.border}` }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded" style={{ background:`${ss.accent}20` }}><Settings className="w-4 h-4" style={{ color:ss.accent }}/></div>
                <div>
                  <div className="text-xs font-bold font-mono" style={{ color:ss.accent }}>MACHINE STATE: RUNNING · AUTO CYCLE</div>
                  <div className="text-[10px] font-mono text-zinc-500">CNC-MILL-04 · MACHINING CENTER · PLC-02 LINKED</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold" style={{ color:ss.accent }}>{values[channels[0]?.key]}</div>
                <div className="text-[9px] font-mono text-zinc-500">{channels[0]?.unit}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left */}
              <div className="col-span-8 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {channels.slice(1,4).map(c => <KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
                </div>
                {/* Hourly production bars */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">SHIFT PRODUCTION TIMELINE</span>
                    <span className="text-[9px] font-mono text-zinc-600">CYCLES/HR</span>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    {prodBars.map((v,i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-sm transition-all duration-700"
                          style={{ height:`${v}%`, background: i===prodBars.length-1?ss.accent:`${ss.accent}45` }}/>
                        <span className="text-[6px] font-mono text-zinc-600">{9+i}h</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Live trend */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Live Telemetry · {channels[0]?.label}</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'76px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={500} h={60}/>
                  </div>
                </div>
              </div>
              {/* Right */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase">Drive Unit Schematic</div>
                  <svg viewBox="0 0 120 90" className="w-full">
                    <rect x="5" y="12" width="110" height="68" rx="3" fill="#0c0c10" stroke="#27272a" strokeWidth="1.5"/>
                    <circle cx="38" cy="46" r="18" fill="#09090b" stroke={`${ss.accent}45`} strokeWidth="1.5"/>
                    <circle cx="38" cy="46" r="11" fill="#09090b" stroke={ss.accent} strokeWidth="1.5"/>
                    <circle cx="38" cy="46" r="4" fill={`${ss.accent}55`} stroke={ss.accent} strokeWidth="1"/>
                    {[0,1,2,3,4,5].map(i=>{const a=(i/6)*Math.PI*2; return <line key={i} x1={38+13*Math.cos(a)} y1={46+13*Math.sin(a)} x2={38+18*Math.cos(a)} y2={46+18*Math.sin(a)} stroke={ss.accent} strokeWidth="1.5" opacity="0.55"/>;  })}
                    <rect x="66" y="28" width="40" height="24" rx="2" fill="#09090b" stroke={`${ss.accent}40`} strokeWidth="1"/>
                    {[0,1,2,3].map(i=><rect key={i} x={70+i*9} y={32} width="5" height={7+i*4} rx="1" fill={ss.accent} opacity={0.2+i*0.2}/>)}
                    <text x="84" y="10" fill={`${ss.accent}90`} fontSize="5" fontFamily="monospace" textAnchor="middle">AXIS ENCODER</text>
                    <text x="38" y="76" fill={`${ss.accent}65`} fontSize="4.5" fontFamily="monospace" textAnchor="middle">SPINDLE MOTOR</text>
                  </svg>
                </div>
                <div className="space-y-1">
                  {[["SPINDLE","RUNNING"],["COOLANT","ACTIVE"],["AXIS X/Y","HOMED"],["PROGRAM","IN CYCLE"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between px-3 py-1.5 bg-zinc-900/40 border border-zinc-800 rounded text-[9px] font-mono">
                      <span className="text-zinc-500">{k}</span><span style={{ color:ss.accent }}>{v}</span>
                    </div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 2. PREDICTIVE MAINTENANCE ──────────────────────────────────────────
      case "Predictive Maintenance Systems": {
        const fftBars = [2,5,3,8,12,18,32,45,28,52,38,22,15,10,7,4,3,2,1,2];
        const maxFFT = 52;
        const health = [{name:"BEARING-A",pct:68,col:"#f59e0b"},{name:"SHAFT-B",pct:84,col:"#10b981"},{name:"COUPLING",pct:52,col:"#ef4444"}];
        return (
          <div className="p-5 space-y-4">
            {/* 4 KPI tiles */}
            <div className="grid grid-cols-4 gap-3">
              {channels.map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left: FFT + trend */}
              <div className="col-span-8 space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">FFT FREQUENCY SPECTRUM</span>
                    <span className="text-[9px] font-mono text-zinc-600">FREQUENCY DOMAIN</span>
                  </div>
                  <div className="flex items-end gap-[3px] h-24">
                    {fftBars.map((v,i)=>(
                      <div key={i} className="flex-1 rounded-t-sm transition-all duration-1000"
                        style={{ height:`${(v/maxFFT)*100}%`, background: v>40?`#ef4444`:v>25?ss.accent:`${ss.accent}55` }}/>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5 text-[8px] font-mono text-zinc-600">
                    <span>0 Hz</span><span>25 Hz</span><span>50 Hz</span><span>75 Hz</span><span>100 Hz</span>
                  </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Vibration History · {channels[0]?.label}</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'68px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={500} h={52}/>
                  </div>
                </div>
              </div>
              {/* Right: health rings + schedule */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-4 uppercase">Component Health</div>
                  <div className="space-y-4">
                    {health.map(h=>{
                      const r=16, circ=2*Math.PI*r;
                      return (
                        <div key={h.name} className="flex items-center gap-3">
                          <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0">
                            <circle cx="20" cy="20" r={r} fill="none" stroke={`${h.col}25`} strokeWidth="3"/>
                            <circle cx="20" cy="20" r={r} fill="none" stroke={h.col} strokeWidth="3"
                              strokeDasharray={`${(h.pct/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 20 20)"/>
                            <text x="20" y="24" fill={h.col} fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{h.pct}%</text>
                          </svg>
                          <div>
                            <div className="text-[9px] font-mono text-zinc-300">{h.name}</div>
                            <div className="text-[8px] font-mono" style={{ color:h.col }}>{h.pct>70?"HEALTHY":h.pct>50?"MONITOR":"REPLACE"}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Maintenance Schedule</div>
                  <div className="space-y-1.5 text-[9px] font-mono">
                    <div className="flex justify-between"><span className="text-zinc-500">Next Lubrication</span><span style={{ color:ss.accent }}>+12 days</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Bearing Inspect</span><span className="text-amber-400">+3 days</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Coupling Replace</span><span className="text-red-400">URGENT</span></div>
                  </div>
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 3. SMART ENERGY ────────────────────────────────────────────────────
      case "Smart Energy Monitoring": {
        const phases = [
          { n:"L1",v:values[channels[0]?.key]??414, c:values[channels[1]?.key]??162 },
          { n:"L2",v:411, c:158 },
          { n:"L3",v:416, c:165 },
        ];
        const pfVal = values[channels[2]?.key] ?? 0.94;
        const pfR=22, pfCirc=2*Math.PI*pfR;
        const loadBars=[42,65,78,55,88,72,95,81,76,68];
        return (
          <div className="p-5 space-y-4">
            {/* 3-phase meters */}
            <div className="grid grid-cols-3 gap-4">
              {phases.map(p=>(
                <div key={p.n} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-1">PHASE {p.n}</div>
                  <div className="text-2xl font-mono font-bold mb-0.5" style={{ color:ss.accent }}>{p.v}<span className="text-sm text-zinc-500 font-normal ml-1">V</span></div>
                  <div className="text-base font-mono font-semibold text-zinc-400">{p.c}<span className="text-xs text-zinc-600 ml-1">A</span></div>
                  <div className="mt-2 h-1 bg-zinc-800 rounded overflow-hidden">
                    <div className="h-full transition-all duration-700 rounded" style={{ width:`${((p.v-405)/20)*100}%`, background:ss.accent }}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 space-y-4">
                {/* Energy trend */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Energy Consumption Trend · kWh</span>
                    <span className="text-[9px] font-mono" style={{ color:ss.accent }}>{values[channels[3]?.key]} kWh today</span>
                  </div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'70px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={500} h={54}/>
                  </div>
                </div>
                {/* Load distribution */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase">Load Distribution · Active Circuits</div>
                  <div className="flex items-end gap-1 h-16">
                    {loadBars.map((v,i)=>(
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-sm" style={{ height:`${v}%`, background:v>85?`#f59e0b`:v>70?ss.accent:`${ss.accent}50` }}/>
                        <span className="text-[6px] font-mono text-zinc-600">C{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right: PF gauge + stats */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg flex flex-col items-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase w-full">Power Factor</div>
                  <svg width="100" height="60" viewBox="0 0 100 60">
                    <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={`${ss.accent}20`} strokeWidth="8" strokeLinecap="round"/>
                    <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={ss.accent} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${pfVal*125.6} 125.6`}/>
                    <text x="50" y="52" fill={ss.accent} fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{pfVal}</text>
                  </svg>
                  <div className="text-[9px] font-mono text-zinc-500 mt-1">TARGET ≥ 0.95</div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg space-y-2">
                  {[["Harmonic THD","3.2%"],["Reactive kVAR","28.4"],["Demand kW","182.6"],["Est. Monthly","₹48,200"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between text-[9px] font-mono">
                      <span className="text-zinc-500">{k}</span><span style={{ color:ss.accent }}>{v}</span>
                    </div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 4. INDUSTRIAL TELEMETRY ────────────────────────────────────────────
      case "Industrial Telemetry Systems": {
        const nodeList = [
          {id:"NODE-01",rssi:-72,batt:98,status:"OK"},{id:"NODE-02",rssi:-84,batt:81,status:"OK"},
          {id:"NODE-03",rssi:-91,batt:62,status:"WEAK"},{id:"NODE-04",rssi:-68,batt:94,status:"OK"},
          {id:"NODE-05",rssi:-77,batt:75,status:"OK"},
        ];
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {channels.map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left: LoRa coverage + trend */}
              <div className="col-span-8 space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase">LoRa Coverage Topology</div>
                  <div className="flex items-center justify-center" style={{ height:'130px' }}>
                    <svg width="420" height="120" viewBox="0 0 420 120">
                      {/* Gateway center */}
                      {[40,70,100].map((r,i)=>(
                        <ellipse key={i} cx="200" cy="60" rx={r*2} ry={r} fill="none" stroke={ss.accent} strokeWidth="0.8" opacity={0.15+(i*0.12)} strokeDasharray="4 3"/>
                      ))}
                      {/* Node positions */}
                      {nodeList.map((n,i)=>{
                        const ang=(i/nodeList.length)*Math.PI*2;
                        const dist=60+(i%2)*30;
                        const x=200+dist*2*Math.cos(ang), y=60+dist*Math.sin(ang);
                        return (
                          <g key={n.id}>
                            <line x1="200" y1="60" x2={x} y2={y} stroke={`${ss.accent}30`} strokeWidth="0.8" strokeDasharray="3 2"/>
                            <circle cx={x} cy={y} r="6" fill="#18181b" stroke={n.status==="OK"?ss.accent:"#f59e0b"} strokeWidth="1.5"/>
                            <text x={x} y={y+3} fill={ss.accent} fontSize="4.5" fontFamily="monospace" textAnchor="middle">{i+1}</text>
                          </g>
                        );
                      })}
                      {/* Gateway */}
                      <circle cx="200" cy="60" r="10" fill="#18181b" stroke={ss.accent} strokeWidth="2"/>
                      <text x="200" y="63" fill={ss.accent} fontSize="6" fontFamily="monospace" textAnchor="middle">GW</text>
                    </svg>
                  </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">RSSI Trend · Gateway Channel</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'68px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={500} h={52}/>
                  </div>
                </div>
              </div>
              {/* Right: node list */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase">Node Signal Status</div>
                  <div className="space-y-2">
                    {nodeList.map(n=>(
                      <div key={n.id} className="p-2 bg-zinc-950/50 border border-zinc-900 rounded">
                        <div className="flex justify-between mb-1 text-[8px] font-mono">
                          <span style={{ color:ss.accent }}>{n.id}</span>
                          <span className={n.status==="OK"?"text-emerald-400":"text-amber-400"}>{n.status}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-1 bg-zinc-800 rounded overflow-hidden">
                            <div className="h-full rounded" style={{ width:`${Math.max(0,(n.rssi+110)/40*100)}%`, background:ss.accent }}/>
                          </div>
                          <span className="text-[7px] font-mono text-zinc-500">{n.rssi}dBm</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <div className="flex-1 h-0.5 bg-zinc-800 rounded overflow-hidden">
                            <div className="h-full rounded" style={{ width:`${n.batt}%`, background:"#f59e0b" }}/>
                          </div>
                          <span className="text-[7px] font-mono text-zinc-600">{n.batt}% batt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 5. AI SURVEILLANCE ─────────────────────────────────────────────────
      case "AI-Based Surveillance": {
        const cams = [
          {id:"CAM-01",zone:"ENTRANCE GATE",status:"CLEAR",fps:38},{id:"CAM-02",zone:"FLOOR ZONE A",status:"PPE ALERT",fps:36},
          {id:"CAM-03",zone:"LOADING BAY",status:"CLEAR",fps:41},{id:"CAM-04",zone:"CRANE AREA",status:"CLEAR",fps:39},
        ];
        const ppeVal = values[channels[1]?.key]??96.2;
        const ppeR=28, ppeCirc=2*Math.PI*ppeR;
        const detections = [{t:"21:14:03",cam:"CAM-02",type:"NO HELMET",conf:"96.2%"},{t:"21:11:44",cam:"CAM-02",type:"NO VEST",conf:"91.8%"}];
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Left: camera grid */}
              <div className="col-span-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {cams.map(cam=>(
                    <div key={cam.id} className="bg-zinc-950/80 border border-zinc-800 rounded-lg overflow-hidden" style={{ minHeight:'120px' }}>
                      <div className="relative" style={{ height:'88px', background:'#080808' }}>
                        {/* Simulated camera frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full" style={{ background:`repeating-linear-gradient(0deg,transparent,transparent 18px,${ss.accent}08 18px,${ss.accent}08 19px),repeating-linear-gradient(90deg,transparent,transparent 22px,${ss.accent}08 22px,${ss.accent}08 23px)` }}/>
                        </div>
                        {cam.status==="PPE ALERT" && (
                          <div className="absolute" style={{ top:'18px',left:'28px',width:'44px',height:'52px',border:`1.5px solid ${ss.accent}`,borderRadius:'2px' }}>
                            <div className="absolute -top-2 left-0 px-1 text-[6px] font-mono" style={{ color:ss.accent, background:'#080808' }}>PERSON</div>
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cam.status==="CLEAR"?"#22c55e":ss.accent }}/>
                          <span className="text-[7px] font-mono text-zinc-400">{cam.id}</span>
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 text-[7px] font-mono text-zinc-500">{cam.fps} FPS</div>
                      </div>
                      <div className="px-2.5 py-1.5 flex justify-between items-center">
                        <span className="text-[8px] font-mono text-zinc-500">{cam.zone}</span>
                        <span className="text-[7px] font-mono px-1.5 py-0.5 rounded" style={{ background: cam.status==="CLEAR"?"rgba(34,197,94,0.15)":"rgba(244,63,94,0.15)", color: cam.status==="CLEAR"?"#22c55e":ss.accent }}>
                          {cam.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {channels.slice(0,2).map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
                </div>
              </div>
              {/* Right: PPE ring + detections */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg flex flex-col items-center">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase w-full">PPE Compliance Rate</div>
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r={ppeR} fill="none" stroke={`${ss.accent}20`} strokeWidth="6"/>
                    <circle cx="45" cy="45" r={ppeR} fill="none" stroke={ss.accent} strokeWidth="6"
                      strokeDasharray={`${(ppeVal/100)*ppeCirc} ${ppeCirc}`} strokeLinecap="round" transform="rotate(-90 45 45)"/>
                    <text x="45" y="42" fill={ss.accent} fontSize="14" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{ppeVal}%</text>
                    <text x="45" y="56" fill="#71717a" fontSize="7" fontFamily="monospace" textAnchor="middle">COMPLIANT</text>
                  </svg>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Recent Detections</div>
                  {detections.map((d,i)=>(
                    <div key={i} className="py-1.5 border-b border-zinc-900 last:border-0">
                      <div className="flex justify-between text-[8px] font-mono mb-0.5">
                        <span style={{ color:ss.accent }}>{d.cam}</span><span className="text-zinc-600">{d.t}</span>
                      </div>
                      <div className="flex justify-between text-[8px] font-mono">
                        <span className="text-zinc-400">{d.type}</span><span className="text-zinc-500">{d.conf}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {channels.slice(2,4).map(c=>(
                    <div key={c.key} className="bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-lg">
                      <div className="text-[8px] font-mono text-zinc-500 mb-0.5">{c.label}</div>
                      <div className="text-base font-mono font-bold" style={{ color:c.accent }}>{values[c.key]}<span className="text-[9px] text-zinc-500"> {c.unit}</span></div>
                    </div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 6. EDGE AI INFRASTRUCTURE ──────────────────────────────────────────
      case "Edge AI Infrastructure": {
        const pipeline = [
          {name:"SENSOR INPUT",desc:"ADC / I2C",lat:0.4},{name:"PREPROCESS",desc:"Normalize",lat:0.8},
          {name:"INFERENCE",desc:"TFLite",lat:values[channels[0]?.key]??3.2},{name:"POSTPROCESS",desc:"Threshold",lat:0.6},{name:"ACTUATE",desc:"GPIO/MQTT",lat:0.4}
        ];
        const resources = [{name:"CPU",val:values[channels[1]?.key]??45,max:100,col:"#3b82f6"},{name:"RAM",val:values[channels[2]?.key]??192,max:512,col:"#f59e0b"},{name:"GPU",val:68,max:100,col:"#a855f7"}];
        return (
          <div className="p-5 space-y-4">
            {/* Pipeline diagram */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
              <div className="text-[9px] font-mono text-zinc-500 mb-4 uppercase">Inference Pipeline · Stage Latency</div>
              <div className="flex items-stretch gap-1">
                {pipeline.map((s,i)=>(
                  <React.Fragment key={s.name}>
                    <div className="flex-1 flex flex-col items-center p-2.5 rounded-lg" style={{ background:`${ss.accent}12`, border:`1px solid ${ss.accent}30` }}>
                      <div className="text-[8px] font-mono font-bold text-center mb-1" style={{ color:ss.accent }}>{s.name}</div>
                      <div className="text-[7px] font-mono text-zinc-500 text-center mb-1">{s.desc}</div>
                      <div className="text-[8px] font-mono text-zinc-300">{s.lat}ms</div>
                    </div>
                    {i < pipeline.length-1 && (
                      <div className="flex items-center"><ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color:`${ss.accent}50` }}/></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left: accuracy + trend */}
              <div className="col-span-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {channels.map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Inference Latency Trend · ms</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'68px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={480} h={52}/>
                  </div>
                </div>
              </div>
              {/* Right: resource bars */}
              <div className="col-span-4 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-4 uppercase">Edge Resource Load</div>
                  <div className="space-y-4">
                    {resources.map(r=>(
                      <div key={r.name}>
                        <div className="flex justify-between mb-1.5 text-[9px] font-mono">
                          <span className="text-zinc-400">{r.name}</span>
                          <span style={{ color:r.col }}>{Math.round((r.val/r.max)*100)}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width:`${(r.val/r.max)*100}%`, background:r.col }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg space-y-1.5 text-[9px] font-mono">
                  {[["Model","YOLOv8n-edge"],["Framework","TFLite 2.14"],["Precision","INT8 Quant"],["Classes","12 active"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between"><span className="text-zinc-500">{k}</span><span style={{ color:ss.accent }}>{v}</span></div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 7. REMOTE ASSET MONITORING ─────────────────────────────────────────
      case "Remote Asset Monitoring": {
        const waypoints = [[30,70],[80,55],[140,62],[190,40],[250,48],[310,32],[370,38],[420,22]];
        const gauges = [
          {name:"SPEED",val:values[channels[0]?.key]??54,max:120,unit:"km/h",col:"#fb923c"},
          {name:"CARGO TEMP",val:values[channels[1]?.key]??4.2,max:25,unit:"°C",col:"#10b981"},
          {name:"FUEL LEVEL",val:values[channels[2]?.key]??68,max:100,unit:"%",col:"#f59e0b"},
        ];
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Left: GPS track + KPIs */}
              <div className="col-span-7 space-y-4">
                {/* GPS track */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">Live Asset Track · GPS Coordinates</span>
                    <span className="text-[9px] font-mono" style={{ color:ss.accent }}>ASSET-04 · ACTIVE</span>
                  </div>
                  <div className="relative" style={{ height:'120px', background:'#080808', borderRadius:'6px' }}>
                    {/* Grid overlay */}
                    <svg width="100%" height="120" viewBox="0 0 460 120" preserveAspectRatio="none" style={{ position:'absolute',inset:0 }}>
                      {[0,1,2,3,4,5,6,7].map(i=><line key={i} x1={i*60} y1="0" x2={i*60} y2="120" stroke={`${ss.accent}08`} strokeWidth="1"/>)}
                      {[0,1,2,3].map(i=><line key={i} x1="0" y1={i*40} x2="460" y2={i*40} stroke={`${ss.accent}08`} strokeWidth="1"/>)}
                      {/* Track path */}
                      <polyline points={waypoints.map(p=>p.join(',')).join(' ')} fill="none" stroke={`${ss.accent}50`} strokeWidth="1.5" strokeDasharray="5 3"/>
                      {/* Waypoint dots */}
                      {waypoints.map(([x,y],i)=>(
                        <circle key={i} cx={x} cy={y} r={i===waypoints.length-1?6:3}
                          fill={i===waypoints.length-1?ss.accent:`${ss.accent}60`}/>
                      ))}
                      {/* Pulse on latest */}
                      <circle cx={waypoints[waypoints.length-1][0]} cy={waypoints[waypoints.length-1][1]} r="12" fill="none" stroke={ss.accent} strokeWidth="1" opacity="0.35"/>
                    </svg>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/70 border border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background:ss.accent }}/>
                      <span className="text-[8px] font-mono" style={{ color:ss.accent }}>17.382°N, 78.486°E</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {channels.slice(2,4).map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Speed / Temp Trend</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'60px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={380} h={44}/>
                  </div>
                </div>
              </div>
              {/* Right: arc gauges */}
              <div className="col-span-5 space-y-3">
                {gauges.map(g=>{
                  const R=26, C=2*Math.PI*R, pct=Math.max(0,Math.min(1,(g.val)/(g.max)));
                  return (
                    <div key={g.name} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                      <div className="text-[9px] font-mono text-zinc-500 mb-3">{g.name}</div>
                      <div className="flex items-center gap-4">
                        <svg width="70" height="40" viewBox="0 0 70 42">
                          <path d="M 8 38 A 27 27 0 0 1 62 38" fill="none" stroke={`${g.col}20`} strokeWidth="6" strokeLinecap="round"/>
                          <path d="M 8 38 A 27 27 0 0 1 62 38" fill="none" stroke={g.col} strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${pct*84.8} 84.8`}/>
                          <text x="35" y="34" fill={g.col} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">{g.val}</text>
                        </svg>
                        <div>
                          <div className="text-xl font-mono font-bold" style={{ color:g.col }}>{g.val}<span className="text-xs text-zinc-500 ml-1">{g.unit}</span></div>
                          <div className="text-[8px] font-mono text-zinc-600 mt-0.5">MAX {g.max} {g.unit}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg space-y-1.5 text-[9px] font-mono">
                  {[["Vehicle","TMP-REEFER-04"],["Route","HYD→MUM"],["ETA","4h 22m"],["Geofence","IN ZONE"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between"><span className="text-zinc-500">{k}</span><span style={{ color:ss.accent }}>{v}</span></div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 8. SMART SENSOR NETWORKS ───────────────────────────────────────────
      case "Smart Sensor Networks": {
        const meshNodes = [
          {x:60,y:50,on:true,id:"01"},{x:130,y:30,on:true,id:"02"},{x:200,y:55,on:false,id:"03"},
          {x:270,y:35,on:true,id:"04"},{x:340,y:50,on:true,id:"05"},{x:95,y:90,on:true,id:"06"},
          {x:165,y:80,on:true,id:"07"},{x:235,y:90,on:true,id:"08"},{x:305,y:85,on:false,id:"09"},
          {x:375,y:75,on:true,id:"10"}
        ];
        const meshEdges = [[0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[6,7],[7,8],[4,9],[5,6],[8,9],[3,7],[1,7]];
        const nodeHealth = Array.from({length:40},(_,i)=>({ on: Math.random()>0.15 }));
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {channels.map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
            </div>
            <div className="grid grid-cols-12 gap-4">
              {/* Left: mesh topology */}
              <div className="col-span-7 space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">10-Node Self-Healing Mesh</span>
                    <span className="text-[9px] font-mono" style={{ color:ss.accent }}>8/10 ONLINE</span>
                  </div>
                  <svg width="100%" height="130" viewBox="0 0 420 130" preserveAspectRatio="xMidYMid meet">
                    {meshEdges.map(([i,j],k)=>(
                      <line key={k} x1={meshNodes[i].x} y1={meshNodes[i].y} x2={meshNodes[j].x} y2={meshNodes[j].y}
                        stroke={`${ss.accent}28`} strokeWidth="1.2"/>
                    ))}
                    {meshNodes.map(n=>(
                      <g key={n.id}>
                        <circle cx={n.x} cy={n.y} r="11" fill="#18181b" stroke={n.on?ss.accent:`${ss.accent}30`} strokeWidth={n.on?1.5:0.8}/>
                        {n.on && <circle cx={n.x} cy={n.y} r="16" fill="none" stroke={ss.accent} strokeWidth="0.5" opacity="0.2"/>}
                        <text x={n.x} y={n.y+4} fill={n.on?ss.accent:`${ss.accent}50`} fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">N{n.id}</text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-2 uppercase">Mesh Throughput Trend · kbps</div>
                  <div className="bg-black/30 rounded p-2 flex items-center" style={{ height:'60px' }}>
                    <Sparkline points={history} stroke={ss.accent} animate={false} w={380} h={44}/>
                  </div>
                </div>
              </div>
              {/* Right: node health matrix + stats */}
              <div className="col-span-5 space-y-3">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-lg">
                  <div className="text-[9px] font-mono text-zinc-500 mb-3 uppercase">Node Health Matrix (40 nodes)</div>
                  <div className="grid gap-1" style={{ gridTemplateColumns:'repeat(8,1fr)' }}>
                    {nodeHealth.map((n,i)=>(
                      <div key={i} className="w-full aspect-square rounded-sm" style={{ background: n.on?ss.accent:`${ss.accent}25` }}/>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3 text-[8px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background:ss.accent }}/><span className="text-zinc-400">Online</span></span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background:`${ss.accent}25` }}/><span className="text-zinc-400">Offline</span></span>
                  </div>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg space-y-1.5 text-[9px] font-mono">
                  {[["Protocol","ESP-NOW Mesh"],["Hop Avg",`${values[channels[1]?.key]??1.8}`],["Drop Rate",`${values[channels[2]?.key]??0.12}%`],["RF Channel","CH-6 (2.437GHz)"]].map(([k,v])=>(
                    <div key={k} className="flex justify-between"><span className="text-zinc-500">{k}</span><span style={{ color:ss.accent }}>{v}</span></div>
                  ))}
                </div>
                <LogPanel/>
              </div>
            </div>
          </div>
        );
      }

      // ── 9. INDUSTRIAL DASHBOARD SYSTEMS ───────────────────────────────────
      case "Industrial Dashboard Systems": {
        const msgHistory = history;
        const latencyPercentiles = [
          {p:"p50",val:4,max:20,col:"#818cf8"},{p:"p95",val:11,max:20,col:"#f59e0b"},{p:"p99",val:18,max:20,col:"#ef4444"}
        ];
        const activeViews = [
          {name:"Plant Overview","users":8},{name:"Energy Matrix","users":3},{name:"Alarm Console","users":5},{name:"Asset Tracker","users":2},{name:"Predictive MX","users":4}
        ];
        return (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {channels.map(c=><KPI key={c.key} label={c.label} val={values[c.key]} unit={c.unit} accent={c.accent}/>)}
            </div>
            