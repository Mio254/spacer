import axios from "axios"

const api = axios.create({
  baseURL: "/api/bookings",
})

export const checkAvailability = (spaceId, params) =>
  api.get(`/space/${spaceId}`, { params })

export const createBooking = (data) =>
  api.post("/", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
