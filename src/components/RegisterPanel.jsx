import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import {
  generateCertId,
  fetchPincode,
  getSkillsForCert,
} from "../utils/certificationHelpers.js";

import {
  TECHNOLOGIES,
  DURATION_OPTIONS,
  INDIAN_STATES,
} from "../data/certificationConstants.js";

import {
  ELIGIBLE_REGISTRATIONS_COLLECTION,
  isPaidStudent,
  makeEligibilityId,
  normalizeRollNumber,
  normalizeWorkshopCode,
} from "../utils/certificateEligibility.js";

export default function RegisterPanel({ onRegistered }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState("");
  const [error, setError] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePin = async (val) => {
    const pin = val.replace(/\D/g, "").slice(0, 6);
    set("pincode", pin);

    if (pin.length === 6) {
      const res = await fetchPincode(pin);
      if (res) {
        set("city", res.city);
        set("state", res.state);
      }
    }
  };

  const applyEligibleDefaults = (student) => {
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || student.fullName || "",
      phone: prev.phone || student.phone || "",
      institution: prev.institution || student.institution || "",
      institutionType: prev.institutionType || student.institutionType || "",
      technology: prev.technology || student.technology || "",
      durationDays: prev.durationDays || student.durationDays || "",
      trainingDate: prev.trainingDate || student.trainingDate || "",
      workshopCode: prev.workshopCode || student.workshopCode || "",
    }));
  };

  const submit = async () => {
    const rollKey = normalizeRollNumber(form.rollNo);
    const workshopKey = normalizeWorkshopCode(form.workshopCode);

    if (!rollKey) {
      setError("Enter your roll number / registration number to check certificate eligibility.");
      return;
    }

    if (!workshopKey) {
      setError("Enter the workshop/session code shared by ARC LABS for this training.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessId("");

    try {
      const eligibilityId = makeEligibilityId(rollKey, workshopKey);
      const eligibleRef = doc(db, ELIGIBLE_REGISTRATIONS_COLLECTION, eligibilityId);
      const eligibleSnap = await getDoc(eligibleRef);

      if (!eligibleSnap.exists()) {
        setError(
          "Your roll/registration number was not found for this workshop/session. Check the workshop code or contact the ARC LABS coordinator."
        );
        setLoading(false);
        return;
      }

      const eligibleStudent = eligibleSnap.data();
      applyEligibleDefaults(eligibleStudent);

      if (!isPaidStudent(eligibleStudent)) {
        setError(
          "This roll/registration number is not marked as paid yet. Certificate registration is available only after fee payment is confirmed."
        );
        setLoading(false);
        return;
      }

      if (eligibleStudent.certificateId) {
        setError(
          `A certificate is already registered for this roll/registration number. Certificate ID: ${eligibleStudent.certificateId}`
        );
        setLoading(false);
        return;
      }

      const certId = generateCertId();
      const durationDays = parseInt(form.durationDays || eligibleStudent.durationDays || 0, 10);
      const technology = form.technology || eligibleStudent.technology || "";
      const cert = {
        ...eligibleStudent,
        ...form,
        rollNo: form.rollNo || eligibleStudent.rollNo || rollKey,
        rollKey,
        workshopCode: form.workshopCode || eligibleStudent.workshopCode || workshopKey,
        workshopKey,
        certId,
        technology,
        durationDays,
        skills: getSkillsForCert(technology, durationDays),
        issueDate: new Date().toISOString().split("T")[0],
        eligibleStudentId: eligibilityId,
      };

      await setDoc(doc(db, "certificates", certId), cert);
      await updateDoc(eligibleRef, {
        certificateId: certId,
        certificateRegisteredAt: new Date().toISOString(),
      });

      setSuccessId(certId);
      onRegistered && onRegistered(cert);
    } catch (err) {
      console.error("Firebase Error:", err);
      setError(err.message || "Certificate registration failed. Please try again.");
    }

    setLoading(false);
  };

  const fields = [
    {
      label: "Roll / Registration Number",
      placeholder: "Enter roll or registration number",
      field: (
        <input
          className="cert-inp"
          value={form.rollNo || ""}
          onChange={(e) => set("rollNo", e.target.value.toUpperCase())}
        />
      ),
    },
    {
      label: "Workshop / Session Code",
      placeholder: "Example: CMRTC-IOT-JUN2026",
      field: (
        <input
          className="cert-inp"
          value={form.workshopCode || ""}
          onChange={(e) => set("workshopCode", e.target.value.toUpperCase())}
        />
      ),
    },
    {
      label: "Full Name",
      placeholder: "Enter name",
      field: (
        <input
          className="cert-inp"
          value={form.fullName || ""}
          onChange={(e) => set("fullName", e.target.value)}
        />
      ),
    },
    {
      label: "Phone Number",
      placeholder: "Enter phone number",
      field: (
        <input
          className="cert-inp"
          value={form.phone || ""}
          onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
        />
      ),
    },
    {
      label: "Institution Type",
      field: (
        <select
          className="cert-inp"
          value={form.institutionType || ""}
          onChange={(e) => set("institutionType", e.target.value)}
        >
          <option value="">Select Institution Type</option>
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="university">University</option>
          <option value="corporate">Corporate</option>
          <option value="individual">Individual</option>
        </select>
      ),
    },
    {
      label: "Institution Name",
      placeholder: "Enter institution name",
      field: (
        <input
          className="cert-inp"
          value={form.institution || ""}
          onChange={(e) => set("institution", e.target.value)}
        />
      ),
    },
    {
      label: "Training Date",
      field: (
        <input
          type="date"
          className="cert-inp"
          value={form.trainingDate || ""}
          onChange={(e) => set("trainingDate", e.target.value)}
        />
      ),
    },
    {
      label: "Pincode",
      placeholder: "Enter pincode",
      field: (
        <input
          className="cert-inp"
          value={form.pincode || ""}
          onChange={(e) => handlePin(e.target.value)}
        />
      ),
    },
    {
      label: "City",
      placeholder: "Enter city",
      field: (
        <input
          className="cert-inp"
          value={form.city || ""}
          onChange={(e) => set("city", e.target.value)}
        />
      ),
    },
    {
      label: "State",
      field: (
        <select
          className="cert-inp"
          value={form.state || ""}
          onChange={(e) => set("state", e.target.value)}
        >
          <option value="">Select State</option>
          {INDIAN_STATES.map((state) => (
            <option key={state}>{state}</option>
          ))}
        </select>
      ),
    },
    {
      label: "Technology",
      field: (
        <select
          className="cert-inp"
          value={form.technology || ""}
          onChange={(e) => set("technology", e.target.value)}
        >
          <option value="">Select Technology</option>
          {TECHNOLOGIES.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Duration",
      field: (
        <select
          className="cert-inp"
          value={form.durationDays || ""}
          onChange={(e) => set("durationDays", e.target.value)}
        >
          <option value="">Select Duration</option>
          {DURATION_OPTIONS.map((duration) => (
            <option key={duration.val} value={duration.val}>
              {duration.label}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="vcard">
      <div className="vcard-eye">Certificate Registration</div>
      <div className="vcard-title">Register Certificate</div>
      <div className="vcard-sub">
        Only students whose roll/registration number is present in the paid-student upload can register for a certificate.
      </div>

      <div className="cert-form-grid">
        {fields.map((item) => (
          <div className="cert-field" key={item.label}>
            <label>{item.label}</label>
            {item.placeholder
              ? React.cloneElement(item.field, { placeholder: item.placeholder })
              : item.field}
          </div>
        ))}
      </div>

      <div className="cert-submit-row">
        <button className="btn-v" onClick={submit} disabled={loading}>
          {loading ? "Registering..." : "Register Certificate"}
        </button>
      </div>

      {error && <div className="verr">{error}</div>}

      {successId && (
        <div className="vok">
          Certificate ID: <strong>{successId}</strong>
        </div>
      )}
    </div>
  );
}
