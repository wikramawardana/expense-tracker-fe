import { apiFetch } from "@/lib/api.config";
import type {
  BillStatementsResponse,
  CreateBillStatementPayload,
  SingleBillStatementResponse,
  UpdateBillStatementPayload,
} from "@/types/bill-statement.types";

/**
 * Fetch all bill statements
 */
export async function getBillStatements(): Promise<BillStatementsResponse> {
  return apiFetch<BillStatementsResponse>("/bill-statements");
}

/**
 * Fetch a single bill statement by ID
 */
export async function getBillStatementById(
  id: string,
): Promise<SingleBillStatementResponse> {
  return apiFetch<SingleBillStatementResponse>(`/bill-statements/${id}`);
}

/**
 * Create a new bill statement
 */
export async function createBillStatement(
  payload: CreateBillStatementPayload,
): Promise<SingleBillStatementResponse> {
  return apiFetch<SingleBillStatementResponse>("/bill-statements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a bill statement
 */
export async function updateBillStatement(
  id: string,
  payload: UpdateBillStatementPayload,
): Promise<SingleBillStatementResponse> {
  return apiFetch<SingleBillStatementResponse>(`/bill-statements/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a bill statement
 */
export async function deleteBillStatement(id: string): Promise<void> {
  return apiFetch<void>(`/bill-statements/${id}`, {
    method: "DELETE",
  });
}
