// ═══════════════════════════════════════════════════════
//  ARC LABS — Product Data
//  src/data/products.js
// ═══════════════════════════════════════════════════════

export const PRODUCTS = [
  {
    id: "essential",
    tier: "TIER 01 · BASIC",
    name: "ARC LABS IoT Essential Kit",
    short: "IoT Essential Kit",
    tagline:
      "Dual-controller trainer with Raspberry Pi Pico, ESP32, sensors, relays, and display modules.",
    price: 10000,
    oldPrice: 13000,
    color: "#22c55e",
    glow: "34,197,94",
    emoji: "🌱",
    image: "/images/products/essential-kit.jpg",
    badge: "ESSENTIAL",
    badgeBg: "rgba(34,197,94,0.12)",
    badgeColor: "#22c55e",
    overview:
      "The ARC LABS IoT Essential Kit is a compact hands-on trainer built around Raspberry Pi Pico and ESP32. It includes onboard sensor, display, relay, buzzer, potentiometer, terminal, and GPIO sections so students can practice embedded programming, sensor reading, Wi-Fi/Bluetooth IoT, and basic automation on one ready-to-use board.",
    controllers: [
      "Raspberry Pi Pico",
      "ESP32 Wi-Fi + Bluetooth",
    ],
    sensors: [
      "DHT11 — Temperature & Humidity",
      "HC-SR04 — Ultrasonic Sensor",
      "LDR — Light Sensor",
      "IR Obstacle Sensor",
    ],
    sensors: [
      "HC-SR04 Ultrasonic Sensor",
      "DHT Sensor Interface",
      "IR / Digital Sensor Interface",
      "Analog Sensor Input via Potentiometer",
    ],
    display: [
      "0.96″ OLED Display",
      "Status LED Indicators",
      "Active Buzzer",
    ],
    actuators: [
      "Dual Relay Modules",
      "Tactile Push Buttons",
      "Screw Terminal Outputs",
    ],
    connectivity: [
      "Pico GPIO Breakouts",
      "ESP32 GPIO Breakouts",
      "UART / I2C / SPI",
      "5V & 3.3V Power Rails",
    ],
    includes: [
      {
        icon: "🔧",
        name: "Essential Kit Board",
        desc: "Pre-assembled Pico + ESP32 trainer",
      },
      {
        icon: "💻",
        name: "Sample Codes",
        desc: "Pico, MicroPython, and ESP32 examples",
      },
      {
        icon: "📋",
        name: "User Manual",
        desc: "Pin maps, wiring notes, and lab exercises",
      },
      {
        icon: "🎧",
        name: "Technical Support",
        desc: "ARC LABS support access",
      },
    ],
    useCases: [
      {
        title: "Pico + ESP32 Training",
        desc: "Practice GPIO, ADC, I2C display control, and Wi-Fi/Bluetooth IoT with two popular controller platforms.",
      },
      {
        title: "Sensor & Automation Labs",
        desc: "Build distance sensing, buzzer alerts, relay switching, and simple monitoring experiments.",
      },
      {
        title: "Workshop Projects",
        desc: "Use the onboard modules to complete beginner-friendly embedded and IoT projects without loose wiring.",
      },
    ],
    for: [
      "School Students",
      "Diploma & Engineering Year 1",
      "Pico + ESP32 Basics",
      "Workshop Labs",
    ],
  },
  {
    id: "lite",
    tier: "TIER 02 · STARTER",
    name: "ARC LABS IoT Lite Kit",
    short: "IoT Lite Kit",
    tagline:
      "Compact, beginner-friendly IoT training board for Arduino & ESP32.",
    price: 15000,
    oldPrice: 18000,
    color: "#FF8C42",
    glow: "255,140,66",
    emoji: "🔌",
    image: "/images/products/lite-kit.jpg",
    badge: "BEGINNER",
    badgeBg: "rgba(255,140,66,0.15)",
    badgeColor: "#FF8C42",
    overview:
      "The ARC LABS IoT Lite Kit is a compact, budget-friendly training platform designed for beginners, students, and aspiring innovators entering the world of IoT and embedded systems. Dual microcontroller support (Arduino UNO + ESP32) with a curated sensor set and plug-and-play design.",
    controllers: [
      "Arduino UNO (ATmega328P)",
      "ESP32 (Dual-core Wi-Fi + Bluetooth)",
      "Dual MCU slots for flexible usage",
    ],
    sensors: [
      "DHT11 — Temperature & Humidity",
      "HC-SR04 — Ultrasonic Distance",
      "IR Obstacle Sensor — Digital proximity",
      "Touch Sensor — Capacitive input",
      "LDR — Light detection",
      "MQ Gas Sensor — Gas leakage",
      "Potentiometer — Analog ADC testing",
    ],
    display: [
      "0.96″ OLED Display (I2C)",
      "RGB LED Indicators",
      "Active Buzzer Output",
    ],
    actuators: ["Dual Relay Modules (AC/DC control)", "Tactile Push Buttons"],
    connectivity: [
      "Onboard 5V/3.3V regulated rails",
      "Screw terminals for relay",
      "UART, SPI, I2C, GPIO breakout headers",
    ],
    includes: [
      {
        icon: "🔧",
        name: "Assembled Lite Kit Board",
        desc: "Fully built, ready-to-use",
      },
      { icon: "💻", name: "Sample Codes", desc: "Arduino & ESP32 examples" },
      { icon: "📖", name: "Sensor Datasheets", desc: "All onboard sensors" },
      {
        icon: "📋",
        name: "Basic User Manual",
        desc: "Setup and getting started",
      },
      { icon: "🎧", name: "Technical Support", desc: "ARC LABS expert team" },
    ],
    useCases: [
      {
        title: "Academic IoT Lab",
        desc: "Perfect for school and college IoT labs — students can start without any prior electronics experience.",
      },
      {
        title: "Embedded Systems Basics",
        desc: "Learn GPIO, sensors, actuators, and communication protocols from scratch.",
      },
      {
        title: "DIY & Hobby Projects",
        desc: "Build smart home prototypes, weather stations, and automation controllers.",
      },
      {
        title: "Early Prototyping",
        desc: "Rapid proof-of-concept for IoT product ideas — from idea to working demo in hours.",
      },
    ],
    for: [
      "School Students (Class 9–12)",
      "Engineering Year 1",
      "Beginners & Hobbyists",
      "Academic Labs",
    ],
  },
  {
    id: "experience",
    tier: "TIER 03 · FLAGSHIP",
    name: "ARC LABS IoT Experience Kit",
    short: "IoT Experience Kit",
    tagline:
      "All-in-one multi-MCU trainer — the most versatile kit in the lineup.",
    price: 20000,
    oldPrice: 23000,
    color: "#00F5A0",
    glow: "0,245,160",
    emoji: "⚡",
    image: "/images/products/experience-kit.jpg",
    badge: "BEST SELLER",
    badgeBg: "rgba(0,245,160,0.12)",
    badgeColor: "#00F5A0",
    isBest: true,
    overview:
      "The ARC LABS IoT Experience Kit is a comprehensive, all-in-one embedded systems trainer designed to bridge the gap between theoretical knowledge and hands-on practice. Supporting 5 microcontrollers — Arduino, ESP32, STM32, Raspberry Pi Pico, and Raspberry Pi 4/5 — with LoRa, GSM/4G, RS485, and full sensor coverage.",
    controllers: [
      "Arduino UNO (ATmega328P) — Beginner dev",
      "ESP32 DevKit — Dual-core Wi-Fi + BT",
      "STM32 DevKit — ARM Cortex-M industrial",
      "Raspberry Pi Pico/W — RP2040 + Wi-Fi",
      "Raspberry Pi 4/5 Header — 40-pin GPIO",
    ],
    sensors: [
      "BMP180 — Barometric pressure & temp",
      "DHT11 — Temperature & Humidity",
      "Ultrasonic HC-SR04 — Distance",
      "IR Obstacle Detection",
      "INA219 — Current & Voltage monitoring",
      "Potentiometer — Analog ADC input",
    ],
    display: [
      "1.8″ TFT Color Display (SPI)",
      "RGB LED — Full color",
      "Active Buzzer",
      "4× DP Switches with onboard LEDs",
    ],
    actuators: [
      "Dual Relay Module (RELAY1 & RELAY2)",
      "Servo Motor Port",
      "Digital Output Headers",
    ],
    connectivity: [
      "LoRa Module Interface — Long range",
      "GSM/4G Module (SIMCOM) — SIM slot",
      "RS485 — Industrial serial",
      "I2C & UART Headers",
      "USB-Powered",
      "GPIO Breakout Headers",
    ],
    includes: [
      {
        icon: "🔧",
        name: "Pre-assembled Training Board",
        desc: "Ready to use — plug in and start",
      },
      {
        icon: "⚡",
        name: "Optional Power Supply",
        desc: "External 5V supply supported",
      },
      {
        icon: "💻",
        name: "Sample Codes & Manuals",
        desc: "All 5 controller platforms covered",
      },
      {
        icon: "☁️",
        name: "Cloud Platform Access",
        desc: "Arc Lab Cloud, Blynk, MQTT ready",
      },
      {
        icon: "🎧",
        name: "Expert Technical Support",
        desc: "ARC LABS certified team",
      },
    ],
    useCases: [
      {
        title: "Wireless Sensor Networks",
        desc: "Use LoRa and GSM to build long-range IoT sensor networks for agriculture, smart cities, or industry.",
      },
      {
        title: "Embedded Systems R&D",
        desc: "Experiment with 5 different MCU platforms — compare performance, power, and code on real hardware.",
      },
      {
        title: "Cloud IoT Integration",
        desc: "Connect to Arc Lab Cloud, Blynk, or custom MQTT servers and build live dashboards.",
      },
      {
        title: "Industrial Monitoring",
        desc: "Use RS485, current sensing, and relay control to simulate industrial automation scenarios.",
      },
      {
        title: "Smart Home Systems",
        desc: "Build complete smart home automation with sensors, relays, cloud alerts, and remote control.",
      },
      {
        title: "AIoT Projects",
        desc: "Combine sensor data with edge AI on Raspberry Pi — build intelligent IoT systems.",
      },
    ],
    for: [
      "Engineering Year 1–3",
      "IoT Professionals",
      "R&D Labs",
      "Academic Institutions",
      "Training Programs",
    ],
  },
  {
    id: "pro",
    tier: "TIER 04 · ADVANCED",
    name: "ARC LABS IoT Pro Kit",
    short: "IoT Pro Kit",
    tagline:
      "High-performance development board for advanced IoT, edge AI, and Raspberry Pi.",
    price: 25000,
    oldPrice: 28000,
    color: "#00BFFF",
    glow: "0,191,255",
    emoji: "🚀",
    image: "/images/products/pro-kit.jpg",
    badge: "ADVANCED",
    badgeBg: "rgba(0,191,255,0.12)",
    badgeColor: "#00BFFF",
    overview:
      "The ARC LABS IoT Pro Kit is a high-performance development and prototyping board designed for advanced learners, researchers, and developers. Dual-controller support for Raspberry Pi 4 and ESP32 with shared I/O zones — ideal for edge computing, AIoT, sensor fusion, and complex data acquisition projects.",
    controllers: [
      "Raspberry Pi 4 — 40-pin GPIO interface",
      "ESP32 DevKit — Wi-Fi + Bluetooth",
      "Shared I/O zones for hybrid Pi + ESP32 experiments",
    ],
    sensors: [
      "BMP180 — Barometric Pressure & Temp",
      "DHT11 — Temperature & Humidity",
      "HC-SR04 — Ultrasonic Distance",
      "MQ-135 — Gas & Air Quality",
      "ADXL345 — 3-Axis Accelerometer",
      "Touch Sensor — Capacitive",
      "IR Obstacle Detection",
      "LDR — Light Dependent Resistor",
      "Potentiometer — ADC testing",
    ],
    display: [
      "1.8″ SPI TFT Color Display",
      "RGB LED Output",
      "1-Digit 7-Segment Display",
      "3× Push Buttons",
      "Onboard 3.3V & 5V Power Indicators",
    ],
    actuators: ["Dual Relay Module", "Active Buzzer", "GPIO Breakout Headers"],
    connectivity: [
      "Isolated 3.3V and 5V power rails",
      "MCP3008 ADC — analog sensor inputs",
      "GPIO expansion for Pi + ESP32",
      "USB / Power connectivity",
    ],
    includes: [
      {
        icon: "🔧",
        name: "Assembled IoT Pro Kit Board",
        desc: "Fully built and tested",
      },
      {
        icon: "🎀",
        name: "Ribbon Cable for Raspberry Pi",
        desc: "40-pin GPIO ribbon included",
      },
      {
        icon: "💻",
        name: "Sample Codes & Tutorials",
        desc: "Python (Pi) + Arduino (ESP32)",
      },
      {
        icon: "📚",
        name: "Full Documentation",
        desc: "Online tutorials + schematic",
      },
      {
        icon: "🎧",
        name: "Arc Lab Technical Support",
        desc: "Priority support access",
      },
    ],
    useCases: [
      {
        title: "Edge Computing & AIoT",
        desc: "Run TensorFlow Lite models on Raspberry Pi while ESP32 handles real-time sensor acquisition.",
      },
      {
        title: "Environmental Monitoring",
        desc: "Multi-sensor data logging with gas, temperature, pressure, light, and motion — cloud-connected.",
      },
      {
        title: "Wireless Data Logging",
        desc: "ESP32 Wi-Fi + Raspberry Pi Linux stack for enterprise-grade wireless sensor deployments.",
      },
      {
        title: "Industrial Training",
        desc: "Simulate real industrial sensor systems — accelerometer, gas, relay control, and current sensing.",
      },
      {
        title: "Research Projects",
        desc: "Ideal for dissertation, publication, and advanced research in embedded systems and IoT.",
      },
      {
        title: "Product Development",
        desc: "Use as a rapid-development platform to validate IoT product concepts before PCB design.",
      },
    ],
    for: [
      "Engineering Year 3–4",
      "Postgraduate Students",
      "Researchers & R&D Teams",
      "IoT Professionals",
      "Product Developers",
    ],
  },
];
