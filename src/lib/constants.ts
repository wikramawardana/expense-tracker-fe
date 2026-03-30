export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining", emoji: "🍔" },
  { value: "transport", label: "Transportation", emoji: "🚗" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "bills", label: "Bills & Utilities", emoji: "📄" },
  { value: "health", label: "Health & Medical", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "other", label: "Other", emoji: "📦" },
] as const;

export const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash", emoji: "💵" },
  { value: "Credit Card", label: "Credit Card", emoji: "💳" },
  { value: "Debit Card", label: "Debit Card", emoji: "💳" },
  { value: "Transfer", label: "Bank Transfer", emoji: "🏦" },
  { value: "E-Wallet", label: "E-Wallet", emoji: "📱" },
] as const;

export const RECURRENCE_TYPES = [
  { value: "none", label: "One-time", emoji: "1️⃣" },
  { value: "installment", label: "Installment", emoji: "📅" },
  { value: "subscription", label: "Subscription", emoji: "🔄" },
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
