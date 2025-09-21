import Room from "../models/room.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Socket instance ko inject karne ke liye ek variable
let ioInstance;
export const setSocketInstance = (io) => {
  ioInstance = io;
};

// ✅ Create a new room
export const createRoom = asyncHandler(async (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 8); // eg: "abc123"

  const room = await Room.create({ roomId });

  // Socket event (notify admin/others if needed)
  if (ioInstance) {
    ioInstance.emit("roomCreated", { roomId, room });
  }

  return ApiResponse(
    res,
    201,
    true,
    "Room created successfully",
    {
      room,
      link: `${req.protocol}://${req.get("host")}/room/${roomId}`,
    }
  );
});

// ✅ Join a room
export const joinRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { name, socketId } = req.body;

  const room = await Room.findOne({ roomId, isActive: true });
  if (!room) {
    return ApiResponse(res, 404, false, "Room not found or inactive");
  }

  room.participants.push({ name, socketId });
  await room.save();

  // Socket event (notify all in that room)
  if (ioInstance) {
    ioInstance.to(roomId).emit("userJoined", { name, socketId, roomId });
  }

  return ApiResponse(res, 200, true, "Joined room successfully", room);
});

// ✅ End a room
export const endRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOne({ roomId });
  if (!room) {
    return ApiResponse(res, 404, false, "Room not found");
  }

  room.isActive = false;
  room.endedAt = Date.now();
  await room.save();

  // Socket event (notify all participants in room)
  if (ioInstance) {
    ioInstance.to(roomId).emit("roomEnded", { roomId });
  }

  return ApiResponse(res, 200, true, "Room ended successfully", room);
});
