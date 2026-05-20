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

/**
 * Convert a hex color to a soft background + readable foreground.
 * Falls back to a neutral slate badge if no color is provided.
 */
function lighten(hex: string, alpha: number) {
  const m = hex.replace("#", "");
  if (m.length !== 6) return undefined;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return undefined;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  const bg = category.color ? lighten(category.color, 0.12) : undefined;
  const ring = category.color ? lighten(category.color, 0.3) : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        !bg && "bg-muted text-muted-foreground ring-border",
        className,
      )}
      style={
        bg
          ? {
              backgroundColor: bg,
              color: category.color ?? undefined,
              boxShadow: `inset 0 0 0 1px ${ring}`,
            }
          : undefined
      }
    >
      {category.icon && <span>{category.icon}</span>}
      <span>{category.name}</span>
    </span>
  );
}

interface PaymentMethodBadgeProps {
  paymentMethod?: string | null;
  className?: string;
}

export function PaymentMethodBadge({
  paymentMethod,
  className,
}: PaymentMethodBadgeProps) {
  if (!paymentMethod) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const methodInfo = [
    { value: "Cash", label: "Cash", emoji: "💵" },
    { value: "Credit Card", label: "Credit Card", emoji: "💳" },
    { value: "Debit Card", label: "Debit Card", emoji: "💳" },
    { value: "Transfer", label: "Bank Transfer", emoji: "🏦" },
    { value: "E-Wallet", label: "E-Wallet", emoji: "📱" },
  ].find((m) => m.value === paymentMethod || m.label === paymentMethod);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-foreground",
        className,
      )}
    >
      {methodInfo?.emoji && <span>{methodInfo.emoji}</span>}
      <span>{methodInfo?.label || paymentMethod}</span>
    </span>
  );
}
