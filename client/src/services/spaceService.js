import { apiFetch } from "../api/client";

export const spaceService = {
  getAllSpaces() {
    return apiFetch("/api/spaces").then((d) => d.spaces ?? d);
  },
  getSpace(id) {
    return apiFetch(`/api/spaces/${id}`).then((d) => d.space ?? d);
  },
};
