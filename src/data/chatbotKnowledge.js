import { PRODUCTS } from "./products.js";
import { SAMPLE_CERTIFICATES } from "./constants.js";

const CONTACT_ACTIONS = [
  { label: "Call sales", href: "tel:+917815809412" },
  { label: "Email ARC LABS", href: "mailto:hello@arclabs.in" },
  { label: "WhatsApp", href: "https://wa.me/917815809412" },
];

const PAGE_ACTIONS = {
  packages: [{ label: "View lab packages", to: "/lab-packages" }],
  products: [{ label: "Compare IoT kits", to: "/products" }],
  programs: [{ label: "View programs", to: "/programs" }],
  csr: [{ label: "CSR partners", to: "/csr-partners" }],
  IIoT: [{ label: "IIoT solutions", to: "/industrial-iot-solutions" }],
  verify: [{ label: "Verify certificate", to: "/verify" }],
  checkout: [{ label: "Products checkout", to: "/products" }],
};

const CONTACT_TEXT =
  "You can contact ARC LABS at +91 78158 09412, +91 40 3565 9806, hello@arclabs.in, or sales@arclabs.in. WhatsApp is available at +91 7815809412. ARC LABS is based in Hyderabad and serves schools, colleges, CSR partners, and industrial clients across India.";

const LAB_PACKAGES = {
  school: [
    {
      name: "Starter Lab",
      price: "Rs.2.5L",
      bestFor: "Classes 6-9, 50-100 students/year",
      includes:
        "10 IoT Lite kits, NEP 2020 Level 1 curriculum, 2-day teacher training, lab branding, installation, and 6-month support.",
    },
    {
      name: "Standard Lab",
      price: "Rs.5L",
      bestFor: "Classes 8-12, 100-200 students/year",
      includes:
        "15 IoT Pro kits, 10 robotics starter kits, 60-session IoT + Robotics curriculum, 3-day teacher certification, cloud access, installation, and annual support.",
    },
    {
      name: "Premier IoT & Robotics Lab",
      price: "Rs.10L+",
      bestFor: "Full-school advanced STEM and CSR/government deployments",
      includes:
        "Full IoT, Robotics, and AI stack, 25+ stations, AI modules, 90 sessions, priority installation, and 3-year support SLA.",
    },
  ],
  college: [
    {
      name: "Essential IoT Lab",
      price: "Rs.4L",
      bestFor: "Diploma and B.Tech Year 1-2 departments",
      includes:
        "20 IoT Experience kits, IoT fundamentals lab manual, 20 experiments, 2-day faculty training, experiment manuals, and 1-year technical support.",
    },
    {
      name: "Advanced IoT & Embedded Lab",
      price: "Rs.8L",
      bestFor: "ECE/EEE labs, NBA/NAAC documentation, parallel experiment tracks",
      includes:
        "IoT Pro x20 plus Experience Kit x20, IoT/Embedded/IIoT manuals, 60 experiments, cloud license, quarterly visits, and CO-PO mapping.",
    },
    {
      name: "R&D Innovation Lab",
      price: "Rs.15L+",
      bestFor: "M.Tech, Ph.D., research centers, CoE, and incubation labs",
      includes:
        "Complete hardware stack, advanced equipment, research-grade manuals, 3-year premium SLA, grant documentation support, and industry connect.",
    },
  ],
};

