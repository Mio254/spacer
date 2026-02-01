const API_URL = 'http://localhost:5000/api';
export const spaceService = {
  async getAllSpaces() {
    const res = await fetch(`${API_URL}/spaces`);
    if (!res.ok) throw new Error('Failed fetch spaces');
    return await res.json();
  },
  async getSpace(id) {
    const res = await fetch(`${API_URL}/spaces/${id}`);
    if (!res.ok) throw new Error('Failed fetch space');
    return await res.json();
  }
};
