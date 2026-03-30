import { apiFetch } from "@/lib/api.config";
import type {
  CreatePaymentMethodPayload,
  PaymentMethodsResponse,
  SinglePaymentMethodResponse,
  UpdatePaymentMethodPayload,
} from "@/types/payment-method.types";

/**
 * Fetch all payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethodsResponse> {
  return apiFetch<PaymentMethodsResponse>("/payment-methods");
}

/**
 * Fetch a single payment method by ID
 */
export async function getPaymentMethodById(
  id: string,
): Promise<SinglePaymentMethodResponse> {
  return apiFetch<SinglePaymentMethodResponse>(`/payment-methods/${id}`);
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(
  payload: CreatePaymentMethodPayload,
): Promise<SinglePaymentMethodResponse> {
  return apiFetch<SinglePaymentMethodResponse>("/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a payment method
 */
export async function updatePaymentMethod(
  id: string,
  payload: UpdatePaymentMethodPayload,
): Promise<SinglePaymentMethodResponse> {
  return apiFetch<SinglePaymentMethodResponse>(`/payment-methods/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  return apiFetch<void>(`/payment-methods/${id}`, {
    method: "DELETE",
  });
}
