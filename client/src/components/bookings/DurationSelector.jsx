const DurationSelector = ({ duration, setDuration }) => {
  return (
    <input
      type="number"
      min="1"
      value={duration}
      onChange={(e) => setDuration(Number(e.target.value))}
    />
  )
}

export default DurationSelector
