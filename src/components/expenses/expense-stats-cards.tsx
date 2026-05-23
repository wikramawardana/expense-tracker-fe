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
      tone: "bg-primary text-primary-foreground",
    },
    {
      label: "Total spent",
      value: formatCurrency(stats?.total_amount ?? 0),
      helper: "all selected expenses",
      icon: DollarSign,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Paid",
      value: formatCurrency(stats?.approved_amount ?? 0),
      helper: "settled amount",
      icon: CheckCircle,
      tone: "bg-success text-success-foreground",
    },
    {
      label: "Pending",
      value: formatCurrency(stats?.pending_amount ?? 0),
      helper: "waiting to be paid",
      icon: Clock,
      tone: "bg-warning text-warning-foreground",
    },
    {
      label: "Unpaid",
      value: formatCurrency(stats?.rejected_amount ?? 0),
      helper: "not settled yet",
      icon: CircleAlert,
      tone: "bg-destructive text-destructive-foreground",
    },
  ];

  if (isLoading) {
    return (
      <section className="border-3 border-foreground bg-card p-3 shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="h-5 w-32 animate-pulse border-2 border-foreground bg-muted" />
          <div className="h-7 w-24 animate-pulse border-2 border-foreground bg-primary" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="min-h-20 animate-pulse border-2 border-foreground bg-background p-3 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,251,245,1)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="h-3 w-20 bg-foreground/20" />
                <div className="h-7 w-7 border-2 border-foreground bg-muted" />
              </div>
              <div className="h-6 w-28 bg-foreground/20" />
              <div className="mt-2 h-3 w-24 bg-foreground/20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="border-3 border-foreground bg-card p-3 shadow-[5px_5px_0px_0px_rgba(26,26,26,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,251,245,1)]">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-foreground">
        <span className="inline-flex items-center gap-1.5 border-2 border-foreground bg-primary px-2 py-1 font-black uppercase text-primary-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
          <Filter className="h-3.5 w-3.5" />
          Summary
        </span>
        {dateRange ? (
          <span className="inline-flex items-center border-2 border-foreground bg-secondary px-2 py-1 font-bold text-secondary-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
            {dateRange}
          </span>
        ) : (
          <span className="inline-flex items-center border-2 border-foreground bg-secondary px-2 py-1 font-bold text-secondary-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
            All dates
          </span>
        )}
        {filters?.category && (
          <span className="inline-flex items-center border-2 border-foreground bg-accent px-2 py-1 font-bold text-accent-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
            {filters.category}
          </span>
        )}
        {filters?.status && (
          <span className="inline-flex items-center border-2 border-foreground bg-muted px-2 py-1 font-bold capitalize text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
            {filters.status}
          </span>
        )}
        {!hasFilters && (
          <span className="font-bold text-muted-foreground">
            No filters applied
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`min-h-20 border-2 border-foreground p-3 text-foreground shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,251,245,1)] ${metric.tone}`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-current/70">
                    {metric.label}
                  </p>
                  <p className="mt-1 truncate text-lg font-black sm:text-xl">
                    {metric.value}
                  </p>
                </div>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground bg-white text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] dark:bg-black dark:shadow-[2px_2px_0px_0px_rgba(255,251,245,1)]">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xs font-bold text-current/70">
                {metric.helper}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
