import express from "express"
import bookingRoutes from "./routes/booking_routes.js"

const app = express()

app.use(express.json())
app.use("/api/bookings", bookingRoutes)

export default app
