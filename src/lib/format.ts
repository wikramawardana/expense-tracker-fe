import { format, parseISO } from "date-fns";

/**
 * Format a number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(
  dateString: string,
  formatStr = "dd MMM yyyy",
): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
}

/**
 * Format a datetime string to a readable format
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, "dd MMM yyyy, HH:mm");
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Strip everything except digits from an amount input value.
 * Returns a raw digit string (e.g., "97168") suitable for Number().
 */
export function parseAmountInput(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format a raw digit string with thousand separators for display in an input.
 * e.g., "97168" -> "97.168" (Indonesian grouping). Empty input stays empty.
 */
export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}
