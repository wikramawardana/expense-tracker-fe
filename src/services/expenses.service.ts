import {
  API_BASE_URL,
  ApiError,
  apiFetch,
  buildQueryString,
  clearAuthTokenCache,
  getAuthToken,
} from "@/lib/api.config";
import type {
  BulkCreateExpensesResponse,
  BulkExpenseActionPayload,
  BulkExpenseActionResponse,
  CreateExpensePayload,
  CreateExpensesBulkPayload,
  ExpenseCategoryBreakdownResponse,
  ExpenseCountResponse,
  ExpenseFilters,
  ExpenseSumResponse,
  ExpensesResponse,
  ImportExpensesCsvResponse,
  SingleExpenseResponse,
  UpdateExpensePayload,
} from "@/types/expense.types";

/**
 * Fetch expenses with filters and pagination
 */
export async function getExpenses(
  filters: ExpenseFilters = {},
): Promise<ExpensesResponse> {
  const queryString = buildQueryString(filters);
  return apiFetch<ExpensesResponse>(`/expenses${queryString}`);
}

/**
 * Fetch a single expense by ID
 */
export async function getExpenseById(
  id: string,
): Promise<SingleExpenseResponse> {
  return apiFetch<SingleExpenseResponse>(`/expenses/${id}`);
}

/**
 * Create a new expense
 */
export async function createExpense(
  payload: CreateExpensePayload,
): Promise<SingleExpenseResponse> {
  return apiFetch<SingleExpenseResponse>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Create multiple expenses in a single request
 */
export async function createExpensesBulk(
  payload: CreateExpensesBulkPayload,
): Promise<BulkCreateExpensesResponse> {
  return apiFetch<BulkCreateExpensesResponse>("/expenses/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Import expenses from a CSV file
 */
export async function importExpensesCsv(
  file: File,
): Promise<ImportExpensesCsvResponse> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/expenses/import-csv`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    if (response.status === 401) {
      clearAuthTokenCache();
    }

    const errorMessage =
      (errorData as { message?: string })?.message ||
      `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

/**
 * Download the CSV import template
 */
export async function downloadExpenseImportTemplate(): Promise<void> {
  const token = await getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/expenses/import-template.csv`, {
    headers,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    if (response.status === 401) {
      clearAuthTokenCache();
    }

    const errorMessage =
      (errorData as { message?: string })?.message ||
      `HTTP error! status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, errorData);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "expense-import-template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Apply one action to multiple expenses
 */
export async function applyBulkExpenseAction(
  payload: BulkExpenseActionPayload,
): Promise<BulkExpenseActionResponse> {
  return apiFetch<BulkExpenseActionResponse>("/expenses/bulk", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an expense
 */
export async function updateExpense(
  id: string,
  payload: UpdateExpensePayload,
): Promise<SingleExpenseResponse> {
  return apiFetch<SingleExpenseResponse>(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  return apiFetch<void>(`/expenses/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get total expenses count
 */
export async function getExpensesCount(
  filters: ExpenseFilters = {},
): Promise<ExpenseCountResponse> {
  const queryString = buildQueryString(filters);
  return apiFetch<ExpenseCountResponse>(`/expenses/count${queryString}`);
}

/**
 * Get total expenses sum
 */
export async function getExpensesSum(
  filters: ExpenseFilters = {},
): Promise<ExpenseSumResponse> {
  const queryString = buildQueryString(filters);
  return apiFetch<ExpenseSumResponse>(`/expenses/sum${queryString}`);
}

/**
 * Get expenses breakdown by category
 */
export async function getExpensesCategoryBreakdown(
  filters: ExpenseFilters = {},
): Promise<ExpenseCategoryBreakdownResponse> {
  const queryString = buildQueryString(filters);
  return apiFetch<ExpenseCategoryBreakdownResponse>(
    `/expenses/category-breakdown${queryString}`,
  );
}

/**
 * Approve a pending expense (Admin only)
 */
export async function approveExpense(
  id: string,
  notes?: string,
): Promise<SingleExpenseResponse> {
  return apiFetch<SingleExpenseResponse>(`/expenses/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}

/**
 * Reject a pending expense (Admin only)
 */
export async function rejectExpense(
  id: string,
  reason: string,
): Promise<SingleExpenseResponse> {
  return apiFetch<SingleExpenseResponse>(`/expenses/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
