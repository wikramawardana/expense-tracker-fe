"use client";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EXPENSE_STATUSES, SCHEDULE_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/services/expenses.service";
import { getPaymentMethods } from "@/services/payment-methods.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type { Expense, ExpenseStatus } from "@/types/expense.types";
import type { PaymentMethod as PaymentMethodRecord } from "@/types/payment-method.types";
import { StatusBadge } from "./status-badge";

interface ExpenseActionDialogProps {
  expense: Expense;
  categories?: Category[];
  onExpenseUpdated?: () => void;
  onExpenseDeleted?: () => void;
}

function findPaymentMethodId(
  paymentMethods: PaymentMethodRecord[],
  paymentMethodId?: string | null,
  paymentMethodName?: string | null,
) {
  if (
    paymentMethodId &&
    paymentMethods.some((method) => method.id === paymentMethodId)
  ) {
    return paymentMethodId;
  }

  const normalizedName = paymentMethodName?.trim().toLowerCase();
  if (!normalizedName) return "";

  return (
    paymentMethods.find(
      (method) => method.name.trim().toLowerCase() === normalizedName,
    )?.id ?? ""
  );
}

function getScheduleType(expense: Expense) {
  if (expense.recurrence_type?.trim().toLowerCase() === "installment") {
    return "installment";
  }

  return "none";
}

