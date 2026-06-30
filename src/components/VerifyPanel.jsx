import { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import { downloadCertificatePdf } from "../utils/generateCertificate.js";
import {
  getTech,
  getDurationLabel,
  getTrainingHours,
} from "../utils/certificationHelpers.js";
import {
  ELIGIBLE_STUDENTS_COLLECTION,
  ELIGIBLE_REGISTRATIONS_COLLECTION,
  normalizeRollNumber,
} from "../utils/certificateEligibility.js";

export default function VerifyPanel({ onSuccess }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const doVerify = async (id) => {
    const sid = (id || q).trim().toUpperCase();
    if (!sid) return;

    setLoading(true);
    setError("");
    setResult(null);
    setShowResultModal(false);

    try {
      const cert = await getCertificateByCertificateId(sid);
      const finalData = cert || await getCertificateByRollNo(sid);

      if (finalData) {
        setResult(finalData);
        setShowResultModal(true);
        onSuccess && onSuccess(finalData);
      } else {
        setError(
          `No certificate found for "${sid}". Check the Certificate ID or roll/registration number and try again.`
        );
      }
    } catch (err) {
      console.log(err);
      setError("Database connection error. Please try again.");
    }

    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result?.certId || "").catch(() => {});
    setToast("Certificate ID copied!");
    setTimeout(() => setToast(""), 2000);
  };

  const downloadVerifiedCertificate = async () => {
    if (!result) return;

    setDownloading(true);
    setToast("");
    try {
      await downloadCertificatePdf(result);
    } catch (err) {
      console.error(err);
      setToast("Certificate download failed. Please try again.");
      setTimeout(() => setToast(""), 3000);
    }
    setDownloading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>
      <div className="vcard">
        <div className="vcard-eye">Certificate Verification</div>
        <div className="vcard-title">Verify Authenticity</div>
        <div className="vcard-sub">
          Enter an ARC LABS Certificate ID. For roll-based lookup across multiple workshops, use ROLL_SESSIONCODE.
        </div>

        <div className="srow">
          <input
            className="cert-inp"
            placeholder="Certificate ID or ROLL_SESSIONCODE"
            value={q}
            maxLength={40}
            onChange={(e) => setQ(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && doVerify()}
          />

          <button
            className="btn-v"
            onClick={() => doVerify()}
            disabled={loading || !q.trim()}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>

      {error && <div className="verr">{error}</div>}

      {result && showResultModal && (
        <VerifiedCertificateModal
          cert={result}
          downloading={downloading}
          onClose={() => setShowResultModal(false)}
          onCopy={copy}
          onDownload={downloadVerifiedCertificate}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function VerifiedCertificateModal({ cert, downloading, onClose, onCopy, onDownload }) {
  const tech = getTech(cert.technology || "");
  const rows = [
    { label: "Student Name", value: cert.fullName || "N/A" },
    { label: "Roll/Reg No", value: cert.rollNo || cert.rollKey || "-" },
    { label: "Workshop / Session", value: cert.workshopCode || cert.workshopKey || "-" },
    { label: "Institution", value: cert.institution || "-" },
    { label: "Technology", value: cert.technology || "-" },
    {
      label: "Duration",
      value: `${cert.durationDays || 0} Days (${getTrainingHours(cert.durationDays || 0)})`,
    },
  ];

  return (
    <div className="verify-result-backdrop" role="dialog" aria-modal="true" aria-labelledby="verify-result-title">
      <div className="verify-result-modal">
        <button className="verify-result-close" type="button" onClick={onClose} aria-label="Close verified certificate details">
          &#x2715;
        </button>

        <div className="verify-result-brand">
          <img src="/images/brand/arc-labs-logo-transparent.png" alt="ARC LABS" />
        </div>

        <div className="verify-result-status">
          <span className="verify-result-ok">OK</span>
          <div>
            <strong>Certificate Verified - Authentic & Active</strong>
            <span>Issued by ARC LABS - Certificate ID: <b>{cert.certId}</b></span>
          </div>
        </div>

        <div className="verify-result-head">
          <h2 id="verify-result-title">{cert.fullName || "N/A"}</h2>
          <p>{getDurationLabel(cert.durationDays || 0)} in {tech.label}</p>
        </div>

        <div className="verify-result-table">
          {rows.map((row) => (
            <div className="verify-result-row" key={row.label}>
              <div className="verify-result-label">{row.label}</div>
              <div className="verify-result-value">{row.value}</div>
            </div>
          ))}
        </div>

        {(cert.skills || []).length > 0 && (
          <div className="verify-result-skills">
            <div className="verify-result-skills-label">Skills</div>
            <div className="dc-chips">
              {cert.skills.map((skill) => (
                <span key={skill} className="dc-chip">{skill}</span>
              ))}
            </div>
          </div>
        )}

        <div className="verify-result-actions">
          <button className="btn-act ghost" type="button" onClick={onCopy}>
            Copy Certificate ID
          </button>
          <a
            className="btn-act ghost"
            href={`https://wa.me/?text=My ARC LABS Certificate: ${cert.certId} - Verify at arclabs.in/verify`}
            target="_blank"
            rel="noreferrer"
          >
            Share
          </a>
          <button
            className="btn-act primary verify-result-download"
            type="button"
            onClick={onDownload}
            disabled={downloading}
          >
            {downloading ? "Preparing..." : "Download Certificate"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function getCertificateByCertificateId(certId) {
  const ref = doc(db, "certificates", certId);
  const snap = await getDoc(ref);
  return snap.exists() ? { certId, ...snap.data() } : null;
}

async function getCertificateByRollNo(value) {
  const raw = String(value || "").trim().toUpperCase();
  const [rollPart, ...sessionParts] = raw.split("_");
  const rollKey = normalizeRollNumber(rollPart);
  const sessionKey = sessionParts.join("_").replace(/[^A-Z0-9-]/g, "");

  if (!rollKey) return null;

  const collectionName = sessionKey
    ? ELIGIBLE_REGISTRATIONS_COLLECTION
    : ELIGIBLE_STUDENTS_COLLECTION;
  const docId = sessionKey ? `${rollKey}_${sessionKey}` : rollKey;
  const eligibleRef = doc(db, collectionName, docId);
  const eligibleSnap = await getDoc(eligibleRef);

  if (!eligibleSnap.exists()) return null;

  const certificateId = eligibleSnap.data().certificateId;
  if (!certificateId) return null;

  return getCertificateByCertificateId(certificateId);
}
