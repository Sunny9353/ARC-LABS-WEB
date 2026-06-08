import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const NAV_LINKS = [
  { path: "/",             label: "Home" },
  { path: "/about-us",     label: "About Us" },
  { path: "/industrial-iot-solutions", label: "IIoT Solutions" },
  {
    path: "/programs",
    label: "Programs",
    children: [
      { path: "/internship", label: "Internship" },
    ],
  },
  { path: "/products",     label: "Products" },
  { path: "/lab-packages", label: "Lab Packages" },
  { path: "/csr-partners", label: "CSR" },
  { path: "/verify",       label: "Verify" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <Link to="/" className="navbar-logo">
          <span className="logo-dot" />
          ARC LABS
        </Link>

        <ul className="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.path} className={link.children ? "nav-item has-dropdown" : "nav-item"}>
              <Link
                to={link.path}
                className={
                  location.pathname === link.path ||
                  link.children?.some((child) => child.path === location.pathname)
                    ? "active"
                    : ""
                }
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="nav-dropdown">
                  {link.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={location.pathname === child.path ? "active" : ""}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          ))}
          <li>
            <Link to="/lab-packages" className="nav-cta">
              Get Started
            </Link>
          </li>
        </ul>

        <button
          className="navbar-burger"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      <div className={`navbar-mobile${mobileOpen ? " open" : ""}`}>
        {NAV_LINKS.map((link) => (
          link.children ? (
            <div className="navbar-mobile-group" key={link.path}>
              <Link to={link.path}>{link.label}</Link>
              {link.children.map((child) => (
                <Link key={child.path} to={child.path} className="navbar-mobile-sub">
                  {child.label}
                </Link>
              ))}
            </div>
          ) : (
            <Link key={link.path} to={link.path}>
              {link.label}
            </Link>
          )
        ))}
        <Link to="/lab-packages" className="nav-cta" style={{ textAlign: "center", marginTop: 4 }}>
          Get Started
        </Link>
      </div>
    </>
  );
}
