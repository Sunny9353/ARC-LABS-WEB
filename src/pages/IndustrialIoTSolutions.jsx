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
function Sparkline({ points, stroke = "#06b6d4", animate = true, w = 160, h = 40 }) {
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

/* ─── LIVE PROJECT DASHBOARD MODAL ─────────────────────────────────────
   Opens when a user clicks any of the 10 Core Engineering Capability
   project cards. Shows a real-time dashboard with random telemetry
   values that update every second + a live-streaming chart. The
   parameters displayed and the tech badges are tailored per project. */
function LiveProjectDashboard({ project, onClose }) {
  // Per-project telemetry channel definitions — each project shows
  // realistic-looking variables for the tech stack it represents.
  const PROJECT_TELEMETRY = {
    "Real-Time Machine Monitoring": [
      { key: "rpm", label: "Spindle RPM", unit: "RPM", min: 1200, max: 1800, decimals: 0, accent: "#06b6d4" },
      { key: "load", label: "Motor Load", unit: "%", min: 40, max: 95, decimals: 1, accent: "#10b981" },
      { key: "cycles", label: "Cycle Count", unit: "pcs", min: 4820, max: 4920, decimals: 0, accent: "#f59e0b" },
      { key: "uptime", label: "OEE Score", unit: "%", min: 88, max: 99, decimals: 1, accent: "#a855f7" },
    ],
    "Predictive Maintenance Systems": [
      { key: "vib", label: "Vibration", unit: "mm/s", min: 0.8, max: 4.5, decimals: 2, accent: "#06b6d4" },
      { key: "bearing", label: "Bearing Temp", unit: "°C", min: 52, max: 78, decimals: 1, accent: "#ef4444" },
      { key: "fft", label: "FFT Dominant", unit: "Hz", min: 48, max: 62, decimals: 1, accent: "#10b981" },
      { key: "rul", label: "Remaining Life", unit: "days", min: 42, max: 58, decimals: 0, accent: "#a855f7" },
    ],
    "Smart Energy Monitoring": [
      { key: "voltage", label: "Line Voltage", unit: "V", min: 408, max: 422, decimals: 1, accent: "#06b6d4" },
      { key: "current", label: "Line Current", unit: "A", min: 145, max: 195, decimals: 1, accent: "#f59e0b" },
      { key: "pf", label: "Power Factor", unit: "", min: 0.88, max: 0.99, decimals: 2, accent: "#10b981" },
      { key: "kwh", label: "Energy Today", unit: "kWh", min: 1240, max: 1380, decimals: 0, accent: "#a855f7" },
    ],
    "Industrial Telemetry Systems": [
      { key: "rssi", label: "LoRa RSSI", unit: "dBm", min: -110, max: -70, decimals: 0, accent: "#06b6d4" },
      { key: "snr", label: "Signal SNR", unit: "dB", min: 6, max: 14, decimals: 1, accent: "#10b981" },
      { key: "batt", label: "Node Battery", unit: "V", min: 3.4, max: 4.1, decimals: 2, accent: "#f59e0b" },
      { key: "pkts", label: "Packets/min", unit: "pkt", min: 12, max: 36, decimals: 0, accent: "#a855f7" },
    ],
    "AI-Based Surveillance": [
      { key: "fps", label: "Inference FPS", unit: "fps", min: 24, max: 42, decimals: 0, accent: "#06b6d4" },
      { key: "ppl", label: "PPE Compliance", unit: "%", min: 88, max: 99, decimals: 1, accent: "#10b981" },
      { key: "alerts", label: "Active Alerts", unit: "", min: 0, max: 4, decimals: 0, accent: "#ef4444" },
      { key: "gpu", label: "Jetson GPU Load", unit: "%", min: 55, max: 88, decimals: 0, accent: "#a855f7" },
    ],
    "Edge AI Infrastructure": [
      { key: "lat", label: "Inference Latency", unit: "ms", min: 1.8, max: 6.4, decimals: 2, accent: "#06b6d4" },
      { key: "cpu", label: "Edge CPU", unit: "%", min: 22, max: 68, decimals: 0, accent: "#10b981" },
      { key: "ram", label: "RAM Used", unit: "MB", min: 120, max: 260, decimals: 0, accent: "#f59e0b" },
      { key: "acc", label: "Model Accuracy", unit: "%", min: 94, max: 99, decimals: 2, accent: "#a855f7" },
    ],
    "Remote Asset Monitoring": [
      { key: "speed", label: "Asset Speed", unit: "km/h", min: 0, max: 78, decimals: 1, accent: "#06b6d4" },
      { key: "temp", label: "Cargo Temp", unit: "°C", min: -4, max: 8, decimals: 1, accent: "#10b981" },
      { key: "fuel", label: "Fuel Level", unit: "%", min: 22, max: 92, decimals: 0, accent: "#f59e0b" },
      { key: "tilt", label: "Tilt Vector", unit: "°", min: 0, max: 12, decimals: 1, accent: "#a855f7" },
    ],
    "Smart Sensor Networks": [
      { key: "nodes", label: "Active Nodes", unit: "", min: 38, max: 42, decimals: 0, accent: "#06b6d4" },
      { key: "hops", label: "Avg Mesh Hops", unit: "", min: 1, max: 4, decimals: 1, accent: "#10b981" },
      { key: "drop", label: "Drop Rate", unit: "%", min: 0, max: 1.2, decimals: 2, accent: "#ef4444" },
      { key: "thr", label: "Mesh Throughput", unit: "kbps", min: 280, max: 420, decimals: 0, accent: "#a855f7" },
    ],
    "Industrial Dashboard Systems": [
      { key: "ws", label: "WS Clients", unit: "", min: 80, max: 140, decimals: 0, accent: "#06b6d4" },
      { key: "msgs", label: "Msgs/sec", unit: "", min: 240, max: 380, decimals: 0, accent: "#10b981" },
      { key: "tsdb", label: "TSDB Write", unit: "ms", min: 3, max: 14, decimals: 1, accent: "#f59e0b" },
      { key: "view", label: "Active Views", unit: "", min: 12, max: 28, decimals: 0, accent: "#a855f7" },
    ],
    "Cloud + Edge IoT Integration": [
      { key: "rtt", label: "Cloud RTT", unit: "ms", min: 32, max: 92, decimals: 0, accent: "#06b6d4" },
      { key: "tls", label: "TLS Sessions", unit: "", min: 18, max: 44, decimals: 0, accent: "#10b981" },
      { key: "ingest", label: "Ingestion Rate", unit: "msg/s", min: 420, max: 680, decimals: 0, accent: "#f59e0b" },
      { key: "fail", label: "Fail Rate", unit: "%", min: 0, max: 0.4, decimals: 3, accent: "#ef4444" },
    ],
  };

  const channels = (project && PROJECT_TELEMETRY[project.title]) || [
    { key: "v1", label: "Channel A", unit: "u", min: 0, max: 100, decimals: 1, accent: "#06b6d4" },
    { key: "v2", label: "Channel B", unit: "u", min: 0, max: 100, decimals: 1, accent: "#10b981" },
    { key: "v3", label: "Channel C", unit: "u", min: 0, max: 100, decimals: 1, accent: "#f59e0b" },
    { key: "v4", label: "Channel D", unit: "u", min: 0, max: 100, decimals: 1, accent: "#a855f7" },
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

  // Live telemetry tick — every 1s, regenerate values + extend chart
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#0a0a0e] border border-zinc-800 rounded-2xl shadow-2xl shadow-cyan-950/40 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-zinc-900 bg-gradient-to-r from-cyan-950/40 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-cyan-400">
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
            ✕ CLOSE
          </button>
        </div>

        {/* Tech badges */}
        <div className="px-6 py-4 border-b border-zinc-900 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-2">Tech Stack:</span>
          {(project.tech || []).map((t, i) => (
            <span key={i} className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-900/60 px-2.5 py-1 rounded">
              {t}
            </span>
          ))}
        </div>

        {/* Live KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-5">
          {channels.map((c) => (
            <div key={c.key} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{c.label}</div>
              <div className="text-2xl font-mono font-bold" style={{ color: c.accent }}>
                {values[c.key]}{" "}
                <span className="text-xs text-zinc-500 font-normal">{c.unit}</span>
              </div>
              <div className="mt-2 h-1 bg-zinc-800 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((values[c.key] - c.min) / (c.max - c.min)) * 100))}%`,
                    background: c.accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live chart */}
        <div className="px-6 pb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Live Telemetry · {channels[0].label}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">1000ms interval</span>
          </div>
          <div className="bg-zinc-900/60 h-40 rounded border border-zinc-900 flex items-center justify-center p-3">
            <Sparkline points={history} stroke={channels[0].accent} animate={false} w={760} h={130} />
          </div>
        </div>

        {/* System log */}
        <div className="px-6 pb-6">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">System Log</div>
          <div className="bg-black/60 border border-zinc-900 rounded p-3 font-mono text-[11px] text-zinc-400 max-h-44 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-zinc-600">Waiting for telemetry...</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex gap-3 py-0.5 border-b border-zinc-900/60 last:border-0">
                  <span className="text-emerald-500/80">[{l.t}]</span>
                  <span>{l.msg}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-[10px] font-mono text-zinc-600 mt-3">
            Simulated values for demonstration · production gateway pushes real OPC-UA/Modbus/MQTT data via secure TLS.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IndustrialIoTSolutions() {
  const containerRef = useRef(null);

  // States
  const [activeTab, setActiveTab] = useState("manufacturing");
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

      {/* Global Wrapper (Dark Matte theme) */}
      <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen font-sans selection:bg-cyan-500 selection:text-[#09090b] relative overflow-hidden" ref={containerRef}>
        
        {/* Subtle grid background globally */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.06),rgba(255,255,255,0))]" />
        
        {/* SECTION 1 — CINEMATIC HERO */}
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
                    <Sparkline points={telemetryHistory} stroke="#06b6d4" animate={false} />
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

        {/* SECTION 2 — WHY ARC LABS */}
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
              {[
                { title: "End-to-End Deployment", desc: "From physical sensor installations and PLC mapping to dashboard terminals.", icon: Settings },
                { title: "Embedded Firmware Expertise", desc: "Deterministic microcontrollers, real-time operating systems (RTOS), and safety fail-safes.", icon: Cpu },
                { title: "AI + IoT Integration", desc: "Running predictive diagnostic algorithms directly on secure cloud logic clusters.", icon: Network },
                { title: "Industrial Dashboards", desc: "Clean SCADA-inspired control room panels built with React for performance and responsiveness.", icon: LineChart },
                { title: "Edge AI Architectures", desc: "Running deep learning and computer vision on NVIDIA Jetson modules at the site.", icon: Activity },
                { title: "Telemetry Pipelines", desc: "Highly stable MQTT broker queues capable of handling thousands of sensor packets.", icon: Gauge },
                { title: "Hardware Integration", desc: "Direct hardware-software loop validation preventing physical interface errors.", icon: Database },
                { title: "Real-Time Monitoring", desc: "High-resolution telemetry graphs with sub-second transmission delay.", icon: Signal },
                { title: "Industrial Automation", desc: "Modbus/TCP, Profinet, and OPC-UA bridge setups connecting old manufacturing bays.", icon: Wrench },
                { title: "Custom PCB Development", desc: "Designing dedicated multi-sensor boards tailored for specific industrial enclosures.", icon: HardDrive }
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-lg hover:border-cyan-500/30 transition-all duration-300 group flex flex-col justify-between hover:bg-zinc-900/60 shadow-sm relative">
                  <div>
                    <item.icon className="w-7 h-7 text-zinc-500 group-hover:text-cyan-400 transition-colors duration-300 mb-5" />
                    <h3 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors duration-300">{item.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-sans">{item.desc}</p>
                  </div>
                  <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-cyan-500 transition-colors duration-300" />
                </div>
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

        {/* SECTION 3 — INDUSTRIES WE SERVE */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { id: "manufacturing", name: "Manufacturing", desc: "Machine uptime monitoring, vibration diagnostics, and PLC integration.", icon: Factory, p: [45, 48, 52, 49, 47, 53, 50, 48] },
                { id: "agriculture", name: "Smart Agriculture", desc: "Automated micro-irrigation, soil moisture matrices, and weather telemetry.", icon: Globe, p: [12, 14, 18, 15, 13, 19, 17, 16] },
                { id: "warehousing", name: "Warehousing", desc: "RFID inventory pipelines, environmental logs, and autonomous routing.", icon: Database, p: [80, 82, 85, 83, 81, 88, 86, 84] },
                { id: "cold_storage", name: "Cold Storage", desc: "Multi-tier temperature monitoring, sensor logs, and anomaly cooling triggers.", icon: ShieldAlert, p: [-18, -17, -19, -18, -17, -19, -18, -18] },
                { id: "smart_cities", name: "Smart Cities", desc: "Acoustic noise matrices, ambient air telemetry, and lighting grid controls.", icon: Network, p: [350, 360, 380, 370, 355, 390, 375, 370] },
                { id: "water", name: "Water Management", desc: "Flow telemetry, water level analytics, and valve actuator loops.", icon: Activity, p: [120, 125, 122, 128, 124, 132, 129, 128] },
                { id: "logistics", name: "Logistics", desc: "Real-time transport telematics, refrigeration logs, and route optimization.", icon: Signal, p: [62, 65, 68, 64, 63, 67, 66, 65] },
                { id: "pharma", name: "Pharma", desc: "SLA-compliant batch environment logging and clean room air flow matrices.", icon: Lock, p: [22, 22, 23, 22, 21, 23, 22, 22] },
                { id: "automation", name: "Industrial Automation", desc: "Modbus conversions, SCADA linking, and pneumatic valve automation.", icon: Settings, p: [8, 9, 8, 10, 9, 11, 10, 9] },
                { id: "energy", name: "Energy Monitoring", desc: "Direct grid sub-metering, harmonic current tracking, and load analysis.", icon: Zap, p: [1500, 1550, 1600, 1580, 1540, 1620, 1590, 1580] }
              ].map((ind) => (
                <div
                  key={ind.id}
                  className={`bg-zinc-900/30 border p-5 rounded-lg transition-all duration-300 cursor-pointer flex flex-col justify-between h-[230px] relative overflow-hidden ${
                    activeTab === ind.id 
                      ? "border-cyan-500/60 shadow-lg shadow-cyan-950/20 bg-zinc-900/60" 
                      : "border-zinc-800/80 hover:border-zinc-700/60 hover:bg-zinc-900/50"
                  }`}
                  onClick={() => setActiveTab(ind.id)}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <ind.icon className={`w-6 h-6 ${activeTab === ind.id ? "text-cyan-400" : "text-zinc-500"}`} />
                      {activeTab === ind.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2 font-syne">{ind.name}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-sans">{ind.desc}</p>
                  </div>

                  {/* Sparkline in the card bottom representing hover micro-telemetry */}
                  <div className="mt-4 pt-3 border-t border-zinc-900">
                    <span className="text-[8px] font-mono text-zinc-500 block mb-1">REAL-TIME VARIABLE LOG</span>
                    <Sparkline points={ind.p} stroke={activeTab === ind.id ? "#06b6d4" : "#52525b"} animate={activeTab === ind.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — INDUSTRIAL SOLUTIONS */}
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
              ].map((sol, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProject(sol)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedProject(sol); }}
                  className={`group bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 transition-all duration-300 hover:border-cyan-500/60 hover:bg-zinc-900/60 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    activeSolution === index ? "shadow-lg shadow-cyan-950/20" : ""
                  }`}
                  onMouseEnter={() => setActiveSolution(index)}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded text-cyan-400">
                        <sol.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 tracking-wider uppercase">
                        {sol.val}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 font-syne">{sol.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-6 font-light">{sol.desc}</p>
                  </div>

                  {/* Sparkline & Tags */}
                  <div className="pt-6 border-t border-zinc-900">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sol.tech.map((t, idx) => (
                        <span key={idx} className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">TELEMETRY LOOP WAVE</span>
                      <Sparkline points={sol.p} stroke="#06b6d4" animate={activeSolution === index} />
                    </div>

                    {/* Click-to-open hint */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Live Dashboard
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                        Open Telemetry <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 — AI + IoT INTELLIGENCE */}
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
                    <circle cx="40" cy="100" r="10" fill="#18181b" stroke="#10b981" strokeWidth="2" />
                    <text x="40" y="85" fill="#a1a1aa" fontSize="9" fontFamily="monospace" textAnchor="middle">SENSOR INPUT</text>

                    {/* Hidden layer nodes */}
                    <circle cx="140" cy="50" r="8" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />
                    <circle cx="140" cy="150" r="8" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />

                    {/* Second hidden layer nodes */}
                    <circle cx="260" cy="40" r="8" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />
                    <circle cx="260" cy="100" r="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
                    <circle cx="260" cy="160" r="8" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />

                    {/* Output node */}
                    <circle cx="360" cy="100" r="12" fill="#18181b" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="360" y="80" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">ANOMALY ALERT</text>
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

        {/* SECTION 6 — TECHNOLOGY STACK WALL */}
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
                <circle cx="300" cy="30" r="4" fill="#06b6d4" className="animate-ping" />
              </svg>
            </div>
          </div>
        </section>

        {/* SECTION 7 — DEPLOYMENT MODELS */}
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
                  traffic: "GATEWAY ➔ MQTT ➔ AWS CLOUD ➔ CLIENT SCREEN",
                  icon: Cloud
                },
                {
                  id: "onprem",
                  title: "On-Premise Systems",
                  desc: "Host all database structures and web server instances locally inside the factory network boundary. Keeps machinery data air-gapped.",
                  traffic: "GATEWAY ➔ LOCAL ROUTER ➔ LOCAL SERVER ➔ SCADA PANEL",
                  icon: HardDrive
                },
                {
                  id: "hybrid",
                  title: "Hybrid Edge AI",
                  desc: "Localized diagnostics engines analyze parameter thresholds instantly at the site, syncing summarized logs with external nodes periodically.",
                  traffic: "GATEWAY ➔ EDGE AI INFERENCE ➔ SUMMARIZED CLOUD SYNC",
                  icon: Layers
                },
                {
                  id: "offline",
                  title: "Offline Systems",
                  desc: "Air-gapped telemetry networks running on local RF (LoRa/mesh). Telemetry is stored directly on physical storage boards for manual checks.",
                  traffic: "GATEWAY ➔ LOCAL RF ➔ MICROSD LOGGER ➔ OPERATOR TERMINAL",
                  icon: Lock
                },
                {
                  id: "remote",
                  title: "Remote Telemetry",
                  desc: "Designed for sites lacking Wi-Fi or Ethernet. Uses GSM/4G cellular backup modules to bridge data channels to client servers.",
                  traffic: "GATEWAY ➔ GSM MODEM ➔ SECURE APN ➔ WEB APP DATABASE",
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

        {/* SECTION 8 — HOW WE WORK */}
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

        {/* SECTION 9 — INDUSTRIAL USE CASES */}
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

        {/* SECTION 10 — LIVE DASHBOARD SHOWCASE */}
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

                      <Sparkline points={telemetryHistory} stroke={dashboardStatus === "ALERT" ? "#ef4444" : dashboardStatus === "WARNING" ? "#f59e0b" : "#06b6d4"} animate={true} w={560} h={140} />
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

        {/* SECTION 11 — ENGINEERING CAPABILITY MATRIX */}
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

        {/* SECTION 12 — FAQ Accordion */}
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

        {/* SECTION 13 — FINAL CTA */}
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

        {/* LIVE PROJECT DASHBOARD MODAL — triggered by clicking any
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
