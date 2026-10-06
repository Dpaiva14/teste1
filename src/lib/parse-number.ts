/**
 * Lenient numeric input parsing for forms. Accepts "39000", "39000.5", "39,000.5" and "39000,5".
 * Returns null when the text is not a finite number. A lone "39.000" is read as 39.0 (dot = decimal);
 * forms add plausibility checks so a mistaken thousands separator cannot go unnoticed.
 */
export function parseNumber(text: string): number | null {
  const t = text.trim().replace(/\s+/g, "");
  if (t === "" || t === "-" || t === ".") return null;
  let normalised = t;
  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // both present: the later one is the decimal separator
    normalised = lastComma > lastDot ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (lastComma !== -1) {
    const parts = t.split(",");
    normalised = parts.length === 2 && parts[1]!.length !== 3 ? `${parts[0]}.${parts[1]}` : t.replace(/,/g, "");
  }
  if (!/^-?\d*\.?\d+$/.test(normalised) && !/^-?\d+\.?$/.test(normalised)) return null;
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}
