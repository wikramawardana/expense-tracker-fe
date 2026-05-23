"use client";

import { format } from "date-fns";
import {
  CheckCircle,
  CircleAlert,
  Clock,
  DollarSign,
  Filter,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { ExpenseFilters, ExpenseStats } from "@/types/expense.types";

interface ExpenseStatsCardsProps {
  stats: ExpenseStats | null;
  filters?: ExpenseFilters;
  isLoading?: boolean;
}

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
  const metrics = [
    {
      label: "Transactions",
      value: (stats?.total_count ?? 0).toLocaleString(),
      helper: "matching filters",
      icon: TrendingUp,
      tone: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Total spent",
      value: formatCurrency(stats?.total_amount ?? 0),
      helper: "all selected expenses",
      icon: DollarSign,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Paid",
      value: formatCurrency(stats?.approved_amount ?? 0),
      helper: "settled amount",
      icon: CheckCircle,
      tone: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      label: "Pending",
      value: formatCurrency(stats?.pending_amount ?? 0),
      helper: "waiting to be paid",
      icon: Clock,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Unpaid",
      value: formatCurrency(stats?.rejected_amount ?? 0),
      helper: "not settled yet",
      icon: CircleAlert,
      tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-muted/20 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-foreground/10" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-h-20 animate-pulse rounded-md border bg-background p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-20 rounded bg-foreground/10" />
                <div className="h-7 w-7 rounded-md bg-foreground/10" />
              </div>
              <div className="h-6 w-28 rounded bg-foreground/10" />
              <div className="mt-2 h-3 w-24 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Filter className="h-3.5 w-3.5" />
          Summary
        </span>
        {dateRange ? (
          <span className="inline-flex items-center rounded-full border bg-background px-2 py-1 font-medium text-foreground">
            {dateRange}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border bg-background px-2 py-1 font-medium text-foreground">
            All dates
          </span>
        )}
        {filters?.category && (
          <span className="inline-flex items-center rounded-full border bg-background px-2 py-1 font-medium text-foreground">
            {filters.category}
          </span>
        )}
        {filters?.status && (
          <span className="inline-flex items-center rounded-full border bg-background px-2 py-1 font-medium capitalize text-foreground">
            {filters.status}
          </span>
        )}
        {!hasFilters && (
          <span className="text-muted-foreground">No filters applied</span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="min-h-20 rounded-md border bg-background p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-foreground sm:text-xl">
                    {metric.value}
                  </p>
                </div>
                <span
                  className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${metric.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