const PROGRAMS = [
  {
    name: "Internet of Things",
    aliases: ["iot", "internet of things", "esp32", "arduino", "mqtt", "node-red", "aws iot", "thingspeak"],
    level: "Foundational to advanced",
    tools: ["ESP32", "Arduino", "MQTT", "Node-RED", "AWS IoT", "ThingSpeak"],
    audience: "school seniors, diploma, engineering students, and professionals",
    certificates: [
      "ARC LABS IoT Fundamentals Certificate",
      "ARC LABS IoT Systems Certificate",
      "ARC LABS Certified IoT Engineer",
    ],
    summary:
      "Students build connected sensor devices, publish data to dashboards, use MQTT, register devices on cloud platforms, and complete capstone IoT products.",
  },
  {
    name: "Embedded Systems",
    aliases: ["embedded", "microcontroller", "firmware", "stm32", "rtos", "gpio", "uart", "spi", "i2c"],
    level: "Core engineering",
    tools: ["C/C++", "GPIO", "I2C", "SPI", "UART", "FreeRTOS", "STM32"],
    audience: "diploma, ECE/EEE, product development learners",
    certificates: [
      "ARC LABS Embedded Essentials Certificate",
      "ARC LABS Embedded Systems Certificate",
      "ARC LABS Certified Embedded Engineer",
    ],
    summary:
      "Students learn firmware, peripheral control, communication protocols, real-time programming, ARM toolchains, testing, and embedded product architecture.",
  },
  {
    name: "Industrial IoT",
    aliases: ["IIoT", "industrial iot", "plc", "scada", "modbus", "opc", "opc-ua", "rs485", "factory"],
    level: "Industrial specialization",
    tools: ["PLC basics", "Modbus TCP/RTU", "RS485", "OPC-UA", "SCADA", "edge gateways"],
    audience: "instrumentation, manufacturing, automation, and Industry 4.0 learners",
    certificates: [
      "ARC LABS IIoT Fundamentals Certificate",
      "ARC LABS IIoT Systems Certificate",
      "ARC LABS Certified IIoT Engineer",
    ],
    summary:
      "Students connect industrial sensors, PLC data, dashboards, predictive maintenance concepts, edge gateways, and secure factory telemetry.",
  },
  {
    name: "Robotics",
    aliases: ["robotics", "robot", "line follower", "obstacle", "motor", "servo", "autonomous"],
    level: "Hands-on robotics",
    tools: ["Arduino", "motor drivers", "servo control", "sensors", "path planning"],
    audience: "school, college, robotics clubs, and engineering learners",
    certificates: [
      "ARC LABS Robotics Starter Certificate",
      "ARC LABS Robotics Systems Certificate",
      "ARC LABS Certified Robotics Engineer",
    ],
    summary:
      "Students build autonomous robots, line-following and obstacle-avoidance systems, motion control projects, and advanced robotic demonstrations.",
  },
  {
    name: "IoT & Robotics (IoRT)",
    aliases: ["iort", "iot robotics", "connected robot", "cloud robot", "ros", "ros2", "telemetry"],
    level: "Flagship specialization",
    tools: ["ROS", "MQTT", "AWS IoT", "ESP32", "OpenCV", "Raspberry Pi"],
    audience: "students with IoT or Robotics background",
    certificates: [
      "ARC LABS IoRT Starter Certificate",
      "ARC LABS IoRT Systems Certificate",
      "ARC LABS Certified IoRT Engineer",
    ],
    summary:
      "Students build connected robots with telemetry, cloud commands, remote override, failsafe logic, and autonomous behavior.",
  },
  {
    name: "Artificial Intelligence of Things",
    aliases: ["aiot", "tinyml", "edge ai", "edge impulse", "tensorflow lite", "anomaly", "embedded ml"],
    level: "Advanced",
    tools: ["TensorFlow Lite", "Edge Impulse", "ESP32", "Raspberry Pi", "Python", "ONNX"],
    audience: "engineering students with Python basics and IoT interest",
    certificates: [
      "ARC LABS AIoT Starter Certificate",
      "ARC LABS AIoT Systems Certificate",
      "ARC LABS Certified AIoT Engineer",
    ],
    summary:
      "Students collect sensor data, train small ML models, deploy edge inference, build anomaly detection, and design intelligent IoT products.",
  },
  {
    name: "AI + IoT & Robotics",
    aliases: ["aiort", "ai robotics", "vision robot", "cloud ai", "yolo", "moveit", "ai robot"],
    level: "Expert",
    tools: ["YOLO", "OpenCV", "ROS2", "MoveIt", "AWS IoT", "cloud AI"],
    audience: "final-year students, researchers, and advanced professionals",
    certificates: [
      "ARC LABS AIoRT Starter Certificate",
      "ARC LABS AIoRT Systems Certificate",
      "ARC LABS Certified AIoRT Engineer",
    ],
    summary:
      "Students build AI-powered connected robots with perception, decision-making, cloud intelligence, secure telemetry, and expert capstone projects.",
  },
  {
    name: "Advanced IoT",
    aliases: ["advanced iot", "digital twin", "lorawan", "kafka", "influxdb", "iot devops", "terraform", "docker"],
    level: "Enterprise architecture",
    tools: ["AWS IoT", "Azure IoT", "InfluxDB", "Kafka", "Terraform", "Docker"],
    audience: "senior students, engineers, IoT leads, and architects",
    certificates: [
      "ARC LABS Advanced IoT Certificate",
      "ARC LABS Advanced IoT Systems Certificate",
      "ARC LABS Certified Advanced IoT Architect",
    ],
    summary:
      "Students work on scalable IoT architecture, LPWAN networks, digital twins, data pipelines, DevOps, security, and production operations.",
  },
  {
    name: "Drone Technology",
    aliases: ["drone", "uav", "px4", "ardupilot", "gps", "mission planner", "flight controller"],
    level: "Intermediate to advanced",
    tools: ["PX4", "ArduPilot", "GPS", "Telemetry", "Mission Planner", "Python"],
    audience: "beginners, engineering students, and advanced learners",
    certificates: [
      "ARC LABS Drone Starter Certificate",
      "ARC LABS Drone Systems Certificate",
      "ARC LABS Certified Drone Engineer",
    ],
    summary:
      "Students learn drone anatomy, assembly, flight control, GPS navigation, mission planning, aerial applications, computer vision, and autonomous drone projects.",
  },
  {
    name: "Artificial Intelligence",
    aliases: ["artificial intelligence", "ai", "machine learning", "ml", "deep learning", "computer vision", "nlp", "python"],
    level: "Foundational to advanced",
    tools: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "OpenCV", "NLP"],
    audience: "beginners, intermediate learners, and advanced AI builders",
    certificates: [
      "ARC LABS AI Starter Certificate",
      "ARC LABS AI Systems Certificate",
      "ARC LABS Certified AI Engineer",
    ],
    summary:
      "Students learn AI fundamentals, machine learning, data handling, deep learning, computer vision, NLP, and real-world AI capstone projects.",
  },
];

