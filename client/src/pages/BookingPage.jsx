import BookingForm from "../components/bookings/BookingForm"

const BookingPage = ({ space }) => {
  return (
    <div>
      <h2>Book space</h2>
      <BookingForm spaceId={space.id} pricePerHour={space.price_per_hour} />
    </div>
  )
}

export default BookingPage
