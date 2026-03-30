// Single category item
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API response for categories list
export interface CategoriesResponse {
  status: string;
  message: string;
  data: Category[];
}

// API response for single category
export interface SingleCategoryResponse {
  status: string;
  message: string;
  data: Category;
}

// Payload for creating a category
export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

// Payload for updating a category
export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
  is_active?: boolean;
}
