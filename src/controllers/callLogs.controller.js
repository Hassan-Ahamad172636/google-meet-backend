import asyncHandler from "../utils/asyncHandler.js";
import callLogsModel from "../models/callLogs.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Socket instance inject karne ke liye variable
let ioInstance;
export const setLogsSocketInstance = (io) => {
  ioInstance = io;
};

// ✅ Add new log when user joins
export const addCallLog = asyncHandler(async (req, res) => {
  const { roomId, participantName } = req.body;
  console.log(req.body)

  const log = await callLogsModel.create({
    roomId,
    participantName,
    joinedAt: Date.now(),
  });

  // Emit socket event
  if (ioInstance) {
    ioInstance.to(roomId).emit("logAdded", log);
  }

  return ApiResponse(res, 201, true, "Call log created", log);
});

// ✅ Update log when user leaves
export const endCallLog = asyncHandler(async (req, res) => {
  const { logId } = req.params;

  const log = await callLogsModel.findById(logId);
  if (!log) {
    return ApiResponse(res, 404, false, "Log not found");
  }

  log.leftAt = Date.now();
  await log.save();

  // Emit socket event
  if (ioInstance) {
    ioInstance.to(log.roomId).emit("logUpdated", log);
  }

  return ApiResponse(res, 200, true, "Call log updated", log);
});

// ✅ Get all logs for a room
export const getRoomLogs = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const logs = await callLogsModel.find({ roomId });

  return ApiResponse(res, 200, true, "Room logs fetched", logs);
});
