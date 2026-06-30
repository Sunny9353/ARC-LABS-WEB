import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import {
  generateCertId,
  getSkillsForCert,
} from "../utils/certificationHelpers.js";

import {
  DURATION_OPTIONS,
} from "../data/certificationConstants.js";
import {
  SESSION_CODE_GROUPS,
  isInternshipSessionCode,
} from "../data/sessionCodes.js";

import {
  ELIGIBLE_REGISTRATIONS_COLLECTION,
  isPaidStudent,
  makeEligibilityId,
  normalizeRollNumber,
  normalizeWorkshopCode,
} from "../utils/certificateEligibility.js";
import {
  canSendCertificateEmail,
  sendCertificateRegistrationEmail,
} from "../utils/certificateEmail.js";

export default function RegisterPanel({ onRegistered }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const currentYear = String(new Date().getFullYear());

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const toMonthDay = (value) => String(value || "").slice(5, 10).replace("-", "/");
  const toCurrentYearDate = (value) => (value ? `${currentYear}-${String(value).replace("/", "-")}` : "");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const openModal = (data) => setModal(data);
  const closeModal = () => setModal(null);
  const formatMonthDayInput = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };
  const getMonthDayError = (value) => {
    const text = String(value || "");
    if (text.length < 2) return "";

    const [monthText = "", dayText = ""] = text.split("/");
    const month = Number(monthText);
    if (monthText.length === 2 && (month < 1 || month > 12)) {
      return "Month must be 01 to 12";
    }

    if (dayText.length < 2) return "";
    const day = Number(dayText);
    if (day < 1 || day > 31) return "Date must be 01 to 31";

    const maxDay = new Date(Number(currentYear), month, 0).getDate();
    if (day > maxDay) return `Date must be 01 to ${maxDay}`;
    return "";
  };
  const normalizeComparable = (value) =>
    String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
  const detailsMismatchModal = {
    type: "failed",
    eyebrow: "Incorrect details",
    title: "Details Do Not Match",
    message: "Some details do not match the uploaded student record.",
    note: "Kindly check the details provided, or contact your Dept / Mentor for help.",
  };
  const startDateError = getMonthDayError(form.startMonthDay);
  const endDateError = getMonthDayError(form.endMonthDay);

  const detailsMatchUploadedRecord = (student) => {
    const checks = [
      [form.fullName, student.fullName, normalizeComparable],
      [form.email, student.email, normalizeEmail],
      [form.institution, student.institution, normalizeComparable],
      [form.institutionType, student.institutionType, normalizeComparable],
      [form.workshopCode, student.workshopCode || student.workshopKey, normalizeWorkshopCode],
      [form.rollNo, student.rollNo || student.rollKey, normalizeRollNumber],
    ];

    return checks.every(([entered, uploaded, normalize]) => {
      const uploadedValue = normalize(uploaded);
      if (!uploadedValue) return true;
      return normalize(entered) === uploadedValue;
    });
  };

  const applyEligibleDefaults = (student) => {
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || student.fullName || "",
      phone: prev.phone || student.phone || "",
      email: prev.email || student.email || "",
      institution: prev.institution || student.institution || "",
      institutionType: prev.institutionType || student.institutionType || "",
      technology: prev.technology || student.technology || "",
      durationDays: prev.durationDays || student.durationDays || "",
      startDate: prev.startDate || student.startDate || student.trainingDate || "",
      endDate: prev.endDate || student.endDate || "",
      startMonthDay: prev.startMonthDay || toMonthDay(student.startDate || student.trainingDate),
      endMonthDay: prev.endMonthDay || toMonthDay(student.endDate),
      programName: prev.programName || student.programName || student.workshopName || "",
      departmentName: prev.departmentName || student.departmentName || "",
      collegeName: prev.collegeName || student.collegeName || student.institution || "",
      location: prev.location || student.location || "",
      year: currentYear,
      workshopCode: prev.workshopCode || student.workshopCode || "",
    }));
  };

  const submit = async () => {
    const rollKey = normalizeRollNumber(form.rollNo);
    const workshopKey = normalizeWorkshopCode(form.workshopCode);

    if (startDateError || endDateError) {
      openModal({
        type: "failed",
        eyebrow: "Check dates",
        title: "Registration Failed",
        message: "Please enter valid From and To dates in MM/DD format.",
        note: "Month should be 01-12 and date should match the selected month.",
      });
      return;
    }

    if (!rollKey) {
      openModal({
        type: "failed",
        eyebrow: "Details incomplete",
        title: "Registration Failed",
        message: "Enter your roll/registration number to check certificate eligibility.",
        note: "Contact your Dept coordinator if you do not know the roll number uploaded for this workshop.",
      });
      return;
    }

    if (!workshopKey) {
      openModal({
        type: "failed",
        eyebrow: "Workshop code needed",
        title: "Registration Failed",
        message: "Enter the workshop/session code shared by ARC LABS for this training.",
        note: "Contact your Dept coordinator if the session code is not available.",
      });
      return;
    }

    setLoading(true);
    setModal(null);

    try {
      const eligibilityId = makeEligibilityId(rollKey, workshopKey);
      const eligibleRef = doc(db, ELIGIBLE_REGISTRATIONS_COLLECTION, eligibilityId);
      const eligibleSnap = await getDoc(eligibleRef);

      if (!eligibleSnap.exists()) {
        openModal({
          type: "failed",
          eyebrow: "Not found",
          title: "Registration Failed",
          message: "Your roll/registration number was not found for this workshop/session.",
          note: "Check the workshop code once. If it still fails, contact your Dept coordinator with your roll number.",
        });
        setLoading(false);
        return;
      }

      const eligibleStudent = eligibleSnap.data();

      if (!detailsMatchUploadedRecord(eligibleStudent)) {
        openModal(detailsMismatchModal);
        setLoading(false);
        return;
      }

      if (!isPaidStudent(eligibleStudent)) {
        openModal({
          type: "failed",
          eyebrow: "Payment pending",
          title: "Registration Failed",
          message: "This roll/registration number is not marked as paid yet.",
          note: "Certificate registration opens after payment confirmation. Contact your Dept for support.",
        });
        setLoading(false);
        return;
      }

      applyEligibleDefaults(eligibleStudent);

      if (eligibleStudent.certificateId) {
        openModal({
          type: "already",
          eyebrow: "Already registered",
          title: "You're Already Registered",
          message: "These registration details are already linked to a certificate.",
          certId: eligibleStudent.certificateId,
          note: "Use the Unique ID below in the Verify tab to validate and download your certificate.",
        });
        setLoading(false);
        return;
      }

      const email = String(form.email || eligibleStudent.email || "").trim();
      if (!email || !emailPattern.test(email)) {
        openModal({
          type: "failed",
          eyebrow: "Email required",
          title: "Registration Failed",
          message: "Enter a valid email address so we can send your Unique ID.",
          note: "Use the same active email where you want to receive the certificate registration details.",
        });
        setLoading(false);
        return;
      }

      const certId = generateCertId();
      const selectedDuration = String(form.durationDays || eligibleStudent.durationDays || "");
      const selectedWorkshopCode = form.workshopCode || eligibleStudent.workshopCode || "";
      const isInternship =
        selectedDuration.toLowerCase() === "internship" ||
        isInternshipSessionCode(selectedWorkshopCode) ||
        String(eligibleStudent.certificateType || "").toLowerCase() === "internship";
      const durationDays = isInternship
        ? "internship"
        : parseInt(selectedDuration || 0, 10);
      const skillsDuration = isInternship ? 5 : durationDays;
      const technology = form.technology || eligibleStudent.technology || "";
      const startDate = toCurrentYearDate(form.startMonthDay) || form.startDate || eligibleStudent.startDate || eligibleStudent.trainingDate || "";
      const endDate = toCurrentYearDate(form.endMonthDay) || form.endDate || eligibleStudent.endDate || "";
      const cert = {
        ...eligibleStudent,
        ...form,
        rollNo: form.rollNo || eligibleStudent.rollNo || rollKey,
        rollKey,
        email,
        workshopCode: form.workshopCode || eligibleStudent.workshopCode || workshopKey,
        workshopKey,
        certId,
        technology,
        durationDays,
        certificateType: isInternship ? "Internship" : (form.certificateType || eligibleStudent.certificateType || "Workshop"),
        startDate,
        endDate,
        year: currentYear,
        skills: getSkillsForCert(technology, skillsDuration),
        issueDate: new Date().toISOString().split("T")[0],
        eligibleStudentId: eligibilityId,
      };

      await setDoc(doc(db, "certificates", certId), cert);
      await updateDoc(eligibleRef, {
        certificateId: certId,
        certificateRegisteredAt: new Date().toISOString(),
        registeredEmail: email,
      });

      let emailNotice = "Your Unique ID has been created.";
      if (canSendCertificateEmail()) {
        try {
          await sendCertificateRegistrationEmail(cert);
          emailNotice = `We also sent this Unique ID to ${email}.`;
        } catch (mailErr) {
          console.warn("Certificate email failed:", mailErr);
          emailNotice = "Your registration is complete, but email delivery could not be confirmed. Keep this Unique ID safely.";
        }
      } else {
        emailNotice = "Email delivery is ready in code, but the no-reply mail service is not configured yet.";
      }

      openModal({
        type: "success",
        eyebrow: "Registration complete",
        title: "Congratulations, You Are Registered Successfully",
        message: "Your certificate registration is confirmed. This Unique ID is required for verification and certificate download.",
        certId,
        note: emailNotice,
      });
      onRegistered && onRegistered(cert);
    } catch (err) {
      console.error("Firebase Error:", err);
      openModal({
        type: "failed",
        eyebrow: "Unable to register",
        title: "Registration Failed",
        message: err.message || "Certificate registration failed. Please try again.",
        note: "Contact your Dept coordinator with your roll number and workshop code if this continues.",
      });
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
      field: (
        <select
          className="cert-inp"
          value={form.workshopCode || ""}
          onChange={(e) => set("workshopCode", e.target.value)}
        >
          <option value="">Select WorkShop code</option>
          {SESSION_CODE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
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
      label: "Email Address",
      placeholder: "Enter email address",
      field: (
        <input
          type="email"
          className="cert-inp"
          value={form.email || ""}
          onChange={(e) => set("email", e.target.value.trim())}
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
      wide: true,
      field: (
        <input
          className="cert-inp"
          value={form.institution || ""}
          onChange={(e) => set("institution", e.target.value)}
        />
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
          <div className={`cert-field${item.wide ? " cert-field-wide" : ""}`} key={item.label}>
            <label>{item.label}</label>
            {item.placeholder
              ? React.cloneElement(item.field, { placeholder: item.placeholder })
              : item.field}
          </div>
        ))}
        <div className="cert-field cert-date-row">
          <div className="cert-date-cell cert-date-duration">
            <label>Duration</label>
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
          </div>
          <div className="cert-date-cell">
            <label>From</label>
            <input
              type="text"
              inputMode="numeric"
              className={`cert-inp${startDateError ? " cert-date-invalid" : ""}`}
              placeholder="MM/DD"
              pattern="\\d{2}/\\d{2}"
              maxLength={5}
              value={form.startMonthDay || ""}
              onChange={(e) => set("startMonthDay", formatMonthDayInput(e.target.value))}
            />
            {startDateError && <div className="cert-date-error">{startDateError}</div>}
          </div>
          <div className="cert-date-cell">
            <label>To</label>
            <input
              type="text"
              inputMode="numeric"
              className={`cert-inp${endDateError ? " cert-date-invalid" : ""}`}
              placeholder="MM/DD"
              pattern="\\d{2}/\\d{2}"
              maxLength={5}
              value={form.endMonthDay || ""}
              onChange={(e) => set("endMonthDay", formatMonthDayInput(e.target.value))}
            />
            {endDateError && <div className="cert-date-error">{endDateError}</div>}
          </div>
        </div>
      </div>

      <div className="cert-submit-row">
        <button className="btn-v" onClick={submit} disabled={loading}>
          {loading ? "Registering..." : "Register Certificate"}
        </button>
      </div>

      {modal && (
        <div className="cert-modal-backdrop" role="dialog" aria-modal="true">
          <div className={`cert-modal-card cert-modal-${modal.type}`}>
            <button className="cert-modal-close" type="button" onClick={closeModal} aria-label="Close">
              &times;
            </button>
            <div className="cert-modal-eyebrow">{modal.eyebrow}</div>
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            {modal.certId && (
              <div className="cert-modal-id">
                <span>Unique ID</span>
                <strong>{modal.certId}</strong>
              </div>
            )}
            {modal.note && <div className="cert-modal-note">{modal.note}</div>}
            <button className="btn-v cert-modal-action" type="button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
