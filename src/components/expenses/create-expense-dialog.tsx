"use client";

import { Plus, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHODS } from "@/lib/constants";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { createExpense, createExpensesBulk } from "@/services/expenses.service";
import { getRecurrenceTypes } from "@/services/recurrence-types.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type {
  CreateExpensePayload,
  PaymentMethod,
} from "@/types/expense.types";
import type { RecurrenceType as RecurrenceTypeModel } from "@/types/recurrence-type.types";

interface CreateExpenseDialogProps {
  onExpenseCreated?: () => void;
}

interface ExpenseRow {
  rowId: string;
  title: string;
  amount: string;
  categoryId: string;
  description: string;
}

function newRow(): ExpenseRow {
  return {
    rowId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: "",
    amount: "",
    categoryId: "",
    description: "",
  };
}

export function CreateExpenseDialog({
  onExpenseCreated,
}: CreateExpenseDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = React.useState(false);
  const [billStatements, setBillStatements] = React.useState<BillStatement[]>(
    [],
  );
  const [isBillStatementsLoading, setIsBillStatementsLoading] =
    React.useState(false);
  const [recurrenceTypes, setRecurrenceTypes] = React.useState<
    RecurrenceTypeModel[]
  >([]);
  const [isRecurrenceTypesLoading, setIsRecurrenceTypesLoading] =
    React.useState(false);

  // Per-row state
  const [rows, setRows] = React.useState<ExpenseRow[]>([newRow()]);

  // Shared state across all rows
  const [billStatementId, setBillStatementId] = React.useState("");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("Cash");
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [paidBy, setPaidBy] = React.useState("");

  // Recurrence (only available when there's a single row)
  const [recurrenceTypeId, setRecurrenceTypeId] =
    React.useState<string>("none");
  const [recurrenceCount, setRecurrenceCount] = React.useState("");
  const [recurrenceCurrent, setRecurrenceCurrent] = React.useState("");
  const [recurrenceTotalAmount, setRecurrenceTotalAmount] = React.useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState("");

  const isMulti = rows.length > 1;

  const selectedRecurrenceType = React.useMemo(() => {
    if (recurrenceTypeId === "none") return null;
    return recurrenceTypes.find((rt) => rt.id === recurrenceTypeId);
  }, [recurrenceTypeId, recurrenceTypes]);

  React.useEffect(() => {
    if (isOpen && categories.length === 0) {
      setIsCategoriesLoading(true);
      getCategories()
        .then((response) => {
          setCategories(response.data.filter((c) => c.is_active));
        })
        .catch((error) => {
          toast.error("Failed to load categories");
          console.error(error);
        })
        .finally(() => {
          setIsCategoriesLoading(false);
        });
    }
  }, [isOpen, categories.length]);

  React.useEffect(() => {
    if (isOpen && billStatements.length === 0) {
      setIsBillStatementsLoading(true);
      getBillStatements()
        .then((response) => {
          setBillStatements(response.data.filter((b) => b.is_active));
        })
        .catch((error) => {
          toast.error("Failed to load bill statements");
          console.error(error);
        })
        .finally(() => {
          setIsBillStatementsLoading(false);
        });
    }
  }, [isOpen, billStatements.length]);

  React.useEffect(() => {
    if (isOpen && recurrenceTypes.length === 0) {
      setIsRecurrenceTypesLoading(true);
      getRecurrenceTypes()
        .then((response) => {
          setRecurrenceTypes(response.data.filter((rt) => rt.is_active));
        })
        .catch((error) => {
          toast.error("Failed to load recurrence types");
          console.error(error);
        })
        .finally(() => {
          setIsRecurrenceTypesLoading(false);
        });
    }
  }, [isOpen, recurrenceTypes.length]);

  // When switching to multi-row mode, reset recurrence to one-time since it is
  // not supported for bulk creation.
  React.useEffect(() => {
    if (isMulti && recurrenceTypeId !== "none") {
      setRecurrenceTypeId("none");
      setRecurrenceCount("");
      setRecurrenceCurrent("");
      setRecurrenceTotalAmount("");
      setRecurrenceEndDate("");
    }
  }, [isMulti, recurrenceTypeId]);

  const resetForm = () => {
    setRows([newRow()]);
    setBillStatementId("");
    setPaymentMethod("Cash");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setPaidBy("");
    setRecurrenceTypeId("none");
    setRecurrenceCount("");
    setRecurrenceCurrent("");
    setRecurrenceTotalAmount("");
    setRecurrenceEndDate("");
  };

  const updateRow = (rowId: string, patch: Partial<ExpenseRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, newRow()]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.rowId !== rowId) : prev,
    );
  };

  const buildPayload = (row: ExpenseRow): CreateExpensePayload | null => {
    if (!row.title || !row.amount || !row.categoryId) return null;
    const formattedDate = new Date(expenseDate).toISOString();
    return {
      title: row.title,
      amount: Number(row.amount),
      category_id: row.categoryId,
      bill_statement_id: billStatementId,
      payment_method: paymentMethod,
      expense_date: formattedDate,
      description: row.description || undefined,
      paid_by: paidBy || undefined,
    };
  };

  const handleSubmit = async () => {
    if (!billStatementId || !paymentMethod || !expenseDate) {
      toast.error("Please fill in all shared required fields");
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.title || !row.amount || !row.categoryId) {
        toast.error(
          `Please fill in title, amount, and category for expense #${i + 1}`,
        );
        return;
      }
    }

    const recurrenceTypeName = selectedRecurrenceType?.name?.toLowerCase();

    if (!isMulti) {
      if (
        recurrenceTypeName === "installment" &&
        (!recurrenceCount || !recurrenceTotalAmount)
      ) {
        toast.error("Please fill in installment count and total amount");
        return;
      }

      if (recurrenceTypeName === "installment" && recurrenceCurrent) {
        const cur = Number(recurrenceCurrent);
        const total = Number(recurrenceCount);
        if (cur < 1 || cur > total) {
          toast.error(
            `Current payment must be between 1 and ${total || "total payments"}`,
          );
          return;
        }
      }

      if (recurrenceTypeName === "subscription" && !recurrenceEndDate) {
        toast.error("Please fill in subscription end date");
        return;
      }
    }

    setIsLoading(true);
    try {
      const payloads = rows
        .map(buildPayload)
        .filter((p): p is CreateExpensePayload => p !== null);

      if (payloads.length === 0) {
        toast.error("Please fill in at least one expense");
        return;
      }

      if (!isMulti) {
        const payload = payloads[0];
        if (recurrenceTypeId !== "none" && selectedRecurrenceType) {
          payload.recurrence_type_id = recurrenceTypeId;
          if (recurrenceTypeName === "installment") {
            payload.recurrence_count = Number(recurrenceCount);
            payload.recurrence_total_amount = Number(recurrenceTotalAmount);
            if (recurrenceCurrent) {
              payload.recurrence_current = Number(recurrenceCurrent);
            }
          } else if (
            recurrenceTypeName === "subscription" ||
            recurrenceTypeName === "recurring"
          ) {
            if (recurrenceEndDate) {
              payload.recurrence_end_date = new Date(
                recurrenceEndDate,
              ).toISOString();
            }
          }
        }
        await createExpense(payload);
        toast.success("Expense created successfully");
      } else {
        const response = await createExpensesBulk({ expenses: payloads });
        toast.success(`${response.data.count} expenses created successfully`);
      }

      setIsOpen(false);
      resetForm();
      onExpenseCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create expenses",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasIncompleteRow = rows.some(
    (row) => !row.title || !row.amount || !row.categoryId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {isMulti ? "Add New Expenses" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isMulti
              ? "Create multiple expense entries that share the same date, bill statement, and payment method."
              : "Create a new expense entry. You can add more rows to log several expenses at once."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shared: Date & Bill Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Shared Info
              </h3>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Bill Statement <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={billStatementId}
                  onValueChange={setBillStatementId}
                  disabled={isBillStatementsLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        isBillStatementsLoading
                          ? "Loading..."
                          : "Select bill statement"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {billStatements.map((billStatement) => (
                      <SelectItem
                        key={billStatement.id}
                        value={billStatement.id}
                      >
                        {billStatement.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.emoji} {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidBy">Paid By</Label>
                <Input
                  id="paidBy"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="e.g., Wikra"
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Expense rows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Expenses ({rows.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add another
              </Button>
            </div>

            <div className="space-y-4">
              {rows.map((row, index) => (
                <div
                  key={row.rowId}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Expense #{index + 1}
                    </span>
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.rowId)}
                        aria-label={`Remove expense #${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${row.rowId}`}>
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`title-${row.rowId}`}
                        value={row.title}
                        onChange={(e) =>
                          updateRow(row.rowId, { title: e.target.value })
                        }
                        placeholder="e.g., Lunch at restaurant"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={row.categoryId}
                        onValueChange={(v) =>
                          updateRow(row.rowId, { categoryId: v })
                        }
                        disabled={isCategoriesLoading}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue
                            placeholder={
                              isCategoriesLoading
                                ? "Loading..."
                                : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon && `${category.icon} `}
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${row.rowId}`}>
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`amount-${row.rowId}`}
                        type="number"
                        value={row.amount}
                        onChange={(e) =>
                          updateRow(row.rowId, { amount: e.target.value })
                        }
                        placeholder="0"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${row.rowId}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${row.rowId}`}
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.rowId, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Optional notes..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurrence (single-row only) */}
          {!isMulti && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Expense Type
                </h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Expense Type</Label>
                  <Select
                    value={recurrenceTypeId}
                    onValueChange={setRecurrenceTypeId}
                    disabled={isRecurrenceTypesLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          isRecurrenceTypesLoading
                            ? "Loading..."
                            : "Select expense type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">1️⃣ One-time</SelectItem>
                      {recurrenceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name === "Installment"
                            ? "📅"
                            : type.name === "Subscription"
                              ? "🔄"
                              : "📋"}{" "}
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedRecurrenceType?.name?.toLowerCase() ===
                "installment" && (
                <div className="space-y-4 p-4 bg-muted rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceCurrent">
                        Current Payment #
                      </Label>
                      <Input
                        id="recurrenceCurrent"
                        type="number"
                        min={1}
                        value={recurrenceCurrent}
                        onChange={(e) => setRecurrenceCurrent(e.target.value)}
                        placeholder="e.g., 3"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceCount">
                        Number of Payments{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="recurrenceCount"
                        type="number"
                        min={1}
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(e.target.value)}
                        placeholder="e.g., 12"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurrenceTotalAmount">
                        Total Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="recurrenceTotalAmount"
                        type="number"
                        value={recurrenceTotalAmount}
                        onChange={(e) =>
                          setRecurrenceTotalAmount(e.target.value)
                        }
                        placeholder="e.g., 18000000"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave <span className="font-medium">Current Payment #</span>{" "}
                    empty to start from <span className="font-medium">1</span>.
                    Set it to e.g. <span className="font-medium">3</span> with{" "}
                    <span className="font-medium">12</span> total to log this as{" "}
                    <span className="font-medium">3/12</span>.
                  </p>
                </div>
              )}

              {selectedRecurrenceType?.name?.toLowerCase() ===
                "subscription" && (
                <div className="p-4 bg-muted rounded-lg border">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="recurrenceEndDate">
                      Subscription End Date{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="recurrenceEndDate"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {selectedRecurrenceType?.name?.toLowerCase() === "recurring" && (
                <div className="p-4 bg-muted rounded-lg border">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="recurrenceEndDate">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="recurrenceEndDate"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      placeholder="Leave empty for indefinite"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty if this recurring expense has no end date
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || hasIncompleteRow || !billStatementId}
          >
            {isLoading
              ? "Creating..."
              : isMulti
                ? `Create ${rows.length} Expenses`
                : "Create Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
