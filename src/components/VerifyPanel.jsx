import { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import CertificateDisplay from "./CertificateDisplay";
import { downloadCertificatePdf } from "../utils/generateCertificate.js";
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

  const doVerify = async (id) => {
    const sid = (id || q).trim().toUpperCase();
    if (!sid) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const cert = await getCertificateByCertificateId(sid);
      const finalData = cert || await getCertificateByRollNo(sid);

      if (finalData) {
        setResult(finalData);
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

      {result && (
        <div style={{ animation: "fadein .4s ease" }}>
          <div className="vsuccess-badge">
            <span className="vsb-icon">OK</span>
            <div className="vsb-text">
              <strong>Certificate Verified - Authentic & Active</strong>
              <span>
                Issued by ARC LABS - Certificate ID:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: ".05em",
                    color: "var(--accent)",
                  }}
                >
                  {result.certId}
                </span>
              </span>
            </div>
          </div>

          <CertificateDisplay cert={result} />

          <div className="cert-acts" style={{ marginTop: "1rem" }}>
            <button
              className="btn-act primary"
              onClick={() => downloadCertificatePdf(result)}
            >
              Download Certificate
            </button>

            <button className="btn-act ghost" onClick={copy}>
              Copy Certificate ID
            </button>

            <a
              className="btn-act ghost"
              href={`https://wa.me/?text=My ARC LABS Certificate: ${result.certId} - Verify at arclabs.in/verify`}
              target="_blank"
              rel="noreferrer"
            >
              Share
            </a>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
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
