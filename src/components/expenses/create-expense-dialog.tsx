"use client";

import { Plus } from "lucide-react";
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
import { createExpense } from "@/services/expenses.service";
import { getRecurrenceTypes } from "@/services/recurrence-types.service";
import type { BillStatement } from "@/types/bill-statement.types";
import type { Category } from "@/types/category.types";
import type { PaymentMethod } from "@/types/expense.types";
import type { RecurrenceType as RecurrenceTypeModel } from "@/types/recurrence-type.types";

interface CreateExpenseDialogProps {
  onExpenseCreated?: () => void;
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

  // Form state
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [billStatementId, setBillStatementId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("Cash");
  const [expenseDate, setExpenseDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [paidBy, setPaidBy] = React.useState("");

  // Recurrence state - now stores the recurrence_type_id or "none"
  const [recurrenceTypeId, setRecurrenceTypeId] =
    React.useState<string>("none");
  const [recurrenceCount, setRecurrenceCount] = React.useState(""); // For installments: total payments
  const [recurrenceCurrent, setRecurrenceCurrent] = React.useState(""); // For installments: current payment number (e.g. 3 of 12)
  const [recurrenceTotalAmount, setRecurrenceTotalAmount] = React.useState(""); // For installments
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState(""); // For subscriptions

  // Get the selected recurrence type details
  const selectedRecurrenceType = React.useMemo(() => {
    if (recurrenceTypeId === "none") return null;
    return recurrenceTypes.find((rt) => rt.id === recurrenceTypeId);
  }, [recurrenceTypeId, recurrenceTypes]);

  // Fetch categories when dialog opens
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

  // Fetch bill statements when dialog opens
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

  // Fetch recurrence types when dialog opens
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

  const resetForm = () => {
    setTitle("");
    setCategoryId("");
    setBillStatementId("");
    setDescription("");
    setAmount("");
    setPaymentMethod("Cash");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setPaidBy("");
    setRecurrenceTypeId("none");
    setRecurrenceCount("");
    setRecurrenceCurrent("");
    setRecurrenceTotalAmount("");
    setRecurrenceEndDate("");
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !amount ||
      !categoryId ||
      !billStatementId ||
      !paymentMethod ||
      !expenseDate
    ) {
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

    // Recurring end date is optional - no validation needed

    setIsLoading(true);
    try {
      // Format expense_date to ISO string with time
      const formattedDate = new Date(expenseDate).toISOString();

      // Build payload based on recurrence type
      const payload: Parameters<typeof createExpense>[0] = {
        title,
        amount: Number(amount),
        category_id: categoryId,
        bill_statement_id: billStatementId,
        payment_method: paymentMethod,
        expense_date: formattedDate,
        description: description || undefined,
        paid_by: paidBy || undefined,
      };

      // Add recurrence fields if a recurrence type is selected
      if (recurrenceTypeId !== "none" && selectedRecurrenceType) {
        payload.recurrence_type_id = recurrenceTypeId;

        // Add type-specific fields based on recurrence type name
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
          // Both subscription and recurring can have an end date
          if (recurrenceEndDate) {
            payload.recurrence_end_date = new Date(
              recurrenceEndDate,
            ).toISOString();
          }
        }
      }

      await createExpense(payload);
      toast.success("Expense created successfully");
      setIsOpen(false);
      resetForm();
      onExpenseCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create expense",
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
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            Add New Expense
          </DialogTitle>
          <DialogDescription>
            Create a new expense entry. Fill in the details below.
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
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
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
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="h-11"
                />
              </div>
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
                <Label htmlFor="paidBy">Paid By</Label>
                <Input
                  id="paidBy"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="e.g., Wikra"
                  className="h-11"
                />
              </div>
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
            {selectedRecurrenceType?.name?.toLowerCase() === "installment" && (
              <div className="space-y-4 p-4 bg-muted rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceCurrent">Current Payment #</Label>
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
                      Number of Payments <span className="text-red-500">*</span>
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
                      onChange={(e) => setRecurrenceTotalAmount(e.target.value)}
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

            {/* Subscription fields */}
            {selectedRecurrenceType?.name?.toLowerCase() === "subscription" && (
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

            {/* Recurring fields */}
            {selectedRecurrenceType?.name?.toLowerCase() === "recurring" && (
              <div className="p-4 bg-muted rounded-lg border">
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="recurrenceEndDate">End Date (Optional)</Label>
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

          {/* Section 4: Additional Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Additional Info (Optional)
              </h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
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
            disabled={
              isLoading || !title || !amount || !categoryId || !billStatementId
            }
          >
            {isLoading ? "Creating..." : "Create Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
