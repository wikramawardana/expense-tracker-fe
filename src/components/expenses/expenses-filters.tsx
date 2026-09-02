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
import type {
  ExpenseCategory,
  ExpenseFilters,
  ExpenseStatus,
} from "@/types/expense.types";
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

  // Sync dropdown/sort state from external filter changes.
  React.useEffect(() => {
    setCategoryId(filters.category_id || filters.category || "all");
    setStatus(filters.status || "all");
    setPaymentMethodId(
      filters.payment_method_id || filters.payment_method || "all",
    );
    setBillStatementId(filters.bill_statement_id || "all");
    setSortBy(filters.sort_by || "date");
    setSortOrder(filters.sort_order || "desc");
  }, [filters]);

  // Sync search when cleared externally
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
  ): ExpenseFilters => {
    const selectedMethod = paymentMethods.find(
      (m) => m.id === paymentMethodId || m.name === paymentMethodId,
    );
    const selectedCat = categoryList.find(
      (c) => c.id === categoryId || c.name === categoryId,
    );

    return {
      ...filters,
      search: search.trim(),
      category_id: selectedCat?.id || (categoryId === "all" ? "" : categoryId),
      category: (selectedCat?.name ||
        (categoryId === "all" ? "" : categoryId)) as ExpenseCategory,
      status: status === "all" ? "" : (status as ExpenseStatus),
      payment_method_id:
        selectedMethod?.id ||
        (paymentMethodId === "all" ? "" : paymentMethodId),
      payment_method:
        selectedMethod?.name ||
        (paymentMethodId === "all" ? "" : paymentMethodId),
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
    };
  };

  const handleApplyFilters = () => {
    onFiltersChange(buildFilters());
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    const selectedCat = categoryList.find(
      (c) => c.id === value || c.name === value,
    );
    onFiltersChange({
      ...filters,
      category_id: value === "all" ? "" : selectedCat?.id || value,
      category: (value === "all"
        ? ""
        : selectedCat?.name || value) as ExpenseCategory,
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

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodId(value);
    const selectedMethod = paymentMethods.find(
      (m) => m.id === value || m.name === value,
    );
    onFiltersChange({
      ...filters,
      payment_method_id: value === "all" ? "" : selectedMethod?.id || value,
      payment_method: value === "all" ? "" : selectedMethod?.name || value,
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
    search ||
    categoryId !== "all" ||
    status !== "all" ||
    paymentMethodId !== "all" ||
    billStatementId !== "all" ||
    dateRange?.from ||
    dateRange?.to;

  // Check if local state differs from applied filters
  const hasUnappliedChanges =
    search.trim() !== (filters.search || "").trim() ||
    (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "") !==
      (filters.expense_date_from
        ? filters.expense_date_from.split("T")[0]
        : "") ||
    (dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "") !==
      (filters.expense_date_to ? filters.expense_date_to.split("T")[0] : "");

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
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            className="w-full pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryId} onValueChange={handleCategoryChange}>
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
          value={paymentMethodId}
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
            onDateRangeChange={setDateRange}
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
