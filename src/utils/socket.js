import Room from "../models/room.model.js";
import CallLog from "../models/callLogs.model.js";
import { ApiResponse } from "./apiResponse.js";

export default function socketService(io) {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // ✅ Join Room Event
    socket.on("joinRoom", async ({ roomId, name }) => {
      if (!roomId) {
        console.log("room id is required");
        return;
      }

      socket.join(roomId);

      // DB: Add participant to room
      let room = await Room.findOne({ roomId });
      if (room) {
        room.participants.push({ name, socketId: socket.id });
        await room.save();
      }

      // DB: Add call log
      await CallLog.create({ roomId, participantName: name });

      // Notify others
      socket.to(roomId).emit("userJoined", { socketId: socket.id, name });

      console.log(`${name} joined room ${roomId}`);
    });

    // ✅ Leave Room Event
    socket.on("leaveRoom", async ({ roomId, name }) => {
      socket.leave(roomId);

      // DB: Update participant in room
      let room = await Room.findOne({ roomId });
      if (room) {
        room.participants = room.participants.map((p) =>
          p.socketId === socket.id ? { ...p, leftAt: Date.now() } : p
        );
        await room.save();
      }

      // DB: Update call log
      let log = await CallLog.findOne({ roomId, participantName: name, leftAt: null });
      if (log) {
        log.leftAt = Date.now();
        await log.save();
      }

      // Notify others
      socket.to(roomId).emit("userLeft", { socketId: socket.id, name });

      console.log(`${name} left room ${roomId}`);
    });

    // ✅ Disconnect
    socket.on("disconnect", async () => {
      console.log("❌ Client disconnected:", socket.id);

      // Optional: Clean up if user disconnected without leaveRoom
      let room = await Room.findOne({ "participants.socketId": socket.id });
      if (room) {
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (participant) {
          participant.leftAt = Date.now();
          await room.save();

          // Update log
          let log = await CallLog.findOne({ roomId: room.roomId, participantName: participant.name, leftAt: null });
          if (log) {
            log.leftAt = Date.now();
            await log.save();
          }

          socket.to(room.roomId).emit("userLeft", { socketId: socket.id, name: participant.name });
        }
      }
    });

    // ✅ WebRTC Offer
    socket.on("offer", ({ roomId, offer, toSocketId }) => {
      console.log(`Forwarding offer from ${socket.id} to ${toSocketId} in room ${roomId}`);
      socket.to(roomId).to(toSocketId).emit("offer", { offer, fromSocketId: socket.id });
    });

    // ✅ WebRTC Answer
    socket.on("answer", ({ roomId, answer, toSocketId }) => {
      console.log(`Forwarding answer from ${socket.id} to ${toSocketId} in room ${roomId}`);
      socket.to(roomId).to(toSocketId).emit("answer", { answer, fromSocketId: socket.id });
    });

    // ✅ WebRTC ICE Candidate
    socket.on("ice-candidate", ({ roomId, candidate, toSocketId }) => {
      console.log(`Forwarding ICE candidate from ${socket.id} to ${toSocketId} in room ${roomId}`);
      socket.to(roomId).to(toSocketId).emit("ice-candidate", { candidate, fromSocketId: socket.id });
    });
  });
}