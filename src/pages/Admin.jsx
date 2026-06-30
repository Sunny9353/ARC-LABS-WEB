import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import * as echarts from "echarts";
import indiaMap from "@svg-maps/india";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Download,
  Eye,
  FileUp,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Map,
  PackageCheck,
  Phone,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  getMultiFactorResolver,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  dateMs,
  formatDateTime,
  subscribeAdminData,
  toDayKey,
  toMonthKey,
  updateLeadStatus,
  updateOrderStatus,
  uploadEligibleStudents,
} from "../services/adminData";
import {
  makeEligibilityId,
  mapStudentRow,
  normalizeWorkshopCode,
} from "../utils/certificateEligibility";
import { SESSION_CODE_GROUPS } from "../data/sessionCodes";
import "../styles/Admin.css";

const ADMIN_EMAILS = (process.env.REACT_APP_ADMIN_EMAILS || "techarclab@gmail.com,techarclabs@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const REVIEW_ADMIN = {
  username: "arcAdmin",
  email: "arcadmin@gmail.com",
  password: "arc@admin123",
};
const LOCAL_SECOND_FACTOR = process.env.REACT_APP_ADMIN_SECOND_FACTOR_CODE || "246810";
const XLSX_CDN = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";

const NAV = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "traffic", label: "Traffic", icon: Users },
  { id: "orders", label: "Orders", icon: PackageCheck },
  { id: "leads", label: "Enquiries", icon: Mail },
  { id: "certificates", label: "Certificates", icon: FileUp },
  { id: "security", label: "Security", icon: ShieldCheck },
];

const INDIA_STATES = [
  "Jammu and Kashmir", "Himachal Pradesh", "Punjab", "Uttarakhand", "Haryana", "Delhi",
  "Rajasthan", "Uttar Pradesh", "Bihar", "Sikkim", "Assam", "Arunachal Pradesh",
  "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya", "West Bengal", "Jharkhand",
  "Odisha", "Chhattisgarh", "Madhya Pradesh", "Gujarat", "Maharashtra", "Telangana",
  "Andhra Pradesh", "Karnataka", "Goa", "Kerala", "Tamil Nadu",
];

const PERIODS = [
  { id: "lifetime", label: "Lifetime", unit: "Years" },
  { id: "today", label: "Today", unit: "Hours" },
  { id: "monthly", label: "Monthly", unit: "Days" },
  { id: "yearly", label: "Yearly", unit: "Months" },
];

const PAGE_NAMES = {
  "/": "Home",
  "/about-us": "About Us",
  "/industrial-iot-solutions": "IIoT Solutions",
  "/programs": "Programs",
  "/products": "Products",
  "/lab-packages": "Lab Packages",
  "/csr-partners": "CSR Partners",
  "/verify": "Certificate Verification",
  "/checkout": "Checkout",
  "/privacy": "Privacy Policy",
  "/terms": "Terms",
  "/refunds": "Refunds",
};

const STATE_LAYOUT = {
  "Jammu and Kashmir": [42, 6], "Himachal Pradesh": [48, 14], Punjab: [40, 18],
  Uttarakhand: [55, 20], Haryana: [44, 25], Delhi: [48, 28], Rajasthan: [34, 34],
  "Uttar Pradesh": [55, 35], Bihar: [69, 37], Sikkim: [79, 33], Assam: [86, 38],
  "Arunachal Pradesh": [92, 31], Nagaland: [92, 44], Manipur: [90, 51],
  Mizoram: [87, 59], Tripura: [82, 57], Meghalaya: [82, 44], "West Bengal": [76, 49],
  Jharkhand: [69, 51], Odisha: [70, 62], Chhattisgarh: [59, 58], "Madhya Pradesh": [48, 53],
  Gujarat: [27, 55], Maharashtra: [42, 66], Telangana: [51, 72], "Andhra Pradesh": [58, 79],
  Karnataka: [43, 80], Goa: [35, 76], Kerala: [41, 93], "Tamil Nadu": [51, 91],
};

