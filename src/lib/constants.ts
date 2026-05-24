export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transportation" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills & Utilities" },
  { value: "health", label: "Health & Medical" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Debit Card", label: "Debit Card" },
  { value: "Transfer", label: "Bank Transfer" },
  { value: "E-Wallet", label: "E-Wallet" },
] as const;

export const RECURRENCE_TYPES = [
  { value: "none", label: "One-time" },
  { value: "installment", label: "Installment" },
  { value: "subscription", label: "Subscription" },
] as const;

export const EXPENSE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "title", label: "Title" },
  { value: "created_at", label: "Created At" },
] as const;
