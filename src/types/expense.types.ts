// Expense category
export type ExpenseCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "bills"
  | "health"
  | "education"
  | "other";

// Expense status
export type ExpenseStatus = "pending" | "paid" | "unpaid";

// Payment method
export type PaymentMethod =
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "Transfer"
  | "E-Wallet";

// Recurrence type
export type RecurrenceType = "installment" | "subscription";

// Single expense item
export interface Expense {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  category?: string | null;
  category_id?: string | null;
  expense_date: string;
  status: ExpenseStatus;
  payment_method?: string | null;
  payment_method_id?: string | null;
  paid_by?: string | null;
  bill_statement?: string | null;
  bill_statement_id?: string | null;
  recurrence_type?: string | null;
  recurrence_type_id?: string | null;
  recurrence_count?: number | null;
  recurrence_current?: number | null;
  recurrence_total_amount?: number | null;
  recurrence_end_date?: string | null;
  recurrence_group_id?: string | null;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ExpensesResponse {
  status: string;
  message: string;
  data: {
    data: Expense[];
    pagination: PaginationInfo;
  };
}

export interface SingleExpenseResponse {
  status: string;
  message: string;
  data: Expense;
}

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category_id: string;
  bill_statement_id: string;
  payment_method: PaymentMethod;
  expense_date: string;
  description?: string;
  paid_by?: string;
  recurrence_type_id?: string;
  recurrence_count?: number;
  recurrence_current?: number;
  recurrence_total_amount?: number;
  recurrence_end_date?: string;
}

export interface CreateExpensesBulkPayload {
  expenses: CreateExpensePayload[];
}

export interface BulkCreateExpensesResponse {
  status: string;
  message: string;
  data: {
    created: Expense[];
    count: number;
  };
}

export interface UpdateExpensePayload {
  title?: string;
  description?: string;
  amount?: number;
  category_id?: string;
  bill_statement_id?: string;
  expense_date?: string;
  status?: ExpenseStatus;
  payment_method?: PaymentMethod;
  paid_by?: string;
  notes?: string;
  // Recurrence fields for installments and subscriptions
  recurrence_type_id?: string | null; // UUID of the recurrence type, null to remove
  recurrence_count?: number | null; // For installments: number of payments
  recurrence_total_amount?: number | null;
  recurrence_end_date?: string | null;
  clear_recurrence?: boolean; // Set to true when changing from recurring to one-time
}

export interface ExpenseFilters {
  search?: string;
  page?: number;
  page_size?: number;
  category?: ExpenseCategory | "";
  status?: ExpenseStatus | "";
  bill_statement_id?: string;
  expense_date_from?: string;
  expense_date_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ExpenseStats {
  total_count: number;
  total_amount: number;
  approved_amount: number;
  pending_amount: number;
  rejected_amount: number;
  category_breakdown: Record<ExpenseCategory, number>;
}

export interface ExpenseCountResponse {
  status: string;
  message: string;
  data: {
    total_count: number;
  };
}

export interface ExpenseSumResponse {
  status: string;
  message: string;
  data: {
    total_amount: number;
    approved_amount: number;
    pending_amount: number;
    rejected_amount: number;
  };
}

export interface ExpenseCategoryBreakdownResponse {
  status: string;
  message: string;
  data: Record<ExpenseCategory, number>;
}
