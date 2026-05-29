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

// Payment method display name from the payment_methods table.
export type PaymentMethod = string;

// Schedule type
export type ScheduleType = "none" | "installment";

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
  payment_method_id?: string;
  expense_date: string;
  description?: string;
  paid_by?: string;
  recurrence_type?: Exclude<ScheduleType, "none">;
  recurrence_type_id?: string;
  recurrence_count?: number;
  recurrence_current?: number;
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

export type BulkExpenseAction = "move_bill_statement" | "set_status" | "delete";

export interface BulkExpenseActionPayload {
  expense_ids: string[];
  action: BulkExpenseAction;
  status?: ExpenseStatus;
  bill_statement_id?: string;
}

export interface BulkExpenseActionResponse {
  status: string;
  message: string;
  data: {
    updated: Expense[];
    deleted_count: number;
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
  payment_method_id?: string;
  paid_by?: string;
  notes?: string;
  // Schedule fields for installments
  recurrence_type?: Exclude<ScheduleType, "none"> | null;
  recurrence_type_id?: string | null;
  recurrence_count?: number | null; // For installments: number of payments
  recurrence_end_date?: string | null;
  clear_recurrence?: boolean; // Set to true when changing from scheduled to one-time
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
