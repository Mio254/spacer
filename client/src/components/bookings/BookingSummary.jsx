const safeDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toUTCString();
};

const BookingSummary = ({ startDate, endDate, totalPrice }) => {
  return (
    <div>
      <p>Start: {safeDate(startDate)}</p>
      <p>End: {safeDate(endDate)}</p>
      <p>Total Cost: {totalPrice}</p>
    </div>
  );
};

export default BookingSummary;