export function ExpenseActionDialog({
  expense,
  categories: propCategories,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpenseActionDialogProps) {
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Current expense data (fetched from API)
  const [currentExpense, setCurrentExpense] = React.useState<Expense>(expense);
  const [isExpenseLoading, setIsExpenseLoading] = React.useState(false);

  // Categories and bill statements for edit form
  const [categories, setCategories] = React.useState<Category[]>(
    propCategories || [],
  );
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

  // Edit form state
  const [title, setTitle] = React.useState(expense.title);
  const [description, setDescription] = React.useState(
    expense.description || "",
  );
  const [amount, setAmount] = React.useState(String(expense.amount));
  const [categoryId, setCategoryId] = React.useState(expense.category_id || "");
  const [billStatementId, setBillStatementId] = React.useState(
    expense.bill_statement_id || "",
  );
  const [expenseDate, setExpenseDate] = React.useState(
    expense.expense_date?.split("T")[0] || "",
  );
  const [status, setStatus] = React.useState<ExpenseStatus>(expense.status);
  const [paymentMethodId, setPaymentMethodId] = React.useState(
    expense.payment_method_id || "",
  );
  const [paidBy, setPaidBy] = React.useState(expense.paid_by || "");

  // Schedule state
  const [scheduleType, setScheduleType] = React.useState(
    getScheduleType(expense),
  );
  const [recurrenceCount, setRecurrenceCount] = React.useState(
    expense.recurrence_count?.toString() || "",
  );

  const selectedScheduleType = React.useMemo(
    () => SCHEDULE_TYPES.find((type) => type.value === scheduleType),
    [scheduleType],
  );

  // Get category info for display
  const categoryInfo = React.useMemo(() => {
    if (!currentExpense.category_id || categories.length === 0) return null;
    return categories.find((c) => c.id === currentExpense.category_id);
  }, [currentExpense.category_id, categories]);

  const selectedPaymentMethod = React.useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethodId),
    [paymentMethods, paymentMethodId],
  );

  const filteredBillStatements = React.useMemo(() => {
    if (!selectedPaymentMethod) return [];
    return billStatements.filter(
      (billStatement) =>
        !billStatement.payment_method_id ||
        billStatement.payment_method_id === selectedPaymentMethod.id,
    );
  }, [billStatements, selectedPaymentMethod]);

  // Fetch expense by ID when view or edit dialog opens
  React.useEffect(() => {
    if ((isViewOpen || isEditOpen) && expense.id) {
      setIsExpenseLoading(true);
      getExpenseById(expense.id)
        .then((response) => {
          setCurrentExpense(response.data);
        })
        .catch((error) => {
          toast.error("Failed to load expense details");
          console.error(error);
        })
        .finally(() => {
          setIsExpenseLoading(false);
        });
    }
  }, [isViewOpen, isEditOpen, expense.id]);

  // Fetch categories when edit dialog opens
  React.useEffect(() => {
    if (isEditOpen && categories.length === 0) {
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
  }, [isEditOpen, categories.length]);

  // Fetch bill statements when edit dialog opens
  React.useEffect(() => {
    if (isEditOpen && billStatements.length === 0) {
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
  }, [isEditOpen, billStatements.length]);

  // Fetch payment methods when edit dialog opens
  React.useEffect(() => {
    if (isEditOpen && paymentMethods.length === 0) {
      setIsPaymentMethodsLoading(true);
      getPaymentMethods()
        .then((response) => {
          const activePaymentMethods = response.data.filter(
            (method) => method.is_active,
          );
          setPaymentMethods(activePaymentMethods);
          setPaymentMethodId(
            (current) =>
              current ||
              findPaymentMethodId(
                activePaymentMethods,
                currentExpense.payment_method_id,
                currentExpense.payment_method,
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
  }, [isEditOpen, paymentMethods.length, currentExpense]);

  // Fetch categories for view dialog if not provided
  React.useEffect(() => {
    if (isViewOpen && categories.length === 0 && !propCategories) {
      getCategories()
        .then((response) => {
          setCategories(response.data);
        })
        .catch((error) => {
          console.error("Failed to load categories for view:", error);
        });
    }
  }, [isViewOpen, categories.length, propCategories]);

  // Reset form when edit dialog opens or currentExpense changes
  React.useEffect(() => {
    if (isEditOpen && !isExpenseLoading) {
      setTitle(currentExpense.title);
      setDescription(currentExpense.description || "");
      setAmount(String(currentExpense.amount));
      setCategoryId(currentExpense.category_id || "");
      setBillStatementId(currentExpense.bill_statement_id || "");
      setExpenseDate(currentExpense.expense_date?.split("T")[0] || "");
      setStatus(currentExpense.status);
      setPaymentMethodId(currentExpense.payment_method_id || "");
      setPaidBy(currentExpense.paid_by || "");
      // Reset schedule fields
      setScheduleType(getScheduleType(currentExpense));
      setRecurrenceCount(currentExpense.recurrence_count?.toString() || "");
    }
  }, [isEditOpen, currentExpense, isExpenseLoading]);

  React.useEffect(() => {
    if (
      isEditOpen &&
      !paymentMethodId &&
      currentExpense.payment_method &&
      paymentMethods.length > 0
    ) {
      const matchedPaymentMethodId = findPaymentMethodId(
        paymentMethods,
        currentExpense.payment_method_id,
        currentExpense.payment_method,
      );
      if (matchedPaymentMethodId) {
        setPaymentMethodId(matchedPaymentMethodId);
      }
    }
  }, [isEditOpen, paymentMethodId, currentExpense, paymentMethods]);

  React.useEffect(() => {
    if (
      isEditOpen &&
      billStatementId &&
      selectedPaymentMethod &&
      !filteredBillStatements.some(
        (billStatement) => billStatement.id === billStatementId,
      )
    ) {
      setBillStatementId("");
    }
  }, [
    isEditOpen,
    billStatementId,
    selectedPaymentMethod,
    filteredBillStatements,
  ]);

  const handleEdit = async () => {
    if (
      !title ||
      !amount ||
      !categoryId ||
      !billStatementId ||
      !paymentMethodId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("Please select an active payment method");
      return;
    }

    // Validate schedule fields based on schedule type name
    if (
      scheduleType === "installment" &&
      (!recurrenceCount || Number(recurrenceCount) < 1)
    ) {
      toast.error("Number of payments must be at least 1");
      return;
    }

    setIsLoading(true);
    try {
      const formattedDate = new Date(expenseDate).toISOString();

      // Build update payload
      const updatePayload: Parameters<typeof updateExpense>[1] = {
        title,
        description: description || undefined,
        amount: Number(amount),
        category_id: categoryId,
        bill_statement_id: billStatementId,
        expense_date: formattedDate,
        status,
        payment_method: selectedPaymentMethod.name,
        payment_method_id: selectedPaymentMethod.id,
        paid_by: paidBy || undefined,
      };

      // Add schedule fields based on type
      if (scheduleType === "none") {
        // Clear schedule if set to "none" - use clear_recurrence flag for PATCH semantics
        updatePayload.clear_recurrence = true;
      } else if (scheduleType === "installment") {
        updatePayload.recurrence_type = "installment";
        updatePayload.recurrence_count = Number(recurrenceCount);
        updatePayload.recurrence_end_date = null;
      }

      await updateExpense(expense.id, updatePayload);
      toast.success("Expense updated successfully");
      setIsEditOpen(false);
      onExpenseUpdated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update expense",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted successfully");
      setIsDeleteOpen(false);
      onExpenseDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete expense",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsViewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Expense Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this expense
            </DialogDescription>
          </DialogHeader>

          {isExpenseLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Loading expense details...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Basic Info
                  </h3>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Title
                    </Label>
                    <p className="font-semibold text-lg">
                      {currentExpense.title}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Category
                    </Label>
                    <div className="flex items-center gap-2">
                      {categoryInfo ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-border"
                          style={{
                            backgroundColor: categoryInfo.color
                              ? `${categoryInfo.color}20`
                              : undefined,
                            color: categoryInfo.color ?? undefined,
                          }}
                        >
                          <span>{categoryInfo.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Amount & Date */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Amount & Date
                  </h3>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Amount
                    </Label>
                    <p className="font-bold text-xl text-green-600 dark:text-green-400">
                      {formatCurrency(currentExpense.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Date
                    </Label>
                    <p className="font-semibold">
                      {formatDate(currentExpense.expense_date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Bill Statement
                    </Label>
                    <p className="font-semibold">
                      {currentExpense.bill_statement || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Payment Details
                  </h3>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Payment Method
                    </Label>
                    <p className="font-semibold flex items-center gap-2">
                      {currentExpense.payment_method || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Paid By
                    </Label>
                    <p className="font-semibold">
                      {currentExpense.paid_by || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Status
                    </Label>
                    <div className="mt-1">
                      <StatusBadge status={currentExpense.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Schedule Info (if applicable) */}
              {currentExpense.recurrence_type && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Schedule Details
                    </h3>
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 p-4 bg-muted rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase">
                        Type
                      </Label>
                      <p className="font-semibold capitalize">
                        {currentExpense.recurrence_type}
                      </p>
                    </div>
                    {currentExpense.recurrence_type === "installment" && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs uppercase">
                          Progress
                        </Label>
                        <p className="font-semibold">
                          {currentExpense.recurrence_current || 1} of{" "}
                          {currentExpense.recurrence_count || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 5: Additional Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Additional Info
                  </h3>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Description
                    </Label>
                    <p className="text-sm">
                      {currentExpense.description || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Notes
                    </Label>
                    <p className="text-sm">{currentExpense.notes || "-"}</p>
                  </div>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Created At
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(currentExpense.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Last Updated
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(currentExpense.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewOpen(false);
                setIsEditOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">
              Edit Expense
            </DialogTitle>
            <DialogDescription>
              Make changes to the expense details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Basic Info
                </h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Lunch at restaurant"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isCategoriesLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          isCategoriesLoading ? "Loading..." : "Select category"
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
            </div>

            {/* Section 2: Amount & Date */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Amount & Date
                </h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-date"
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
                    disabled={
                      isBillStatementsLoading ||
                      !paymentMethodId ||
                      filteredBillStatements.length === 0
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          isBillStatementsLoading
                            ? "Loading..."
                            : !paymentMethodId
                              ? "Select payment method first"
                              : filteredBillStatements.length === 0
                                ? "No matching bill statements"
                                : "Select bill statement"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBillStatements.map((billStatement) => (
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
            </div>

            {/* Section 3: Payment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Payment Details
                </h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={paymentMethodId}
                    onValueChange={setPaymentMethodId}
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
                <div className="space-y-2">
                  <Label htmlFor="edit-paidBy">Paid By</Label>
                  <Input
                    id="edit-paidBy"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="e.g., Wikra"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as ExpenseStatus)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Schedule Type Row */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label>Schedule Type</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
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

              {/* Installment fields */}
              {selectedScheduleType?.value === "installment" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg border mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrenceCount">
                      Number of Payments <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-recurrenceCount"
                      type="number"
                      value={recurrenceCount}
                      onChange={(e) => setRecurrenceCount(e.target.value)}
                      placeholder="e.g., 12"
                      className="h-11"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Additional Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Additional Info (Optional)
                </h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any notes or details about this expense..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex flex-row gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                isLoading ||
                !title ||
                !amount ||
                !categoryId ||
                !billStatementId ||
                !paymentMethodId
              }
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="font-medium">{expense.title}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(expense.amount)} •{" "}
              {formatDate(expense.expense_date)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
