const BookingSummary = ({ startDate, endDate, totalPrice }) => {
  return (
    <div>
      <p>Start: {new Date(startDate).toUTCString()}</p>
      <p>End: {new Date(endDate).toUTCString()}</p>
      <p>Total Cost: {totalPrice}</p>
    </div>
  )
}

export default BookingSummary
