import { cn } from "@/lib/utils";
import type { Category } from "@/types/category.types";
import type { ExpenseStatus } from "@/types/expense.types";

interface StatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

const statusVariants: Record<ExpenseStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  unpaid:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        statusVariants[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

interface CategoryBadgeProps {
  category?: Category | null;
  className?: string;
}

const fallbackPalette = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#c2410c",
  "#be123c",
  "#15803d",
  "#0369a1",
  "#a16207",
];

function hashString(value: string) {
  return [...value].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function rgba(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return undefined;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function colorForValue(value: string) {
  return fallbackPalette[hashString(value) % fallbackPalette.length];
}

function categoryAccent(category: Category) {
  return category.color && hexToRgb(category.color)
    ? category.color
    : colorForValue(category.name);
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
          "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
          className,
        )}
      >
        —
      </span>
    );
  }

  const accent = categoryAccent(category);
  const bg = rgba(accent, 0.12);
  const ring = rgba(accent, 0.28);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
      style={{
        backgroundColor: bg,
        color: accent,
        boxShadow: `inset 0 0 0 1px ${ring}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <span>{category.name}</span>
    </span>
  );
}

interface PaymentMethodBadgeProps {
  paymentMethod?: string | null;
  className?: string;
}

function paymentAccent(paymentMethod: string) {
  const normalized = paymentMethod.trim().toLowerCase();

  if (normalized.includes("cash")) return "#059669";
  if (normalized.includes("credit")) return "#7c3aed";
  if (normalized.includes("debit")) return "#2563eb";
  if (normalized.includes("wallet") || normalized.includes("ewallet")) {
    return "#c026d3";
  }
  if (
    normalized.includes("transfer") ||
    normalized.includes("bank") ||
    normalized.includes("va")
  ) {
    return "#0891b2";
  }

  return colorForValue(paymentMethod);
}

export function PaymentMethodBadge({
  paymentMethod,
  className,
}: PaymentMethodBadgeProps) {
  if (!paymentMethod) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
      style={{
        backgroundColor: rgba(paymentAccent(paymentMethod), 0.12),
        color: paymentAccent(paymentMethod),
        boxShadow: `inset 0 0 0 1px ${rgba(
          paymentAccent(paymentMethod),
          0.28,
        )}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: paymentAccent(paymentMethod) }}
      />
      <span>{paymentMethod}</span>
    </span>
  );
}
