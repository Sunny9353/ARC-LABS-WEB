import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SplineSceneBasic } from "../components/SplineSceneBasic";
import { SplineScene } from "../components/ui/splite";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "../styles/Home.css";

const HOME_FAQS = [
  {
    question: "What is ARC LABS?",
    answer:
      "ARC LABS is a Hyderabad-based STEM lab implementation company that builds AI, IoT, Robotics, and Industrial IoT labs for schools, colleges, and CSR partners across India.",
  },
  {
    question: "Does ARC LABS set up AI and Robotics labs for schools?",
    answer:
      "Yes. ARC LABS provides end-to-end school lab setup with hardware kits, curriculum, teacher training, installation, certification, and annual support.",
  },
  {
    question: "Do you provide IoT and Robotics kits for colleges?",
    answer:
      "Yes. ARC LABS designs and supplies made-in-India IoT, Robotics, embedded systems, and AI learning kits for college labs, workshops, and training programs.",
  },
  {
    question: "Where is ARC LABS located?",
    answer:
      "ARC LABS is based in Hyderabad, Telangana, India, and serves schools, colleges, training partners, and CSR programs across India.",
  },
  {
    question: "Does ARC LABS support CSR-funded STEM labs?",
    answer:
      "Yes. ARC LABS implements CSR-funded STEM, AI, IoT, and Robotics labs with documentation, impact reporting, cost-per-beneficiary planning, and long-term outcome tracking.",
  },
  {
    question: "Does ARC LABS train teachers after lab setup?",
    answer:
      "Yes. Teacher training, faculty certification, classroom activity support, and post-installation technical support are included in ARC LABS lab implementation programs.",
  },
];

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "EducationalOrganization", "LocalBusiness"],
      "@id": "https://arclabs.in/#organization",
      name: "ARC LABS",
      url: "https://arclabs.in/",
      logo: "https://arclabs.in/logo512.png",
      image: "https://arclabs.in/og-image.png",
      description:
        "ARC LABS is a Hyderabad-based STEM lab implementation company that builds AI, IoT, Robotics, and Industrial IoT labs for schools, colleges, and CSR partners across India.",
      email: "hello@arclabs.in",
      telephone: "+91-78158-09412",
      priceRange: "INR",
      address: {
        "@type": "PostalAddress",
        streetAddress: "PLOTNO : 1EP, BRINDAVAN MEADOWS, SAHEBNAGAR KALAN",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        postalCode: "501510",
        addressCountry: "IN",
      },
      areaServed: [
        { "@type": "City", name: "Hyderabad" },
        { "@type": "State", name: "Telangana" },
        { "@type": "Country", name: "India" },
      ],
      knowsAbout: [
        "AI lab setup for schools",
        "IoT lab setup",
        "Robotics lab setup",
        "STEM education labs",
        "Industrial IoT solutions",
        "Teacher training",
        "CSR STEM lab implementation",
        "Embedded systems training kits",
      ],
      sameAs: [
        "https://www.linkedin.com/company/arclabstech",
        "https://www.instagram.com/arclabs.in",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-78158-09412",
          email: "hello@arclabs.in",
          contactType: "sales",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi", "Telugu"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://arclabs.in/#website",
      url: "https://arclabs.in/",
      name: "ARC LABS",
      publisher: { "@id": "https://arclabs.in/#organization" },
      inLanguage: "en-IN",
    },
    {
      "@type": "Service",
      "@id": "https://arclabs.in/#lab-setup-service",
      name: "AI, IoT and Robotics Lab Setup for Schools and Colleges",
      serviceType: "STEM lab implementation",
      provider: { "@id": "https://arclabs.in/#organization" },
      areaServed: { "@type": "Country", name: "India" },
      description:
        "End-to-end AI, IoT, Robotics, and Industrial IoT lab setup with hardware, curriculum, teacher training, installation, certification, and support.",
      audience: [
        { "@type": "EducationalAudience", educationalRole: "school" },
        { "@type": "EducationalAudience", educationalRole: "college" },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://arclabs.in/#faq",
      mainEntity: HOME_FAQS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};



/* ─── Hero ─────────────────────────────────────────────── */
const HOME_HERO_IMAGES = [
  { src: "/images/home/308be169-ac9a-4660-a0b4-8cf97f2a7520.JPG" },
  { src: "/images/home/9846ae80-54c9-444e-851e-471326155bbe.JPG"},
  { src: "/images/home/air.jpeg" },
  { src: "/images/home/d8669014-ecc6-409d-a572-bd2823fc8c57.JPG" },
  { src: "/images/home/diet.jpeg" },
  { src: "/images/home/dubai.jpg" },
  { src: "/images/home/mru.jpg" },
  { src: "/images/home/IMG_4249 (1).jpg" },
  { src: "/images/home/IMG_9918.jpg" },
  { src: "/images/home/kolhapur.jpeg", },
  { src: "/images/home/mh.jpeg"},
  { src: "/images/home/fdp.jpeg"}
];

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-inner">

        {/* LEFT */}
        <div className="hero-left">
          <div className="hero-badge hero-gst-badge">
            <span className="hero-badge-dot" />
            GST Number: 36INMPK2340J1ZP
          </div>

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            MSME Registered &middot; Made in India &middot; Hyderabad
          </div>

          {/* Title */}
          <div className="hero-title-row">
            <h1>
              India's Practical<br />
              <span className="accent">AI + IoRT</span> Lab<br />
              System for <span className="blue">Institutions</span>
            </h1>
          </div>

          <p className="hero-sub">
            Full lab infrastructure — hardware, curriculum, teacher training, and annual support.
            Designed in Hyderabad. Delivered across India. One partner, zero complexity.
          </p>

          <div className="hero-actions">
            <Link to="/lab-packages" className="btn btn-primary">Set Up a Lab →</Link>
            <Link to="/programs"     className="btn btn-secondary">Explore Programs</Link>
          </div>

        </div>

        <div className="hero-lab-preview" aria-hidden="true">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="hero-lab-scene"
          />
        </div>

        <div className="hero-image-gallery">
          <Swiper
            effect="coverflow"
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            speed={1200}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 2,
              scale: 0.85,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Autoplay]}
            className="homeHeroSwiper"
          >
            {HOME_HERO_IMAGES.map((image) => (
              <SwiperSlide key={image.src}>
                <img src={image.src} alt={image.alt} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Marquee ────────────────────────────────────── */
function TrustBar() {
  const ITEMS = [
    "IIT Programs Delivered","NEP 2020 Aligned","MSME Registered",
    "Made-in-India Hardware","25,000+ Students","CSR-Ready Labs",
    "IoRT + AI Systems","ATL Compatible Kits","Teacher Certification",
  ];
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="trust-bar">
      <div className="trust-track">
        {doubled.map((item, i) => <span className="trust-item" key={i}>{item}</span>)}
      </div>
    </div>
  );
}

function AIReadyIntro() {
  return (
    <section className="ai-ready-section" aria-labelledby="arc-labs-summary">
      <div className="ai-ready-inner">
        <div>
          <div className="section-label">About ARC LABS</div>
          <h2 id="arc-labs-summary" className="section-heading">
            Hyderabad-based AI, IoT and Robotics lab setup partner.
          </h2>
        </div>
<div className="company-info-box">
  <h2>About ARC LABS</h2>

  <p>
    ARC LABS is a Hyderabad-based STEM lab implementation company that
    builds AI, IoT, Robotics, and Industrial IoT labs for schools,
    colleges, and CSR partners across India.
  </p>

  <p>
    We provide hardware kits, curriculum, teacher training,
    installation, certification, and annual support so institutions
    can launch practical technology labs with one accountable partner.
  </p>
</div>
      </div>
    </section>
  );
}


/* ─── Services ─────────────────────────────────────────── */
function Services() {
  const [openId, setOpenId] = useState(null);

  const SERVICES = [
    {
      id: "school",
      icon: "🏫",
      color: "#00d4aa",
      colorDim: "rgba(0,212,170,0.12)",
      colorBorder: "rgba(0,212,170,0.30)",
      title: "School Lab Setup & STEM",
      desc: "End-to-end IoRT + AI lab installation for Classes 3–10. Hardware, curriculum, installation, and ongoing support — bundled.",
      points: [
        "Complete IoRT + AI lab design, procurement, and installation from scratch",
        "Age-appropriate NEP 2020 aligned curriculum for Classes 3–10",
        "ARC Labs hardware kits — pre-assembled, ready to use on day one",
        "2-day onsite teacher training with hands-on sessions and certification",
        "Lab branding, student workbooks, and instructional posters included",
        "6-month post-installation support with troubleshooting and content updates",
      ],
    },
    {
      id: "college",
      icon: "🎓",
      color: "#3b82f6",
      colorDim: "rgba(59,130,246,0.12)",
      colorBorder: "rgba(59,130,246,0.30)",
      title: "College Training Programs",
      desc: "Industry-driven curriculum in IoT, AI, Cloud, and Embedded Systems. Real projects, live hardware, certification.",
      points: [
        "Structured courses in IoT, Embedded Systems, AI/ML, and Cloud platforms",
        "Hands-on project-based learning with ARC Labs hardware kits",
        "Industry-expert instructors with real-world deployment experience",
        "Curriculum mapped to Anna University, JNTU, and VTU syllabi",
        "Individual student assessment portal with progress tracking and certification",
        "Placement-ready capstone projects and portfolio-building workshops",
      ],
    },
    {
      id: "online",
      icon: "💻",
      color: "#a855f7",
      colorDim: "rgba(168,85,247,0.12)",
      colorBorder: "rgba(168,85,247,0.30)",
      title: "Online Certification",
      desc: "Structured online programs with mentor-led sessions, hands-on projects, and industry-recognized certification.",
      points: [
        "Live mentor-led sessions with Q&A, recordings, and lifetime access",
        "Self-paced modules covering IoT fundamentals to advanced topics",
        "Physical hardware kit shipped to your doorstep for hands-on practice",
        "Capstone project with real IoT deployment and cloud integration",
        "Industry-recognized ARC LABS certificate upon course completion",
        "Community access — peer learning forums and alumni network",
      ],
    },
    {
      id: "csr",
      icon: "🤝",
      color: "#f59e0b",
      colorDim: "rgba(245,158,11,0.12)",
      colorBorder: "rgba(245,158,11,0.30)",
      title: "CSR Lab Implementation",
      desc: "Complete CSR-funded lab setup with impact reporting, cost-per-beneficiary data, and measurable learning outcomes.",
      points: [
        "End-to-end project execution under your company's CSR allocation",
        "Eligible under Schedule VII of the Companies Act — Education clause",
        "Cost per beneficiary from ₹800–₹2,000 with transparent breakdowns",
        "Impact documentation and before/after reports for annual CSR filings",
        "3-year longitudinal outcome tracking for board and regulatory reporting",
        "Listed on CSR Box, GiveIndia Corporate, and Sattva for added visibility",
      ],
    },
    {
      id: "teacher",
      icon: "👩‍🏫",
      color: "#f43f5e",
      colorDim: "rgba(244,63,94,0.12)",
      colorBorder: "rgba(244,63,94,0.30)",
      title: "Teacher Training",
      desc: "Two-level certification program that makes teachers independently capable of delivering IoT and Robotics education.",
      points: [
        "Level 1 — Foundations: sensors, circuits, Arduino, basic IoT concepts",
        "Level 2 — Advanced: ESP32, Raspberry Pi, cloud, AI-assisted teaching tools",
        "Onsite or online delivery options to suit school schedules",
        "Classroom activity kits provided so teachers can practice independently",
        "Certified instructors recognized by ARC LABS with a shareable digital badge",
        "Ongoing refresher sessions each semester as curriculum evolves",
      ],
    },
    {
      id: "rnd",
      icon: "⚙️",
      color: "#64748b",
      colorDim: "rgba(100,116,139,0.12)",
      colorBorder: "rgba(100,116,139,0.30)",
      title: "Custom Hardware & R&D",
      desc: "Made-in-India development boards and educational kits. Custom IoT and embedded system design for institutions.",
      points: [
        "Custom PCB design and fabrication for institution-specific requirements",
        "ARC Labs IoT Lite, Pro, and Experience kits — all manufactured in Hyderabad",
        "Prototyping support for final-year engineering and research projects",
        "Embedded firmware development for Arduino, ESP32, STM32, and Raspberry Pi",
        "Cloud integration design — MQTT, REST, Blynk, AWS IoT, and custom dashboards",
        "Bulk kit supply with warranty, documentation, and ongoing technical support",
      ],
    },
  ];

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="section" id="services">
      <div className="section-label">Programs</div>
      <div className="services-header">
        <h2 className="section-heading">
          Everything an institution needs.<br />
          <span style={{ color: "var(--accent)" }}>One partner.</span>
        </h2>
        <p className="section-desc" style={{ marginBottom: 0 }}>
          From lab design to curriculum delivery — we handle it all.
        </p>
      </div>

      <div className="services-grid">
        {SERVICES.map((s) => {
          const isOpen = openId === s.id;
          return (
            <div
              key={s.id}
              className={`service-card${isOpen ? " service-card--open" : ""}`}
              style={{
                "--svc-color":  s.color,
                "--svc-dim":    s.colorDim,
                "--svc-border": s.colorBorder,
              }}
              onClick={() => toggle(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(s.id); }
              }}
            >
              {/* Colored top accent bar */}
              <div className="service-top-bar" />

              {/* Header row: icon + title share same color */}
              <div className="service-head">
                <span className="service-icon-circle">{s.icon}</span>
                <h3 className="service-title">{s.title}</h3>
              </div>

              <p className="service-desc">{s.desc}</p>

              {/* Toggle label */}
              <div className="service-link">
                {isOpen ? "Hide details ↑" : "Learn more ↓"}
              </div>

              {/* Expanded points */}
              {isOpen && (
                <ul className="service-points">
                  {s.points.map((pt, i) => (
                    <li key={i} className="service-point">
                      <span className="service-point-num">{i + 1}</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Stats Band ───────────────────────────────────────── */
function StatsBand() {
  const STATS = [
    { num: "25,000+", label: "Students Upskilled", desc: "Schools, colleges & corporates" },
    { num: "1,000+",  label: "Faculty Certified",  desc: "Including IIT & NIT programs" },
    { num: "3,000+",  label: "Training Sessions",  desc: "Delivered across India" },
    { num: "10+",     label: "Years in EdTech",    desc: "MSME-registered, Hyderabad" },
    { num: "500+",    label: "Institutions",       desc: "Schools, colleges & labs" },
  ];
  return (
    <div className="stats-band">
      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Products Preview ─────────────────────────────────── */
function ProductsPreview() {
const PRODUCTS = [
  {
    image: "/images/products/essential-kit.jpg",
    label: "ESSENTIAL",
    name: "ARC Labs IoT Essential Kit",
    desc: "Ready-to-use Pico + ESP32 trainer with sensors, OLED display, relays, buzzer, and GPIO practice sections.",
    tags: ["Pico", "ESP32", "IoT Trainer"],
  },

  {
    image: "/images/products/lite-kit.jpg",
    label: "STARTER",
    name: "ARC Labs IoT Lite Kit",
    desc: "Beginner IoT board with Arduino & ESP32 support. Essential sensors for classroom learning.",
    tags: ["Arduino", "ESP32", "IoT Basics"],
  },

  {
    image: "/images/products/pro-kit.jpg",
    label: "PRO",
    name: "ARC Labs IoT Pro Kit",
    desc: "Advanced board with Raspberry Pi & ESP32, industrial sensors, and cloud connectivity.",
    tags: ["Raspberry Pi", "ESP32", "Cloud IoT"],
  },

  {
    image: "/images/products/experience-kit.jpg",
    label: "FLAGSHIP",
    name: "IoT Experience Kit",
    desc: "All-in-one platform — Arduino, ESP32, STM32, Pico, Raspberry Pi. The complete lab solution.",
    tags: ["Multi-MCU", "LoRa", "Research"],
  },
];
  return (
    <section className="section" id="products">
      <div className="products-header">
        <div>
          <div className="section-label">Hardware</div>
          <h2 className="section-heading">
            Made in India.<br />
            <span style={{ color: "var(--accent)" }}>Built for classrooms.</span>
          </h2>
        </div>
        <Link to="/products" className="btn btn-secondary">View All Products &rarr;</Link>
      </div>
      <div className="products-grid">
        {PRODUCTS.map((p) => (
          <Link to="/products" className="product-card" key={p.name}>
            <div className="product-img">
              {p.image && <img
  src={p.image}
  alt={p.name}
  loading="lazy"
/>}
              <span className="product-label">{p.label}</span>
            </div>
            <div className="product-body">
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="product-tags">
                {p.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── Packages Preview ─────────────────────────────────── */
function Packages() {
  const TIERS = [
    {
      tier: "TIER 01", name: "Starter Lab", price: "₹2.5L", period: "one-time", featured: false,
      features: [
        { text: "ARC Labs IoT Lite Kit (15 units)", hi: false },
        { text: "NEP 2020 aligned curriculum — Level 1", hi: false },
        { text: "2-day teacher onsite training", hi: false },
        { text: "Lab branding & installation", hi: false },
        { text: "6-month support contract", hi: false },
        { text: "Digital student workbooks", hi: true },
      ],
    },
    {
      tier: "TIER 02", name: "Standard Lab", price: "₹5L", period: "one-time", featured: true,
      features: [
        { text: "ARC Labs IoT Pro Kit (20 units)", hi: false },
        { text: "Full curriculum — Levels 1 & 2", hi: false },
        { text: "3-day teacher certification program", hi: false },
        { text: "Complete lab installation & branding", hi: false },
        { text: "Annual support + curriculum updates", hi: true },
        { text: "Student assessment portal access", hi: true },
      ],
    },
    {
      tier: "TIER 03", name: "Premier Lab", price: "₹10L+", period: "custom", featured: false,
      features: [
        { text: "Full IoRT + AI lab — custom design", hi: false },
        { text: "Robotics + AI + IoT complete stack", hi: false },
        { text: "5-day teacher certification", hi: false },
        { text: "Priority installation & dedicated support", hi: false },
        { text: "CSR impact reporting & documentation", hi: true },
        { text: "Co-branded lab with ARC LABS", hi: true },
      ],
    },
  ];
  return (
    <section className="section packages-section" id="packages">
      <div className="section-label">Lab Packages</div>
      <h2 className="section-heading">
        Clear packages.<br />
        <span style={{ color: "var(--accent)" }}>No custom quoting.</span>
      </h2>
      <p className="section-desc">Three fixed tiers. Every tier includes hardware, curriculum, training, and support.</p>
      <div className="packages-grid">
        {TIERS.map((t) => (
          <div className={`package-card${t.featured ? " featured" : ""}`} key={t.name}>
            <div className="package-tier">{t.tier}</div>
            <h3>{t.name}</h3>
            <div className="package-price">{t.price} <span>/ {t.period}</span></div>
            <ul className="package-features">
              {t.features.map((f) => <li className={f.hi ? "hi" : ""} key={f.text}>{f.text}</li>)}
            </ul>
            <Link to="/lab-packages" className={`btn ${t.featured ? "btn-primary" : "btn-secondary"}`} style={{ width: "100%", justifyContent: "center" }}>
              Get This Package &rarr;
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CSR Section ──────────────────────────────────────── */
function CSR() {
  const METRICS = [
    { val: "₹800",   label: "Min. cost per beneficiary" },
    { val: "3 Yrs",  label: "Outcome tracking" },
    { val: "Sch VII",label: "Companies Act eligible" },
    { val: "100%",   label: "Documentation provided" },
  ];
  const CHECKLIST = [
    "Complete lab setup funded by CSR allocation",
    "Impact documentation for annual CSR reports",
    "Cost per beneficiary from ₹800–₹2,000",
    "Eligible under Schedule VII — Education clause",
    "3-year outcome tracking available",
  ];
  return (
    <section className="section csr-section" id="csr">
      <div className="csr-inner">
        <div>
          <div className="section-label">CSR Partners</div>
          <h2 className="section-heading">
            Turn your CSR budget into<br />
            <span style={{ color: "var(--accent)" }}>measurable impact.</span>
          </h2>
          <p className="section-desc" style={{ marginBottom: "2rem" }}>
            ARC LABS delivers CSR-funded lab implementations with full documentation aligned with Schedule VII of the Companies Act.
          </p>
          <ul className="csr-checklist">{CHECKLIST.map((item) => <li key={item}>{item}</li>)}</ul>
          <Link to="/csr-partners" className="btn btn-primary">Discuss CSR Partnership &rarr;</Link>
        </div>
        <div className="csr-metrics-grid">
          {METRICS.map((m) => (
            <div className="csr-metric" key={m.label}>
              <div className="csr-metric-val">{m.val}</div>
              <div className="csr-metric-label">{m.label}</div>
            </div>
          ))}
          <div className="csr-metric csr-wide">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "var(--accent)", marginBottom: "6px", letterSpacing: "0.06em" }}>LISTED ON</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-3)", lineHeight: 1.7 }}>
              CSR Box &middot; GiveIndia Corporate &middot; Sattva Platform<br />
              <span style={{ color: "var(--text)", fontWeight: 600 }}>ARC LABS is listed on all major CSR platforms.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─────────────────────────────────────── */
function Testimonials() {
  const TESTIMONIALS = [
    { stars: 5, text: "The IoRT lab setup at our school was seamless. Students are building real projects from week two. The teacher training made our faculty genuinely confident.", author: "Principal, CBSE School", role: "Hyderabad, Telangana" },
    { stars: 5, text: "ARC LABS delivered a complete IoT training module for our engineering students. Industry-relevant, practical, and very well structured.", author: "HOD, Electronics Dept.", role: "Engineering College, Vijayawada" },
    { stars: 5, text: "Our CSR funding for STEM labs was perfectly executed by ARC LABS. The impact documentation made our board reporting straightforward.", author: "CSR Head", role: "Manufacturing Company, Hyderabad" },
  ];
  return (
    <section className="section">
      <div className="section-label">Impact</div>
      <h2 className="section-heading">What institutions say about <span style={{ color: "var(--accent)" }}>ARC LABS.</span></h2>
      <div className="testimonials-grid">
        {TESTIMONIALS.map((t) => (
          <div className="tcard" key={t.author}>
            <div className="tcard-stars">{"★".repeat(t.stars)}</div>
            <p className="tcard-text">{t.text}</p>
            <div className="tcard-author">{t.author}</div>
            <div className="tcard-role">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeFAQ() {
  return (
    <section className="section home-faq-section" id="faq">
      <div className="section-label">FAQ</div>
      <h2 className="section-heading">
        Clear answers for schools, colleges and CSR teams.
      </h2>
      <div className="home-faq-grid">
        {HOME_FAQS.map((item) => (
          <article className="home-faq-card" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA ──────────────────────────────────────────────── */
function CTASection() {
  return (
    <div className="cta-section" id="contact">
      <h2>Ready to build your lab?<br /><span style={{ color: "var(--accent)" }}>Let's talk.</span></h2>
      <p>Schools, colleges, CSR officers — reach out. We respond within 24 hours.</p>
      <div className="cta-buttons">
        <a href="tel:+917815809412" className="btn btn-primary">+91 78158 09412</a>
        <a href="mailto:hello@arclabs.in" className="btn btn-secondary">hello@arclabs.in</a>
        <a href="https://wa.me/917815809412" className="btn btn-secondary" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
      <p className="cta-address">
        PLOTNO : 1EP, BRINDAVAN MEADOWS, SAHEBNAGAR KALAN, Hyderabad &ndash; 501510 &middot; GST &amp; MSME Registered
      </p>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export default function Home() {
  useEffect(() => { document.title = "ARC LABS — AI, IoT & Robotics Labs for Schools and Colleges"; }, []);
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>ARC LABS - AI, IoT &amp; Robotics Lab Setup for Schools and Colleges</title>
        <meta
          name="description"
          content="ARC LABS is a Hyderabad-based STEM lab implementation company for AI, IoT, Robotics, and Industrial IoT labs. Hardware kits, curriculum, teacher training, certification, and support for schools, colleges, and CSR partners across India."
        />
        <link rel="canonical" href="https://arclabs.in/" />
        <meta property="og:url" content="https://arclabs.in/" />
        <meta property="og:title" content="ARC LABS - AI, IoT & Robotics Lab Setup" />
        <meta
          property="og:description"
          content="Hyderabad-based AI, IoT, Robotics, and Industrial IoT lab setup partner for schools, colleges, and CSR programs across India."
        />
        <script type="application/ld+json">
          {JSON.stringify(homeSchema)}
        </script>
      </Helmet>
      <Hero />
      <AIReadyIntro />
      <section className="section spline-showcase-section" aria-label="Interactive 3D STEM lab preview">
        <SplineSceneBasic />
      </section>
      <TrustBar />
      <Services />
      <StatsBand />
      <ProductsPreview />
      <Packages />
      <CSR />
      <Testimonials />
      <HomeFAQ />
      <CTASection />
    </>
  );
}
