"use client";

import { Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateBillStatement } from "@/services/bill-statements.service";
import type { BillStatement } from "@/types/bill-statement.types";

interface BillStatementBulkActionsProps {
  selectedBillStatements: BillStatement[];
  onClearSelection: () => void;
  onBulkActionComplete?: () => void;
}

export function BillStatementBulkActions({
  selectedBillStatements,
  onClearSelection,
  onBulkActionComplete,
}: BillStatementBulkActionsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedCount = selectedBillStatements.length;

  const handleSetActive = async (isActive: boolean) => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedBillStatements.map((bs) =>
          updateBillStatement(bs.id, { is_active: isActive }),
        ),
      );
      toast.success(
        `${selectedCount} bill statement(s) set to ${isActive ? "active" : "inactive"}`,
      );
      onClearSelection();
      onBulkActionComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update bill statements",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="rounded-lg border bg-secondary/70 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">
          {selectedCount} selected
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => handleSetActive(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Set active
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleSetActive(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Set inactive
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
