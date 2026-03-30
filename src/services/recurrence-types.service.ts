import { apiFetch } from "@/lib/api.config";
import type {
    RecurrenceTypesResponse,
    CreateRecurrenceTypePayload,
    SingleRecurrenceTypeResponse,
    UpdateRecurrenceTypePayload,
} from "@/types/recurrence-type.types";

/**
 * Fetch all recurrence types
 */
export async function getRecurrenceTypes(): Promise<RecurrenceTypesResponse> {
    return apiFetch<RecurrenceTypesResponse>("/recurrence-types");
}

/**
 * Fetch a single recurrence type by ID
 */
export async function getRecurrenceTypeById(
    id: string,
): Promise<SingleRecurrenceTypeResponse> {
    return apiFetch<SingleRecurrenceTypeResponse>(`/recurrence-types/${id}`);
}

/**
 * Create a new recurrence type
 */
export async function createRecurrenceType(
    payload: CreateRecurrenceTypePayload,
): Promise<SingleRecurrenceTypeResponse> {
    return apiFetch<SingleRecurrenceTypeResponse>("/recurrence-types", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Update a recurrence type
 */
export async function updateRecurrenceType(
    id: string,
    payload: UpdateRecurrenceTypePayload,
): Promise<SingleRecurrenceTypeResponse> {
    return apiFetch<SingleRecurrenceTypeResponse>(`/recurrence-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * Delete a recurrence type
 */
export async function deleteRecurrenceType(id: string): Promise<void> {
    return apiFetch<void>(`/recurrence-types/${id}`, {
        method: "DELETE",
    });
}
