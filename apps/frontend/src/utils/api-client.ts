const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Shared fetch client wrapper.
 * Resolves standard responses and serializes JSON error models.
 */
export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error?.message) {
        message = errorData.error.message;
      }
    } catch {
      // Fall back to default message if JSON parsing fails
    }
    throw new Error(message);
  }

  // HTTP 202 handles parsing gracefully in case of empty responses
  if (response.status === 202) {
    try {
      const clone = response.clone();
      return await clone.json();
    } catch {
      return {} as T;
    }
  }

  const result = await response.json();
  // Unwrap standard envelope { success: true, data: T }
  return result.data as T;
}
