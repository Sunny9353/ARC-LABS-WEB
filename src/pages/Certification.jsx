import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../styles/Certification.css";
import VerifyPanel from "../components/VerifyPanel";
import RegisterPanel from "../components/RegisterPanel";
import EligibleStudentUploadPanel from "../components/EligibleStudentUploadPanel";

export default function CertificationPage() {
  const [tab, setTab] = useState("verify");

  const handleVerified = () => {};

  return (
    <>
      <Helmet>
        <title>Verify Certificate — ARC LABS IoT &amp; Robotics Certification</title>
        <meta name="description" content="Verify your ARC LABS certificate or register for a new certification in IoT, AI, or Robotics. Instant verification for employers and institutions." />
        <link rel="canonical" href="https://arclabs.in/verify" />
        <meta property="og:url" content="https://arclabs.in/verify" />
        <meta property="og:title" content="Verify Certificate — ARC LABS" />
        <meta property="og:description" content="Verify your ARC LABS certification in IoT, AI, or Robotics. Instant verification." />
      </Helmet>
      {/* HERO */}
      <div className="cert-hero">
        <div className="cert-tag">
          <span className="cert-tag-dot" />
          Official Certification Registry · ARC LABS
        </div>
        <h1>
          Verify or Register
          <br />
          your <em>ARC LABS Certificate.</em>
        </h1>
        <p>
          Verify any certificate instantly, or register your training to receive
          a unique Certificate ID.
        </p>
      </div>

      {/* TABS */}
      <div className="mtabs">
        <button
          className={`mtab${tab === "verify" ? " active" : ""}`}
          onClick={() => setTab("verify")}
        >
          Verify Certificate
        </button>

        <button
          className={`mtab${tab === "register" ? " active" : ""}`}
          onClick={() => setTab("register")}
        >
          Register Certificate
        </button>

        <button
          className={`mtab${tab === "upload" ? " active" : ""}`}
          onClick={() => setTab("upload")}
        >
          Upload Paid Students
        </button>
      </div>

      {/* CONTENT */}
      <div className="vcontent">
        {tab === "verify" && (
          <VerifyPanel onSuccess={handleVerified} />
        )}

        {tab === "register" && (
          <RegisterPanel onRegistered={handleVerified} />
        )}

        {tab === "upload" && (
          <EligibleStudentUploadPanel />
        )}
      </div>
    </>
  );
}
