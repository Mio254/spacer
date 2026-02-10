const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

export async function apiFetch(path, { method = "GET", body, token, headers: extraHeaders } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
