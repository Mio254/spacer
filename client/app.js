import express from "express"
import bookingRoutes from "./app/routes/booking_routes.js"

const app = express()
const port = 5000

app.use(express.json())
app.use("/api/bookings", bookingRoutes)

app.get("/", (req, res) => {
  res.json({ status: "server running" })
})

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`)
})
