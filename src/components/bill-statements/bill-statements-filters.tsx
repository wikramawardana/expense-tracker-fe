"use client";

import { endOfDay, startOfDay } from "date-fns";
import { Search, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePickerWithPresets } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillStatement } from "@/types/bill-statement.types";

interface BillStatementsFiltersProps {
  billStatements: BillStatement[];
  onFilteredChange: (filtered: BillStatement[]) => void;
}

export function BillStatementsFilters({
  billStatements,
  onFilteredChange,
}: BillStatementsFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">(
    "all",
  );
  const [dateField, setDateField] = React.useState<
    "statement_date" | "due_date"
  >("statement_date");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  );

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  // Compute filtered results whenever any filter state changes
  React.useEffect(() => {
    let filtered = billStatements;

    // Search by name (case-insensitive)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      filtered = filtered.filter((bs) =>
        bs.name.toLowerCase().includes(lowerSearch),
      );
    }

    // Status filter
    if (status === "active") {
      filtered = filtered.filter((bs) => bs.is_active === true);
    } else if (status === "inactive") {
      filtered = filtered.filter((bs) => bs.is_active === false);
    }

    // Date range filter
    if (dateRange?.from) {
      const from = startOfDay(dateRange.from);
      const to = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from);

      filtered = filtered.filter((bs) => {
        const dateValue = bs[dateField];
        if (!dateValue) return false;
        const date = new Date(dateValue);
        return date >= from && date <= to;
      });
    }

    onFilteredChange(filtered);
  }, [
    billStatements,
    debouncedSearch,
    status,
    dateField,
    dateRange,
    onFilteredChange,
  ]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setDateField("statement_date");
    setDateRange(undefined);
  };

  const hasActiveFilters =
    search !== "" || status !== "all" || dateRange !== undefined;

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bill statements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as "all" | "active" | "inactive")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Field Selector */}
        <Select
          value={dateField}
          onValueChange={(v) =>
            setDateField(v as "statement_date" | "due_date")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Statement date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="statement_date">Statement date</SelectItem>
            <SelectItem value="due_date">Due date</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker */}
        <DateRangePickerWithPresets
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          triggerClassName="w-full"
          align="start"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 px-3"
          >
            <X className="mr-1 h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
