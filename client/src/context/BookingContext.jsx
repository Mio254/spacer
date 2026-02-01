import { createContext, useState } from "react"

export const BookingContext = createContext()

const BookingProvider = ({ children }) => {
  const [availability, setAvailability] = useState(null)

  return (
    <BookingContext.Provider value={{ availability, setAvailability }}>
      {children}
    </BookingContext.Provider>
  )
}

export default BookingProvider
