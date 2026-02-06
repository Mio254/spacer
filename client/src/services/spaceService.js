const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

export const spaceService = {
  async getAllSpaces() {
    const res = await fetch(`${API_URL}/api/spaces`);
    if (!res.ok) throw new Error("Failed fetch spaces");
    return await res.json();
  },

  async getSpace(id) {
    const res = await fetch(`${API_URL}/api/spaces/${id}`);
    if (!res.ok) throw new Error("Failed fetch space");
    return await res.json();
  },
};
