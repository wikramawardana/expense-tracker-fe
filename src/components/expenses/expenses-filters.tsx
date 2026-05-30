"use client";

import { format } from "date-fns";
import { Filter, Search, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePickerWithPresets } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  SORT_OPTIONS,
} from "@/lib/constants";
import { getBillStatements } from "@/services/bill-statements.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type {
  ExpenseCategory,
  ExpenseFilters,
  ExpenseStatus,
} from "@/types/expense.types";

interface ExpensesFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
}

export function ExpensesFilters({
  filters,
  onFiltersChange,
}: ExpensesFiltersProps) {
  // Local state for all filter inputs
  const [search, setSearch] = React.useState(filters.search || "");
  const [category, setCategory] = React.useState(filters.category || "all");
  const [status, setStatus] = React.useState(filters.status || "all");
  const [billStatementId, setBillStatementId] = React.useState(
    filters.bill_statement_id || "all",
  );
  const [billStatements, setBillStatements] = React.useState<BillStatement[]>(
    [],
  );

  // Fetch bill statements on mount
  React.useEffect(() => {
    const fetchBillStatements = async () => {
      try {
        const response = await getBillStatements();
        setBillStatements(response.data);
      } catch (error) {
        console.error("Failed to fetch bill statements:", error);
      }
    };
    fetchBillStatements();
  }, []);
  // Combined date range state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const from = filters.expense_date_from
        ? new Date(filters.expense_date_from)
        : undefined;
      const to = filters.expense_date_to
        ? new Date(filters.expense_date_to)
        : undefined;
      return from || to ? { from, to } : undefined;
    },
  );
  const [sortBy, setSortBy] = React.useState(filters.sort_by || "date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">(
    filters.sort_order || "desc",
  );

  // Sync local state with external filter changes
  React.useEffect(() => {
    setSearch(filters.search || "");
    setCategory(filters.category || "all");
    setStatus(filters.status || "all");
    setBillStatementId(filters.bill_statement_id || "all");
    const from = filters.expense_date_from
      ? new Date(filters.expense_date_from)
      : undefined;
    const to = filters.expense_date_to
      ? new Date(filters.expense_date_to)
      : undefined;
    setDateRange(from || to ? { from, to } : undefined);
    setSortBy(filters.sort_by || "date");
    setSortOrder(filters.sort_order || "desc");
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange({
      ...filters,
      search,
      category: category === "all" ? "" : (category as ExpenseCategory),
      status: status === "all" ? "" : (status as ExpenseStatus),
      bill_statement_id: billStatementId === "all" ? "" : billStatementId,
      expense_date_from: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd'T'00:00:00'Z'")
        : "",
      expense_date_to: dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd'T'23:59:59'Z'")
        : "",
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setBillStatementId("all");
    setDateRange(undefined);
    setSortBy("date");
    setSortOrder("desc");
    onFiltersChange({
      page: 1,
      page_size: 20,
      sort_by: "date",
      sort_order: "desc",
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    search ||
    category !== "all" ||
    status !== "all" ||
    billStatementId !== "all" ||
    dateRange?.from ||
    dateRange?.to;

  // Check if local state differs from applied filters
  const hasUnappliedChanges =
    search !== (filters.search || "") ||
    category !== (filters.category || "all") ||
    status !== (filters.status || "all") ||
    billStatementId !== (filters.bill_statement_id || "all") ||
    (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "") !==
      (filters.expense_date_from
        ? filters.expense_date_from.split("T")[0]
        : "") ||
    (dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "") !==
      (filters.expense_date_to ? filters.expense_date_to.split("T")[0] : "") ||
    sortBy !== (filters.sort_by || "date") ||
    sortOrder !== (filters.sort_order || "desc");

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4 space-y-3">
      {/* Primary Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            className="w-full pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {EXPENSE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bill Statement Filter */}
        <MonthYearPicker
          billStatements={billStatements}
          value={billStatementId}
          onValueChange={setBillStatementId}
          showAllOption={true}
        />
      </div>

      {/* Second Row: Date Range + Sort + Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Date Range Filter */}
          <DateRangePickerWithPresets
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            triggerClassName="w-full sm:w-[260px]"
            align="start"
          />

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 px-3"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
          <Button
            onClick={handleApplyFilters}
            size="sm"
            className="h-9 px-4"
            disabled={!hasUnappliedChanges}
          >
            <Filter className="mr-1 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
