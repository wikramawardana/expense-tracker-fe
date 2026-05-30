import { apiFetch } from "@/lib/api.config";
import type {
  CreatePaidByPayload,
  PaidByResponse,
  SinglePaidByResponse,
  UpdatePaidByPayload,
} from "@/types/paid-by.types";

/**
 * Fetch all paid-by entries
 */
export async function getPaidByList(): Promise<PaidByResponse> {
  return apiFetch<PaidByResponse>("/paid-by");
}

/**
 * Fetch a single paid-by entry by ID
 */
export async function getPaidByById(id: string): Promise<SinglePaidByResponse> {
  return apiFetch<SinglePaidByResponse>(`/paid-by/${id}`);
}

/**
 * Create a new paid-by entry
 */
export async function createPaidBy(
  payload: CreatePaidByPayload,
): Promise<SinglePaidByResponse> {
  return apiFetch<SinglePaidByResponse>("/paid-by", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a paid-by entry
 */
export async function updatePaidBy(
  id: string,
  payload: UpdatePaidByPayload,
): Promise<SinglePaidByResponse> {
  return apiFetch<SinglePaidByResponse>(`/paid-by/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a paid-by entry
 */
export async function deletePaidBy(id: string): Promise<void> {
  return apiFetch<void>(`/paid-by/${id}`, {
    method: "DELETE",
  });
}
