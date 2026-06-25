import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import "../styles/Navbar.css";

const THEME_STORAGE_KEY = "arclabs_theme";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/about-us", label: "About Us" },
  { path: "/industrial-iot-solutions", label: "IIoT Solutions" },
  { path: "/programs", label: "Programs" },
  { path: "/products", label: "Products" },
  { path: "/lab-packages", label: "Lab Packages" },
  { path: "/csr-partners", label: "CSR" },
  { path: "/verify", label: "Verify" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  });
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themeMode = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const linkStateFor = (path) =>
    path === "/" && location.pathname !== "/" ? { skipHomeIntro: true } : undefined;
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}${isHome ? " home-intro" : ""}`}>
        <Link to="/" state={linkStateFor("/")} className="navbar-logo">
          <img src="/images/brand/arc-labs-logo-transparent.png" alt="ARC LABS" />
        </Link>

        <ul className="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.path} className="nav-item">
              <Link
                to={link.path}
                state={linkStateFor(link.path)}
                className={location.pathname === link.path ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/lab-packages" className="nav-cta">
              Get Started
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="nav-theme-toggle"
              onClick={() => setTheme(nextTheme)}
              aria-label={`Switch to ${nextTheme} mode`}
              title={`Switch to ${nextTheme} mode`}
            >
              <ThemeIcon aria-hidden="true" />
            </button>
          </li>
        </ul>

        <div className="navbar-mobile-actions">
          <button
            type="button"
            className="nav-theme-toggle nav-theme-toggle-compact"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            <ThemeIcon aria-hidden="true" />
          </button>
          <button
            className="navbar-burger"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div className={`navbar-mobile${mobileOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            state={linkStateFor(link.path)}
            className={location.pathname === link.path ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/lab-packages"
          className={`nav-cta${location.pathname === "/lab-packages" ? " active" : ""}`}
          style={{ textAlign: "center", marginTop: 4 }}
        >
          Get Started
        </Link>
      </div>
    </>
  );
}
