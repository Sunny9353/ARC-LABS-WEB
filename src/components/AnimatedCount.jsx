import { useEffect, useRef, useState } from "react";

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

function parseCountValue(value) {
  const text = String(value).trim();
  const match = text.match(/^([^0-9-]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { prefix: "", target: 0, suffix: text, decimals: 0 };
  }

  const [, prefix, numeric, suffix] = match;
  const normalized = numeric.replace(/,/g, "");
  const decimals = normalized.includes(".") ? normalized.split(".")[1].length : 0;

  return {
    prefix,
    target: Number(normalized),
    suffix,
    decimals,
  };
}

function formatCount(value, decimals) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function AnimatedCount({ value, duration = 1500, className = "" }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const startedRef = useRef(false);
  const { prefix, target, suffix, decimals } = parseCountValue(value);
  const [displayValue, setDisplayValue] = useState(() =>
    `${prefix}${formatCount(0, decimals)}${suffix}`
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      setDisplayValue(String(value));
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setDisplayValue(String(value));
      return undefined;
    }

    const element = ref.current;
    if (!element) return undefined;

    const startAnimation = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const startTime = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = target * easeOutCubic(progress);
        setDisplayValue(`${prefix}${formatCount(current, decimals)}${suffix}`);

        if (progress < 1) {
          frameRef.current = window.requestAnimationFrame(tick);
        } else {
          setDisplayValue(String(value));
        }
      };

      frameRef.current = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startAnimation();
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [decimals, duration, prefix, suffix, target, value]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
