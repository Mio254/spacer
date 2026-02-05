import Booking from "../../../server/models/booking.js"

export const isAvailable = async (spaceId, startDate, endDate) => {
  const clash = await Booking.findOne({
    space_id: spaceId,
    start_date: { $lt: endDate },
    end_date: { $gt: startDate },
    status: { $ne: "cancelled" },
  })

  return !clash
}
