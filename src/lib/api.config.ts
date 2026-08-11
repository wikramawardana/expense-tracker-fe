"use client";

import { getSession, signOut } from "@/lib/auth-client";

/**
 * API Configuration
 * Configure the base URL for the backend API
 */

// Use environment variable or fallback to localhost
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

// Backend base URL (without /api/v1) for static files like images
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

/**
 * Get full URL for uploaded files (images, etc.)
 */
export function getUploadUrl(path: string): string {
  if (!path) return "";
  // If already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Prepend backend URL
  return `${BACKEND_URL}${path}`;
}

// Cache for the session token promise to avoid multiple get-session calls
let tokenPromise: Promise<string | null> | null = null;
let tokenExpiry = 0;
const TOKEN_CACHE_DURATION = 5000; // Cache token for 5 seconds
let isSigningOut = false;

/**
 * Clear the token cache (call this on logout or auth errors)
 */
export function clearAuthTokenCache(): void {
  tokenPromise = null;
  tokenExpiry = 0;
}

/**
 * Get the session token for API authorization (with caching)
 */
export async function getAuthToken(): Promise<string | null> {
  const now = Date.now();

  // Return cached promise if still valid
  if (tokenPromise && now < tokenExpiry) {
    return tokenPromise;
  }

  // Create new token promise
  tokenPromise = (async () => {
    try {
      const session = await getSession();
      return session?.data?.session?.token ?? null;
    } catch {
      return null;
    }
  })();

  tokenExpiry = now + TOKEN_CACHE_DURATION;
  return tokenPromise;
}

async function forceSignOutAndRedirect(): Promise<void> {
  if (isSigningOut || typeof window === "undefined") return;
  isSigningOut = true;
  clearAuthTokenCache();

  const callbackUrl = encodeURIComponent(window.location.pathname);
  try {
    await signOut();
  } catch {
    document.cookie = "expense-tracker.session_token=; Max-Age=0; path=/";
    document.cookie = "expense-tracker.session_data=; Max-Age=0; path=/";
  }

  window.location.href = `/login?callbackUrl=${callbackUrl}`;
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let token = await getAuthToken();
  if (!token) {
    await forceSignOutAndRedirect();
    throw new ApiError("No authentication token available", 401);
  }

  const request = (authToken: string) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${authToken}`);
    return fetch(url, { ...options, headers });
  };

  let response = await request(token);
  if (response.status === 401) {
    clearAuthTokenCache();
    token = await getAuthToken();
    if (token) {
      response = await request(token);
    }
  }

  if (response.status === 401) {
    await forceSignOutAndRedirect();
  }

  return response;
}

/**
 * Build query string from object
 */
export function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Handle API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic fetch wrapper with error handling and authorization
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await authenticatedFetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      const errorMessage =
        (errorData as { message?: string })?.message ||
        `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error occurred",
    );
  }
}
