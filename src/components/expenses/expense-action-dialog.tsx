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
import { EXPENSE_STATUSES, PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { getBillStatements } from "@/services/bill-statements.service";
import { getCategories } from "@/services/categories.service";
import {
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/services/expenses.service";
import { getRecurrenceTypes } from "@/services/recurrence-types.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type {
  Expense,
  ExpenseStatus,
  PaymentMethod,
} from "@/types/expense.types";
import type { RecurrenceType as RecurrenceTypeModel } from "@/types/recurrence-type.types";
import { StatusBadge } from "./status-badge";

interface ExpenseActionDialogProps {
  expense: Expense;
  categories?: Category[];
  onExpenseUpdated?: () => void;
  onExpenseDeleted?: () => void;
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

  // Categories, bill statements and recurrence types for edit form
  const [categories, setCategories] = React.useState<Category[]>(
    propCategories || [],
  );
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
  const [paymentMethod, setPaymentMethod] = React.useState<
    PaymentMethod | string
  >(expense.payment_method || "Cash");
  const [paidBy, setPaidBy] = React.useState(expense.paid_by || "");

  // Recurrence state
  const [recurrenceTypeId, setRecurrenceTypeId] = React.useState<string>(
    expense.recurrence_type_id || "none",
  );
  const [recurrenceCount, setRecurrenceCount] = React.useState(
    expense.recurrence_count?.toString() || "",
  );
  const [recurrenceTotalAmount, setRecurrenceTotalAmount] = React.useState(
    expense.recurrence_total_amount || "",
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState(
    expense.recurrence_end_date?.split("T")[0] || "",
  );

  // Get the selected recurrence type details
  const selectedRecurrenceType = React.useMemo(() => {
    if (recurrenceTypeId === "none") return null;
    return recurrenceTypes.find((rt) => rt.id === recurrenceTypeId);
  }, [recurrenceTypeId, recurrenceTypes]);

  // Get category info for display
  const categoryInfo = React.useMemo(() => {
    if (!currentExpense.category_id || categories.length === 0) return null;
    return categories.find((c) => c.id === currentExpense.category_id);
  }, [currentExpense.category_id, categories]);

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

  // Fetch recurrence types when edit dialog opens
  React.useEffect(() => {
    if (isEditOpen && recurrenceTypes.length === 0) {
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
  }, [isEditOpen, recurrenceTypes.length]);

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
      setPaymentMethod(currentExpense.payment_method || "Cash");
      setPaidBy(currentExpense.paid_by || "");
      // Reset recurrence fields
      setRecurrenceTypeId(currentExpense.recurrence_type_id || "none");
      setRecurrenceCount(currentExpense.recurrence_count?.toString() || "");
      setRecurrenceTotalAmount(currentExpense.recurrence_total_amount || "");
      setRecurrenceEndDate(
        currentExpense.recurrence_end_date?.split("T")[0] || "",
      );
    }
  }, [isEditOpen, currentExpense, isExpenseLoading]);

  const handleEdit = async () => {
    if (!title || !amount || !categoryId || !billStatementId) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Get selected recurrence type name (lowercase) for validation
    const recurrenceTypeName = selectedRecurrenceType?.name?.toLowerCase();

    // Validate recurrence fields based on recurrence type name
    if (
      recurrenceTypeName === "installment" &&
      (!recurrenceCount || !recurrenceTotalAmount)
    ) {
      toast.error("Please fill in installment count and total amount");
      return;
    }

    if (recurrenceTypeName === "subscription" && !recurrenceEndDate) {
      toast.error("Please fill in subscription end date");
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
        payment_method: paymentMethod as PaymentMethod,
        paid_by: paidBy || undefined,
      };

      // Add recurrence fields based on type
      if (recurrenceTypeId === "none") {
        // Clear recurrence if set to "none" - use clear_recurrence flag for PATCH semantics
        updatePayload.clear_recurrence = true;
      } else {
        updatePayload.recurrence_type_id = recurrenceTypeId;

        if (recurrenceTypeName === "installment") {
          updatePayload.recurrence_count = Number(recurrenceCount);
          updatePayload.recurrence_total_amount = recurrenceTotalAmount;
          updatePayload.recurrence_end_date = null;
        } else if (
          recurrenceTypeName === "subscription" ||
          recurrenceTypeName === "recurring"
        ) {
          updatePayload.recurrence_count = null;
          updatePayload.recurrence_total_amount = null;
          if (recurrenceEndDate) {
            updatePayload.recurrence_end_date = new Date(
              recurrenceEndDate,
            ).toISOString();
          } else {
            updatePayload.recurrence_end_date = null;
          }
        }
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
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black uppercase tracking-wide border-3 border-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                          style={{
                            backgroundColor: categoryInfo.color || "#88AAEE",
                          }}
                        >
                          {categoryInfo.icon && (
                            <span>{categoryInfo.icon}</span>
                          )}
                          <span>{categoryInfo.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Amount & Date */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment Details
                  </h3>
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Payment Method
                    </Label>
                    <p className="font-semibold flex items-center gap-2">
                      {(() => {
                        const method = PAYMENT_METHODS.find(
                          (m) => m.value === currentExpense.payment_method,
                        );
                        return method ? (
                          <>
                            <span>{method.emoji}</span>
                            <span>{method.label}</span>
                          </>
                        ) : (
                          currentExpense.payment_method || "-"
                        );
                      })()}
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

              {/* Section 4: Recurrence Info (if applicable) */}
              {currentExpense.recurrence_type && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Recurrence Details
                    </h3>
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3 p-4 bg-muted rounded-lg border">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase">
                        Type
                      </Label>
                      <p className="font-semibold capitalize">
                        {currentExpense.recurrence_type}
                      </p>
                    </div>
                    {currentExpense.recurrence_type === "installment" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase">
                            Progress
                          </Label>
                          <p className="font-semibold">
                            {currentExpense.recurrence_current || 1} of{" "}
                            {currentExpense.recurrence_count || "-"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase">
                            Total Amount
                          </Label>
                          <p className="font-semibold">
                            {currentExpense.recurrence_total_amount
                              ? formatCurrency(
                                  currentExpense.recurrence_total_amount,
                                )
                              : "-"}
                          </p>
                        </div>
                      </>
                    )}
                    {currentExpense.recurrence_type === "subscription" &&
                      currentExpense.recurrence_end_date && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase">
                            End Date
                          </Label>
                          <p className="font-semibold">
                            {formatDate(currentExpense.recurrence_end_date)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Section 5: Additional Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                          {category.icon && `${category.icon} `}
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
            </div>

            {/* Section 3: Payment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment Details
                </h3>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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

              {/* Expense Type Row */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-4">
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

              {/* Installment fields */}
              {selectedRecurrenceType?.name?.toLowerCase() ===
                "installment" && (
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrenceTotalAmount">
                      Total Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-recurrenceTotalAmount"
                      type="number"
                      value={recurrenceTotalAmount}
                      onChange={(e) => setRecurrenceTotalAmount(e.target.value)}
                      placeholder="e.g., 18000000"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Subscription fields */}
              {selectedRecurrenceType?.name?.toLowerCase() ===
                "subscription" && (
                <div className="p-4 bg-muted rounded-lg border mt-4">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="edit-recurrenceEndDate">
                      Subscription End Date{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-recurrenceEndDate"
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Recurring fields */}
              {selectedRecurrenceType?.name?.toLowerCase() === "recurring" && (
                <div className="p-4 bg-muted rounded-lg border mt-4">
                  <div className="space-y-2 max-w-sm">
                    <Label htmlFor="edit-recurrenceEndDate">
                      End Date (Optional)
                    </Label>
                    <Input
                      id="edit-recurrenceEndDate"
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

            {/* Section 4: Additional Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
                !billStatementId
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
