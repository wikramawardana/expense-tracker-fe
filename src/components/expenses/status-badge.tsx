import { cn } from "@/lib/utils";
import type { Category } from "@/types/category.types";
import type { ExpenseStatus } from "@/types/expense.types";

interface StatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    pending:
      "bg-[#FFE156] text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]",
    paid: "bg-[#A3E636] text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]",
    unpaid:
      "bg-[#FF6B6B] text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-wide",
        variants[status],
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

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 text-xs font-black uppercase tracking-wide",
          "bg-[#D4D4D4] text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]",
          className,
        )}
      >
        <span>-</span>
      </span>
    );
  }

  // Use category color from API if available, otherwise use default
  const defaultStyle =
    "bg-[#88AAEE] text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]";

  const style = category.color
    ? `text-foreground border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]`
    : defaultStyle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 text-xs font-black uppercase tracking-wide",
        style,
        className,
      )}
      style={category.color ? { backgroundColor: category.color } : undefined}
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
    return (
      <span className={cn("text-gray-500 dark:text-gray-400", className)}>
        -
      </span>
    );
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
        "inline-flex items-center gap-1 text-sm font-bold",
        className,
      )}
    >
      {methodInfo?.emoji && <span>{methodInfo.emoji}</span>}
      <span>{methodInfo?.label || paymentMethod}</span>
    </span>
  );
}
