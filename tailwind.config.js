/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industry: {
          dark: "#09090b",       // Dark matte background
          card: "#141419",       // Premium glassmorphic card bg
          border: "#27272a",     // Subtle layout borders
          accent: "#06b6d4",     // Cyber/Industrial cyan highlight
          emerald: "#10b981",    // AI / normal operation emerald
          amber: "#f59e0b",      // Anomaly warnings / active alerts amber
          rose: "#ef4444",       // Critical system failure rose
          text: "#f4f4f5",       // Enterprise high-contrast white
          muted: "#71717a",      // Muted technical specifications text
        }
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["Inter", "sans-serif"],
        syne: ["Syne", "sans-serif"]
      },
      boxShadow: {
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.15)",
        "glow-emerald": "0 0 25px rgba(16, 185, 129, 0.15)",
        "glow-amber": "0 0 25px rgba(245, 158, 11, 0.15)",
        "glow-rose": "0 0 25px rgba(239, 68, 68, 0.15)",
        "glass": "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
      }
    },
  },
  plugins: [],
}
