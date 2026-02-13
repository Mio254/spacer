const AvailabilityCalendar = ({ available }) => {
  if (available === null) return null

  return (
    <div>
      {available ? (
        <span>Time slot available</span>
      ) : (
        <span>Time slot unavailable</span>
      )}
    </div>
  )
}

export default AvailabilityCalendar
