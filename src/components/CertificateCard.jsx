import {
  getTechObj,
  getDurLabel,
  getHours,
  fmtDate,
} from "../utils/certificationHelpers.js";

export default function CertCard({ cert }) {
  if (!cert) return null; // ✅ safety

  const tech = getTechObj(cert.technology || "");

  return (
    <div className="dcert">
      <div className="dc-wm">ARC LABS</div>
      <div className="dcert-topbar" />
      <div className="dcert-inner">

        {/* Header */}
        <div className="dc-hd">
          <div className="dc-brand">
            <div className="dc-brand-dot" />
            <div>
              <div className="dc-brand-name">ARC LABS</div>
              <div className="dc-brand-tag">
                MSME REGISTERED · HYDERABAD, INDIA
              </div>
            </div>
          </div>
          <div className="dc-id-chip">
            #{cert.certId || "N/A"}
          </div>
        </div>

        {/* Name */}
        <div className="dc-center">
          <div className="dc-certifies">This is to certify that</div>
          <div className="dc-name">{cert.fullName || "N/A"}</div>
          <div className="dc-completed">
            has successfully completed the{" "}
            <strong>
              {getDurLabel(cert.durationDays || 0)} in {tech.label}
            </strong>
          </div>
        </div>

        {/* Program */}
        <div className="dc-prog">
          <div className="dc-prog-lbl">Program Completed</div>
          <div className="dc-prog-name">
            {tech.icon} {tech.label}
          </div>
          <div className="dc-prog-sub">
            {getDurLabel(cert.durationDays || 0)}
          </div>
        </div>

        {/* Details */}
        <div className="dc-grid">
          {[
            { k: "Student Name", v: cert.fullName || "N/A" },
            { k: "Phone Number", v: cert.phone || "-" },
            { k: "Institution", v: cert.institution || "-" },
            {
              k: "Institution Type",
              v:
                cert.institutionType
                  ? cert.institutionType.charAt(0).toUpperCase() +
                    cert.institutionType.slice(1)
                  : "-",
            },
            { k: "Training Date", v: fmtDate(cert.trainingDate) },
            { k: "Certificate Issued", v: fmtDate(cert.issueDate) },
            { k: "City / State", v: `${cert.city || "-"}, ${cert.state || "-"}` },
            { k: "PIN Code", v: cert.pincode || "-" },
            { k: "Technology", v: cert.technology || "-" },
            {
              k: "Duration",
              v: `${cert.durationDays || 0} Days (${getHours(cert.durationDays || 0)})`,
            },
            { k: "Certificate Type", v: cert.performance || "-" },
            { k: "Trainer", v: cert.trainer || "ARC LABS Trainer" },
            { k: "Certificate Status", v: "✓ ACTIVE & VERIFIED" },
          ].map((d) => (
            <div className="dc-cell" key={d.k}>
              <div className="dc-cell-k">{d.k}</div>
              <div className="dc-cell-v">{d.v}</div>
            </div>
          ))}
        </div>

        {/* Skills (FIXED) */}
        <div className="dc-skills">
          <div className="dc-skills-lbl">
            Skills & Competencies Demonstrated
          </div>
          <div className="dc-chips">
            {(cert.skills || []).length > 0 ? (
              cert.skills.map((s, i) => (
                <span key={s} className={`dc-chip${i < 2 ? " hi" : ""}`}>
                  {s}
                </span>
              ))
            ) : (
              <span>No skills data</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}