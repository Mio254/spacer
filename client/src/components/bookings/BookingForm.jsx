import { useState } from "react"
import { checkAvailability, createBooking } from "../../services/bookingService"
import AvailabilityCalendar from "./AvailabilityCalendar"
import DurationSelector from "./DurationSelector"
import BookingSummary from "./BookingSummary"
import { calculateDuration } from "../../utils/dateUtils"
import { calculatePrice } from "../../utils/priceCalculator"

const BookingForm = ({ spaceId, pricePerHour }) => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [duration, setDuration] = useState(1)
  const [available, setAvailable] = useState(null)

  const totalPrice = calculatePrice(duration, pricePerHour)

  const handleCheck = async () => {
    const res = await checkAvailability(spaceId, {
      start_date: startDate,
      end_date: endDate,
    })
    setAvailable(res.data.available)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createBooking({
      space_id: spaceId,
      start_date: startDate,
      end_date: endDate,
      duration,
    })
    alert("Booking created")
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="datetime-local" onChange={(e) => setStartDate(e.target.value)} />
      <input type="datetime-local" onChange={(e) => setEndDate(e.target.value)} />

      <DurationSelector duration={duration} setDuration={setDuration} />

      <button type="button" onClick={handleCheck}>Check availability</button>

      <AvailabilityCalendar available={available} />

      <BookingSummary
        startDate={startDate}
        endDate={endDate}
        totalPrice={totalPrice}
      />

      <button type="submit">Confirm booking</button>
    </form>
  )
}

export default BookingForm
