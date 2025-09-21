// server.js
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";          // ✅ app import yaha se karna hai
import socketService from "./utils/socket.js";
import { connectDB } from "./database/server.js";

// HTTP server wrap around express app
const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Initialize socket service
socketService(io);

// ✅ DB connect
connectDB();

// Start server
server.listen(5001, '0.0.0.0', () => {
  console.log("🚀 Server running on port 5001");
});
