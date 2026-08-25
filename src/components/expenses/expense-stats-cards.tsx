"use client";

import { format } from "date-fns";
import {
  CircleCheckBig,
  Clock3,
  Filter,
  ReceiptText,
  TriangleAlert,
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
      return `${format(new Date(dateFrom), "dd MMM")} - ${format(
        new Date(dateTo),
        "dd MMM yyyy",
      )}`;
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

  if (isLoading) {
    return (
      <section className="overflow-hidden border-3 border-foreground bg-card shadow-[5px_5px_0_var(--foreground)]">
        <div className="h-11 animate-pulse bg-primary" />
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="min-h-24 animate-pulse border-foreground bg-muted p-4 even:border-l-2 lg:border-l-2 lg:first:border-l-0"
            />
          ))}
        </div>
      </section>
    );
  }

  const totalSpent = stats?.total_amount ?? 0;
  const totalCount = stats?.total_count ?? 0;
  const summaryItems = [
    {
      label: "Total expenses",
      value: totalSpent,
      note: `${totalCount.toLocaleString()} transaction${totalCount === 1 ? "" : "s"}`,
      icon: ReceiptText,
      color: "bg-primary text-primary-foreground",
    },
    {
      label: "Already paid",
      value: stats?.approved_amount ?? 0,
      note: "Payment confirmed",
      icon: CircleCheckBig,
      color: "bg-success text-success-foreground",
    },
    {
      label: "Waiting to pay",
      value: stats?.pending_amount ?? 0,
      note: "Scheduled or pending",
      icon: Clock3,
      color: "bg-warning text-warning-foreground",
    },
    {
      label: "Still owed",
      value: stats?.rejected_amount ?? 0,
      note: "Overdue or unpaid",
      icon: TriangleAlert,
      color: "bg-destructive text-destructive-foreground",
    },
  ];

  return (
    <section className="overflow-hidden border-3 border-foreground bg-card shadow-[5px_5px_0_var(--foreground)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b-3 border-foreground bg-primary px-4 py-2.5 text-primary-foreground">
        <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
          <Filter className="size-4" strokeWidth={3} />
          Expense recap
        </span>
        <span className="font-mono text-xs font-bold text-blue-50">
          {dateRange ?? "All dates"}
        </span>
        <span className="font-mono text-xs font-black text-white">
          {totalCount.toLocaleString()} transactions
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={`${item.color} min-w-0 border-foreground p-3.5 sm:p-4 ${
              index % 2 === 1 ? "border-l-2" : ""
            } ${index > 1 ? "border-t-2 lg:border-t-0" : ""} lg:border-l-2 lg:first:border-l-0`}
          >
            <div className="mb-2 flex items-center gap-2">
              <item.icon className="size-4 shrink-0" strokeWidth={3} />
              <p className="truncate text-xs font-black uppercase tracking-wide">
                {item.label}
              </p>
            </div>
            <p className="truncate text-xl font-black tracking-[-0.04em] sm:text-2xl">
              {formatCurrency(item.value)}
            </p>
            <p className="mt-1 truncate text-xs font-bold opacity-80">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
