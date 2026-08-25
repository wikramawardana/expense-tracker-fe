"use client";

import { format } from "date-fns";
import { CreditCard, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { ExpenseFilters, ExpenseStats } from "@/types/expense.types";

interface ExpenseStatsCardsProps {
  stats: ExpenseStats | null;
  filters?: ExpenseFilters;
  isLoading?: boolean;
}

const neoSurfaceClass =
  "rounded-[2px] border-2 border-foreground bg-card shadow-[5px_5px_0_var(--foreground)]";
const neoItemClass =
  "border-2 border-foreground shadow-[3px_3px_0_var(--foreground)]";
const neoChipClass =
  "inline-flex items-center border-2 border-foreground shadow-[2px_2px_0_var(--foreground)]";

// Colored neo-brutalist status boxes — colored border + matching hard shadow
const neoTotalClass =
  "border-2 border-foreground bg-secondary shadow-[3px_3px_0_var(--foreground)]";
const neoPaidClass =
  "border-2 border-foreground bg-success shadow-[3px_3px_0_var(--foreground)]";
const neoPendingClass =
  "border-2 border-foreground bg-warning shadow-[3px_3px_0_var(--foreground)]";
const neoUnpaidClass =
  "border-2 border-foreground bg-destructive shadow-[3px_3px_0_var(--foreground)]";

function formatDateRange(dateFrom?: string, dateTo?: string): string | null {
  if (!dateFrom && !dateTo) return null;
  try {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      return `${format(from, "dd MMM")} - ${format(to, "dd MMM yyyy")}`;
    }
    if (dateFrom) return `From ${format(new Date(dateFrom), "dd MMM yyyy")}`;
    if (dateTo) return `Until ${format(new Date(dateTo), "dd MMM yyyy")}`;
  } catch {
    return null;
  }
  return null;
}

export function ExpenseStatsCards({
  stats,
  filters,
  isLoading,
}: ExpenseStatsCardsProps) {
  const dateRange = formatDateRange(
    filters?.expense_date_from,
    filters?.expense_date_to,
  );
  const hasFilters =
    filters?.search ||
    filters?.category ||
    filters?.status ||
    filters?.bill_statement_id ||
    dateRange;

  if (isLoading) {
    return (
      <section className={`${neoSurfaceClass} p-3`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="h-5 w-32 animate-pulse border-2 border-foreground/20 bg-muted" />
          <div className="h-7 w-24 animate-pulse border-2 border-foreground/20 bg-primary/15" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`${neoItemClass} min-h-32 animate-pulse bg-background p-3`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-24 bg-foreground/20" />
                <div className="h-7 w-7 border-2 border-foreground/20 bg-muted" />
              </div>
              <div className="h-7 w-32 bg-foreground/20" />
              <div className="mt-3 h-3 w-full bg-foreground/20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const breakdown = stats?.payment_method_breakdown ?? [];
  const totalSpent = stats?.total_amount ?? 0;
  const totalCount = stats?.total_count ?? 0;
  const totalPaid = stats?.approved_amount ?? 0;
  const totalPending = stats?.pending_amount ?? 0;
  const totalUnpaid = stats?.rejected_amount ?? 0;

  return (
    <section className={`${neoSurfaceClass} p-3`}>
      {/* Header chips */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-foreground">
        <span
          className={`${neoChipClass} gap-1.5 bg-primary px-2 py-1 font-black uppercase text-primary-foreground`}
        >
          <Filter className="h-3.5 w-3.5" />
          Spending Summary
        </span>
        {dateRange ? (
          <span
            className={`${neoChipClass} bg-secondary px-2 py-1 font-bold text-secondary-foreground`}
          >
            {dateRange}
          </span>
        ) : (
          <span
            className={`${neoChipClass} bg-secondary px-2 py-1 font-bold text-secondary-foreground`}
          >
            All dates
          </span>
        )}
        <span
          className={`${neoChipClass} bg-secondary px-2 py-1 font-bold text-secondary-foreground`}
        >
          {totalCount.toLocaleString()} transactions
        </span>
        <span
          className={`${neoChipClass} bg-foreground px-2 py-1 font-black text-background`}
        >
          Total {formatCurrency(totalSpent)}
        </span>
        {!hasFilters && (
          <span className="font-bold text-muted-foreground">
            No filters applied
          </span>
        )}
      </div>

      {/* Overall totals row */}
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={`${neoTotalClass} p-3`}>
          <p className="text-[10px] font-black uppercase text-muted-foreground">
            Total Expenses
          </p>
          <p className="mt-1 truncate text-lg font-black text-foreground">
            {formatCurrency(totalSpent)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {totalCount} transaction{totalCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className={`${neoPaidClass} p-3`}>
          <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
            ✓ Already Paid
          </p>
          <p className="mt-1 truncate text-lg font-black text-foreground">
            {formatCurrency(totalPaid)}
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
            Payment confirmed
          </p>
        </div>
        <div className={`${neoPendingClass} p-3`}>
          <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
            ⏳ Waiting to Pay
          </p>
          <p className="mt-1 truncate text-lg font-black text-foreground">
            {formatCurrency(totalPending)}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-600/70 dark:text-amber-400/70">
            Scheduled, not yet due
          </p>
        </div>
        <div className={`${neoUnpaidClass} p-3`}>
          <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
            ⚠ Still Owed
          </p>
          <p className="mt-1 truncate text-lg font-black text-foreground">
            {formatCurrency(totalUnpaid)}
          </p>
          <p className="mt-0.5 text-[10px] text-rose-600/70 dark:text-rose-400/70">
            Overdue or not paid
          </p>
        </div>
      </div>

      {/* Per-payment-method boxes */}
      {breakdown.length === 0 ? (
        <div
          className={`${neoItemClass} bg-background p-6 text-center text-sm font-bold text-muted-foreground`}
        >
          No expenses to summarize
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {breakdown.map((method) => (
            <div
              key={method.payment_method}
              className={`${neoItemClass} bg-background p-3`}
            >
              {/* Method name + total */}
              <div className="mb-3 flex items-start justify-between gap-3 border-b-2 border-foreground/15 pb-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase text-foreground">
                    {method.payment_method}
                  </p>
                  <p className="mt-1 truncate text-xl font-black text-foreground">
                    {formatCurrency(method.total)}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">
                    {method.count} transaction{method.count === 1 ? "" : "s"}
                  </p>
                </div>
                <span
                  className={`${neoChipClass} h-8 w-8 shrink-0 justify-center bg-card text-foreground`}
                >
                  <CreditCard className="h-4 w-4" />
                </span>
              </div>

              {/* Status breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="border-2 border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    Paid
                  </p>
                  <p className="truncate text-xs font-black text-foreground">
                    {formatCurrency(method.paid)}
                  </p>
                </div>
                <div className="border-2 border-amber-500/50 bg-amber-500/10 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                    Pending
                  </p>
                  <p className="truncate text-xs font-black text-foreground">
                    {formatCurrency(method.pending)}
                  </p>
                </div>
                <div className="border-2 border-rose-500/50 bg-rose-500/10 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                    Unpaid
                  </p>
                  <p className="truncate text-xs font-black text-foreground">
                    {formatCurrency(method.unpaid)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
