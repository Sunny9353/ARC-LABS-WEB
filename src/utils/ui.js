import { useEffect } from "react";

let lockCount = 0;
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";

export function setBodyScrollLocked(locked) {
  if (typeof document === "undefined") return;

  if (locked) {
    lockCount += 1;
    if (lockCount === 1) {
      savedBodyOverflow = document.body.style.overflow;
      savedBodyPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add("arc-scroll-locked");
    }
    return;
  }

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;
    document.body.classList.remove("arc-scroll-locked");
  }
}

export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    setBodyScrollLocked(true);
    return () => setBodyScrollLocked(false);
  }, [active]);
}

export function markFieldInvalid(field) {
  if (!field) return;
  field.classList.remove("field-invalid");
  void field.offsetWidth;
  field.classList.add("field-invalid");
  field.setAttribute("aria-invalid", "true");

  const wrapper = field.closest(".form-row, .lp-form-row, .csr-form-row, .csr-field, .co-field");
  wrapper?.classList.add("field-invalid-wrap");
}

export function clearFieldInvalid(field) {
  field.classList.remove("field-invalid");
  field.removeAttribute("aria-invalid");
  field.closest(".form-row, .lp-form-row, .csr-form-row, .csr-field, .co-field")?.classList.remove("field-invalid-wrap");
}

export function focusInvalidField(field) {
  if (!field) return;
  markFieldInvalid(field);
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => field.focus?.({ preventScroll: true }), 280);
}

export function validateRequiredFields(formElement) {
  const fields = Array.from(formElement.querySelectorAll("[required]"));
  const invalid = fields.find((field) => {
    const value = field.type === "checkbox" || field.type === "radio" ? field.checked : String(field.value || "").trim();
    return !value || !field.checkValidity();
  });

  if (invalid) {
    focusInvalidField(invalid);
    return false;
  }

  fields.forEach(clearFieldInvalid);
  return true;
}

export function installRequiredFieldUX() {
  if (typeof document === "undefined") return () => {};

  const onInvalid = (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement)) return;
    event.preventDefault();
    focusInvalidField(field);
  };

  const onInput = (event) => {
    const field = event.target;
    if (!(field instanceof HTMLElement)) return;
    if (field.matches("input, select, textarea")) clearFieldInvalid(field);
  };

  document.addEventListener("invalid", onInvalid, true);
  document.addEventListener("input", onInput, true);
  document.addEventListener("change", onInput, true);

  return () => {
    document.removeEventListener("invalid", onInvalid, true);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onInput, true);
  };
}
