export const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Read the currently logged-in user from localStorage (set by Login.jsx).
 * Returns null if not logged in.
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  return getCurrentUser()?.id || null;
}

async function handleResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      body?.message ||
      (body?.errors ? Object.values(body.errors).flat().join(", ") : null) ||
      `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = body;
    throw error;
  }

  return body;
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  return handleResponse(res);
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiPut(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiPatch(path, data) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return handleResponse(res);
}

/**
 * POST with multipart/form-data (for file uploads).
 * data: object with primitives and/or File values.
 */
export async function apiPostForm(path, data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, value);
    }
  });

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });
  return handleResponse(res);
}
