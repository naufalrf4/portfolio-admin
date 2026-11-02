export { getErrorMessage } from '@naufalrf/http';

interface ApiClientOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export async function apiClient<T = unknown>(options: ApiClientOptions): Promise<ApiResponse<T>> {
  const { url, method = 'GET', body, headers = {}, signal } = options;

  const config: RequestInit = {
    method,
    signal,
    headers: {
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export function handleApiError(error: unknown): string {
   if (error instanceof Error) {
     if (error.name === 'AbortError') {
       return 'Request was cancelled';
     }
     return error.message;
   }
   return 'An unexpected error occurred';
 }
