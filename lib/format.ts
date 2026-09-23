export function percent(value: number | null, digits = 0): string {
  return value === null ? "—" : `${(value * 100).toFixed(digits)}%`;
}

export function dollars(value: number | null, digits = 2): string {
  return value === null ? "—" : `$${value.toFixed(digits)}`;
}

export function number(value: number | null, digits = 0): string {
  return value === null ? "—" : value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function signedPercent(value: number | null, digits = 1): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(digits)}%`;
}

export function signedDollars(value: number | null, digits = 2): string {
  if (value === null) return "—";
  return `${value >= 0 ? "+" : "−"}$${Math.abs(value).toFixed(digits)}`;
}
