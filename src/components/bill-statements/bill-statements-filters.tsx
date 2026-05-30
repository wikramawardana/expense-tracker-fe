"use client";

import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">(
    "all",
  );
  const [dateField, setDateField] = React.useState<
    "statement_date" | "due_date"
  >("statement_date");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  );

  // Compute filtered results whenever any filter state changes
  React.useEffect(() => {
    let filtered = billStatements;

    // Search by name (case-insensitive)
    if (search) {
      const lowerSearch = search.toLowerCase();
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
  }, [billStatements, search, status, dateField, dateRange, onFilteredChange]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setDateField("statement_date");
    setDateRange(undefined);
  };

  const hasActiveFilters =
    search !== "" || status !== "all" || dateRange !== undefined;

  const handlePresetSelect = (from: Date, to: Date) => {
    setDateRange({ from: startOfDay(from), to: endOfDay(to) });
  };

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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <div className="flex flex-col gap-1 border-r p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  onClick={() => {
                    const today = new Date();
                    handlePresetSelect(today, today);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  onClick={() => {
                    const today = new Date();
                    handlePresetSelect(subDays(today, 6), today);
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  onClick={() => {
                    const today = new Date();
                    handlePresetSelect(subDays(today, 29), today);
                  }}
                >
                  Last 30 days
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  onClick={() => {
                    const today = new Date();
                    handlePresetSelect(startOfMonth(today), endOfMonth(today));
                  }}
                >
                  This month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full"
                  onClick={() => {
                    const lastMonth = subMonths(new Date(), 1);
                    handlePresetSelect(
                      startOfMonth(lastMonth),
                      endOfMonth(lastMonth),
                    );
                  }}
                >
                  Last month
                </Button>
              </div>
              <div className="p-3">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
