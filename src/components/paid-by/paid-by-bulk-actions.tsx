"use client";

import { Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePaidBy } from "@/services/paid-by.service";
import type { PaidBy } from "@/types/paid-by.types";

interface PaidByBulkActionsProps {
  selectedPaidByList: PaidBy[];
  onClearSelection: () => void;
  onBulkActionComplete?: () => void;
}

export function PaidByBulkActions({
  selectedPaidByList,
  onClearSelection,
  onBulkActionComplete,
}: PaidByBulkActionsProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedCount = selectedPaidByList.length;

  const handleSetActive = async (isActive: boolean) => {
    setIsSubmitting(true);
    try {
      const results = await Promise.allSettled(
        selectedPaidByList.map((pb) =>
          updatePaidBy(pb.id, { is_active: isActive }),
        ),
      );
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failureCount = results.filter(
        (r) => r.status === "rejected",
      ).length;

      if (failureCount === 0) {
        toast.success(
          `${successCount} paid-by entry(s) set to ${isActive ? "active" : "inactive"}`,
        );
      } else if (successCount === 0) {
        toast.error("Failed to update paid-by entries");
      } else {
        toast.warning(`${successCount} updated, ${failureCount} failed`);
      }
      onClearSelection();
      onBulkActionComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update paid-by entries",
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
