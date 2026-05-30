"use client";

import { ArrowRightLeft, CheckCircle2, Loader2, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getBillStatements } from "@/services/bill-statements.service";
import { applyBulkExpenseAction } from "@/services/expenses.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { BulkExpenseActionPayload, Expense } from "@/types/expense.types";

type BulkActionValue =
  | "move_bill_statement"
  | "mark_paid"
  | "mark_unpaid"
  | "delete";

interface ExpenseBulkActionsProps {
  selectedExpenses: Expense[];
  onClearSelection: () => void;
  onBulkActionComplete?: () => void;
}

const neoControlClass =
  "rounded-sm border-2 border-foreground/20 bg-background font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] dark:border-foreground/15 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.06)]";
const neoButtonClass =
  "rounded-sm border-2 border-foreground/25 font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/20 dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.08)]";
const neoPopoverClass =
  "rounded-sm border-2 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]";

function getBillStatementSortValue(billStatement: BillStatement): number {
  if (billStatement.statement_date) {
    const timestamp = Date.parse(billStatement.statement_date);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  const nameTimestamp = Date.parse(`1 ${billStatement.name}`);
  if (!Number.isNaN(nameTimestamp)) return nameTimestamp;

  return Number.MAX_SAFE_INTEGER;
}

export function ExpenseBulkActions({
  selectedExpenses,
  onClearSelection,
  onBulkActionComplete,
}: ExpenseBulkActionsProps) {
  const [action, setAction] = React.useState<BulkActionValue>(
    "move_bill_statement",
  );
  const [billStatements, setBillStatements] = React.useState<BillStatement[]>(
    [],
  );
  const [billStatementId, setBillStatementId] = React.useState("");
  const [isLoadingBillStatements, setIsLoadingBillStatements] =
    React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const selectedCount = selectedExpenses.length;
  const selectedIds = React.useMemo(
    () => selectedExpenses.map((expense) => expense.id),
    [selectedExpenses],
  );

  const sortedBillStatements = React.useMemo(
    () =>
      [...billStatements].sort((a, b) => {
        const byDate =
          getBillStatementSortValue(a) - getBillStatementSortValue(b);
        return byDate === 0 ? a.name.localeCompare(b.name) : byDate;
      }),
    [billStatements],
  );

  React.useEffect(() => {
    if (selectedCount === 0 || billStatements.length > 0) return;

    let cancelled = false;
    setIsLoadingBillStatements(true);
    getBillStatements()
      .then((response) => {
        if (!cancelled) setBillStatements(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch bill statements:", error);
        if (!cancelled) toast.error("Failed to load bill statements");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBillStatements(false);
      });

    return () => {
      cancelled = true;
    };
  }, [billStatements.length, selectedCount]);

  React.useEffect(() => {
    if (selectedCount === 0 || sortedBillStatements.length === 0) {
      setBillStatementId("");
      return;
    }

    const currentId = selectedExpenses[0]?.bill_statement_id;
    const allSameBillStatement =
      !!currentId &&
      selectedExpenses.every(
        (expense) => expense.bill_statement_id === currentId,
      );
    const currentIndex = sortedBillStatements.findIndex(
      (billStatement) => billStatement.id === currentId,
    );
    const nextBillStatement =
      allSameBillStatement && currentIndex >= 0
        ? sortedBillStatements[currentIndex + 1]
        : undefined;
    const fallbackBillStatement =
      sortedBillStatements.find(
        (billStatement) => billStatement.id !== currentId,
      ) || sortedBillStatements[0];

    setBillStatementId(
      nextBillStatement?.id || fallbackBillStatement?.id || "",
    );
  }, [selectedExpenses, selectedCount, sortedBillStatements]);

  const runBulkAction = async (payload: BulkExpenseActionPayload) => {
    setIsSubmitting(true);
    try {
      const response = await applyBulkExpenseAction(payload);
      toast.success(`${response.data.count} expense(s) updated`);
      onClearSelection();
      await onBulkActionComplete?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update expenses",
      );
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleApply = async () => {
    if (selectedIds.length === 0) return;

    if (action === "delete") {
      setIsDeleteOpen(true);
      return;
    }

    if (action === "move_bill_statement") {
      if (!billStatementId) {
        toast.error("Choose a bill statement first");
        return;
      }

      await runBulkAction({
        expense_ids: selectedIds,
        action: "move_bill_statement",
        bill_statement_id: billStatementId,
      });
      return;
    }

    await runBulkAction({
      expense_ids: selectedIds,
      action: "set_status",
      status: action === "mark_paid" ? "paid" : "unpaid",
    });
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="rounded-sm border-2 border-foreground/20 bg-secondary/70 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-muted-foreground">
              Bulk Action
            </p>
            <p className="text-sm font-black text-foreground">
              {selectedCount} selected
            </p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[minmax(180px,240px)_minmax(220px,1fr)_auto_auto] lg:max-w-4xl">
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase text-muted-foreground">
                Action
              </Label>
              <Select
                value={action}
                onValueChange={(value) => setAction(value as BulkActionValue)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={cn(neoControlClass, "w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={neoPopoverClass}>
                  <SelectItem value="move_bill_statement">
                    Move to bill statement
                  </SelectItem>
                  <SelectItem value="mark_paid">Mark as paid</SelectItem>
                  <SelectItem value="mark_unpaid">Mark as unpaid</SelectItem>
                  <SelectItem value="delete">Delete selected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-black uppercase text-muted-foreground">
                Target
              </Label>
              <Select
                value={billStatementId}
                onValueChange={setBillStatementId}
                disabled={
                  action !== "move_bill_statement" ||
                  isSubmitting ||
                  isLoadingBillStatements
                }
              >
                <SelectTrigger className={cn(neoControlClass, "w-full")}>
                  <SelectValue
                    placeholder={
                      isLoadingBillStatements
                        ? "Loading bill statements..."
                        : "Select bill statement"
                    }
                  />
                </SelectTrigger>
                <SelectContent className={neoPopoverClass}>
                  {sortedBillStatements.map((billStatement) => (
                    <SelectItem key={billStatement.id} value={billStatement.id}>
                      {billStatement.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={handleApply}
              disabled={isSubmitting}
              className={cn(neoButtonClass, "self-end")}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : action === "delete" ? (
                <Trash2 className="h-4 w-4" />
              ) : action === "move_bill_statement" ? (
                <ArrowRightLeft className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Apply
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onClearSelection}
              disabled={isSubmitting}
              className={cn(neoButtonClass, "self-end bg-background")}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-sm border-2 border-foreground/30 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.12)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Selected Expenses</DialogTitle>
            <DialogDescription>
              Delete {selectedCount} selected expense(s). This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                runBulkAction({
                  expense_ids: selectedIds,
                  action: "delete",
                })
              }
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