const KNOWLEDGE_TOPICS = [
  {
    title: "School lab setup",
    keywords: ["school", "classes", "cbse", "state board", "nep", "atal", "atl", "stem", "teacher training", "school lab"],
    answer:
      "ARC LABS sets up complete AI, IoT, Robotics, and STEM labs for schools. Packages include hardware, curriculum, installation, lab branding, teacher training, certification, student activities, support, and annual updates. Standard and Premier packages are suitable for ATL-style requirements.",
    actions: PAGE_ACTIONS.packages,
  },
  {
    title: "College labs and training",
    keywords: ["college", "university", "engineering", "ece", "eee", "diploma", "faculty", "naac", "nba", "internship"],
    answer:
      "For colleges, ARC LABS offers department labs and training programs in IoT, Embedded Systems, Robotics, IIoT, AIoT, AI, drones, and Advanced IoT. College lab packages include manuals, experiments, faculty certification, support, cloud access, and CO-PO/NBA/NAAC documentation where applicable.",
    actions: [...PAGE_ACTIONS.programs, ...PAGE_ACTIONS.packages],
  },
  {
    title: "CSR implementation",
    keywords: ["csr", "schedule vii", "beneficiary", "impact", "brsr", "corporate", "donor", "funding", "company act", "annual report"],
    answer:
      "ARC LABS implements CSR-funded STEM labs under Schedule VII education alignment. We support cost-per-beneficiary planning, due diligence documents, beneficiary data, faculty/student certification records, photos/videos, annual impact reports, BRSR-ready content, co-branding, and outcome tracking.",
    actions: [...PAGE_ACTIONS.csr, ...CONTACT_ACTIONS],
  },
  {
    title: "Industrial IoT",
    keywords: ["industrial", "IIoT", "factory", "automation", "plc", "scada", "modbus", "opc-ua", "predictive maintenance", "dashboard"],
    answer:
      "ARC LABS delivers Industrial IoT and smart automation systems: sensor retrofits, Modbus TCP/RTU, RS485, OPC-UA, MQTT, LoRaWAN, PLC mapping, predictive maintenance dashboards, edge AI, energy monitoring, telemetry gateways, and local/cloud dashboards.",
    actions: [...PAGE_ACTIONS.IIoT, ...CONTACT_ACTIONS],
  },
  {
    title: "Certificates",
    keywords: ["certificate", "certification", "verify", "registry", "register certificate", "certificate id", "grade", "trainer"],
    answer:
      "ARC LABS certificates can be verified from the Verify page using the Certificate ID. The registration form captures participant, institution, technology, duration, city/state, and generates a unique certificate record.",
    actions: PAGE_ACTIONS.verify,
  },
  {
    title: "Support and warranty",
    keywords: ["support", "warranty", "break", "repair", "replacement", "maintenance", "amc", "technical help"],
    answer:
      "ARC LABS packages include technical support, installation help, faculty training, manuals, and hardware replacement warranty depending on tier. Starter includes 6-month support, Standard includes annual support, and Premier/R&D tiers include longer SLA options.",
    actions: [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS],
  },
  {
    title: "Curriculum and teacher training",
    keywords: ["curriculum", "teacher", "faculty", "training", "manual", "sessions", "lesson", "non technical", "electronics background"],
    answer:
      "ARC LABS provides curriculum, experiment manuals, sample code, teacher/faculty certification, recorded resources, and hands-on onsite training. School content is aligned with NEP 2020 skill education needs, and college packages can include university syllabus and CO-PO mapping.",
    actions: [...PAGE_ACTIONS.packages, ...PAGE_ACTIONS.programs],
  },
  {
    title: "Ordering and checkout",
    keywords: ["checkout", "order", "buy", "purchase", "payment", "razorpay", "upi", "invoice", "delivery", "shipping", "gst"],
    answer:
      "Individual IoT kits can be ordered from the Products page. Checkout collects name, email, phone, shipping address, city, state, zip, and payment method. Razorpay supports UPI, card, and netbanking flows, and the site generates a PDF invoice after successful payment.",
    actions: PAGE_ACTIONS.products,
  },
  {
    title: "Implementation timeline",
    keywords: ["timeline", "how long", "installation time", "go live", "deployment time", "proposal"],
    answer:
      "Typical lab implementation flow: discovery, proposal in about 48 hours, procurement, installation, teacher training, and go-live. The lab packages page positions the full enquiry-to-live-lab process at about 4 weeks for standard deployments.",
    actions: [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS],
  },
  {
    title: "Space requirements",
    keywords: ["space", "room size", "area", "minimum space", "layout", "furniture"],
    answer:
      "Indicative lab space: Starter lab needs about 20x15 ft, Standard about 25x20 ft, and Premier/R&D about 30x25 ft or larger. ARC LABS provides a detailed layout plan with furniture and power point recommendations during proposal.",
    actions: PAGE_ACTIONS.packages,
  },
];

