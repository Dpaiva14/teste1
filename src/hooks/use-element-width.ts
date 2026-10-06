"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks the content-box width of an element (SSR-safe; falls back to `initial`). */
export function useElementWidth<T extends HTMLElement>(initial = 800) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.max(1, Math.round(el.getBoundingClientRect().width)));
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.max(1, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
