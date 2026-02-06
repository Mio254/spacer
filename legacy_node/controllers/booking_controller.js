import Booking from "../models/booking.js"
import { isAvailable } from "../services/availability_service.js"
import { calculateCost } from "../services/pricing_service.js"

export const createBooking = async (req, res) => {
  const { space_id, start_date, end_date, duration } = req.body

  const available = await isAvailable(space_id, start_date, end_date)
  if (!available) {
    return res.status(400).json({ error: "space not available" })
  }

  const total_cost = calculateCost(duration, 100)

  const booking = await Booking.create({
    user_id: req.user.id,
    space_id,
    start_date,
    end_date,
    duration,
    total_cost,
  })

  res.status(201).json(booking)
}

export const checkAvailability = async (req, res) => {
  const { spaceId } = req.params
  const { start_date, end_date } = req.query

  const available = await isAvailable(spaceId, start_date, end_date)
  res.json({ available })
}
