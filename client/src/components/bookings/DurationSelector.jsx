const DurationSelector = ({ duration, setDuration }) => {
  return (
    <input
      type="number"
      min="1"
      value={duration}
      onChange={(e) => setDuration(Number(e.target.value || 1))}
    />
  );
};

export default DurationSelector;
