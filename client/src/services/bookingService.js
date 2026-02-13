import { apiFetch } from "../api/client";

export const checkAvailability = (spaceId, params) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/bookings/space/${spaceId}?${qs}`);
};

export const createBooking = (data, token) => {
  return apiFetch("/api/bookings", {
    method: "POST",
    token,
    body: data,
  });
};
