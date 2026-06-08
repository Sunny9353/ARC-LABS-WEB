import {
  getTech,
  getDurationLabel,
  getTrainingHours,
} from "../utils/certificationHelpers.js";

export default function CertificateDisplay({ cert }) {
  if (!cert) return null; // ✅ safety

  const tech = getTech(cert.technology || "");

  return (
    <div className="digital-cert">

      <div className="dc-inner">

        {/* Header */}
        <div className="dc-header">
          <div className="dc-brand">
            <div className="dc-brand-dot" />
            <div>
              <div className="dc-brand-name">ARC LABS</div>
            </div>
          </div>

          <div className="dc-cert-id-chip">
            #{cert.certId || "N/A"}
          </div>
        </div>

        {/* Name */}
        <div className="dc-center">
          <div className="dc-name">{cert.fullName || "N/A"}</div>
          <div>
            {getDurationLabel(cert.durationDays || 0)} in {tech.label}
          </div>
        </div>

        {/* Details */}
        <div className="dc-details-grid">
          {[
            { key: "Student Name", val: cert.fullName || "N/A" },
            { key: "Roll / Registration No", val: cert.rollNo || cert.rollKey || "-" },
            { key: "Workshop / Session", val: cert.workshopCode || cert.workshopKey || "-" },
            { key: "Institution", val: cert.institution || "-" },
            { key: "Technology", val: cert.technology || "-" },
            {
              key: "Duration",
              val: `${cert.durationDays || 0} Days (${getTrainingHours(cert.durationDays || 0)})`,
            },
          ].map((d) => (
            <div key={d.key}>
              <strong>{d.key}:</strong> {d.val}
            </div>
          ))}
        </div>

        {/* Skills (FIXED) */}
        <div className="dc-skills-section">
          <div>Skills</div>
          <div className="dc-chips">
            {(cert.skills || []).length > 0 ? (
              cert.skills.map((skill) => (
                <span key={skill} className="dc-chip">
                  {skill}
                </span>
              ))
            ) : (
              <span>No skills available</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