const STATE_GEO = {
  "Jammu and Kashmir": [34.08, 74.8], "Himachal Pradesh": [31.1, 77.17], Punjab: [30.9, 75.85],
  Uttarakhand: [30.07, 79.02], Haryana: [29.06, 76.08], Delhi: [28.61, 77.2],
  Rajasthan: [26.9, 74.2], "Uttar Pradesh": [26.85, 80.95], Bihar: [25.6, 85.1],
  Sikkim: [27.53, 88.51], Assam: [26.2, 92.9], "Arunachal Pradesh": [28.21, 94.72],
  Nagaland: [26.15, 94.56], Manipur: [24.66, 93.9], Mizoram: [23.16, 92.93],
  Tripura: [23.94, 91.99], Meghalaya: [25.57, 91.88], "West Bengal": [23.68, 87.68],
  Jharkhand: [23.61, 85.28], Odisha: [20.95, 85.1], Chhattisgarh: [21.25, 81.63],
  "Madhya Pradesh": [23.47, 77.95], Gujarat: [22.26, 71.19], Maharashtra: [19.75, 75.71],
  Telangana: [17.85, 79.12], "Andhra Pradesh": [15.91, 79.74], Karnataka: [15.31, 75.71],
  Goa: [15.29, 74.12], Kerala: [10.85, 76.27], "Tamil Nadu": [11.13, 78.65],
};

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function compactMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount >= 100000000 ? 0 : 1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${Math.round(amount)}`;
}

function paidAmount(order) {
  return Number(order.amount || order.productPrice || order.price || 0);
}

function isPaid(order) {
  const status = String(order.status || "").toLowerCase();
  return status === "paid" || status === "captured" || order.paymentId;
}

function orderState(order) {
  return order.customer?.state || order.customer?.region || order.customerRegion || order.customerState || order.customer?.city || "Unknown";
}

function eventState(event) {
  return event.state || event.region || event.customerRegion || event.geo?.state || "Unknown";
}

function bucketBy(items, keyFn, valueFn = () => 1) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || "Unknown";
    acc[key] = (acc[key] || 0) + valueFn(item);
    return acc;
  }, {});
}

function topEntries(map, max = 10) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, max);
}

function useAdminData(enabled) {
  const [data, setData] = useState({
    orders: [],
    analyticsEvents: [],
    telemetryData: [],
    leads: [],
    certificates: [],
    eligibleRegistrations: [],
  });

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeAdminData(setData);
  }, [enabled]);

  return data;
}

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [localUser, setLocalUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("arc_admin_local_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authReady, setAuthReady] = useState(false);
  const [secondFactorPassed, setSecondFactorPassed] = useState(false);
  const [tab, setTab] = useState("overview");
  const [overviewPeriod, setOverviewPeriod] = useState("lifetime");
  const [trafficPeriod, setTrafficPeriod] = useState("lifetime");

  useEffect(() => onAuthStateChanged(auth, async (current) => {
    setUser(current);
    setAuthReady(true);
    if (!current) {
      setSecondFactorPassed(false);
      return;
    }
    const email = current.email?.toLowerCase() || "";
    setSecondFactorPassed((prev) => prev || sessionStorage.getItem("arc_admin_mfa") === email);
  }), []);

  const activeUser = localUser || user;
  const isAllowedAdmin = activeUser && (
    ADMIN_EMAILS.includes(activeUser.email?.toLowerCase()) ||
    activeUser.email?.toLowerCase() === REVIEW_ADMIN.email
  );
  const unlocked = Boolean(activeUser && isAllowedAdmin && secondFactorPassed);
  const data = useAdminData(unlocked);
  const overviewMetrics = useMemo(() => computeMetrics(data, overviewPeriod), [data, overviewPeriod]);
  const trafficMetrics = useMemo(() => computeMetrics(data, trafficPeriod), [data, trafficPeriod]);

  if (!authReady) {
    return <div className="admin-boot">Loading secure admin</div>;
  }

  if (!activeUser || !isAllowedAdmin || !secondFactorPassed) {
    return (
      <AdminLogin
        user={activeUser}
        isAllowedAdmin={isAllowedAdmin}
        onLocalCredential={(nextUser) => {
          sessionStorage.setItem("arc_admin_local_user", JSON.stringify(nextUser));
          setLocalUser(nextUser);
        }}
        onSecondFactor={() => {
          sessionStorage.setItem("arc_admin_mfa", activeUser.email?.toLowerCase() || "");
          setSecondFactorPassed(true);
        }}
      />
    );
  }

  const ActiveIcon = NAV.find((item) => item.id === tab)?.icon || BarChart3;

  return (
    <>
      <Helmet>
        <title>ARC LABS Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-brand">
            <span>ARC</span>
            <div>
              <strong>ARC LABS</strong>
              <small>Admin Command</small>
            </div>
          </div>
          <nav>
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="admin-user">
            <span>{activeUser.email}</span>
            <button onClick={() => {
              sessionStorage.removeItem("arc_admin_local_user");
              sessionStorage.removeItem("arc_admin_mfa");
              setLocalUser(null);
              setSecondFactorPassed(false);
              signOut(auth).catch(() => {});
            }} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </aside>
        <main className="admin-main">
          <header className="admin-topbar">
            <div>
              <p>Live Operations</p>
              <h1><ActiveIcon size={28} /> {NAV.find((item) => item.id === tab)?.label}</h1>
            </div>
          </header>

          {tab === "overview" && (
            <Overview
              metrics={overviewMetrics}
              data={data}
              period={overviewPeriod}
              onPeriodChange={setOverviewPeriod}
            />
          )}
          {tab === "traffic" && (
            <Traffic
              metrics={trafficMetrics}
              period={trafficPeriod}
              onPeriodChange={setTrafficPeriod}
            />
          )}
          {tab === "orders" && <Orders data={data} adminEmail={activeUser.email} />}
          {tab === "leads" && <Leads data={data} />}
          {tab === "certificates" && <Certificates data={data} adminEmail={activeUser.email} />}
          {tab === "security" && <Security user={activeUser} />}
        </main>
      </div>
    </>
  );
}

function AdminLogin({ user, isAllowedAdmin, onLocalCredential, onSecondFactor }) {
  const [form, setForm] = useState({ email: "", password: "", code: "" });
  const [status, setStatus] = useState("");
  const [mfaResolver, setMfaResolver] = useState(null);

  const login = async (event) => {
    event.preventDefault();
    setStatus("");
    const loginId = form.email.trim();
    const normalizedLogin = loginId.toLowerCase();
    const isReviewLogin =
      (normalizedLogin === REVIEW_ADMIN.email || loginId === REVIEW_ADMIN.username) &&
      form.password === REVIEW_ADMIN.password;

    if (isReviewLogin) {
      onLocalCredential({
        uid: "local-review-admin",
        email: REVIEW_ADMIN.email,
        displayName: REVIEW_ADMIN.username,
        isLocalReview: true,
      });
      return;
    }

    const firebaseEmail = loginId === REVIEW_ADMIN.username ? REVIEW_ADMIN.email : loginId;

    try {
      await signInWithEmailAndPassword(auth, firebaseEmail, form.password);
    } catch (err) {
      if (err.code === "auth/multi-factor-auth-required") {
        setMfaResolver(getMultiFactorResolver(auth, err));
        setStatus("Firebase MFA challenge detected. Complete the configured second factor to continue.");
        return;
      }
      setStatus(friendlyAuthError(err));
    }
  };

  const verifyLocalSecondFactor = (event) => {
    event.preventDefault();
    if (form.code.trim() !== LOCAL_SECOND_FACTOR) {
      setStatus("Invalid second-factor code.");
      return;
    }
    onSecondFactor();
  };

  if (user && !isAllowedAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <AlertTriangle size={34} />
          <h1>Not Authorized</h1>
          <p>{user.email} is signed in, but this account is not allowed to access ARC LABS admin.</p>
          <button className="admin-primary" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>
    );
  }

  if (user && isAllowedAdmin) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={verifyLocalSecondFactor}>
          <ShieldCheck size={34} />
          <h1>Two-Factor Check</h1>
          <p>Enter the admin second-factor code. Local review code: {LOCAL_SECOND_FACTOR}. For production, replace this with Firebase TOTP or a backend-issued email OTP.</p>
          {mfaResolver && <small className="admin-note">Firebase MFA resolver is available for this account.</small>}
          <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="6-digit code" autoFocus />
          <button className="admin-primary">Verify & Enter</button>
          <button type="button" className="admin-secondary" onClick={() => signOut(auth)}>Use another account</button>
          {status && <div className="admin-auth-error">{status}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={login}>
        <Lock size={34} />
        <h1>Admin Login</h1>
        <p>Email/username and password authentication with a second-factor gate. No Google sign-in is used.</p>
        <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email or username" required />
        <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" required />
        <button className="admin-primary">Continue</button>
        {status && <div className="admin-auth-error">{status}</div>}
      </form>
    </div>
  );
}

function Overview({ metrics, data, period, onPeriodChange }) {
  return (
    <div className="admin-stack">
      <PeriodTabs value={period} onChange={onPeriodChange} />
      <KpiGrid metrics={metrics} />
      <Panel title={`Revenue Trend by ${periodUnit(period)}`} icon={TrendingUp} className="admin-panel-wide">
        <RevenueTrendChart rows={metrics.revenueTrendRows} products={metrics.revenueProducts} />
      </Panel>
      <Panel title="Payment Health" icon={CircleDollarSign} className="payment-panel">
        <PaymentHealth metrics={metrics} />
      </Panel>
      <InsightList title="Top Clicked / Viewed Assets" items={metrics.topInteractions} />
      <RecentActivity items={metrics.recentActivities} />
    </div>
  );
}

function Traffic({ metrics, period, onPeriodChange }) {
  return (
    <div className="admin-stack">
      <PeriodTabs value={period} onChange={onPeriodChange} />
      <Panel title={`Visitors by ${periodUnit(period)}`} icon={Eye}>
        <TrafficChart data={metrics.visitSeries} />
      </Panel>
      <Panel title="India Visitor Map" icon={Map} className="traffic-map-panel">
        <IndiaHeatMap stateCounts={metrics.stateCounts} telemetryPoints={metrics.telemetryPoints} />
      </Panel>
      <div className="admin-grid three">
        <InsightList title="Most Viewed Pages" items={metrics.topPages} />
        <InsightList title="Most Clicked Buttons" items={metrics.topClicks} />
        <InsightList title="Forms & Sections" items={metrics.topFormsSections} />
      </div>
    </div>
  );
}

function Orders({ data, adminEmail }) {
  const [search, setSearch] = useState("");
  const orders = data.orders.filter((order) => JSON.stringify(order).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <Search size={17} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders, customers, payments" />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Payment</th><th>Delivery</th><th>Action</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.invoiceNumber || order.paymentId || order.id}</strong><span>{formatDateTime(order.createdAt || order.paidAt)}</span></td>
                <td>{order.customer?.name || order.customerName || "Customer"}<span>{order.customer?.email || order.customerEmail || ""}</span></td>
                <td>{order.product?.name || order.productName || order.productId || "Product"}</td>
                <td>{money(paidAmount(order))}</td>
                <td><Status text={order.status || "paid"} /></td>
                <td><Status text={order.fulfillmentStatus || "pending"} /></td>
                <td>
                  <select value={order.fulfillmentStatus || "pending"} onChange={(e) => updateOrderStatus(order, e.target.value, adminEmail)}>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accept Order</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Leads({ data }) {
  const items = useMemo(() => buildInboxItems(data), [data]);
  const [filter, setFilter] = useState("all");
  const [selectedKey, setSelectedKey] = useState("");
  const [contactLead, setContactLead] = useState(null);
  const filteredItems = items.filter((item) => filter === "all" || item.bucket === filter);
  const selectedItem = filteredItems.find((item) => item.key === selectedKey) || filteredItems[0];
  const types = [
    { id: "all", label: "Inbox" },
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
    { id: "contacted", label: "Contacted" },
    { id: "payment_success", label: "Payment Success" },
    { id: "payment_failed", label: "Payment Failed" },
  ].filter((type) => type.id === "all" || items.some((item) => item.bucket === type.id));

  useEffect(() => {
    if (!selectedItem || selectedItem.kind !== "lead" || selectedItem.raw.adminStatus) return;
    updateLeadStatus(selectedItem.raw, { adminStatus: "read", readAt: new Date() }).catch(() => {});
  }, [selectedItem?.key]);

  const openContact = (lead) => {
    setContactLead(lead);
  };

  const markContacted = (lead, channel) => {
    updateLeadStatus(lead, { adminStatus: "contacted", contactedVia: channel, contactedAt: new Date() }).catch(() => {});
  };

  return (
    <div className="admin-stack">
      <div className="admin-tabs">
        {types.map((type) => <button key={type.id} className={filter === type.id ? "active" : ""} onClick={() => setFilter(type.id)}>{type.label}</button>)}
      </div>
      <div className="enquiry-inbox">
        <div className="enquiry-list" role="list">
          {filteredItems.map((item) => (
            <button
              type="button"
              className={`enquiry-row ${selectedItem?.key === item.key ? "active" : ""} ${item.unread ? "unread" : ""}`}
              key={item.key}
              onClick={() => setSelectedKey(item.key)}
            >
              <span className={`enquiry-dot ${item.tone}`} />
              <span>
                <strong>{item.title}</strong>
                <small>{item.subject}</small>
              </span>
              <time>{formatDateTime(item.date)}</time>
            </button>
          ))}
          {!filteredItems.length && <div className="recent-empty">No enquiries in this view.</div>}
        </div>

        <section className="enquiry-detail">
          {selectedItem ? (
            <>
              <div className="enquiry-detail-head">
                <div>
                  <span>{selectedItem.typeLabel}</span>
                  <h2>{selectedItem.title}</h2>
                  <p>{selectedItem.subject}</p>
                </div>
                <Status text={selectedItem.statusLabel} />
              </div>

              <div className="enquiry-meta">
                {selectedItem.meta.map(([label, value]) => (
                  <div key={label}><span>{label}</span><strong>{value || "N/A"}</strong></div>
                ))}
              </div>

              {selectedItem.kind === "lead" ? (
                <>
                  <div className="enquiry-message">
                    {formatLeadDetails(selectedItem.raw).map(([label, value]) => (
                      <p key={label}><strong>{label}:</strong> {value || "N/A"}</p>
                    ))}
                  </div>
                  <button type="button" className="admin-primary enquiry-contact-btn" onClick={() => openContact(selectedItem.raw)}>
                    Contact User
                  </button>
                </>
              ) : (
                <PaymentDetail item={selectedItem} />
              )}
            </>
          ) : (
            <div className="recent-empty">Select an enquiry to read it.</div>
          )}
        </section>
      </div>
      {contactLead && (
        <ContactPopover
          lead={contactLead}
          onClose={() => setContactLead(null)}
          onContact={markContacted}
        />
      )}
    </div>
  );
}

function PaymentDetail({ item }) {
  return (
    <div className="enquiry-message">
      {item.details.map(([label, value]) => (
        <p key={label}><strong>{label}:</strong> {value || "N/A"}</p>
      ))}
      {item.raw.invoiceUrl || item.raw.invoicePath ? (
        <a className="invoice-link" href={item.raw.invoiceUrl || item.raw.invoicePath} target="_blank" rel="noreferrer">
          <Download size={16} /> Open invoice document
        </a>
      ) : item.bucket === "payment_success" ? (
        <p><strong>Invoice:</strong> Generation pending. The link appears here after the webhook stores the PDF.</p>
      ) : null}
    </div>
  );
}

function ContactPopover({ lead, onClose, onContact }) {
  const email = lead.email || lead.customerEmail;
  const phone = lead.phone || lead.mobile || lead.whatsapp || lead.customerPhone;
  const cleanPhone = String(phone || "").replace(/[^\d]/g, "");
  const emailHref = email ? `mailto:${email}?subject=${encodeURIComponent(`ARC LABS enquiry - ${lead.leadType || "Website"}`)}` : undefined;
  const whatsappHref = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}` : undefined;

  return (
    <div className="contact-popover-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="contact-popover">
        <div className="contact-popover-head">
          <div>
            <span>Contact details</span>
            <strong>{lead.name || lead.fullName || lead.company || lead.org || "Enquiry"}</strong>
          </div>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <div className="contact-actions">
          <a href={emailHref} onClick={() => email && onContact(lead, "email")} className={!email ? "disabled" : ""}>
            <Mail size={18} /><span>{email || "No email provided"}</span>
          </a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => phone && onContact(lead, "whatsapp")} className={!phone ? "disabled" : ""}>
            <MessageCircle size={18} /><span>{phone || "No WhatsApp number provided"}</span>
          </a>
          <span className="contact-call-disabled">
            <Phone size={18} /><span>{phone || "No phone provided"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function buildInboxItems(data) {
  const leadItems = data.leads.map((lead) => {
    const status = lead.adminStatus || "new";
    return {
      key: `lead-${lead._collection}-${lead.id}`,
      kind: "lead",
      raw: lead,
      bucket: status === "contacted" ? "contacted" : status === "read" ? "read" : "unread",
      unread: !lead.adminStatus || lead.adminStatus === "new",
      tone: status === "contacted" ? "success" : "info",
      title: lead.name || lead.fullName || lead.company || lead.org || lead.institution || "Website enquiry",
      subject: leadSubject(lead),
      typeLabel: lead.leadType || "Enquiry",
      statusLabel: status === "new" ? "unread" : status,
      date: lead.createdAt || lead.updatedAt,
      meta: [
        ["From", lead.email || "N/A"],
        ["Phone", lead.phone || lead.mobile || lead.whatsapp || "N/A"],
        ["Region", lead.city || lead.state || lead.geography || lead.country || "N/A"],
        ["Received", formatDateTime(lead.createdAt)],
      ],
    };
  });

  const paymentItems = data.orders.map((order) => {
    const paid = isPaid(order);
    const status = String(order.status || "").toLowerCase();
    const failed = !paid && /fail|failed|error|declined/.test(status + JSON.stringify(order.paymentError || order.razorpayError || ""));
    return {
      key: `payment-${order.id}`,
      kind: "payment",
      raw: order,
      bucket: paid ? "payment_success" : failed ? "payment_failed" : "unread",
      unread: false,
      tone: paid ? "success" : failed ? "danger" : "warning",
      title: paid ? "Payment successful" : failed ? "Payment failed" : "Payment pending",
      subject: `${order.product?.name || order.productName || order.productId || "Product"} - ${money(paidAmount(order))}`,
      typeLabel: "Payment notification",
      statusLabel: paid ? "success" : failed ? "failed" : order.status || "pending",
      date: order.createdAt || order.paidAt || order.updatedAt,
      meta: [
        ["Customer", order.customer?.name || order.customerName || "Customer"],
        ["Email", order.customer?.email || order.customerEmail || "N/A"],
        ["Payment ID", order.paymentId || order.id],
        ["Invoice", order.invoiceNumber || "Pending"],
      ],
      details: paymentDetails(order, paid, failed),
    };
  });

  return [...leadItems, ...paymentItems].sort((a, b) => dateMs(b.date) - dateMs(a.date));
}

function leadSubject(lead) {
  if (/program/i.test(lead.leadType || "")) {
    return `${lead.programName || lead.workshopTitle || "Program curriculum"}${lead.duration ? ` - ${lead.duration} day` : ""}`;
  }
  if (/lab/i.test(lead.leadType || "")) {
    return lead.packageName || lead.requirements || lead.institution || "Lab proposal request";
  }
  if (/csr/i.test(lead.leadType || "")) {
    return lead.company || lead.focusArea || lead.message || "CSR partnership enquiry";
  }
  return lead.message || lead.requirements || lead.note || "General website enquiry";
}

function formatLeadDetails(lead) {
  const base = [
    ["Name", lead.name || lead.fullName || lead.contactName],
    ["Email", lead.email],
    ["Phone", lead.phone || lead.mobile || lead.whatsapp],
  ];
  if (/program/i.test(lead.leadType || "")) {
    return [
      ...base,
      ["Organization", lead.org || lead.institution || lead.company],
      ["Role", lead.role],
      ["Program", lead.programName || lead.programAbbr],
      ["Workshop", lead.workshopTitle],
      ["Duration", [lead.duration, lead.durationLabel].filter(Boolean).join(" ")],
      ["Total hours", lead.totalHours],
      ["Message", lead.message],
    ];
  }
  if (/lab/i.test(lead.leadType || "")) {
    return [
      ...base,
      ["Institution", lead.institution || lead.org],
      ["Package", lead.packageName || lead.labPackage],
      ["Location", [lead.city, lead.state, lead.country].filter(Boolean).join(", ")],
      ["Requirements", lead.requirements || lead.message],
      ["Budget", lead.budget],
      ["Timeline", lead.timeline],
    ];
  }
  if (/csr/i.test(lead.leadType || "")) {
    return [
      ...base,
      ["Company", lead.company || lead.org],
      ["Focus area", lead.focusArea || lead.csrFocus],
      ["Geography", lead.geography || [lead.city, lead.state].filter(Boolean).join(", ")],
      ["Beneficiaries", lead.beneficiaries],
      ["Message", lead.message || lead.requirements],
    ];
  }
  return [
    ...base,
    ["Location", [lead.city, lead.state, lead.country].filter(Boolean).join(", ")],
    ["Message", lead.message || lead.requirements || lead.note],
  ];
}

function paymentDetails(order, paid, failed) {
  const error = order.paymentError || order.razorpayError || order.error || {};
  const failureReason =
    error.description ||
    error.reason ||
    error.message ||
    order.failureReason ||
    order.failureMessage ||
    "Razorpay has not returned a detailed failure reason for this transaction yet.";
  return [
    ["Product", order.product?.name || order.productName || order.productId],
    ["Amount", money(paidAmount(order))],
    ["Payment status", paid ? "Payment captured successfully" : failed ? "Payment failed" : order.status || "Pending"],
    ["Razorpay message", paid ? "Payment captured by Razorpay." : failureReason],
    ["Customer", order.customer?.name || order.customerName],
    ["Email", order.customer?.email || order.customerEmail],
    ["Phone", order.customer?.phone || order.customerPhone],
  ];
}

function Certificates({ data, adminEmail }) {
  const [workshopCode, setWorkshopCode] = useState("");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const workshopKey = normalizeWorkshopCode(workshopCode);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("Reading file...");
    try {
      const parsed = await readSheetRows(file);
      const mapped = parsed.map(mapStudentRow).filter((row) => row.rollKey);
      setRows(mapped.map((row) => ({
        ...row,
        workshopCode,
        workshopKey,
        eligibilityId: makeEligibilityId(row.rollKey, workshopKey),
      })));
      setStatus(`${mapped.length} student records ready.`);
    } catch (err) {
      setStatus(err.message || "Could not read file.");
    }
  };

  const upload = async () => {
    if (!workshopKey || !rows.length) return;
    setStatus("Uploading certificate eligibility records...");
    await uploadEligibleStudents(rows, workshopKey, fileName, adminEmail);
    setStatus(`Uploaded ${rows.length} eligible student records.`);
  };

  return (
    <div className="admin-stack">
      <div className="admin-grid two">
        <Panel title="Upload Eligible Students" icon={FileUp}>
          <div className="cert-admin-form">
            <select value={workshopCode} onChange={(e) => setWorkshopCode(e.target.value)}>
              <option value="">Select WorkShop code</option>
              {SESSION_CODE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={!workshopKey} />
            <button className="admin-primary" onClick={upload} disabled={!rows.length || !workshopKey}>Upload Records</button>
            {status && <p>{status}</p>}
          </div>
        </Panel>
        <Panel title="Certificate Registry" icon={ClipboardList}>
          <div className="admin-mini-stats">
            <div><strong>{data.certificates.length}</strong><span>Issued certificates</span></div>
            <div><strong>{data.eligibleRegistrations.length}</strong><span>Eligible registrations</span></div>
            <div><strong>{data.eligibleRegistrations.filter((item) => item.certificateId).length}</strong><span>Registered</span></div>
          </div>
        </Panel>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Roll</th><th>Name</th><th>Workshop</th><th>Payment</th><th>Certificate</th></tr></thead>
          <tbody>
            {data.eligibleRegistrations.slice(0, 80).map((item) => (
              <tr key={item.id}>
                <td>{item.rollNo || item.rollKey}</td>
                <td>{item.fullName || "Name not provided"}</td>
                <td>{item.workshopKey || item.workshopCode}</td>
                <td><Status text={item.paymentStatus || (item.feePaid === false ? "unpaid" : "paid")} /></td>
                <td>{item.certificateId || "Not registered"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Security({ user }) {
  return (
    <div className="admin-stack">
      <div className="admin-grid two">
        <Panel title="Authentication Policy" icon={ShieldCheck}>
          <ul className="security-list">
            <li><CheckCircle2 size={17} /> Email/password admin login, no Google sign-in.</li>
            <li><CheckCircle2 size={17} /> Second-factor gate active for local admin review.</li>
            <li><CheckCircle2 size={17} /> Firestore admin reads/writes guarded by admin email or custom claim.</li>
            <li><AlertTriangle size={17} /> Production TOTP should be enabled in Firebase Identity Platform or moved to backend OTP before launch.</li>
          </ul>
        </Panel>
        <Panel title="Signed Session" icon={Lock}>
          <div className="session-card">
            <strong>{user.email}</strong>
            <span>UID: {user.uid}</span>
            {user.isLocalReview && <span>Mode: local review credentials</span>}
            <span>Session second factor: verified for this browser tab</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PeriodTabs({ value, onChange }) {
  const activeIndex = Math.max(0, PERIODS.findIndex((period) => period.id === value));
  return (
    <div className="period-tabs" style={{ "--active-index": activeIndex }} aria-label="Dashboard period">
      <span className="period-tabs-indicator" aria-hidden="true" />
      {PERIODS.map((period) => (
        <button
          key={period.id}
          className={value === period.id ? "active" : ""}
          onClick={() => onChange(period.id)}
          type="button"
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

function KpiGrid({ metrics }) {
  const cards = [
    ["Revenue", money(metrics.revenueTotal), CircleDollarSign],
    ["Avg. Revenue", money(metrics.averageRevenue), TrendingUp],
    ["Successful Payments", metrics.paidOrders.length, CheckCircle2],
    ["Pending Deliveries", metrics.pendingDeliveries, PackageCheck],
    ["Enquiries", metrics.leadCount, Mail],
    ["Unique Sessions", metrics.uniqueSessions, Users],
  ];
  return <div className="kpi-grid">{cards.map(([label, value, Icon]) => <div className="kpi-card" key={label}><Icon size={21} /><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function Panel({ title, icon: Icon, children, className = "" }) {
  return <section className={`admin-panel ${className}`.trim()}><h2>{Icon && <Icon size={19} />} {title}</h2>{children}</section>;
}

function Status({ text }) {
  const normalized = String(text || "").toLowerCase();
  return <span className={`admin-status ${normalized}`}>{text}</span>;
}

function RevenueTrendChart({ rows, products }) {
  const sourceRows = rows.length ? rows : [{ Period: "No data", Product: "Revenue", Revenue: 0 }];
  const visibleProducts = products.length ? products : ["Revenue"];
  const datasetWithFilters = visibleProducts.map((product) => ({
    id: `dataset_${product}`,
    fromDatasetId: "dataset_raw",
    transform: {
      type: "filter",
      config: { dimension: "Product", "=": product },
    },
  }));
  const option = {
    color: ["#00dc82", "#60a5fa", "#f59e0b", "#a78bfa", "#22d3ee", "#f472b6"],
    backgroundColor: "transparent",
    animationDuration: 2200,
    animationEasing: "cubicOut",
    dataset: [
      {
        id: "dataset_raw",
        dimensions: ["Period", "Product", "Revenue"],
        source: sourceRows,
      },
      ...datasetWithFilters,
    ],
    tooltip: {
      trigger: "axis",
      order: "valueDesc",
      backgroundColor: "rgba(9,9,11,0.94)",
      borderColor: "rgba(255,255,255,0.12)",
      textStyle: { color: "#fafafa", fontSize: 12 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(255,255,255,0.18)" } },
      valueFormatter: (value) => money(value),
    },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 8,
      itemHeight: 8,
      icon: "circle",
      textStyle: { color: "#a1a1aa", fontSize: 12 },
    },
    grid: { left: 28, right: 122, top: 48, bottom: 34, containLabel: true },
    xAxis: {
      type: "category",
      nameLocation: "middle",
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisTick: { show: false },
      axisLabel: { color: "#8b8b95", fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.075)" } },
      axisLabel: { color: "#8b8b95", fontSize: 11, formatter: (value) => compactMoney(value) },
    },
    series: visibleProducts.map((product) => ({
      name: product,
      type: "line",
      datasetId: `dataset_${product}`,
      smooth: false,
      showSymbol: rows.length <= visibleProducts.length * 2,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 2.2, cap: "round", join: "round" },
      endLabel: {
        show: true,
        color: "#d4d4d8",
        fontSize: 11,
        formatter: (params) => `${params.value.Product}: ${compactMoney(params.value.Revenue)}`,
      },
      labelLayout: { moveOverlap: "shiftY" },
      emphasis: { focus: "series", scale: true },
      encode: {
        x: "Period",
        y: "Revenue",
        label: ["Product", "Revenue"],
        itemName: "Period",
        tooltip: ["Revenue"],
      },
    })),
  };

  return <EChart option={option} className="echart-box" />;
}

function TrafficChart({ data }) {
  const entries = data.length ? data : [{ key: "No data", label: "No data", value: 0 }];
  const option = {
    color: ["#60a5fa", "#00dc82"],
    animationDuration: 850,
    animationEasing: "cubicOut",
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(9,9,11,0.94)",
      borderColor: "rgba(255,255,255,0.12)",
      textStyle: { color: "#fafafa", fontSize: 12 },
    },
    grid: { left: 34, right: 18, top: 24, bottom: 34, containLabel: true },
    xAxis: {
      type: "category",
      data: entries.map((item) => item.label),
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
      axisTick: { show: false },
      axisLabel: { color: "#8b8b95", fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      min: 0,
      minInterval: 1,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.075)" } },
      axisLabel: { color: "#8b8b95", fontSize: 11 },
    },
    series: [
      {
        name: "Visitors",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
        data: entries.map((item) => item.value || 0),
      },
      {
        name: "Trend",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        data: entries.map((item) => item.value || 0),
      },
    ],
  };
  return <EChart option={option} className="echart-box traffic-echart" />;
}

function EChart({ option, className = "" }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    chartInstance.current = echarts.init(chartRef.current, null, { renderer: "canvas" });
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current) return undefined;
    chartInstance.current.setOption(option, true);
    const resize = () => chartInstance.current?.resize();
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [option]);

  return <div ref={chartRef} className={className} role="img" aria-label="Analytics chart" />;
}

function PaymentHealth({ metrics }) {
  const segments = [
    { label: "Successful", value: metrics.paidOrders.length, color: "#00dc82" },
    { label: "Cancelled", value: metrics.cancelledPayments, color: "#f59e0b" },
    { label: "Failed", value: metrics.failedPayments, color: "#ef4444" },
    { label: "Abandoned", value: metrics.abandonedProducts, color: "#60a5fa" },
  ];
  const total = Math.max(segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  let offset = 0;
  const gradient = segments.map((segment) => {
    const start = offset;
    offset += (segment.value / total) * 100;
    return `${segment.color} ${start}% ${offset}%`;
  }).join(", ");
  const successRate = Math.round((metrics.paidOrders.length / total) * 100);

  return (
    <div className="payment-health">
      <div className="payment-ring" style={{ "--payment-gradient": `conic-gradient(${gradient})` }}>
        <div>
          <strong>{successRate}%</strong>
          <span>success</span>
        </div>
      </div>
      <div className="payment-health-grid">
        {segments.map((segment) => (
          <div key={segment.label} className="payment-health-item">
            <i style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, color }) {
  const entries = topEntries(data, 14).sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...entries.map(([, value]) => value), 1);
  const points = entries.map(([_, value], index) => `${(index / Math.max(entries.length - 1, 1)) * 100},${100 - (value / max) * 84 - 8}`).join(" ");
  return <div className="chart-box"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg><ChartLabels entries={entries} /></div>;
}

function BarChart({ data }) {
  const entries = topEntries(data, 12).sort((a, b) => a[0].localeCompare(b[0]));
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return <div className="bar-chart">{entries.map(([label, value]) => <div key={label}><span>{label.slice(5)}</span><i style={{ height: `${Math.max(6, (value / max) * 100)}%` }} /><strong>{value}</strong></div>)}</div>;
}

function ChartLabels({ entries }) {
  return <div className="chart-labels"><span>{entries[0]?.[0] || "Start"}</span><span>{entries.at(-1)?.[0] || "Now"}</span></div>;
}

function Donut({ segments }) {
  const total = Math.max(segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  let offset = 0;
  const gradient = segments.map((segment) => {
    const start = offset;
    offset += (segment.value / total) * 100;
    return `${segment.color} ${start}% ${offset}%`;
  }).join(", ");
  return <div className="donut-wrap"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><span>{total}</span></div><div>{segments.map((s) => <p key={s.label}><i style={{ background: s.color }} />{s.label}: {s.value}</p>)}</div></div>;
}

function InsightList({ title, items }) {
  return (
    <section className="admin-panel">
      <h2>{title}</h2>
      <div className="insight-list">
        {items.length ? items.map((item, index) => {
          const [label, value, meta] = Array.isArray(item) ? item : [item.label, item.value, item.meta];
          return (
            <div className="insight-row" key={`${label}-${index}`}>
              <span className="insight-rank">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{label || "Unknown"}</strong>
                {meta && <small>{meta}</small>}
              </div>
              <b>{value}</b>
            </div>
          );
        }) : <p className="empty">No public website data yet.</p>}
      </div>
    </section>
  );
}

function RankList({ title, items }) {
  return <section className="admin-panel"><h2>{title}</h2><div className="rank-list">{items.length ? items.map(([label, value]) => <div key={label}><span>{label || "Unknown"}</span><strong>{value}</strong></div>) : <p className="empty">No data yet.</p>}</div></section>;
}

function IndiaHeatMap({ stateCounts, telemetryPoints }) {
  const [selectedState, setSelectedState] = useState("India");
  const [hoveredState, setHoveredState] = useState(null);
  const max = Math.max(...Object.values(stateCounts), 1);
  const activeState = hoveredState || selectedState || "India";
  const totalCount = Object.values(stateCounts).reduce((sum, value) => sum + value, 0);
  const activeCount = activeState && activeState !== "India" ? stateCounts[activeState] || 0 : totalCount;
  const selectedTelemetry = selectedState && selectedState !== "India"
    ? telemetryPoints.filter((point) => normalizeState(point.region || point.state) === selectedState)
    : telemetryPoints;
  const markers = useMemo(() => spreadTelemetryMarkers(telemetryPoints.slice(0, 850)), [telemetryPoints]);

  return (
    <div className="india-map-suite">
      <div className="india-map-shell">
        <svg className="india-geo-map" viewBox={indiaMap.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label="India visitor location map">
          <g className="india-state-layer">
            {indiaMap.locations.map((location) => {
              const state = normalizeState(location.name);
              const value = stateCounts[state] || 0;
              const selected = selectedState === state;
              return (
                <path
                  key={location.id}
                  data-state={state}
                  className={`india-state-path${selected ? " active" : ""}`}
                  d={location.path}
                  style={{ "--heat": value / max }}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => setSelectedState((current) => current === state ? "India" : state)}
                />
              );
            })}
          </g>
          <g className="visitor-marker-layer">
            {markers.map((marker) => (
              <circle
                key={marker.id}
                cx={marker.x}
                cy={marker.y}
                r={marker.radius}
                className="visitor-marker"
              >
                <title>{`${marker.city || marker.region || "Visitor"} - ${marker.region || "India"}`}</title>
              </circle>
            ))}
          </g>
          {selectedState !== "India" && (
            <g className="selected-state-outline">
              {indiaMap.locations
                .filter((location) => normalizeState(location.name) === selectedState)
                .map((location) => <path key={`outline-${location.id}`} d={location.path} />)}
            </g>
          )}
        </svg>
        <div className="map-tooltip">
          <span>{activeState}</span>
          <strong>{activeCount}</strong>
          <small>{activeState === "India" ? "tracked sessions" : "state sessions"}</small>
        </div>
      </div>
      <div className="state-zoom-card">
        <span>{selectedState === "India" ? "National View" : "Selected State"}</span>
        <h3>{selectedState}</h3>
        <strong>{activeCount}</strong>
        <p>{selectedState === "India" ? "total tracked sessions" : "tracked state sessions"}</p>
        <div className="region-breakdown">
          {["Telemetry points", "Active cities", "Selected state", "Visible markers"].map((region, index) => (
            <div key={region}>
              <span>{region}</span>
              <b>{index === 0 ? selectedTelemetry.length : index === 1 ? uniqueCities(selectedTelemetry) : index === 2 ? selectedState : markers.length}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ items }) {
  return (
    <Panel title="Recent Activity" icon={Eye} className="recent-panel">
      <div className="recent-table">
        <div className="recent-table-head">
          <span>Activity</span>
          <span>Bought Kit / Source</span>
          <span>User</span>
          <span>Timestamp</span>
        </div>
        {items.length ? items.slice(0, 10).map((item, index) => (
          <div className="recent-table-row" key={`${item.type}-${index}`}>
            <span><i className={`activity-dot ${item.tone}`} />{item.type}</span>
            <span>{item.source}</span>
            <strong>{item.user}</strong>
            <time>{formatDateTime(item.date)}</time>
          </div>
        )) : <div className="recent-empty">No recent public activity yet.</div>}
      </div>
    </Panel>
  );
}

function computeMetrics(data, period = "lifetime") {
  const publicEvents = data.analyticsEvents.filter(isPublicEvent);
  const periodEvents = publicEvents.filter((event) => withinPeriod(event.createdAt || event.clientCreatedAt, period));
  const paidOrders = data.orders.filter((order) => isPaid(order) && withinPeriod(order.createdAt || order.paidAt, period));
  const periodLeads = data.leads.filter((lead) => withinPeriod(lead.createdAt, period));
  const revenueTotal = paidOrders.reduce((sum, order) => sum + paidAmount(order), 0);
  const revenueSeries = makeSeries(paidOrders, period, (order) => order.createdAt || order.paidAt, paidAmount);
  const { rows: revenueTrendRows, products: revenueProducts } = makeRevenueTrendRows(paidOrders, period);
  const successSeries = makeSeries(paidOrders, period, (order) => order.createdAt || order.paidAt);
  const failedEvents = periodEvents.filter((event) => /fail|failed/i.test(event.label || event.type || ""));
  const cancelledEvents = periodEvents.filter((event) => /cancel|cancelled/i.test(event.label || event.type || ""));
  const abandonedEvents = periodEvents.filter((event) => /abandon|checkout|product/i.test(event.label || event.path || ""));
  const failedSeries = makeSeries(failedEvents, period, (event) => event.createdAt || event.clientCreatedAt);
  const cancelledSeries = makeSeries(cancelledEvents, period, (event) => event.createdAt || event.clientCreatedAt);
  const abandonedSeries = makeSeries(abandonedEvents, period, (event) => event.createdAt || event.clientCreatedAt);
  const visitSeries = makeSeries(
    periodEvents.filter((event) => event.type === "page_view"),
    period,
    (event) => event.createdAt || event.clientCreatedAt
  );
  const stateCounts = bucketBy([...periodEvents, ...paidOrders], (item) => normalizeState(eventState(item) || orderState(item)));
  const telemetryPoints = [
    ...(data.telemetryData || []).filter((point) => withinPeriod(point.timestamp || point.createdAt || point.clientCreatedAt, period)),
    ...periodEvents.filter((event) => event.latitude || event.longitude || event.state || event.region),
  ].map(toTelemetryPoint).filter(Boolean);
  const topPages = topEntries(
    bucketBy(periodEvents.filter((event) => event.type === "page_view"), (event) => pageLabel(event.path, event.pageName)),
    8
  ).map(([label, value]) => [label, value, "Page views"]);
  const topClicks = topEntries(
    bucketBy(periodEvents.filter((event) => event.type === "click"), (event) => insightLabel(event, "Button")),
    8
  );
  const topFormsSections = topEntries(
    bucketBy(
      periodEvents.filter((event) => ["form_view", "form_submit", "section_view"].includes(event.type)),
      (event) => insightLabel(event, event.type === "section_view" ? "Section" : "Form")
    ),
    8
  );
  const topInteractions = topEntries(
    bucketBy(
      periodEvents.filter((event) => ["click", "form_submit", "section_view"].includes(event.type) && !isNavigationEvent(event)),
      (event) => insightLabel(event, "Asset")
    ),
    10
  );
  const sessions = new Set(periodEvents.map((event) => event.sessionId).filter(Boolean));
  const cancelledPayments = periodEvents.filter((event) => /cancel/i.test(event.label || event.type || "")).length;
  const failedPayments = periodEvents.filter((event) => /fail/i.test(event.label || event.type || "")).length;
  const productViews = periodEvents.filter((event) => event.path === "/products" || /product/i.test(event.label || "")).length;
  const checkoutStarts = periodEvents.filter((event) => event.path === "/checkout" || /payment|checkout/i.test(event.label || "")).length;

  return {
    period,
    periodEvents,
    paidOrders,
    revenueTotal,
    revenueTrendRows,
    revenueProducts,
    averageRevenue: paidOrders.length ? revenueTotal / paidOrders.length : 0,
    revenueSeries,
    successSeries,
    failedSeries,
    cancelledSeries,
    abandonedSeries,
    visitSeries,
    stateCounts,
    telemetryPoints,
    topPages,
    topClicks,
    topFormsSections,
    topInteractions,
    cancelledPayments,
    failedPayments,
    abandonedProducts: Math.max(0, productViews - checkoutStarts),
    pendingDeliveries: paidOrders.filter((order) => (order.fulfillmentStatus || "pending") !== "delivered").length,
    leadCount: periodLeads.length,
    uniqueSessions: sessions.size,
    recentActivities: buildRecentActivities(data, period, periodEvents),
  };
}

function normalizeState(value) {
  const text = String(value || "").trim().toLowerCase();
  return INDIA_STATES.find((state) => state.toLowerCase() === text) || (text ? text.replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown");
}

function toTelemetryPoint(item) {
  const region = normalizeState(item.region || item.state || item.customerRegion || item.geo?.state);
  const fallback = STATE_GEO[region];
  const latitude = Number(item.latitude ?? item.lat ?? item.geo?.latitude ?? fallback?.[0]);
  const longitude = Number(item.longitude ?? item.lon ?? item.lng ?? item.geo?.longitude ?? fallback?.[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { ...item, region, latitude, longitude };
}

function stateCoordinate(state) {
  return STATE_GEO[normalizeState(state)] || [22.9, 79.1];
}

function projectTelemetryPoint(point) {
  const longitude = Number(point.longitude);
  const latitude = Number(point.latitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    const [left, top] = STATE_LAYOUT[normalizeState(point.region)] || [50, 50];
    return [left, top];
  }
  const x = ((longitude - 68.1) / (97.4 - 68.1)) * 78 + 11;
  const y = ((37.4 - latitude) / (37.4 - 6.7)) * 88 + 5;
  return [Math.max(3, Math.min(97, x)), Math.max(3, Math.min(97, y))];
}

function projectTelemetrySvgPoint(point) {
  const longitude = Number(point.longitude);
  const latitude = Number(point.latitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    const [xPercent, yPercent] = projectTelemetryPoint(point);
    return [(xPercent / 100) * 612, (yPercent / 100) * 696];
  }
  const x = ((longitude - 68.1) / (97.4 - 68.1)) * 545 + 36;
  const y = ((37.4 - latitude) / (37.4 - 6.7)) * 620 + 38;
  return [Math.max(8, Math.min(604, x)), Math.max(8, Math.min(688, y))];
}

function spreadTelemetryMarkers(points) {
  const occupied = new globalThis.Map();
  return points
    .map((point, index) => {
      const [rawX, rawY] = projectTelemetrySvgPoint(point);
      const bucketX = Math.round(rawX / 13);
      const bucketY = Math.round(rawY / 13);
      return { point, index, rawX, rawY, bucketX, bucketY, sortKey: telemetryMarkerSortKey(point, index) };
    })
    .sort((a, b) => a.bucketY - b.bucketY || a.bucketX - b.bucketX || a.sortKey.localeCompare(b.sortKey))
    .map(({ point, index, rawX, rawY, bucketX, bucketY }) => {
    const key = `${bucketX}:${bucketY}`;
    const count = occupied.get(key) || 0;
    occupied.set(key, count + 1);
    const ring = Math.floor(count / 10) + 1;
    const angle = (count % 10) * ((Math.PI * 2) / 10);
    const offset = count ? ring * 4.6 : 0;
    return {
      id: point.id || `${point.sessionId || "visitor"}-${index}`,
      x: Math.max(7, Math.min(605, rawX + Math.cos(angle) * offset)),
      y: Math.max(7, Math.min(689, rawY + Math.sin(angle) * offset)),
      radius: count ? 3.7 : 4.2,
      city: point.city,
      region: point.region,
    };
  });
}

function telemetryMarkerSortKey(point, index) {
  const id = String(point.id || point.sessionId || "");
  const numeric = id.match(/\d+/g)?.join("").padStart(14, "0");
  return `${numeric || "99999999999999"}-${id || index}`;
}

function uniqueCities(points) {
  return new Set(points.map((point) => point.city || point.region).filter(Boolean)).size;
}

function statePath(state) {
  const [cx, cy] = STATE_LAYOUT[state] || [50, 50];
  const size = stateShapeSize(state);
  const skew = ((state.length % 5) - 2) * 0.45;
  const points = [
    [cx - size.w * 0.42, cy - size.h * 0.12],
    [cx - size.w * 0.2, cy - size.h * 0.42],
    [cx + size.w * 0.24, cy - size.h * 0.38],
    [cx + size.w * 0.48, cy - size.h * 0.06],
    [cx + size.w * 0.28, cy + size.h * 0.36],
    [cx - size.w * 0.18, cy + size.h * 0.43],
    [cx - size.w * 0.5, cy + size.h * 0.14],
  ].map(([x, y], index) => `${(x + skew * index).toFixed(2)},${y.toFixed(2)}`);
  return `M ${points.join(" L ")} Z`;
}

function stateShapeSize(state) {
  const large = ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Uttar Pradesh", "Gujarat", "Karnataka", "Andhra Pradesh"];
  const compact = ["Delhi", "Goa", "Sikkim", "Tripura", "Mizoram", "Meghalaya", "Nagaland", "Manipur"];
  if (large.includes(state)) return { w: 13, h: 11 };
  if (compact.includes(state)) return { w: 7.5, h: 6 };
  return { w: 10, h: 8.5 };
}

function stateViewBox(state) {
  const [cx, cy] = STATE_LAYOUT[state] || [50, 50];
  const size = stateShapeSize(state);
  const width = Math.max(22, size.w * 2.8);
  const height = Math.max(20, size.h * 2.8);
  return `${Math.max(0, cx - width / 2)} ${Math.max(0, cy - height / 2)} ${width} ${height}`;
}

function districtLines(state) {
  const [cx, cy] = STATE_LAYOUT[state] || [50, 50];
  const size = stateShapeSize(state);
  return [
    `M ${(cx - size.w * 0.34).toFixed(2)} ${(cy - size.h * 0.08).toFixed(2)} C ${cx - 1} ${cy - size.h * 0.3}, ${cx + 1} ${cy + size.h * 0.25}, ${(cx + size.w * 0.36).toFixed(2)} ${(cy + size.h * 0.08).toFixed(2)}`,
    `M ${(cx - size.w * 0.22).toFixed(2)} ${(cy + size.h * 0.34).toFixed(2)} C ${cx - size.w * 0.05} ${cy + 1}, ${cx + size.w * 0.12} ${cy - 1}, ${(cx + size.w * 0.24).toFixed(2)} ${(cy - size.h * 0.34).toFixed(2)}`,
    `M ${(cx - size.w * 0.45).toFixed(2)} ${(cy + size.h * 0.12).toFixed(2)} C ${cx - size.w * 0.06} ${cy + size.h * 0.02}, ${cx + size.w * 0.08} ${cy - size.h * 0.06}, ${(cx + size.w * 0.42).toFixed(2)} ${(cy - size.h * 0.08).toFixed(2)}`,
  ];
}

function isPublicEvent(event) {
  const path = String(event.path || "");
  const label = String(event.label || "");
  return !path.startsWith("/admin") && !/admin login|two-factor|overview|traffic|orders|security/i.test(label);
}

function eventDate(value) {
  const ms = dateMs(value);
  return ms ? new Date(ms) : new Date();
}

function withinPeriod(value, period) {
  if (period === "lifetime") return true;
  const date = eventDate(value);
  const now = new Date();
  if (period === "today") {
    return date.toDateString() === now.toDateString();
  }
  if (period === "monthly") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  if (period === "yearly") {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

function periodUnit(period) {
  return PERIODS.find((item) => item.id === period)?.unit || "Period";
}

function seriesKey(date, period) {
  if (period === "today") return String(date.getHours()).padStart(2, "0");
  if (period === "monthly") return String(date.getDate()).padStart(2, "0");
  if (period === "yearly") return String(date.getMonth() + 1).padStart(2, "0");
  return String(date.getFullYear());
}

function seriesLabel(key, period) {
  if (period === "today") return `${key}:00`;
  if (period === "monthly") return `Day ${Number(key)}`;
  if (period === "yearly") {
    return new Date(2026, Number(key) - 1, 1).toLocaleString("en-IN", { month: "short" });
  }
  return key;
}

function makeSeries(items, period, dateFn, valueFn = () => 1) {
  const map = bucketBy(items, (item) => seriesKey(eventDate(dateFn(item)), period), valueFn);
  const keys = seriesKeysForPeriod(period, map);
  return keys.map((key) => ({
    key,
    label: seriesLabel(key, period),
    value: map[key] || 0,
  }));
}

function makeRevenueTrendRows(orders, period) {
  const productTotals = {};
  const keyed = {};
  orders.forEach((order) => {
    const product = productLabel(order);
    const key = seriesKey(eventDate(order.createdAt || order.paidAt), period);
    const mapKey = `${key}__${product}`;
    keyed[mapKey] = (keyed[mapKey] || 0) + paidAmount(order);
    productTotals[product] = (productTotals[product] || 0) + paidAmount(order);
  });
  const products = topEntries(productTotals, 6).map(([label]) => label);
  const keys = seriesKeysForPeriod(period, Object.fromEntries(Object.keys(keyed).map((item) => [item.split("__")[0], 1])));
  const activeProducts = products.length ? products : ["Revenue"];
  return {
    products: activeProducts,
    rows: keys.flatMap((key) =>
      activeProducts.map((product) => ({
        Period: seriesLabel(key, period),
        Product: product,
        Revenue: keyed[`${key}__${product}`] || 0,
      }))
    ),
  };
}

function productLabel(order) {
  const raw = order.product?.name || order.productName || order.productId || "Product Revenue";
  return String(raw)
    .replace(/^ARC LABS\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30);
}

function seriesKeysForPeriod(period, map) {
  const now = new Date();
  if (period === "today") return Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  if (period === "monthly") {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, index) => String(index + 1).padStart(2, "0"));
  }
  if (period === "yearly") return Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  const years = Object.keys(map).length ? Object.keys(map).sort() : [String(now.getFullYear())];
  return years;
}

function pageLabel(path, fallback) {
  return PAGE_NAMES[path] || fallback || "Website";
}

function insightLabel(event, fallback) {
  const location = event.location || pageLabel(event.path, event.pageName);
  const raw = event.actionName || event.sectionName || event.label || fallback;
  const cleaned = String(raw)
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
  return `${cleaned || fallback} (${location})`;
}

function isNavigationEvent(event) {
  const label = String(event.label || event.actionName || "").toLowerCase();
  const href = String(event.href || "");
  const navLabels = ["home", "about us", "iiot solutions", "programs", "products", "lab packages", "csr", "verify", "admin login", "get started"];
  return href.startsWith("/") || navLabels.some((item) => label === item || label.startsWith(`${item} (`));
}

function buildRecentActivities(data, period, events) {
  const orderItems = data.orders
    .filter((order) => withinPeriod(order.createdAt || order.paidAt, period))
    .map((order) => ({
      type: isPaid(order) ? "Payment Paid" : "Failed/Pending Transaction",
      source: order.product?.name || order.productName || order.productId || "Kit order",
      user: order.customer?.name || order.customerName || order.customer?.email || order.customerEmail || "Customer",
      date: order.createdAt || order.paidAt,
      tone: isPaid(order) ? "success" : "warning",
    }));

  const leadItems = data.leads
    .filter((lead) => withinPeriod(lead.createdAt, period))
    .map((lead) => ({
      type: leadActivityType(lead),
      source: lead.workshopTitle || lead.packageName || lead.institution || lead.company || lead.source || lead.leadType || "Website form",
      user: lead.name || lead.fullName || lead.email || lead.phone || "Visitor",
      date: lead.createdAt,
      tone: "info",
    }));

  const intentItems = events
    .filter((event) => ["click", "form_submit"].includes(event.type))
    .map((event) => {
      const label = String(event.label || event.actionName || event.href || "");
      if (/whatsapp|wa\.me/i.test(label + event.href)) {
        return activityFromEvent(event, "WhatsApp Enquiry", "WhatsApp CTA", "success");
      }
      if (/mailto|email/i.test(label + event.href)) {
        return activityFromEvent(event, "Email Intent", "Email CTA", "info");
      }
      if (/download|brochure|syllabus|curriculum/i.test(label)) {
        return activityFromEvent(event, "Brochure/Syllabus Download", event.sectionName || "Download", "warning");
      }
      if (/contact/i.test(label)) {
        return activityFromEvent(event, "General Contact Form", event.sectionName || "Contact", "info");
      }
      return null;
    })
    .filter(Boolean);

  return [...orderItems, ...leadItems, ...intentItems]
    .sort((a, b) => dateMs(b.date) - dateMs(a.date))
    .slice(0, 10);
}

function leadActivityType(lead) {
  const text = `${lead.leadType || ""} ${lead.source || ""} ${lead._collection || ""}`.toLowerCase();
  if (text.includes("program") || text.includes("curriculum")) return "Program Curriculum Enquiry";
  if (text.includes("proposal") || text.includes("lab")) return "Lab Setup Request";
  if (text.includes("csr")) return "Lab Setup Request";
  return "General Contact Form";
}

function activityFromEvent(event, type, source, tone) {
  return {
    type,
    source,
    user: event.location || pageLabel(event.path, event.pageName),
    date: event.createdAt || event.clientCreatedAt,
    tone,
  };
}

function friendlyAuthError(err) {
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Invalid admin email or password.";
    case "auth/user-not-found":
      return "No admin account exists for this email.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a while and try again.";
    default:
      return err?.message || "Login failed.";
  }
}

async function readSheetRows(file) {
  if (file.name.toLowerCase().endsWith(".csv")) return parseCsv(await file.text());
  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

async function loadXlsx() {
  if (window.XLSX) return window.XLSX;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = XLSX_CDN;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Excel parser."));
    document.head.appendChild(script);
  });
  return window.XLSX;
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(headerLine || "");
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
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
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
