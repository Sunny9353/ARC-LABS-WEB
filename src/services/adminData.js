import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.js";

export const LEAD_SOURCES = [
  { collectionName: "programCurriculumLeads", type: "Program Curriculum" },
  { collectionName: "custom_proposals", type: "Lab Proposal" },
  { collectionName: "csrPartnershipLeads", type: "CSR Partnership" },
  { collectionName: "contactEnquiries", type: "General Enquiry" },
];

export function subscribeCollection(collectionName, callback, maxItems = 250) {
  const ref = collection(db, collectionName);
  const q = query(ref, limit(maxItems));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => ({ id: item.id, ...item.data(), _collection: collectionName }))
          .sort((a, b) => dateMs(b.createdAt || b.paidAt || b.updatedAt) - dateMs(a.createdAt || a.paidAt || a.updatedAt))
      );
    },
    () => callback([])
  );
}

export function subscribeAdminData(callback) {
  const state = {
    orders: [],
    analyticsEvents: [],
    telemetryData: [],
    leads: [],
    certificates: [],
    eligibleRegistrations: [],
    paymentEvents: [],
    cancelledPayments: [],
    checkoutSessions: [],
    products: [],
  };

  const emit = () => callback({ ...state });
  const unsubs = [
    subscribeCollection("orders", (items) => {
      state.orders = items;
      emit();
    }),
    subscribeCollection("paymentEvents", (items) => {
      state.paymentEvents = items;
      emit();
    }),
    subscribeCollection("cancelledPayments", (items) => {
      state.cancelledPayments = items;
      emit();
    }),
    subscribeCollection("checkoutSessions", (items) => {
      state.checkoutSessions = items;
      emit();
    }, 800),
    subscribeCollection("products", (items) => {
      state.products = items;
      emit();
    }),
    subscribeCollection("analyticsEvents", (items) => {
      state.analyticsEvents = items;
      emit();
    }, 500),
    subscribeCollection("telemetry_data", (items) => {
      state.telemetryData = items;
      emit();
    }, 800),
    subscribeCollection("certificates", (items) => {
      state.certificates = items;
      emit();
    }),
    subscribeCollection("certificateEligibleRegistrations", (items) => {
      state.eligibleRegistrations = items;
      emit();
    }),
    ...LEAD_SOURCES.map((source) =>
      subscribeCollection(source.collectionName, (items) => {
        const others = state.leads.filter((lead) => lead._collection !== source.collectionName);
        state.leads = [
          ...others,
          ...items.map((item) => ({
            ...item,
            leadType: item.leadType || source.type,
          })),
        ].sort((a, b) => dateMs(b.createdAt) - dateMs(a.createdAt));
        emit();
      })
    ),
  ];

  return () => unsubs.forEach((unsubscribe) => unsubscribe?.());
}

export async function updateOrderStatus(order, status, adminEmail) {
  const ref = doc(db, order._collection || "orders", order.id);
  await updateDoc(ref, {
    fulfillmentStatus: status,
    statusUpdatedAt: serverTimestamp(),
    statusUpdatedBy: adminEmail || "admin",
  });
  await addDoc(collection(db, "orderEvents"), {
    orderId: order.id,
    paymentId: order.paymentId || order.id,
    status,
    adminEmail: adminEmail || "admin",
    createdAt: serverTimestamp(),
  });
}

export async function updateLeadStatus(lead, updates) {
  const ref = doc(db, lead._collection, lead.id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadEligibleStudents(rows, workshopKey, fileName, adminEmail) {
  for (let index = 0; index < rows.length; index += 450) {
    const batch = writeBatch(db);
    rows.slice(index, index + 450).forEach((student) => {
      const ref = doc(db, "certificateEligibleRegistrations", student.eligibilityId);
      batch.set(
        ref,
        {
          ...student,
          workshopKey,
          sourceFile: fileName,
          uploadedBy: adminEmail || "admin",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  }
}

export function dateMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatDateTime(value) {
  const ms = dateMs(value);
  if (!ms) return "Not recorded";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function toDayKey(value = Date.now()) {
  const date = new Date(dateMs(value) || value);
  return date.toISOString().slice(0, 10);
}

export function toMonthKey(value = Date.now()) {
  return toDayKey(value).slice(0, 7);
}
