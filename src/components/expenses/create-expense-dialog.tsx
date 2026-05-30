"use client";

import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { MonthYearPicker } from "@/components/ui/month-year-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { SCHEDULE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { createExpense, createExpensesBulk } from "@/services/expenses.service";
import { getPaymentMethods } from "@/services/payment-methods.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type { CreateExpensePayload } from "@/types/expense.types";
import type { PaymentMethod as PaymentMethodRecord } from "@/types/payment-method.types";

interface CreateExpenseDialogProps {
  onExpenseCreated?: () => void;
}

interface ExpenseRow {
  rowId: string;
  title: string;
  amount: string;
  categoryId: string;
  billStatementId: string;
  paymentMethodId: string;
  paidBy: string;
  scheduleType: string;
  recurrenceCount: string;
  recurrenceCurrent: string;
  description: string;
}

function newRow(paymentMethodId = ""): ExpenseRow {
  return {
    rowId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: "",
    amount: "",
    categoryId: "",
    billStatementId: "",
    paymentMethodId,
    paidBy: "",
    scheduleType: "none",
    recurrenceCount: "",
    recurrenceCurrent: "",
    description: "",
  };
}

function getDefaultPaymentMethodId(paymentMethods: PaymentMethodRecord[]) {
  return (
    paymentMethods.find((method) => method.name.trim().toLowerCase() === "cash")
      ?.id ??
    paymentMethods[0]?.id ??
    ""
  );
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
  const [paymentMethods, setPaymentMethods] = React.useState<
    PaymentMethodRecord[]
  >([]);
  const [isPaymentMethodsLoading, setIsPaymentMethodsLoading] =
    React.useState(false);

  // Per-row state
  const [rows, setRows] = React.useState<ExpenseRow[]>([newRow()]);

  // Shared date across all rows
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );

  const getFilteredBillStatements = React.useCallback(
    (paymentMethodId: string) => {
      const selectedPaymentMethod = paymentMethods.find(
        (method) => method.id === paymentMethodId,
      );
      if (!selectedPaymentMethod) return [];

      return billStatements.filter(
        (billStatement) =>
          !billStatement.payment_method_id ||
          billStatement.payment_method_id === selectedPaymentMethod.id,
      );
    },
    [billStatements, paymentMethods],
  );

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
          const active = response.data.filter((b) => b.is_active);
          setBillStatements(active);
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
    if (isOpen && paymentMethods.length === 0) {
      setIsPaymentMethodsLoading(true);
      getPaymentMethods()
        .then((response) => {
          const activePaymentMethods = response.data.filter(
            (method) => method.is_active,
          );
          setPaymentMethods(activePaymentMethods);
          const defaultPaymentMethodId =
            getDefaultPaymentMethodId(activePaymentMethods);
          setRows((prev) =>
            prev.map((row) =>
              row.paymentMethodId
                ? row
                : { ...row, paymentMethodId: defaultPaymentMethodId },
            ),
          );
        })
        .catch((error) => {
          toast.error("Failed to load payment methods");
          console.error(error);
        })
        .finally(() => {
          setIsPaymentMethodsLoading(false);
        });
    }
  }, [isOpen, paymentMethods.length]);

  React.useEffect(() => {
    if (!isOpen || paymentMethods.length === 0) return;

    const defaultPaymentMethodId = getDefaultPaymentMethodId(paymentMethods);
    setRows((prev) =>
      prev.map((row) =>
        row.paymentMethodId
          ? row
          : { ...row, paymentMethodId: defaultPaymentMethodId },
      ),
    );
  }, [isOpen, paymentMethods]);

  React.useEffect(() => {
    if (!isOpen || billStatements.length === 0 || paymentMethods.length === 0) {
      return;
    }

    setRows((prev) =>
      prev.map((row) => {
        if (
          !row.billStatementId ||
          getFilteredBillStatements(row.paymentMethodId).some(
            (billStatement) => billStatement.id === row.billStatementId,
          )
        ) {
          return row;
        }

        return { ...row, billStatementId: "" };
      }),
    );
  }, [
    isOpen,
    billStatements.length,
    paymentMethods.length,
    getFilteredBillStatements,
  ]);

  const resetForm = () => {
    setRows([newRow(getDefaultPaymentMethodId(paymentMethods))]);
    setExpenseDate(new Date().toISOString().split("T")[0]);
  };

  const updateRow = (rowId: string, patch: Partial<ExpenseRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      newRow(getDefaultPaymentMethodId(paymentMethods)),
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.rowId !== rowId) : prev,
    );
  };

  const buildPayload = (row: ExpenseRow): CreateExpensePayload | null => {
    const selectedPaymentMethod = paymentMethods.find(
      (method) => method.id === row.paymentMethodId,
    );

    if (
      !row.title ||
      !row.amount ||
      !row.categoryId ||
      !row.billStatementId ||
      !selectedPaymentMethod
    ) {
      return null;
    }
    const formattedDate = new Date(expenseDate).toISOString();
    const payload: CreateExpensePayload = {
      title: row.title,
      amount: Number(row.amount),
      category_id: row.categoryId,
      bill_statement_id: row.billStatementId,
      payment_method: selectedPaymentMethod.name,
      payment_method_id: selectedPaymentMethod.id,
      expense_date: formattedDate,
      description: row.description || undefined,
      paid_by: row.paidBy || undefined,
    };

    if (row.scheduleType === "installment") {
      payload.recurrence_type = "installment";
      payload.recurrence_count = Number(row.recurrenceCount);
      if (row.recurrenceCurrent) {
        payload.recurrence_current = Number(row.recurrenceCurrent);
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!expenseDate) {
      toast.error("Please fill in the expense date");
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const selectedPaymentMethod = paymentMethods.find(
        (method) => method.id === row.paymentMethodId,
      );

      if (
        !row.title ||
        !row.amount ||
        !row.categoryId ||
        !row.billStatementId ||
        !row.paymentMethodId
      ) {
        toast.error(`Please fill in all required fields for expense #${i + 1}`);
        return;
      }

      if (!selectedPaymentMethod) {
        toast.error(
          `Please select an active payment method for expense #${i + 1}`,
        );
        return;
      }

      if (row.scheduleType === "installment") {
        const total = Number(row.recurrenceCount);
        if (!row.recurrenceCount || total < 1) {
          toast.error(
            `Number of payments for expense #${i + 1} must be at least 1`,
          );
          return;
        }

        if (row.recurrenceCurrent) {
          const cur = Number(row.recurrenceCurrent);
          if (cur < 1 || cur > total) {
            toast.error(
              `Current payment for expense #${i + 1} must be between 1 and ${
                total || "total payments"
              }`,
            );
            return;
          }
        }
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

      if (payloads.length === 1) {
        await createExpense(payloads[0]);
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
    (row) =>
      !row.title ||
      !row.amount ||
      !row.categoryId ||
      !row.billStatementId ||
      !row.paymentMethodId ||
      (row.scheduleType === "installment" && !row.recurrenceCount),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {rows.length > 1 ? "Add New Expenses" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            Create expense entries that share a date. Each row can use its own
            payment details and schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shared date */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Shared Date
              </h3>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal",
                        !expenseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expenseDate
                        ? format(new Date(expenseDate), "MMMM d, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expenseDate ? new Date(expenseDate) : undefined}
                      onSelect={(date) =>
                        setExpenseDate(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Expense rows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b">
              <h3 className="text-sm font-semibold text-muted-foreground">
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
              {rows.map((row, index) => {
                const rowFilteredBillStatements = getFilteredBillStatements(
                  row.paymentMethodId,
                );
                const rowSelectedScheduleType = SCHEDULE_TYPES.find(
                  (type) => type.value === row.scheduleType,
                );

                return (
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
                        <Label>
                          Payment Method <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={row.paymentMethodId}
                          onValueChange={(value) =>
                            updateRow(row.rowId, {
                              paymentMethodId: value,
                              billStatementId: "",
                            })
                          }
                          disabled={isPaymentMethodsLoading}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue
                              placeholder={
                                isPaymentMethodsLoading
                                  ? "Loading..."
                                  : "Select payment method"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>
                          Bill Statement <span className="text-red-500">*</span>
                        </Label>
                        <MonthYearPicker
                          billStatements={rowFilteredBillStatements}
                          value={row.billStatementId}
                          onValueChange={(value) =>
                            updateRow(row.rowId, { billStatementId: value })
                          }
                          disabled={
                            isBillStatementsLoading ||
                            !row.paymentMethodId ||
                            rowFilteredBillStatements.length === 0
                          }
                          showAllOption={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`paidBy-${row.rowId}`}>Paid By</Label>
                        <Input
                          id={`paidBy-${row.rowId}`}
                          value={row.paidBy}
                          onChange={(e) =>
                            updateRow(row.rowId, { paidBy: e.target.value })
                          }
                          placeholder="e.g., Wikra"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Schedule Type</Label>
                          <Select
                            value={row.scheduleType}
                            onValueChange={(value) =>
                              updateRow(row.rowId, {
                                scheduleType: value,
                                recurrenceCount:
                                  value === "installment"
                                    ? row.recurrenceCount
                                    : "",
                                recurrenceCurrent:
                                  value === "installment"
                                    ? row.recurrenceCurrent
                                    : "",
                              })
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select schedule type" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHEDULE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {rowSelectedScheduleType?.value === "installment" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`recurrenceCurrent-${row.rowId}`}>
                              Current Payment #
                            </Label>
                            <Input
                              id={`recurrenceCurrent-${row.rowId}`}
                              type="number"
                              min={1}
                              value={row.recurrenceCurrent}
                              onChange={(e) =>
                                updateRow(row.rowId, {
                                  recurrenceCurrent: e.target.value,
                                })
                              }
                              placeholder="e.g., 3"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`recurrenceCount-${row.rowId}`}>
                              Number of Payments{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`recurrenceCount-${row.rowId}`}
                              type="number"
                              min={1}
                              value={row.recurrenceCount}
                              onChange={(e) =>
                                updateRow(row.rowId, {
                                  recurrenceCount: e.target.value,
                                })
                              }
                              placeholder="e.g., 12"
                              className="h-11"
                            />
                          </div>
                        </div>
                      )}
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
                );
              })}
            </div>
          </div>
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
            disabled={isLoading || hasIncompleteRow}
          >
            {isLoading
              ? "Creating..."
              : rows.length > 1
                ? `Create ${rows.length} Expenses`
                : "Create Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
