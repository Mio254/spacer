import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    space_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    duration: { type: Number, required: true },
    total_cost: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
)

export default mongoose.model("booking", bookingSchema)
