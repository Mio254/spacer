import axios from "axios";

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: "/api/bookings", // Matches Flask route prefix
});

// --- Check availability ---
// GET /api/bookings/space/:spaceId?start_date=...&end_date=...
export const checkAvailability = async (spaceId, params) => {
  try {
    const response = await api.get(`/space/${spaceId}`, { params });
    // Flask returns { available: true/false }
    return response;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
};

// --- Create booking ---
// POST /api/bookings/
// Requires JWT token in Authorization header
export const createBooking = async (data) => {
  try {
    const token = localStorage.getItem("token"); // Make sure token is saved after login
    const response = await api.post("/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};
