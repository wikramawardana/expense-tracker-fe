"use client";

import { Plus } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateRangePickerWithPresets } from "@/components/ui/date-range-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBillStatement } from "@/services/bill-statements.service";

interface CreateBillStatementDialogProps {
  onBillStatementCreated?: () => void;
}

export function CreateBillStatementDialog({
  onBillStatementCreated,
}: CreateBillStatementDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined,
  );
  const [description, setDescription] = React.useState("");

  const resetForm = () => {
    setName("");
    setDateRange(undefined);
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a bill statement name");
      return;
    }

    setIsLoading(true);
    try {
      await createBillStatement({
        name: name.trim(),
        statement_date: dateRange?.from
          ? dateRange.from.toISOString()
          : undefined,
        due_date: dateRange?.to ? dateRange.to.toISOString() : undefined,
        description: description.trim() || undefined,
      });
      toast.success("Bill statement created successfully");
      setIsOpen(false);
      resetForm();
      onBillStatementCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create bill statement",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bill Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bill Statement</DialogTitle>
          <DialogDescription>
            Create a new bill statement. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., January 2026"
            />
          </div>

          <div className="space-y-2">
            <Label>Statement period</Label>
            <DateRangePickerWithPresets
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              triggerClassName="w-full"
              align="start"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Monthly statement for credit card"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Bill Statement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
