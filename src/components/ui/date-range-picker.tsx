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
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerWithPresetsProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
}

export function DateRangePickerWithPresets({
  dateRange,
  onDateRangeChange,
  triggerClassName,
  align = "start",
}: DateRangePickerWithPresetsProps) {
  const handlePresetSelect = (from: Date, to: Date) => {
    onDateRangeChange({ from: startOfDay(from), to: endOfDay(to) });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left",
            !dateRange && "text-muted-foreground",
            triggerClassName,
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
      <PopoverContent className="w-auto p-0" align={align}>
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
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
