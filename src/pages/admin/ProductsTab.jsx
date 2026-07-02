import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, Plus, Search, X } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase";
import { PRODUCT_CATALOG as STATIC_PRODUCTS } from "../Products";
import {
  COMPARE_TEMPLATE,
  DEFAULT_BADGE_BG,
  DEFAULT_BADGE_COLOR,
  DEFAULT_BEST_SELLER_COLOR,
  DEFAULT_PRODUCT_COLOR,
  DEFAULT_PRODUCT_GLOW,
  DEFAULT_SHIPPING,
  INCLUDE_CATEGORIES,
  defaultBadgeForTier,
  defaultCompareValues,
  formatTier,
  normalizeProduct,
  productInputName,
  saveProduct,
} from "../../services/productsData";

const SPEC_FIELDS = [
  { key: "controllers", title: "Controllers / MCU's" },
  { key: "sensors", title: "Sensors" },
  { key: "display", title: "Display & Output" },
  { key: "actuators", title: "Actuators" },
  { key: "connectivity", title: "Connectivity & Power" },
];

const EMPTY_INCLUDE = INCLUDE_CATEGORIES.map((category) => ({
  category: category.id,
  label: category.label,
  name: "",
  desc: "",
}));

function productToForm(product = {}) {
  const normalized = normalizeProduct(product);
  return {
    ...normalized,
    tierNumber: String(normalized.tier || "").match(/\d+/)?.[0] || "",
    nameInput: productInputName(normalized.name),
    badge: normalized.badge || defaultBadgeForTier(normalized.tier),
    bestSellerColor: normalized.bestSellerColor || DEFAULT_BEST_SELLER_COLOR,
    shipping: {
      ...DEFAULT_SHIPPING,
      ...(normalized.shipping || {}),
      shipmentType: "forward",
      paymentType: "prepaid",
    },
    includes: INCLUDE_CATEGORIES.map((category) => {
      const existing = (normalized.includes || []).find((item) => item.category === category.id || item.label === category.label);
      return existing || { category: category.id, label: category.label, name: "", desc: "" };
    }),
    compare: normalized.compare || defaultCompareValues(normalized),
  };
}

function formToProduct(form) {
  const tier = formatTier(form.tierNumber);
  const product = {
    ...form,
    tier,
    name: form.nameInput,
    short: form.nameInput,
    color: DEFAULT_PRODUCT_COLOR,
    glow: DEFAULT_PRODUCT_GLOW,
    badge: form.badge || defaultBadgeForTier(tier),
    badgeBg: DEFAULT_BADGE_BG,
    badgeColor: DEFAULT_BADGE_COLOR,
    price: Number(form.price || 0),
    oldPrice: Number(form.oldPrice || 0),
    isBest: Boolean(form.isBest),
    bestSellerColor: form.bestSellerColor || DEFAULT_BEST_SELLER_COLOR,
    galleryImages: (form.galleryImages || []).slice(0, 10),
    includes: (form.includes || []).filter((item) => item.name || item.desc),
    useCases: (form.useCases || []).filter((item) => item.title || item.desc),
    shipping: {
      ...form.shipping,
      shipmentType: "forward",
      paymentType: "prepaid",
      actualWeightKg: Number(form.shipping.actualWeightKg || 0),
      lengthCm: Number(form.shipping.lengthCm || 0),
      breadthCm: Number(form.shipping.breadthCm || 0),
      heightCm: Number(form.shipping.heightCm || 0),
      shipmentValue: Number(form.shipping.shipmentValue || form.price || 0),
      dangerousGoods: Boolean(form.shipping.dangerousGoods),
      secureShipment: Boolean(form.shipping.secureShipment),
    },
  };
  return normalizeProduct(product);
}

