export const calculateDuration = (start, end) => {
  return (new Date(end) - new Date(start)) / 3600000
}
