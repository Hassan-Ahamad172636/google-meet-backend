// app.js
import express from "express";
import cors from "cors";
import router from "./routes/room.route.js";
import callRouter from "./routes/callLogs.route.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logs
console.log("✅ Middlewares loaded");

// Health check route
app.get("/", (req, res) => {
  console.log("🔥 Health check hit");
  res.send("Server is running...");
});

// Room routes
app.use("/room", router);
console.log("✅ Room routes loaded");

// CallLogs routes
app.use("/callLogs", callRouter);
console.log("✅ CallLogs routes loaded");

export default app;
