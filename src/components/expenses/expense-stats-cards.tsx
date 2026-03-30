"use client";

import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ExpenseFilters, ExpenseStats } from "@/types/expense.types";

interface ExpenseStatsCardsProps {
  stats: ExpenseStats | null;
  filters?: ExpenseFilters;
  isLoading?: boolean;
}

/**
 * Format the date range for display
 */
function formatDateRange(dateFrom?: string, dateTo?: string): string | null {
  if (!dateFrom && !dateTo) return null;

  try {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      return `${format(from, "dd MMM")} - ${format(to, "dd MMM yyyy")}`;
    }
    if (dateFrom) {
      return `From ${format(new Date(dateFrom), "dd MMM yyyy")}`;
    }
    if (dateTo) {
      return `Until ${format(new Date(dateTo), "dd MMM yyyy")}`;
    }
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
  // Build filter context info
  const dateRange = formatDateRange(
    filters?.expense_date_from,
    filters?.expense_date_to,
  );
  const hasFilters = filters?.search || filters?.category || filters?.status;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-foreground/20" />
              <div className="h-5 w-5 bg-foreground/20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-foreground/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Context Info */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="font-black uppercase">Stats for:</span>
        {dateRange ? (
          <span className="inline-flex items-center bg-[#FFE156] border-2 border-foreground px-2 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            📅 {dateRange}
          </span>
        ) : (
          <span className="inline-flex items-center border-2 border-foreground px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            All dates
          </span>
        )}
        {filters?.category && (
          <span className="inline-flex items-center bg-[#88AAEE] border-2 border-foreground px-2 py-1 text-xs font-bold text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            📁 {filters.category}
          </span>
        )}
        {filters?.status && (
          <span className="inline-flex items-center bg-[#C4B5FD] border-2 border-foreground px-2 py-1 text-xs font-bold capitalize text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {filters.status}
          </span>
        )}
        {!dateRange && !hasFilters && (
          <span className="text-muted-foreground italic">
            No filters applied
          </span>
        )}
      </div>

      {/* Stats Cards - Vertical Stack */}
      <Card className="bg-[#88AAEE] border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-black uppercase text-foreground">
            Total Expenses
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-black text-foreground">
            {stats?.total_count ?? 0}
          </div>
          <p className="text-xs font-bold text-foreground/70 uppercase">
            transactions
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#A3E636] border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-black uppercase text-foreground">
            Total Amount
          </CardTitle>
          <DollarSign className="h-5 w-5 text-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-black text-foreground truncate">
            {formatCurrency(stats?.total_amount ?? 0)}
          </div>
          <p className="text-xs font-bold text-foreground/70 uppercase">
            total spent
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#7DF9FF] border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-black uppercase text-foreground">
            Approved
          </CardTitle>
          <CheckCircle className="h-5 w-5 text-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-black text-foreground truncate">
            {formatCurrency(stats?.approved_amount ?? 0)}
          </div>
          <p className="text-xs font-bold text-foreground/70 uppercase">
            approved expenses
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#FFE156] border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-xs font-black uppercase text-foreground">
            Pending
          </CardTitle>
          <Clock className="h-5 w-5 text-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-black text-foreground truncate">
            {formatCurrency(stats?.pending_amount ?? 0)}
          </div>
          <p className="text-xs font-bold text-foreground/70 uppercase">
            awaiting approval
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
