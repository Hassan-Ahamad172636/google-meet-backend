import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // random unique ID (uuid / shortid)
  participants: [
    {
      name: { type: String }, // guest name (optional)
      socketId: { type: String }, // real-time socket ke liye
      joinedAt: { type: Date, default: Date.now },
      leftAt: { type: Date }
    }
  ],
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