function slugify(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uploadProductImage(file, productId, type) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${productId || "draft"}/${type}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

function Field({ label, children, hint }) {
  return (
    <label className="product-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function ProductTabs({ value, onChange }) {
  return (
    <div className="admin-tabs product-inner-tabs">
      {[
        ["specs", "Specification"],
        ["included", "What's Included"],
        ["usecases", "Use Cases"],
        ["compare", "Compare All"],
      ].map(([id, label]) => (
        <button key={id} className={value === id ? "active" : ""} type="button" onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ChipListEditor({ title, items, onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...(items || []), value]);
    setDraft("");
  };
  return (
    <div className="product-edit-card">
      <div className="product-edit-card-head">
        <h4>{title}</h4>
        <button type="button" className="icon-only-add" onClick={add} title="Add item"><Plus size={18} /></button>
      </div>
      <div className="chip-editor-input">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={`Add ${title}`} />
      </div>
      <div className="admin-chip-list">
        {(items || []).map((item, index) => (
          <span className="admin-skill-chip" key={`${item}-${index}`}>
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}><X size={13} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function IncludesEditor({ items, onChange }) {
  const updateItem = (index, patch) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  return (
    <div className="product-include-grid">
      {INCLUDE_CATEGORIES.map((category, index) => {
        const item = items[index] || EMPTY_INCLUDE[index];
        return (
          <div className="product-edit-card compact" key={category.id}>
            <div className="product-edit-card-head">
              <h4>{category.title}</h4>
              <span className="inbox-icon">{category.label}</span>
            </div>
            <div className="include-inputs">
              <input value={item.name || ""} onChange={(e) => updateItem(index, { name: e.target.value, category: category.id, label: category.label })} placeholder="Heading" />
              <input value={item.desc || ""} onChange={(e) => updateItem(index, { desc: e.target.value, category: category.id, label: category.label })} placeholder="Description" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UseCasesEditor({ items, onChange }) {
  const [draft, setDraft] = useState(null);
  const addDraft = () => setDraft({ title: `Use Case ${items.length + 1}`, desc: "" });
  const save = () => {
    if (!draft?.title && !draft?.desc) return;
    onChange([...items, draft]);
    setDraft(null);
  };
  return (
    <div className="usecase-admin-grid">
      {items.map((item, index) => (
        <div className="usecase-card admin-usecase-card" key={`${item.title}-${index}`}>
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))}><X size={14} /></button>
          <div className="usecase-num">USE CASE {String(index + 1).padStart(2, "0")}</div>
          <div className="usecase-title">{item.title}</div>
          <div className="usecase-desc">{item.desc}</div>
        </div>
      ))}
      {draft ? (
        <div className="product-edit-card usecase-draft">
          <input value={draft.title} onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Heading" />
          <textarea value={draft.desc} onChange={(e) => setDraft((prev) => ({ ...prev, desc: e.target.value }))} placeholder="Description" />
          <button type="button" className="admin-primary" onClick={save}>Add</button>
        </div>
      ) : (
        <button type="button" className="empty-add-card" onClick={addDraft}>Add Use Case</button>
      )}
    </div>
  );
}

function CompareEditor({ form, onChange }) {
  const setValue = (label, value) => onChange({ ...form.compare, [label]: value });
  return (
    <div className="admin-compare-editor">
      {COMPARE_TEMPLATE.map((row) => row.section ? (
        <div className="admin-compare-section" key={row.section}>{row.section}</div>
      ) : (
        <div className="admin-compare-row" key={row.label}>
          <span>{row.label}</span>
          {row.label === "Best For" || row.label === "Difficulty" || row.label === "Price" ? (
            <input value={form.compare?.[row.label] || ""} onChange={(e) => setValue(row.label, e.target.value)} placeholder={row.label} />
          ) : (
            <div className="admin-compare-actions">
              <button type="button" className={form.compare?.[row.label] === true ? "active yes" : ""} onClick={() => setValue(row.label, true)}><Check size={16} /></button>
              <button type="button" className={form.compare?.[row.label] === false ? "active no" : ""} onClick={() => setValue(row.label, false)}><X size={16} /></button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProductsAdmin({ data, adminEmail }) {
  const liveProducts = (data.products || []).map(normalizeProduct);
  const products = liveProducts.length ? liveProducts : STATIC_PRODUCTS.map(normalizeProduct);
  const currentBest = products.find((item) => item.isBest);
  const [mode, setMode] = useState("new");
  const [selectedId, setSelectedId] = useState(products[0]?.id || "");
  const [form, setForm] = useState(() => productToForm({ id: "", shipping: DEFAULT_SHIPPING, includes: EMPTY_INCLUDE }));
  const [status, setStatus] = useState("");
  const [detailTab, setDetailTab] = useState("specs");
  const [bestConfirm, setBestConfirm] = useState(null);
  const [uploading, setUploading] = useState("");

  useEffect(() => {
    if (mode !== "edit") return;
    const selected = products.find((item) => item.id === selectedId) || products[0];
    if (selected) setForm(productToForm(selected));
  }, [mode, selectedId, data.products.length]);

  const bestSellerWarning = useMemo(() => (
    form.isBest && currentBest && currentBest.id !== form.id ? currentBest : null
  ), [form.isBest, currentBest, form.id]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateShipping = (key, value) => setForm((prev) => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }));
  const updateSpec = (key, value) => setForm((prev) => ({ ...prev, [key]: value, compare: defaultCompareValues({ ...prev, [key]: value }) }));

  const cloneForNew = () => {
    setMode("new");
    setForm(productToForm({
      id: "",
      tier: "5",
      name: "",
      price: 0,
      oldPrice: 0,
      badge: "NEW",
      bestSellerColor: DEFAULT_BEST_SELLER_COLOR,
      shipping: DEFAULT_SHIPPING,
      includes: EMPTY_INCLUDE,
    }));
  };

  const uploadPrimary = async (file) => {
    if (!file) return;
    const id = form.id || slugify(form.nameInput);
    if (!id) {
      setStatus("Enter Product ID before uploading images.");
      return;
    }
    setUploading("primary");
    try {
      const url = await uploadProductImage(file, id, "primary");
      update("image", url);
      setForm((prev) => ({ ...prev, galleryImages: [{ src: url, alt: prev.nameInput || prev.name }, ...(prev.galleryImages || []).filter((img) => img.src !== url)].slice(0, 10) }));
      setStatus("Primary image uploaded.");
    } catch (err) {
      setStatus(err.message || "Image upload failed.");
    } finally {
      setUploading("");
    }
  };

  const uploadGallery = async (files) => {
    const selected = Array.from(files || []).slice(0, Math.max(0, 10 - (form.galleryImages?.length || 0)));
    if (!selected.length) return;
    const id = form.id || slugify(form.nameInput);
    if (!id) {
      setStatus("Enter Product ID before uploading images.");
      return;
    }
    setUploading("gallery");
    try {
      const uploaded = [];
      for (const file of selected) {
        const url = await uploadProductImage(file, id, "gallery");
        uploaded.push({ src: url, alt: `${form.nameInput || form.name} gallery image` });
      }
      setForm((prev) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), ...uploaded].slice(0, 10) }));
      setStatus("Gallery images uploaded.");
    } catch (err) {
      setStatus(err.message || "Gallery upload failed.");
    } finally {
      setUploading("");
    }
  };

  const save = async (force = false) => {
    if (bestSellerWarning && !force) {
      setBestConfirm(bestSellerWarning);
      return;
    }
    setStatus("Saving product...");
    try {
      const product = formToProduct(form);
      await saveProduct(product, adminEmail);
      setStatus("Product saved. Products page will update from Firestore.");
      setBestConfirm(null);
      if (mode === "new") {
        setMode("edit");
        setSelectedId(product.id);
      }
    } catch (err) {
      setStatus(err.message || "Product save failed.");
    }
  };

  return (
    <div className="admin-stack">
      <div className="admin-tabs">
        <button className={mode === "new" ? "active" : ""} onClick={cloneForNew}>New Product</button>
        <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>Edit Existing Product</button>
      </div>

      {mode === "edit" && (
        <div className="admin-toolbar product-select-toolbar">
          <Search size={17} />
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
      )}

      <section className="admin-panel product-editor">
        <h2>Product Card</h2>
        <div className="product-form-grid">
          <Field label="Product ID"><input value={form.id} onChange={(e) => update("id", slugify(e.target.value))} disabled={mode === "edit"} /></Field>
          <Field label="Tier Number" hint="Enter only the number. Example: 1 becomes TIER 01."><input type="number" min="1" value={form.tierNumber} onChange={(e) => update("tierNumber", e.target.value)} /></Field>
          <Field label="Product Name" hint="Type only the product name. ARC LABS is added automatically."><input value={form.nameInput} onChange={(e) => update("nameInput", e.target.value)} placeholder="IoT Essential Kit" /></Field>
          <Field label="Price"><input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></Field>
          <Field label="MRP / Old Price"><input type="number" value={form.oldPrice} onChange={(e) => update("oldPrice", e.target.value)} /></Field>
          <Field label="Badge"><input value={form.badge} onChange={(e) => update("badge", e.target.value.toUpperCase())} placeholder="INTERMEDIATE" /></Field>
          <Field label="Upload Primary Item Image">
            <label className="admin-upload-box">
              <ImagePlus size={18} />
              <span>{uploading === "primary" ? "Uploading..." : "Choose image"}</span>
              <input type="file" accept="image/*" onChange={(e) => uploadPrimary(e.target.files?.[0])} />
            </label>
          </Field>
          <Field label="Best Seller">
            <label className="admin-check"><input type="checkbox" checked={form.isBest} onChange={(e) => update("isBest", e.target.checked)} /> Highlight this product</label>
            {form.isBest && <input type="color" value={form.bestSellerColor || DEFAULT_BEST_SELLER_COLOR} onChange={(e) => update("bestSellerColor", e.target.value)} />}
          </Field>
        </div>
        {form.image && <img className="admin-product-preview" src={form.image} alt="Primary product preview" />}
        <Field label="Gallery Images">
          <label className="admin-upload-box">
            <ImagePlus size={18} />
            <span>{uploading === "gallery" ? "Uploading..." : `Choose up to ${10 - (form.galleryImages?.length || 0)} images`}</span>
            <input type="file" accept="image/*" multiple onChange={(e) => uploadGallery(e.target.files)} />
          </label>
        </Field>
        <div className="admin-gallery-list">
          {(form.galleryImages || []).map((image, index) => (
            <div key={`${image.src}-${index}`}>
              <img src={image.src} alt={image.alt || ""} />
              <button type="button" onClick={() => update("galleryImages", form.galleryImages.filter((_, i) => i !== index))}><X size={14} /></button>
            </div>
          ))}
        </div>
        <Field label="Tagline"><textarea value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></Field>
        <Field label="Overview"><textarea value={form.overview} onChange={(e) => update("overview", e.target.value)} /></Field>
      </section>

      <section className="admin-panel product-editor">
        <h2>Product Details</h2>
        <ProductTabs value={detailTab} onChange={setDetailTab} />
        {detailTab === "specs" && (
          <div className="product-form-grid two">
            {SPEC_FIELDS.map((field) => <ChipListEditor key={field.key} title={field.title} items={form[field.key] || []} onChange={(items) => updateSpec(field.key, items)} />)}
          </div>
        )}
        {detailTab === "included" && <IncludesEditor items={form.includes || EMPTY_INCLUDE} onChange={(items) => update("includes", items)} />}
        {detailTab === "usecases" && <UseCasesEditor items={form.useCases || []} onChange={(items) => update("useCases", items)} />}
        {detailTab === "compare" && <CompareEditor form={form} onChange={(compare) => update("compare", compare)} />}
      </section>

      <section className="admin-panel product-editor">
        <h2>Shipping / Shiprocket</h2>
        <div className="product-form-grid">
          <Field label="Shipment Type"><input value="Forward" disabled /></Field>
          <Field label="Payment Type"><input value="Prepaid" disabled /></Field>
          <Field label="Pickup Pincode"><input value={form.shipping.pickupPincode} onChange={(e) => updateShipping("pickupPincode", e.target.value)} /></Field>
          <Field label="Actual Weight KG"><input type="number" step="0.001" value={form.shipping.actualWeightKg} onChange={(e) => updateShipping("actualWeightKg", e.target.value)} /></Field>
          <Field label="Length CM"><input type="number" step="0.1" value={form.shipping.lengthCm} onChange={(e) => updateShipping("lengthCm", e.target.value)} /></Field>
          <Field label="Breadth CM"><input type="number" step="0.1" value={form.shipping.breadthCm} onChange={(e) => updateShipping("breadthCm", e.target.value)} /></Field>
          <Field label="Height CM"><input type="number" step="0.1" value={form.shipping.heightCm} onChange={(e) => updateShipping("heightCm", e.target.value)} /></Field>
          <Field label="Shipment Value"><input type="number" value={form.shipping.shipmentValue} onChange={(e) => updateShipping("shipmentValue", e.target.value)} /></Field>
          <Field label="Dangerous Goods"><label className="admin-check"><input type="checkbox" checked={form.shipping.dangerousGoods} onChange={(e) => updateShipping("dangerousGoods", e.target.checked)} /> Yes</label></Field>
          <Field label="Secure Shipment"><label className="admin-check"><input type="checkbox" checked={form.shipping.secureShipment} onChange={(e) => updateShipping("secureShipment", e.target.checked)} /> Yes</label></Field>
        </div>
        <Field label="Pickup Address"><textarea value={form.shipping.pickupAddress} onChange={(e) => updateShipping("pickupAddress", e.target.value)} /></Field>
      </section>

      <div className="product-editor-actions">
        <button className="admin-primary" type="button" onClick={() => save(false)}>Save Product</button>
        {status && <span>{status}</span>}
      </div>

      {bestConfirm && (
        <div className="admin-confirm-overlay">
          <div className="admin-confirm-card">
            <h3>Change Best Seller?</h3>
            <p>{bestConfirm.name} is already Best Seller. Continuing will remove Best Seller from it and highlight {form.nameInput || form.id} instead.</p>
            <div>
              <button className="admin-secondary" type="button" onClick={() => setBestConfirm(null)}>Close</button>
              <button className="admin-primary" type="button" onClick={() => save(true)}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
