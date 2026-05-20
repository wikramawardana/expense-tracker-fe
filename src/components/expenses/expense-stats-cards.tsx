"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Filter,
  Receipt,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
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
      return `${format(from, "dd MMM")} – ${format(to, "dd MMM yyyy")}`;
    }
    if (dateFrom) return `From ${format(new Date(dateFrom), "dd MMM yyyy")}`;
    if (dateTo) return `Until ${format(new Date(dateTo), "dd MMM yyyy")}`;
  } catch {
    return null;
  }
  return null;
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "indigo" | "emerald" | "amber" | "slate";
}

const accentStyles: Record<StatCardProps["accent"], { ring: string; iconBg: string; iconText: string }> = {
  indigo: {
    ring: "",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconText: "text-indigo-600 dark:text-indigo-300",
  },
  emerald: {
    ring: "",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    ring: "",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600 dark:text-amber-300",
  },
  slate: {
    ring: "",
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconText: "text-slate-600 dark:text-slate-300",
  },
};

function StatCard({ title, value, subtitle, icon: Icon, accent }: StatCardProps) {
  const s = accentStyles[accent];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", s.iconBg)}>
          <Icon className={cn("h-4 w-4", s.iconText)} />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums truncate">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </CardContent>
    </Card>
  );
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
  const hasFilters = filters?.search || filters?.category || filters?.status;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <div className="h-3.5 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-md" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-7 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter context strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-medium">Stats for:</span>
        {dateRange ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
            📅 {dateRange}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-border">
            All dates
          </span>
        )}
        {filters?.category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900">
            📁 {filters.category}
          </span>
        )}
        {filters?.status && (
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium capitalize text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900">
            {filters.status}
          </span>
        )}
        {!dateRange && !hasFilters && (
          <span className="italic">No filters applied</span>
        )}
      </div>

      <StatCard
        title="Total Expenses"
        value={(stats?.total_count ?? 0).toLocaleString()}
        subtitle="transactions"
        icon={Receipt}
        accent="indigo"
      />
      <StatCard
        title="Total Amount"
        value={formatCurrency(stats?.total_amount ?? 0)}
        subtitle="total spent"
        icon={Wallet}
        accent="slate"
      />
      <StatCard
        title="Approved"
        value={formatCurrency(stats?.approved_amount ?? 0)}
        subtitle="approved expenses"
        icon={CheckCircle2}
        accent="emerald"
      />
      <StatCard
        title="Pending"
        value={formatCurrency(stats?.pending_amount ?? 0)}
        subtitle="awaiting approval"
        icon={Clock}
        accent="amber"
      />
    </div>
  );
}
