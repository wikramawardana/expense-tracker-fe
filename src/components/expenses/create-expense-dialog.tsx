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
import { SCHEDULE_TYPES } from "@/lib/constants";
import { formatAmountInput, parseAmountInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import { createExpense, createExpensesBulk } from "@/services/expenses.service";
import { getPaidByList } from "@/services/paid-by.service";
import { getPaymentMethods } from "@/services/payment-methods.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type { CreateExpensePayload, ScheduleType } from "@/types/expense.types";
import type { PaidBy } from "@/types/paid-by.types";
import type { PaymentMethod as PaymentMethodRecord } from "@/types/payment-method.types";

interface CreateExpenseDialogProps {
  onExpenseCreated?: () => void;
  defaultScheduleType?: ScheduleType;
  fixedScheduleType?: ScheduleType;
  entityLabel?: string;
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

function newRow(
  paymentMethodId = "",
  scheduleType: ScheduleType = "none",
): ExpenseRow {
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
    scheduleType,
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

function getDefaultPaidBy(paidByList: PaidBy[]) {
  return (
    paidByList.find((item) => item.name.trim().toLowerCase() === "wikra")
      ?.name ?? ""
  );
}

export function CreateExpenseDialog({
  onExpenseCreated,
  defaultScheduleType = "none",
  fixedScheduleType,
  entityLabel = "Expense",
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
  const [paidByList, setPaidByList] = React.useState<PaidBy[]>([]);
  const [isPaidByLoading, setIsPaidByLoading] = React.useState(false);

  // Per-row state
  const [rows, setRows] = React.useState<ExpenseRow[]>([
    newRow("", defaultScheduleType),
  ]);

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
    if (isOpen && paidByList.length === 0) {
      setIsPaidByLoading(true);
      getPaidByList()
        .then((response) => {
          const activePaidBy = response.data.filter((pb) => pb.is_active);
          const defaultPaidBy = getDefaultPaidBy(activePaidBy);
          setPaidByList(activePaidBy);
          setRows((prev) =>
            prev.map((row) =>
              row.paidBy ? row : { ...row, paidBy: defaultPaidBy },
            ),
          );
        })
        .catch((error) => {
          toast.error("Failed to load paid-by list");
          console.error(error);
        })
        .finally(() => {
          setIsPaidByLoading(false);
        });
    }
  }, [isOpen, paidByList.length]);

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
        const filteredBillStatements = getFilteredBillStatements(
          row.paymentMethodId,
        );
        if (
          row.billStatementId &&
          filteredBillStatements.some(
            (billStatement) => billStatement.id === row.billStatementId,
          )
        ) {
          return row;
        }

        if (filteredBillStatements.length === 1) {
          return {
            ...row,
            billStatementId: filteredBillStatements[0].id,
          };
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
    const row = newRow(
      getDefaultPaymentMethodId(paymentMethods),
      defaultScheduleType,
    );
    row.paidBy = getDefaultPaidBy(paidByList);
    setRows([row]);
    setExpenseDate(new Date().toISOString().split("T")[0]);
  };

  const updateRow = (rowId: string, patch: Partial<ExpenseRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    const previousRow = rows[rows.length - 1];
    const row = newRow(
      previousRow?.paymentMethodId || getDefaultPaymentMethodId(paymentMethods),
      (previousRow?.scheduleType as ScheduleType) || defaultScheduleType,
    );
    row.categoryId = previousRow?.categoryId || "";
    row.billStatementId = previousRow?.billStatementId || "";
    row.paidBy = previousRow?.paidBy || getDefaultPaidBy(paidByList);

    setRows((prev) => [...prev, row]);
    requestAnimationFrame(() => {
      const titleInput = document.getElementById(`title-${row.rowId}`);
      titleInput?.focus();
      titleInput?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
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
    } else if (row.scheduleType === "subscription") {
      payload.recurrence_type = "subscription";
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
          Add {entityLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="grid max-h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-5xl"
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            (event.metaKey || event.ctrlKey) &&
            !isLoading &&
            !hasIncompleteRow
          ) {
            event.preventDefault();
            handleSubmit();
          }
        }}
      >
        <DialogHeader className="border-b px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-xl font-semibold">
            {rows.length > 1
              ? `Add New ${entityLabel}s`
              : `Add New ${entityLabel}`}
          </DialogTitle>
          <DialogDescription>
            Enter one or several items for the same date. New rows keep the
            previous payment details so you can move quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-muted/35 p-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full space-y-1.5 sm:max-w-xs">
              <Label htmlFor="expenseDate">
                Transaction date <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expenseDate"
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-start bg-card text-left font-normal",
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
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-sm text-muted-foreground">
                {rows.length} {rows.length === 1 ? "entry" : "entries"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                className="bg-card"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add row
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => {
              const rowFilteredBillStatements = getFilteredBillStatements(
                row.paymentMethodId,
              );
              const isInstallment = row.scheduleType === "installment";

              return (
                <div
                  key={row.rowId}
                  className="space-y-4 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {entityLabel} details
                      </span>
                    </div>
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeRow(row.rowId)}
                        aria-label={`Remove ${entityLabel.toLowerCase()} ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="space-y-1.5 md:col-span-6">
                      <Label htmlFor={`title-${row.rowId}`}>
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`title-${row.rowId}`}
                        value={row.title}
                        onChange={(event) =>
                          updateRow(row.rowId, { title: event.target.value })
                        }
                        placeholder="What did you spend on?"
                        autoFocus={index === 0}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-3">
                      <Label htmlFor={`amount-${row.rowId}`}>
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          id={`amount-${row.rowId}`}
                          inputMode="numeric"
                          value={formatAmountInput(row.amount)}
                          onChange={(event) =>
                            updateRow(row.rowId, {
                              amount: parseAmountInput(event.target.value),
                            })
                          }
                          placeholder="0"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 md:col-span-3">
                      <Label>
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={row.categoryId}
                        onValueChange={(value) =>
                          updateRow(row.rowId, { categoryId: value })
                        }
                        disabled={isCategoriesLoading}
                      >
                        <SelectTrigger className="h-10 w-full">
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

                    <div className="space-y-1.5 md:col-span-4">
                      <Label>
                        Payment method <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={row.paymentMethodId}
                        onValueChange={(value) => {
                          const compatibleStatements =
                            getFilteredBillStatements(value);
                          updateRow(row.rowId, {
                            paymentMethodId: value,
                            billStatementId:
                              compatibleStatements.length === 1
                                ? compatibleStatements[0].id
                                : "",
                          });
                        }}
                        disabled={isPaymentMethodsLoading}
                      >
                        <SelectTrigger className="h-10 w-full">
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
                    <div className="space-y-1.5 md:col-span-5">
                      <Label>
                        Bill statement <span className="text-red-500">*</span>
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
                        triggerClassName="h-10 bg-card"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-3">
                      <Label>Paid by</Label>
                      <Select
                        value={row.paidBy || "__none__"}
                        onValueChange={(value) =>
                          updateRow(row.rowId, {
                            paidBy: value === "__none__" ? "" : value,
                          })
                        }
                        disabled={isPaidByLoading}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue
                            placeholder={
                              isPaidByLoading ? "Loading..." : "Select payer"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {paidByList.map((paidBy) => (
                            <SelectItem key={paidBy.id} value={paidBy.name}>
                              {paidBy.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t pt-4 md:grid-cols-12">
                    {!fixedScheduleType && (
                      <div className="space-y-1.5 md:col-span-3">
                        <Label>Schedule</Label>
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
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select schedule" />
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
                    )}

                    {isInstallment && (
                      <>
                        <div className="space-y-1.5 md:col-span-3">
                          <Label htmlFor={`recurrenceCurrent-${row.rowId}`}>
                            Current payment
                          </Label>
                          <Input
                            id={`recurrenceCurrent-${row.rowId}`}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={row.recurrenceCurrent}
                            onChange={(event) =>
                              updateRow(row.rowId, {
                                recurrenceCurrent: event.target.value.replace(
                                  /\D/g,
                                  "",
                                ),
                              })
                            }
                            placeholder="1"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-3">
                          <Label htmlFor={`recurrenceCount-${row.rowId}`}>
                            Total payments{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`recurrenceCount-${row.rowId}`}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={row.recurrenceCount}
                            onChange={(event) =>
                              updateRow(row.rowId, {
                                recurrenceCount: event.target.value.replace(
                                  /\D/g,
                                  "",
                                ),
                              })
                            }
                            placeholder="12"
                          />
                        </div>
                      </>
                    )}

                    <div
                      className={cn(
                        "space-y-1.5",
                        isInstallment
                          ? fixedScheduleType
                            ? "md:col-span-6"
                            : "md:col-span-3"
                          : fixedScheduleType
                            ? "md:col-span-12"
                            : "md:col-span-9",
                      )}
                    >
                      <Label htmlFor={`description-${row.rowId}`}>
                        Note{" "}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id={`description-${row.rowId}`}
                        value={row.description}
                        onChange={(event) =>
                          updateRow(row.rowId, {
                            description: event.target.value,
                          })
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key !== "Enter" ||
                            event.metaKey ||
                            event.ctrlKey
                          ) {
                            return;
                          }

                          event.preventDefault();
                          const nextRow = rows[index + 1];
                          if (nextRow) {
                            document
                              .getElementById(`title-${nextRow.rowId}`)
                              ?.focus();
                          } else {
                            addRow();
                          }
                        }}
                        placeholder="Optional · Enter adds a row"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t bg-background px-5 py-4 sm:px-6">
          <p className="hidden text-sm text-muted-foreground sm:block">
            {hasIncompleteRow
              ? "Complete the required fields to continue"
              : `${rows.length} ${rows.length === 1 ? "entry" : "entries"} ready`}
          </p>
          <div className="ml-auto flex gap-2">
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
              title="Create (Command/Ctrl + Enter)"
            >
              {isLoading
                ? "Creating..."
                : rows.length > 1
                  ? `Create ${rows.length} ${entityLabel}s`
                  : `Create ${entityLabel}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