function answer(text, actions = []) {
  return { text, actions };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(value) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/rs\.?|inr|rupees|₹/g, " rs ")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesTerm(normalizedQuestion, term) {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  if (/^[a-z0-9+#-]{1,4}$/.test(normalizedTerm)) {
    return new RegExp(`(^|\\s)${escapeRegExp(normalizedTerm)}($|\\s)`).test(normalizedQuestion);
  }
  return normalizedQuestion.includes(normalizedTerm);
}

function hasAny(normalizedQuestion, terms) {
  return terms.some((term) => includesTerm(normalizedQuestion, term));
}

function formatPrice(value) {
  return `Rs.${Number(value).toLocaleString("en-IN")}`;
}

function productAliases(product) {
  const common = [product.id, product.name, product.short, product.tagline, ...product.for];
  const aliases = {
    basic: ["basic", "essential", "starter kit", "entry kit", "low cost", "budget", "affordable"],
    lite: ["lite", "beginner", "starter", "school kit", "class 9", "class 10", "early college"],
    experience: ["experience", "flagship", "best seller", "all in one", "multi mcu", "stm32", "lora", "gsm", "rs485"],
    pro: ["pro", "advanced", "raspberry", "edge ai", "research", "industrial training", "product development", "postgraduate"],
  };
  return [...common, ...(aliases[product.id] || [])];
}

function findProduct(normalizedQuestion) {
  const scored = PRODUCTS.map((product) => ({
    product,
    score: productAliases(product).reduce(
      (sum, alias) => sum + (includesTerm(normalizedQuestion, alias) ? (normalize(alias).split(" ").length > 1 ? 3 : 2) : 0),
      0
    ),
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].product : null;
}

function summarizeProduct(product) {
  const sensors = product.sensors.slice(0, 5).join(", ");
  const controllers = product.controllers.join(", ");
  const bestFor = product.for.join(", ");
  const name =
    product.id === "basic"
      ? `${product.name} (also treated as the entry-level Essential tier)`
      : product.name;

  return `${name}\nPrice: ${formatPrice(product.price)} + GST / unit. MRP: ${formatPrice(product.oldPrice)}.\nBest for: ${bestFor}.\nControllers: ${controllers}.\nKey sensors: ${sensors}.\nWhy choose it: ${product.tagline}`;
}

function productPriceList() {
  return PRODUCTS.map(
    (product) => `${product.name}: ${formatPrice(product.price)} + GST / unit. Best for ${product.for.join(", ")}.`
  ).join("\n");
}

function compareProducts() {
  return [
    "ARC LABS IoT kit comparison:",
    `1. Basic/Essential - ${formatPrice(10000)}: entry-level Arduino + ESP32 IoT learning for beginners and school labs.`,
    `2. Lite - ${formatPrice(15000)}: beginner-friendly Arduino + ESP32 board with more sensors, relays, OLED, and classroom examples.`,
    `3. Experience - ${formatPrice(20000)}: flagship multi-MCU trainer with Arduino, ESP32, STM32, Raspberry Pi Pico/4/5, LoRa, GSM/4G, RS485, cloud IoT, and AIoT use cases.`,
    `4. Pro - ${formatPrice(25000)}: advanced Raspberry Pi + ESP32 board for edge AI, research, industrial training, and product prototyping.`,
    "Quick recommendation: Lite for beginners, Experience for the most versatile lab, Pro for advanced Raspberry Pi/edge AI/research.",
  ].join("\n");
}

function recommendProduct(normalizedQuestion) {
  if (hasAny(normalizedQuestion, ["school", "class 9", "class 10", "beginner", "beginners", "starter", "budget", "low cost"])) {
    return PRODUCTS.find((product) => product.id === "lite") || PRODUCTS[0];
  }
  if (hasAny(normalizedQuestion, ["raspberry", "edge ai", "research", "postgraduate", "product development", "advanced"])) {
    return PRODUCTS.find((product) => product.id === "pro");
  }
  if (hasAny(normalizedQuestion, ["lora", "gsm", "rs485", "stm32", "cloud", "best", "flagship", "multi mcu", "all in one"])) {
    return PRODUCTS.find((product) => product.id === "experience");
  }
  if (hasAny(normalizedQuestion, ["basic", "essential", "affordable", "minimum"])) {
    return PRODUCTS.find((product) => product.id === "basic");
  }
  return PRODUCTS.find((product) => product.id === "experience") || PRODUCTS[0];
}

function findProgram(normalizedQuestion) {
  const scored = PROGRAMS.map((program) => ({
    program,
    score: program.aliases.reduce(
      (sum, alias) => sum + (includesTerm(normalizedQuestion, alias) ? (normalize(alias).split(" ").length > 1 ? 4 : 2) : 0),
      0
    ),
  })).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].program : null;
}

function programAnswer(program) {
  return `${program.name} program\nLevel: ${program.level}.\nAudience: ${program.audience}.\nTools/topics: ${program.tools.join(", ")}.\nFormat: 2-day workshop, 3-day intensive, or 5-day bootcamp.\nCertificates: ${program.certificates.join("; ")}.\nWhat students do: ${program.summary}`;
}

function allProgramsAnswer() {
  return [
    "ARC LABS training programs cover:",
    PROGRAMS.map((program) => `- ${program.name}: ${program.summary}`).join("\n"),
    "Each track can be delivered as a 2-day workshop, 3-day intensive, or 5-day bootcamp with ARC LABS certification.",
  ].join("\n");
}

function labPackageAnswer(normalizedQuestion) {
  const allPackages = [
    ...LAB_PACKAGES.school.map((pkg) => ({
      pkg,
      audience: "School",
      aliases:
        pkg.name === "Starter Lab"
          ? ["starter lab", "starter package", "package 01", "2.5l", "rs 2.5l"]
          : pkg.name === "Standard Lab"
            ? ["standard lab", "standard package", "package 02", "5l", "rs 5l"]
            : ["premier lab", "premier", "premium lab", "package 03", "10l", "rs 10l"],
    })),
    ...LAB_PACKAGES.college.map((pkg) => ({
      pkg,
      audience: "College",
      aliases:
        pkg.name === "Essential IoT Lab"
          ? ["essential iot lab", "college essential", "essential lab", "4l", "rs 4l"]
          : pkg.name === "Advanced IoT & Embedded Lab"
            ? ["advanced iot embedded lab", "advanced lab", "college advanced", "8l", "rs 8l"]
            : ["r and d", "r&d", "research lab", "innovation lab", "college research", "15l", "rs 15l", "coe"],
    })),
  ];

  const exactPackage = allPackages.find((item) => hasAny(normalizedQuestion, item.aliases));
  if (exactPackage) {
    const { pkg, audience } = exactPackage;
    return answer(
      `${audience} package: ${pkg.name}\nPrice: ${pkg.price} / lab setup.\nBest for: ${pkg.bestFor}.\nIncludes: ${pkg.includes}\n\nA final quote can include exact kit quantities, room layout, curriculum scope, support SLA, taxes, and implementation timeline.`,
      [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS]
    );
  }

  const group =
    hasAny(normalizedQuestion, ["college", "university", "btech", "m.tech", "research", "department", "ece", "eee"])
      ? "college"
      : hasAny(normalizedQuestion, ["school", "class", "cbse", "atl", "atal", "teacher"])
        ? "school"
        : null;

  const packageLines = (key) =>
    LAB_PACKAGES[key]
      .map((pkg) => `${pkg.name} - ${pkg.price}: ${pkg.bestFor}. Includes ${pkg.includes}`)
      .join("\n\n");

  if (group) {
    return answer(
      `${group === "school" ? "School" : "College"} lab packages:\n\n${packageLines(group)}\n\nAll packages combine hardware, curriculum, training, installation, and support. Custom proposals include layout, timeline, and exact pricing.`,
      [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS]
    );
  }

  return answer(
    `ARC LABS lab packages are split into school and college tracks.\n\nSchool packages:\n${packageLines("school")}\n\nCollege packages:\n${packageLines("college")}\n\nA tailored proposal can include exact kit quantities, lab layout, curriculum, support SLA, CSR documentation, and timeline.`,
    [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS]
  );
}

function csrAnswer(normalizedQuestion) {
  if (hasAny(normalizedQuestion, ["tier", "budget", "silver", "gold", "platinum"])) {
    return answer(
      "CSR partnership tiers:\nSilver Partner: Rs.5L-Rs.15L/year for 1 lab and 50-150 students annually.\nGold Partner: Rs.15L-Rs.50L/year for 3-5 labs, 300-800 students, co-branded lab nameplates, quarterly updates, and board presentation deck.\nPlatinum Partner: Rs.50L+/year for 10+ labs, 1,000+ students annually, full co-branding, BRSR-ready documentation, media support, and executive reviews.",
      [...PAGE_ACTIONS.csr, ...CONTACT_ACTIONS]
    );
  }

  if (hasAny(normalizedQuestion, ["document", "due diligence", "brsr", "audit", "annual report", "pan", "80g"])) {
    return answer(
      "ARC LABS provides CSR due-diligence and reporting documents including MSME certificate, PAN, audited financials, 80G certificate, prior impact reports, MoU templates, anonymized beneficiary data, faculty/student certification records, cost-per-beneficiary sheet, Schedule VII eligibility declaration, and annual BRSR-ready impact report.",
      [...PAGE_ACTIONS.csr, ...CONTACT_ACTIONS]
    );
  }

  return answer(
    "Yes. ARC LABS supports CSR-funded STEM, AI, IoT, and Robotics labs. The program is aligned with Schedule VII education and vocational skills. We handle lab implementation, beneficiary planning, impact documentation, co-branding, cost-per-student reporting, and long-term outcome tracking. Typical impact positioning is Rs.800-Rs.2,000 per student depending on scale.",
    [...PAGE_ACTIONS.csr, ...CONTACT_ACTIONS]
  );
}

function IIoTAnswer(normalizedQuestion) {
  if (hasAny(normalizedQuestion, ["protocol", "modbus", "opc", "mqtt", "rs485", "lorawan", "gsm", "4g"])) {
    return answer(
      "ARC LABS IIoT systems support Modbus TCP, Modbus RTU, RS485, OPC-UA, MQTT, LoRaWAN, GSM/4G, BLE tags, ESP-NOW mesh, and secure cloud or local server pipelines. These are used for telemetry gateways, PLC mapping, SCADA overlays, and factory dashboards.",
      [...PAGE_ACTIONS.IIoT, ...CONTACT_ACTIONS]
    );
  }

  if (hasAny(normalizedQuestion, ["legacy", "old machine", "old machines", "retrofit", "cnc", "pump", "molding", "lathe"])) {
    return answer(
      "Yes. ARC LABS can retrofit legacy machinery by adding external current transducers, vibration probes, temperature sensors, flow/level sensors, gateway hardware, and Modbus/MQTT bridges. Older CNC, injection molding, pump, utility, and process equipment can be connected to dashboards without replacing the entire machine.",
      [...PAGE_ACTIONS.IIoT, ...CONTACT_ACTIONS]
    );
  }

  return answer(
    "ARC LABS Industrial IoT solutions include predictive maintenance, energy monitoring, industrial telemetry, AI safety monitoring, edge computing gateways, smart sensor networks, industrial dashboards, secure cloud sync, and local/air-gapped deployments. Useful industries include manufacturing, cold storage, automation, smart agriculture, water systems, and energy-heavy plants.",
    [...PAGE_ACTIONS.IIoT, ...CONTACT_ACTIONS]
  );
}

function certificateAnswer(originalQuestion, normalizedQuestion) {
  const certId = originalQuestion.toUpperCase().match(/\bARC[A-Z0-9]{4,}\b/)?.[0];

  if (certId && SAMPLE_CERTIFICATES[certId]) {
    const cert = SAMPLE_CERTIFICATES[certId];
    return answer(
      `Certificate ${certId} is available in the demo registry.\nName: ${cert.fullName}.\nInstitution: ${cert.institution}.\nTechnology: ${cert.technology}.\nDuration: ${cert.durationDays} days.\nProject: ${cert.projectTitle}.\nGrade: ${cert.grade}.\nStatus: ${cert.status}.\nFor live verification, use the Verify page.`,
      PAGE_ACTIONS.verify
    );
  }

  if (certId) {
    return answer(
      `I cannot confirm ${certId} from chat because live records are checked against Firebase on the Verify page. Open /verify, enter the Certificate ID, and the site will show whether it is authentic and active.`,
      PAGE_ACTIONS.verify
    );
  }

  if (hasAny(normalizedQuestion, ["register", "generate", "new certificate"])) {
    return answer(
      "To register a certificate, open the Verify page, switch to Register Certificate, and enter full name, phone, institution type/name, training date, pincode, state, technology, and duration. The site generates a unique ARC LABS Certificate ID and stores it in Firebase.",
      PAGE_ACTIONS.verify
    );
  }

  return answer(
    "ARC LABS has a certificate registry. Use the Verify page to check a Certificate ID or register a new certificate. Demo IDs visible in the site data include ARC4F2K, ARC7K9P, and ARCM3XQ.",
    PAGE_ACTIONS.verify
  );
}

function quoteAnswer(normalizedQuestion) {
  if (hasAny(normalizedQuestion, ["csr", "corporate", "company"])) {
    return answer(
      "For a CSR proposal, share company/organisation name, CSR budget range, target geography, beneficiary type, timeline, and expected student count. ARC LABS prepares impact projections, cost-per-student calculation, lab options, documentation samples, and implementation timeline within about 48 hours.",
      [...PAGE_ACTIONS.csr, ...CONTACT_ACTIONS]
    );
  }

  return answer(
    "To get a lab quote, start from the Lab Packages page, choose school or college, then request a custom proposal. Helpful details: institution name, city/state, student count per year, target grade/department, preferred package, room size, timeline, and whether CSR/government funding is involved. ARC LABS responds with pricing, layout, curriculum, and timeline.",
    [...PAGE_ACTIONS.packages, ...CONTACT_ACTIONS]
  );
}

function scoreTopic(normalizedQuestion, topic) {
  return topic.keywords.reduce(
    (score, keyword) => score + (includesTerm(normalizedQuestion, keyword) ? (normalize(keyword).split(" ").length > 1 ? 4 : 2) : 0),
    0
  );
}

function fallbackAnswer(normalizedQuestion) {
  const ranked = KNOWLEDGE_TOPICS.map((topic) => ({
    topic,
    score: scoreTopic(normalizedQuestion, topic),
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    const primary = ranked[0].topic;
    const secondary = ranked[1]?.score >= 2 ? `\n\nRelated: ${ranked[1].topic.answer}` : "";
    return answer(`${primary.answer}${secondary}`, primary.actions || []);
  }

  return answer(
    "I can help with ARC LABS school labs, college programs, IoT kit selection, lab package pricing, CSR-funded STEM labs, Industrial IoT systems, certificate verification, ordering, installation, support, and contact details. Try asking: 'Which kit is best for a school?', 'What is the Standard Lab price?', 'Do you support CSR reporting?', or 'How do I verify a certificate?'",
    [
      ...PAGE_ACTIONS.packages,
      ...PAGE_ACTIONS.products,
      ...PAGE_ACTIONS.programs,
      ...CONTACT_ACTIONS,
    ]
  );
}

export function getSmartBotAnswer(rawQuestion) {
  const originalQuestion = (rawQuestion || "").trim();
  const q = normalize(originalQuestion);

  if (!originalQuestion) {
    return answer(
      "Ask me about ARC LABS lab setup, IoT kits, pricing, CSR, training programs, Industrial IoT, certificate verification, checkout, support, or contact details.",
      [...PAGE_ACTIONS.packages, ...PAGE_ACTIONS.products]
    );
  }

  if (hasAny(q, ["hi", "hello", "hey", "namaste", "good morning", "good evening"])) {
    return answer(
      "Hello. I am the ARC LABS website assistant. I can answer questions about AI/IoT/Robotics labs, product kits, school and college packages, CSR proposals, IIoT systems, certification, pricing, checkout, and support.",
      [...PAGE_ACTIONS.packages, ...PAGE_ACTIONS.products, ...PAGE_ACTIONS.programs]
    );
  }

  if (hasAny(q, ["thank", "thanks", "thank you"])) {
    return answer("You are welcome. Share your institution type, city, student count, or target technology and I can suggest the right ARC LABS package or kit.");
  }

  if (/\bARC[A-Z0-9]{4,}\b/i.test(originalQuestion) || hasAny(q, ["certificate", "certification", "verify", "register certificate", "certificate id"])) {
    return certificateAnswer(originalQuestion, q);
  }

  if (hasAny(q, ["quote", "proposal", "demo", "meeting", "enquiry", "enquiry", "estimate", "custom requirement"])) {
    return quoteAnswer(q);
  }

  if (hasAny(q, ["contact", "phone", "mobile", "number", "email", "whatsapp", "call", "address", "location", "where are you", "hyderabad"])) {
    return answer(CONTACT_TEXT, CONTACT_ACTIONS);
  }

  const asksProduct =
    hasAny(q, ["kit", "kits", "product", "products", "board", "boards", "sensor", "sensors", "controller", "arduino", "esp32", "raspberry", "lora", "gsm", "rs485", "basic", "essential", "lite", "experience", "pro"]) ||
    (hasAny(q, ["price", "cost"]) && hasAny(q, ["iot", "kit", "kits", "board", "product"]));

  if (asksProduct && hasAny(q, ["best", "recommend", "suggest", "which kit", "suitable", "choose"])) {
    const product = recommendProduct(q);
    return answer(`Recommended kit:\n${summarizeProduct(product)}`, [
      ...PAGE_ACTIONS.products,
      { label: "Order kit", to: `/checkout?product=${product.id}&price=${product.price}` },
    ]);
  }

  if (asksProduct && hasAny(q, ["compare", "difference", "vs", "versus", "which", "better"])) {
    return answer(compareProducts(), PAGE_ACTIONS.products);
  }

  if (asksProduct) {
    const product = findProduct(q);
    if (product) {
      return answer(summarizeProduct(product), [
        ...PAGE_ACTIONS.products,
        { label: "Order kit", to: `/checkout?product=${product.id}&price=${product.price}` },
      ]);
    }

    return answer(`ARC LABS IoT kit price list:\n${productPriceList()}\n\nFor a full school or college lab, use Lab Packages because those include multiple kits, curriculum, training, installation, and support.`, [
      ...PAGE_ACTIONS.products,
      ...PAGE_ACTIONS.packages,
    ]);
  }

  if (hasAny(q, ["space", "room size", "minimum space", "layout", "furniture", "power point"])) {
    return answer(
      "Indicative lab space: Starter lab needs about 20x15 ft, Standard about 25x20 ft, and Premier/R&D labs about 30x25 ft or larger. ARC LABS provides a detailed layout plan with furniture arrangement and power point requirements during proposal.",
      PAGE_ACTIONS.packages
    );
  }

  if (hasAny(q, ["school", "classes", "class", "cbse", "student", "students"]) && hasAny(q, ["lab", "labs", "setup", "robotics", "ai", "stem"])) {
    return labPackageAnswer(q);
  }

  if (hasAny(q, ["lab package", "package", "school lab", "college lab", "lab setup", "setup a lab", "price for lab", "fixed tier", "starter lab", "standard lab", "premier lab", "essential iot lab", "innovation lab", "room size", "space"])) {
    return labPackageAnswer(q);
  }

  if (hasAny(q, ["csr", "schedule vii", "beneficiary", "impact", "brsr", "corporate", "donation", "funding", "partner", "80g", "cost per student"])) {
    return csrAnswer(q);
  }

  if (hasAny(q, ["industrial", "IIoT", "factory", "automation", "plc", "scada", "modbus", "opc-ua", "predictive maintenance", "telemetry", "legacy machine", "legacy machines", "old machine", "old machines", "cnc", "energy monitoring"])) {
    return IIoTAnswer(q);
  }

  const program = findProgram(q);
  if (program) {
    return answer(programAnswer(program), PAGE_ACTIONS.programs);
  }

  if (hasAny(q, ["program", "course", "workshop", "bootcamp", "training", "internship", "duration", "2 day", "3 day", "5 day", "certificate course"])) {
    return answer(allProgramsAnswer(), PAGE_ACTIONS.programs);
  }

  if (hasAny(q, ["checkout", "order", "buy", "purchase", "payment", "razorpay", "upi", "card", "netbanking", "invoice", "shipping", "delivery", "gst"])) {
    return fallbackAnswer("checkout order payment invoice delivery");
  }

  if (hasAny(q, ["who are you", "about", "what is arc labs", "company", "what do you do", "services"])) {
    return answer(
      "ARC LABS is a Hyderabad-based STEM lab implementation company that builds AI, IoT, Robotics, and Industrial IoT labs for schools, colleges, CSR partners, and industrial clients across India. The site covers lab packages, products, training programs, CSR partnerships, IIoT systems, certificate verification, and checkout for individual kits.",
      [
        ...PAGE_ACTIONS.packages,
        ...PAGE_ACTIONS.products,
        ...PAGE_ACTIONS.programs,
        ...CONTACT_ACTIONS,
      ]
    );
  }

  return fallbackAnswer(q);
}

