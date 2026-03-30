import { apiFetch } from "@/lib/api.config";
import type {
    CategoriesResponse,
    CreateCategoryPayload,
    SingleCategoryResponse,
    UpdateCategoryPayload,
} from "@/types/category.types";

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
    return apiFetch<CategoriesResponse>("/categories");
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(
    id: string,
): Promise<SingleCategoryResponse> {
    return apiFetch<SingleCategoryResponse>(`/categories/${id}`);
}

/**
 * Create a new category
 */
export async function createCategory(
    payload: CreateCategoryPayload,
): Promise<SingleCategoryResponse> {
    return apiFetch<SingleCategoryResponse>("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Update a category
 */
export async function updateCategory(
    id: string,
    payload: UpdateCategoryPayload,
): Promise<SingleCategoryResponse> {
    return apiFetch<SingleCategoryResponse>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
    return apiFetch<void>(`/categories/${id}`, {
        method: "DELETE",
    });
}
