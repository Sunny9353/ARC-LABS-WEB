import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import { db, auth } from "../firebase";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import {
  ELIGIBLE_REGISTRATIONS_COLLECTION,
  makeEligibilityId,
  mapStudentRow,
  normalizeWorkshopCode,
} from "../utils/certificateEligibility.js";

const XLSX_CDN = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
const AUTHORIZED_ADMIN_EMAILS = ["techarclab@gmail.com"];

export default function EligibleStudentUploadPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workshopCode, setWorkshopCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionKey = normalizeWorkshopCode(workshopCode);
  const validRows = useMemo(() => rows.filter((row) => row.rollKey && sessionKey), [rows, sessionKey]);

  useEffect(() => {
    // Surface any error returned by a redirect-based sign in (used as a popup fallback).
    getRedirectResult(auth).catch((err) => setStatus(friendlyAuthError(err)));

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      const token = await currentUser.getIdTokenResult(true);
      const email = currentUser.email?.toLowerCase() || "";
      setIsAdmin(token.claims.admin === true || AUTHORIZED_ADMIN_EMAILS.includes(email));
    });
  }, []);

  const login = async () => {
    setLoading(true);
    setStatus("");

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      // On deployed domains popups are frequently blocked; fall back to a full-page redirect.
      const redirectable = [
        "auth/popup-blocked",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
        "auth/operation-not-supported-in-this-environment",
      ];
      if (redirectable.includes(err.code)) {
        try {
          await signInWithRedirect(auth, provider);
          return; // page will redirect away
        } catch (redirectErr) {
          setStatus(friendlyAuthError(redirectErr));
        }
      } else {
        setStatus(friendlyAuthError(err));
      }
    }

    setLoading(false);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("");
    setRows([]);
    setFileName(file.name);

    try {
      const parsedRows = await readSheetRows(file);
      const mappedRows = parsedRows.map(mapStudentRow).filter((row) => row.rollKey);

      setRows(mappedRows);
      setStatus(
        mappedRows.length
          ? `${mappedRows.length} student records ready to upload for ${sessionKey || "this session"}.`
          : "No usable records found. Make sure the sheet has a Roll No or Registration Number column."
      );
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Could not read this file.");
    }

    setLoading(false);
  };

  const uploadRows = async () => {
    if (!validRows.length || !isAdmin) return;

    setLoading(true);
    setStatus("Uploading student records...");

    try {
      for (let index = 0; index < validRows.length; index += 450) {
        const batch = writeBatch(db);
        validRows.slice(index, index + 450).forEach((student) => {
          const eligibilityId = makeEligibilityId(student.rollKey, sessionKey);
          const ref = doc(db, ELIGIBLE_REGISTRATIONS_COLLECTION, eligibilityId);

          batch.set(
            ref,
            {
              ...student,
              eligibilityId,
              workshopCode,
              workshopKey: sessionKey,
              sourceFile: fileName,
              uploadedBy: user.email,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        });
        await batch.commit();
      }

      setStatus(`Uploaded ${validRows.length} paid-student records for ${sessionKey}.`);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Upload failed.");
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="vcard">
        <div className="vcard-eye">Admin Upload</div>
        <div className="vcard-title">Authorized Sign In</div>
        <div className="vcard-sub">
          Sign in with the Firebase admin Google account to upload paid-student lists.
        </div>

        <div className="cert-submit-row">
          <button className="btn-v" onClick={login} disabled={loading}>
            Sign in with Google
          </button>
        </div>

        {status && <div className="upload-status">{status}</div>}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="vcard">
        <div className="vcard-eye">Admin Upload</div>
        <div className="vcard-title">Not Authorized</div>
        <div className="vcard-sub">
          You are signed in as {user.email}, but only techarclab@gmail.com can upload paid-student lists.
        </div>
        <button className="btn-v" onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    );
  }

  return (
    <div className="vcard">
      <div className="vcard-eye">Admin Upload</div>
      <div className="vcard-title">Upload Paid Students Excel</div>
      <div className="vcard-sub">
        Upload one workshop/session at a time. Students will register with their roll number and this workshop code.
      </div>

      <div className="cert-form-grid" style={{ marginBottom: "1rem" }}>
        <div className="cert-field">
          <label>Workshop / Session Code</label>
          <input
            className="cert-inp"
            placeholder="Example: CMRTC-IOT-JUN2026"
            value={workshopCode}
            onChange={(e) => setWorkshopCode(e.target.value.toUpperCase())}
          />
        </div>
        <div className="cert-field">
          <label>Signed In Admin</label>
          <input className="cert-inp" value={user.email || ""} readOnly />
        </div>
      </div>

      <div className="upload-box">
        <input
          className="cert-inp"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          disabled={loading || !sessionKey}
        />
        <button className="btn-v" onClick={uploadRows} disabled={loading || !validRows.length}>
          Upload to Database
        </button>
      </div>

      <div className="upload-help">
        Required: Roll No or Registration Number. Optional: Name, Phone, Email, Institution,
        Technology, Duration, Training Date, Paid or Payment Status.
      </div>

      {status && <div className="upload-status">{status}</div>}

      {validRows.length > 0 && (
        <div className="upload-preview">
          <div className="upload-preview-title">Preview</div>
          <div className="upload-preview-grid">
            {validRows.slice(0, 6).map((row) => (
              <div className="upload-preview-row" key={makeEligibilityId(row.rollKey, sessionKey)}>
                <strong>{row.rollNo}</strong>
                <span>{row.fullName || "Name not provided"}</span>
                <span>{sessionKey}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cert-submit-row">
        <button className="btn-act ghost" onClick={() => signOut(auth)}>Sign Out</button>
      </div>
    </div>
  );
}

function friendlyAuthError(err) {
  if (!err) return "";
  switch (err.code) {
    case "auth/unauthorized-domain":
      return "This website domain is not authorized for Google sign in. Add this exact domain (for example your-app.vercel.app) under Firebase Console > Authentication > Settings > Authorized domains, then try again.";
    case "auth/operation-not-allowed":
      return "Google sign in is disabled for this project. Enable the Google provider in Firebase Console > Authentication > Sign-in method.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign in popup. Please allow popups for this site and try again.";
    case "auth/network-request-failed":
      return "Network error during sign in. Check your connection and try again.";
    default:
      return err.message || "Sign in failed.";
  }
}

async function readSheetRows(file) {
  if (file.name.toLowerCase().endsWith(".csv")) {
    return parseCsv(await file.text());
  }

  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
}

async function loadXlsx() {
  if (window.XLSX) return window.XLSX;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = XLSX_CDN;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load the Excel parser. Check your internet connection."));
    document.head.appendChild(script);
  });

  return window.XLSX;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "");

  return lines.map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}
