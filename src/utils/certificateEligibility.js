export const ELIGIBLE_STUDENTS_COLLECTION = "certificateEligibleStudents";
export const ELIGIBLE_REGISTRATIONS_COLLECTION = "certificateEligibleRegistrations";

export function normalizeRollNumber(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function normalizeWorkshopCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

export function makeEligibilityId(rollNo, workshopCode) {
  const rollKey = normalizeRollNumber(rollNo);
  const workshopKey = normalizeWorkshopCode(workshopCode);
  return workshopKey ? `${rollKey}_${workshopKey}` : rollKey;
}

export function isPaidStudent(student = {}) {
  if (student.feePaid === false || student.paid === false) return false;

  const status = String(student.paymentStatus || student.status || "")
    .trim()
    .toLowerCase();

  if (!status) return true;

  return !["unpaid", "pending", "failed", "no", "not paid"].includes(status);
}

export function pickColumn(row, aliases) {
  const normalized = Object.entries(row || {}).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});

  for (const alias of aliases) {
    const value = normalized[normalizeHeader(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

export function mapStudentRow(row) {
  const rollNo = pickColumn(row, [
    "rollNo",
    "roll no",
    "roll number",
    "roll/registration number",
    "registrationNo",
    "registration no",
    "registration number",
    "regNo",
    "reg no",
    "student id",
    "id",
  ]);

  const paidValue = pickColumn(row, [
    "paid",
    "fee paid",
    "fees paid",
    "payment status",
    "status",
  ]);

  const paymentStatus = String(paidValue || "paid").trim();

  const workshopName = String(
    pickColumn(row, ["workshop name", "workshop", "course", "program", "technology"]) || ""
  ).trim();
  const workshopCode = String(
    pickColumn(row, ["workshop code", "session code", "batch code", "event code"]) || workshopName
  ).trim();

  return {
    rollNo: String(rollNo || "").trim(),
    rollKey: normalizeRollNumber(rollNo),
    fullName: String(pickColumn(row, ["full name", "name", "student name"]) || "").trim(),
    phone: String(pickColumn(row, ["phone", "phone number", "mobile", "mobile number"]) || "").trim(),
    email: String(pickColumn(row, ["email", "email id", "mail"]) || "").trim(),
    institution: String(
      pickColumn(row, [
        "institution",
        "institution name",
        "college",
        "college name",
        "college/organisation name",
        "college organisation name",
        "organization",
        "organisation",
      ]) || ""
    ).trim(),
    institutionType: normalizeInstitutionType(
      pickColumn(row, ["institution type", "registration type", "participant type"])
    ),
    workshopName,
    workshopCode,
    workshopKey: normalizeWorkshopCode(workshopCode),
    technology: normalizeTechnology(workshopName),
    durationDays: String(pickColumn(row, ["duration", "duration days", "days"]) || "").replace(/\D/g, ""),
    trainingDate: normalizeExcelDate(pickColumn(row, ["training date", "date", "workshop date"])),
    paymentStatus,
    feePaid: parsePaidValue(paymentStatus),
  };
}

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parsePaidValue(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return true;
  if (["yes", "y", "paid", "true", "1", "completed", "success"].includes(text)) return true;
  if (["no", "n", "unpaid", "false", "0", "pending", "failed"].includes(text)) return false;
  return true;
}

function normalizeInstitutionType(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (["student", "college student", "faculty"].includes(text)) return "college";
  if (["school", "college", "university", "corporate", "individual"].includes(text)) return text;
  return text;
}

function normalizeTechnology(value) {
  const text = String(value || "").trim();
  const normalized = text.toLowerCase();

  if (normalized.includes("advanced iot")) return "AdvIoT";
  if (normalized.includes("aiort")) return "AIoRT";
  if (normalized.includes("aiot")) return "AIoT";
  if (normalized.includes("iort")) return "IoRT";
  if (normalized.includes("iiot") || normalized.includes("industrial iot")) return "IIoT";
  if (normalized.includes("embedded")) return "Embedded";
  if (normalized.includes("robotics")) return "Robotics";
  if (normalized.includes("iot")) return "IoT";

  return text;
}

function normalizeExcelDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return text;
}
