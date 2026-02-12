import { apiFetch } from "./client";

export const adminApi = {
  users: (token) => apiFetch("/api/admin/users", { token }),
  createUser: (token, body) =>
    apiFetch("/api/admin/users", { method: "POST", token, body: JSON.stringify(body) }),
  patchUser: (token, id, body) =>
    apiFetch(`/api/admin/users/${id}`, { method: "PATCH", token, body: JSON.stringify(body) }),

  spaces: (token) => apiFetch("/api/admin/spaces", { token }),
  patchSpace: (token, id, body) =>
    apiFetch(`/api/admin/spaces/${id}`, { method: "PATCH", token, body: JSON.stringify(body) }),

  bookings: (token) => apiFetch("/api/admin/bookings", { token }),
  patchBooking: (token, id, body) =>
    apiFetch(`/api/admin/bookings/${id}`, { method: "PATCH", token, body: JSON.stringify(body) }),
};
