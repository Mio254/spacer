import express from "express"
import { createBooking, checkAvailability } from "../../../server/controllers/booking_controller.js"
import authMiddleware from "../../../server/middleware/auth_middleware.js"

const router = express.Router()

router.post("/", authMiddleware, createBooking)
router.get("/space/:spaceId", checkAvailability)

export default router
