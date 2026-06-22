import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import "./styles/global.css";
import "./styles/App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ArcLabsChatBot from "./components/ArcLabsChatBot";
import { ThemeDock } from "./components/ui/docks";

// Pages — lazy-loaded
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Programs = lazy(() => import("./pages/Programs"));
const Products = lazy(() => import("./pages/Products"));
const LabPackages = lazy(() => import("./pages/LabPackages"));
const CSRPartners = lazy(() => import("./pages/CSRPartners"));
const Certification = lazy(() => import("./pages/Certification"));
const Checkout = lazy(() => import("./pages/Checkout"));
const IndustrialIoTSolutions = lazy(() => import("./pages/IndustrialIoTSolutions"));
const Internship = lazy(() => import("./pages/Internship"));
const LegalPage = lazy(() => import("./pages/LegalPage"));

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
      Loading
    </div>
  );
}

/* WhatsApp SVG icon */
const WaIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function Layout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const selectors = [
      ".section",
      ".about-section",
      ".about-hero",
      ".tech-section",
      ".internship-hero",
      ".prog-hero",
      ".prog-bottom-cta",
      ".products-wrap",
      ".ph-hero",
      ".filter-bar",
      ".compare-section",
      ".pcta-section",
      ".checkout-section",
      ".not-found",
      ".iiot-page section",
      ".gsap-reveal",
    ].join(",");

    let observer;
    const timers = [];

    const attachReveal = () => {
      observer?.disconnect();

      const elements = Array.from(document.querySelectorAll(selectors)).filter(
        (element) => !element.classList.contains("reveal-ignore")
      );

      if (!elements.length) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
      }

      elements.forEach((element) => element.classList.add("scroll-reveal"));

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
      );

      elements.forEach((element) => observer.observe(element));
    };

    attachReveal();
    timers.push(window.setTimeout(attachReveal, 120));
    timers.push(window.setTimeout(attachReveal, 520));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer?.disconnect();
    };
  }, [pathname]);

  return (
    <div className={`app-shell${isHome ? " home-intro-shell" : ""}`}>
      <Navbar />
      <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      <Footer />
      <ThemeDock />
      <ArcLabsChatBot />
      <a
        href="https://wa.me/917815809412"
        className="wa-float"
        target="_blank"
        rel="noreferrer"
        title="WhatsApp ARC LABS"
      >
        <WaIcon />
      </a>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <ScrollReset />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/industrial-iot-solutions" element={<IndustrialIoTSolutions />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/products" element={<Products />} />
            <Route path="/lab-packages" element={<LabPackages />} />
            <Route path="/csr-partners" element={<CSRPartners />} />
            <Route path="/verify" element={<Certification />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/refunds" element={<LegalPage type="refunds" />} />
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404</h1>
                  <p>This page doesn't exist.</p>
                  <a href="/" className="btn btn-primary">
                    Back to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
    </HelmetProvider>
  );
}
