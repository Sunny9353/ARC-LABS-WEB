import { Link } from "react-router-dom";
import "../styles/Footer.css";

const LINKS = {
  Programs: [
    { label: "School Lab Setup",      to: "/lab-packages" },
    { label: "College Training",      to: "/programs" },
    { label: "Online Internships",    to: "/internship" },
    { label: "Teacher Certification", to: "/programs" },
  ],
  Company: [
    { label: "About Us",     to: "/about-us" },
    { label: "IIoT Solutions", to: "/industrial-iot-solutions" },
    { label: "CSR Partners", to: "/csr-partners" },
    { label: "Products",     to: "/products" },
    { label: "Verify Cert",  to: "/verify" },
  ],
  Contact: [
    { label: "+91 78158 09412",  to: "tel:+917815809412" },
    { label: "+91 40 3565 9806", to: "tel:+914035659806" },
    { label: "hello@arclabs.in", to: "mailto:hello@arclabs.in" },
    { label: "sales@arclabs.in", to: "mailto:sales@arclabs.in" },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "var(--text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                background: "var(--accent)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            ARC LABS
          </Link>
          <p className="footer-brand-desc">
            India's practical AI, IoT & Robotics lab system for schools and
            colleges. Designed, built & delivered from Hyderabad.
          </p>
          <div className="footer-msme">MSME Registered &middot; Made in India</div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading} className="footer-col">
            <h4>{heading}</h4>
            {items.map((item) =>
              item.to.startsWith("tel:") || item.to.startsWith("mailto:") ? (
                <a key={item.label} href={item.to}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} to={item.to}>
                  {item.label}
                </Link>
              ),
            )}
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <span>
          &copy; {new Date().getFullYear()} ARC LABS &middot; Hyderabad, India
        </span>

        <div className="footer-social">
          {[
            { label: "Li", href: "https://www.linkedin.com/company/arclabs-india" },
            { label: "Yt", href: "https://www.youtube.com/@arclabs" },
            { label: "Ig", href: "https://www.instagram.com/arclabs.in" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="social-btn"
              target="_blank"
              rel="noreferrer"
              aria-label={s.label === "Li" ? "LinkedIn" : s.label === "Yt" ? "YouTube" : "Instagram"}
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="footer-legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refunds">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
