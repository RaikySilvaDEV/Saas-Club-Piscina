const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function getToken() {
  return localStorage.getItem("clubpiscina_token");
}

export function setToken(token) {
  localStorage.setItem("clubpiscina_token", token);
}

export function setUser(user) {
  localStorage.setItem("clubpiscina_user", JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem("clubpiscina_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearToken() {
  localStorage.removeItem("clubpiscina_token");
  localStorage.removeItem("clubpiscina_user");
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || "request_failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
}
