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
import { getPaymentMethods } from "@/services/payment-methods.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type { ExpenseFilters, ExpenseStatus } from "@/types/expense.types";
import type { PaymentMethod } from "@/types/payment-method.types";

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
  const [categoryId, setCategoryId] = React.useState(
    filters.category_id || filters.category || "all",
  );
  const [status, setStatus] = React.useState(filters.status || "all");
  const [paymentMethodId, setPaymentMethodId] = React.useState(
    filters.payment_method_id || filters.payment_method || "all",
  );
  const [billStatementId, setBillStatementId] = React.useState(
    filters.bill_statement_id || "all",
  );
  const [billStatements, setBillStatements] = React.useState<BillStatement[]>(
    [],
  );
  const [categoryList, setCategoryList] = React.useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(
    [],
  );

  // Fetch bill statements, categories, and payment methods on mount
  React.useEffect(() => {
    getBillStatements()
      .then((response) => setBillStatements(response.data))
      .catch((error) =>
        console.error("Failed to fetch bill statements:", error),
      );
    getCategories()
      .then((response) => setCategoryList(response.data ?? []))
      .catch((error) => console.error("Failed to fetch categories:", error));
    getPaymentMethods()
      .then((response) => setPaymentMethods(response.data ?? []))
      .catch((error) =>
        console.error("Failed to fetch payment methods:", error),
      );
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

  // Sync state from external filter changes.
  React.useEffect(() => {
    setCategoryId(filters.category_id || filters.category || "all");
    setStatus(filters.status || "all");
    setPaymentMethodId(
      filters.payment_method_id || filters.payment_method || "all",
    );
    setBillStatementId(filters.bill_statement_id || "all");
    setSearch(filters.search || "");
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

  // Unified filter application function that combines all current filter dimensions
  const applyFilters = (overrides: Partial<ExpenseFilters> = {}) => {
    const nextCat =
      overrides.category_id !== undefined
        ? overrides.category_id
        : overrides.category !== undefined
          ? overrides.category
          : categoryId;
    const nextStatus =
      overrides.status !== undefined ? overrides.status : status;
    const nextPm =
      overrides.payment_method_id !== undefined
        ? overrides.payment_method_id
        : overrides.payment_method !== undefined
          ? overrides.payment_method
          : paymentMethodId;
    const nextStmt =
      overrides.bill_statement_id !== undefined
        ? overrides.bill_statement_id
        : billStatementId;
    const nextSearch =
      overrides.search !== undefined ? overrides.search : search;
    const nextSortBy =
      overrides.sort_by !== undefined ? overrides.sort_by : sortBy;
    const nextSortOrder =
      overrides.sort_order !== undefined ? overrides.sort_order : sortOrder;

    const selectedPm = paymentMethods.find(
      (m) => m.id === nextPm || m.name.toLowerCase() === nextPm.toLowerCase(),
    );
    const selectedCat = categoryList.find(
      (c) => c.id === nextCat || c.name.toLowerCase() === nextCat.toLowerCase(),
    );

    const fromDate =
      overrides.expense_date_from !== undefined
        ? overrides.expense_date_from
        : dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd'T'00:00:00'Z'")
          : "";
    const toDate =
      overrides.expense_date_to !== undefined
        ? overrides.expense_date_to
        : dateRange?.to
          ? format(dateRange.to, "yyyy-MM-dd'T'23:59:59'Z'")
          : "";

    const combined: ExpenseFilters = {
      ...filters,
      page: 1,
      page_size: filters.page_size || 50,
      expense_type: filters.expense_type,
      search: nextSearch.trim(),
      category_id: selectedCat?.id || (nextCat === "all" ? "" : nextCat),
      category: selectedCat?.name || (nextCat === "all" ? "" : nextCat),
      status: nextStatus === "all" ? "" : (nextStatus as ExpenseStatus),
      payment_method_id: selectedPm?.id || (nextPm === "all" ? "" : nextPm),
      payment_method: selectedPm?.name || (nextPm === "all" ? "" : nextPm),
      bill_statement_id: nextStmt === "all" ? "" : nextStmt,
      expense_date_from: fromDate,
      expense_date_to: toDate,
      sort_by: nextSortBy,
      sort_order: nextSortOrder,
    };

    onFiltersChange(combined);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    applyFilters({ category_id: value });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters({ status: value as ExpenseStatus });
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodId(value);
    applyFilters({ payment_method_id: value });
  };

  const handleBillStatementChange = (value: string) => {
    setBillStatementId(value);
    applyFilters({ bill_statement_id: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    applyFilters({
      expense_date_from: range?.from
        ? format(range.from, "yyyy-MM-dd'T'00:00:00'Z'")
        : "",
      expense_date_to: range?.to
        ? format(range.to, "yyyy-MM-dd'T'23:59:59'Z'")
        : "",
    });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    applyFilters({ sort_by: value });
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "asc" | "desc");
    applyFilters({ sort_order: value as "asc" | "desc" });
  };

  const handleSearchSubmit = () => {
    applyFilters({ search });
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setStatus("all");
    setPaymentMethodId("all");
    setBillStatementId("all");
    setDateRange(undefined);
    setSortBy("date");
    setSortOrder("desc");
    onFiltersChange({
      page: 1,
      page_size: filters.page_size || 50,
      sort_by: "date",
      sort_order: "desc",
      expense_type: filters.expense_type,
    });
  };

  // Check if any filters are active
  const hasActiveFilters =
    Boolean(search) ||
    categoryId !== "all" ||
    status !== "all" ||
    paymentMethodId !== "all" ||
    billStatementId !== "all" ||
    Boolean(dateRange?.from) ||
    Boolean(dateRange?.to);

  // Derive selected value keys for controlled selects so they never desync
  const selectedCatValue =
    categoryList.find(
      (c) =>
        c.id === categoryId ||
        c.name.toLowerCase() === categoryId.toLowerCase(),
    )?.id || (categoryId === "all" ? "all" : categoryId);

  const selectedPmValue =
    paymentMethods.find(
      (m) =>
        m.id === paymentMethodId ||
        m.name.toLowerCase() === paymentMethodId.toLowerCase(),
    )?.id || (paymentMethodId === "all" ? "all" : paymentMethodId);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Primary Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className="w-full pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCatValue} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryList.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
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

        {/* Payment Method Filter */}
        <Select
          value={selectedPmValue}
          onValueChange={handlePaymentMethodChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All payment methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment methods</SelectItem>
            {paymentMethods.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter */}
          <DateRangePickerWithPresets
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            triggerClassName="w-full sm:w-[240px]"
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
            <SelectTrigger className="w-full sm:w-[130px] sm:shrink-0">
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
          <Button onClick={handleSearchSubmit} size="sm" className="h-9 px-4">
            <Search className="mr-1 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
