import { authService } from "./auth-service";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authService.getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add token if it exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Merge with any headers passed in options
  if (options.headers) {
    const optionsHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optionsHeaders);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized (token expired/invalid)
  if (response.status === 401) {
    authService.logout();
    window.location.reload();
  }

  return response;
}
