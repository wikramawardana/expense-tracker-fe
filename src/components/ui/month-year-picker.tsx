"use client";

import { parse } from "date-fns";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillStatement } from "@/types/bill-statement.types";

interface MonthYearPickerProps {
  billStatements: BillStatement[];
  value: string;
  onValueChange: (billStatementId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showAllOption?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseBillStatementDate(name: string): Date | null {
  try {
    return parse(name, "MMMM yyyy", new Date());
  } catch {
    return null;
  }
}

export function MonthYearPicker({
  billStatements,
  value,
  onValueChange,
  disabled = false,
  placeholder: _placeholder,
  showAllOption = false,
}: MonthYearPickerProps) {
  // Extract unique years and months from bill statements
  const { years, monthsByYear, statementMap } = React.useMemo(() => {
    const yrs = new Set<number>();
    const mbY: Record<number, Set<number>> = {};
    const sMap: Record<string, string> = {}; // "month-year" -> bill statement id

    for (const bs of billStatements) {
      const date = parseBillStatementDate(bs.name);
      if (!date) continue;

      const year = date.getFullYear();
      const month = date.getMonth();

      yrs.add(year);
      if (!mbY[year]) mbY[year] = new Set();
      mbY[year].add(month);
      sMap[`${month}-${year}`] = bs.id;
    }

    // Sort years descending (newest first)
    const sortedYears = Array.from(yrs).sort((a, b) => b - a);

    return { years: sortedYears, monthsByYear: mbY, statementMap: sMap };
  }, [billStatements]);

  // Derive selected month and year from value (bill statement ID)
  const { selectedMonth, selectedYear } = React.useMemo(() => {
    if (!value || value === "all")
      return { selectedMonth: "", selectedYear: "" };

    const bs = billStatements.find((b) => b.id === value);
    if (!bs) return { selectedMonth: "", selectedYear: "" };

    const date = parseBillStatementDate(bs.name);
    if (!date) return { selectedMonth: "", selectedYear: "" };

    return {
      selectedMonth: String(date.getMonth()),
      selectedYear: String(date.getFullYear()),
    };
  }, [value, billStatements]);

  // Track whether "all" mode is active
  const isAllMode = showAllOption && (value === "all" || value === "");

  // Get available months for the currently selected year
  const availableMonths = React.useMemo(() => {
    if (!selectedYear && !isAllMode) {
      // If no year selected yet, show all months across all years
      const allMonths = new Set<number>();
      for (const monthSet of Object.values(monthsByYear)) {
        for (const m of monthSet) allMonths.add(m);
      }
      return Array.from(allMonths).sort((a, b) => a - b);
    }
    const yr = Number(selectedYear);
    if (!monthsByYear[yr]) return [];
    return Array.from(monthsByYear[yr]).sort((a, b) => a - b);
  }, [selectedYear, monthsByYear, isAllMode]);

  const handleYearChange = (yr: string) => {
    if (yr === "all") {
      onValueChange("all");
      return;
    }
    // When year changes, try to keep the same month if it exists
    const yearNum = Number(yr);
    const monthNum = selectedMonth !== "" ? Number(selectedMonth) : null;

    if (monthNum !== null && monthsByYear[yearNum]?.has(monthNum)) {
      const id = statementMap[`${monthNum}-${yearNum}`];
      if (id) {
        onValueChange(id);
        return;
      }
    }

    // Try current month of the new year
    const now = new Date();
    const currentMonth = now.getMonth();
    if (monthsByYear[yearNum]?.has(currentMonth)) {
      const id = statementMap[`${currentMonth}-${yearNum}`];
      if (id) {
        onValueChange(id);
        return;
      }
    }

    // Pick the first available month in this year
    if (monthsByYear[yearNum]) {
      const months = Array.from(monthsByYear[yearNum]).sort((a, b) => a - b);
      if (months.length > 0) {
        const id = statementMap[`${months[0]}-${yearNum}`];
        if (id) {
          onValueChange(id);
          return;
        }
      }
    }
  };

  const handleMonthChange = (mo: string) => {
    if (mo === "all") {
      onValueChange("all");
      return;
    }
    const monthNum = Number(mo);
    const yearNum = selectedYear ? Number(selectedYear) : null;

    if (yearNum !== null) {
      const id = statementMap[`${monthNum}-${yearNum}`];
      if (id) {
        onValueChange(id);
        return;
      }
    }

    // If no year selected, find the first year that has this month
    for (const yr of years) {
      if (monthsByYear[yr]?.has(monthNum)) {
        const id = statementMap[`${monthNum}-${yr}`];
        if (id) {
          onValueChange(id);
          return;
        }
      }
    }
  };

  // Default to empty (null) — user must explicitly pick a bill statement.

  if (isAllMode) {
    return (
      <div className="flex gap-2 w-full">
        <Select
          value="all"
          onValueChange={(v) => {
            if (v === "all") {
              onValueChange("all");
            } else {
              // User selected a year, switch out of "all" mode
              handleYearChange(v);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All bill statements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bill statements</SelectItem>
            {years.map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex gap-2 w-full">
      <Select
        value={selectedMonth}
        onValueChange={handleMonthChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-1/2">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">All bill statements</SelectItem>
          )}
          {availableMonths.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {MONTH_NAMES[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedYear}
        onValueChange={handleYearChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-1/2">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">All bill statements</SelectItem>
          )}
          {years.map((yr) => (
            <SelectItem key={yr} value={String(yr)}>
              {yr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
