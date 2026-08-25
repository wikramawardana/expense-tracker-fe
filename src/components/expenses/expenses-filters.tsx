"use client";

import { format } from "date-fns";
import { Search, X } from "lucide-react";
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
import { EXPENSE_STATUSES, SORT_OPTIONS } from "@/lib/constants";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
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
  const [categoryList, setCategoryList] = React.useState<Category[]>([]);

  // Fetch bill statements and categories on mount
  React.useEffect(() => {
    const fetchBillStatements = async () => {
      try {
        const response = await getBillStatements();
        setBillStatements(response.data);
      } catch (error) {
        console.error("Failed to fetch bill statements:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategoryList(response.data ?? []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchBillStatements();
    fetchCategories();
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

  // Sync dropdown/sort state from external filter changes.
  // Intentionally excludes `search` and `dateRange` — those have their own apply flow
  // and should not be reset when an auto-applied dropdown causes `filters` to update.
  React.useEffect(() => {
    setCategory(filters.category || "all");
    setStatus(filters.status || "all");
    setBillStatementId(filters.bill_statement_id || "all");
    setSortBy(filters.sort_by || "date");
    setSortOrder(filters.sort_order || "desc");
  }, [filters]);

  // Separately sync search and date range only when the user explicitly clears via the
  // parent (i.e. when the applied filter value reverts to empty — not on every change).
  const prevSearchRef = React.useRef(filters.search || "");
  React.useEffect(() => {
    const appliedSearch = filters.search || "";
    if (appliedSearch === "" && prevSearchRef.current !== "") {
      setSearch("");
    }
    prevSearchRef.current = appliedSearch;
  }, [filters.search]);

  const buildFilters = (
    overrides: Partial<ExpenseFilters> = {},
  ): ExpenseFilters => ({
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
    ...overrides,
  });

  const handleApplyFilters = () => {
    onFiltersChange(buildFilters());
  };

  // Auto-apply handlers for dropdowns — changes take effect immediately without clicking Apply.
  // Use the last-applied `filters` prop as the base so unapplied local search/date changes
  // don't get accidentally submitted when the user switches a dropdown.
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFiltersChange({
      ...filters,
      category: value === "all" ? "" : (value as ExpenseCategory),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFiltersChange({
      ...filters,
      status: value === "all" ? "" : (value as ExpenseStatus),
      page: 1,
    });
  };

  const handleBillStatementChange = (value: string) => {
    setBillStatementId(value);
    onFiltersChange({
      ...filters,
      bill_statement_id: value === "all" ? "" : value,
      page: 1,
    });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    onFiltersChange({ ...filters, sort_by: value, page: 1 });
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "asc" | "desc");
    onFiltersChange({
      ...filters,
      sort_order: value as "asc" | "desc",
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
      page_size: filters.page_size || 50,
      sort_by: "date",
      sort_order: "desc",
      payment_method: filters.payment_method,
      payment_method_id: filters.payment_method_id,
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
    <div className="space-y-3 border-2 border-foreground bg-secondary p-3 shadow-[4px_4px_0_var(--foreground)] sm:p-4">
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
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryList.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {EXPENSE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month / Bill Statement Filter */}
        <MonthYearPicker
          billStatements={billStatements}
          value={billStatementId}
          onValueChange={handleBillStatementChange}
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
          <Select value={sortBy} onValueChange={handleSortByChange}>
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
          <Select value={sortOrder} onValueChange={handleSortOrderChange}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Oldest first</SelectItem>
              <SelectItem value="desc">Newest first</SelectItem>
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
            title={
              hasUnappliedChanges
                ? "Apply search & date filter"
                : "No pending search/date changes"
            }
          >
            <Search className="mr-1 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
