import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  participantName: { type: String },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("CallLog", callLogSchema);
