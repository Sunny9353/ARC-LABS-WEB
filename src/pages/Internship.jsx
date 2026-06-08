import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../styles/Internship.css";
import { DetailPanel, pageStyles } from "./Programs.jsx";
import {
  INTERNSHIP_TECHNOLOGIES as INTERNSHIP_TECHS,
  INTERNSHIP_DURATIONS,
} from "../data/internshipCurriculum.js";

export default function Internship() {
  const [activeTech, setActiveTech] = useState(null);

  const handleTechClick = (tech) => {
    setActiveTech((prev) => (prev?.id === tech.id ? null : tech));
  };

  return (
    <>
      <Helmet>
        <title>Internship Programs - ARC LABS</title>
        <meta
          name="description"
          content="ARC LABS project-based internships in IoT, embedded systems, robotics, AI and industrial IoT — 2-3, 3-4 and 4-5 week tracks with a week-by-week curriculum and certification."
        />
      </Helmet>
      <style>{pageStyles}</style>

      {/* Hero */}
      <section className="internship-hero">
        <div className="internship-kicker">ARC LABS Internships</div>
        <h1>Project-based internships for practical engineering skills.</h1>
        <p>
          Students learn by building real hardware, software, and cloud-connected
          projects under ARC LABS mentorship — structured week by week, ending in a
          capstone project and certificate.
        </p>
      </section>

      {/* Track grid (same list style as the Programs page) */}
      <div className="tech-section">
        <div className="section-label">Internship Tracks</div>
        <h2 className="section-heading">
          Choose your track.
          <br />
          See the internship plan.
        </h2>
        <p className="sec-sub">
          Click any track to expand the full curriculum — choose a 2-3 week, 3-4
          week, or 4-5 week internship.
        </p>

        <div className="tech-grid">
          {INTERNSHIP_TECHS.map((tech) => (
            <div
              key={tech.id}
              className={`tech-card${activeTech?.id === tech.id ? " active" : ""}`}
              style={{ "--tc-color": tech.color }}
              onClick={() => handleTechClick(tech)}
            >
              <div className="tc-top">
                <div
                  className="tc-icon"
                  style={{ background: tech.iconBg, color: tech.color }}
                >
                  {tech.iconLabel}
                </div>
                <span
                  className="tc-level"
                  style={{ background: tech.levelBg, color: tech.levelColor }}
                >
                  {tech.level}
                </span>
              </div>
              <h3>
                {tech.abbr} — {tech.name}
              </h3>
              <p>{tech.desc}</p>
              <div className="tc-tools">
                {tech.tools.slice(0, 4).map((t) => (
                  <span className="tc-tool" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="tc-cta">
                {activeTech?.id === tech.id ? "Close curriculum" : "View curriculum"}{" "}
                <span style={{ fontSize: "0.9rem" }}>&rarr;</span>
              </div>
            </div>
          ))}
        </div>

        {activeTech && (
          <DetailPanel
            key={activeTech.id}
            tech={activeTech}
            durationOptions={INTERNSHIP_DURATIONS}
            onClose={() => setActiveTech(null)}
          />
        )}
      </div>
    </>
  );
}
