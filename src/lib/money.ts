/** Money helpers. Amounts are stored as doubles; round to cents at every boundary. */

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUsd(value: number): string {
  return usd.format(Number.isFinite(value) ? value : 0);
}

export function formatUsdCompact(value: number): string {
  return usdCompact.format(Number.isFinite(value) ? value : 0);
}

export function formatSigned(value: number, decimals = 2): string {
  const v = roundTo(value, decimals);
  return `${v > 0 ? "+" : ""}${v.toFixed(decimals)}`;
}

export function formatR(value: number): string {
  return `${formatSigned(value, 2)}R`;
}

export function formatPrice(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
