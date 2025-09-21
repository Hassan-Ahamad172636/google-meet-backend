import express from "express";
import { createRoom, joinRoom, endRoom } from "../controllers/room.controller.js";

const router = express.Router();
router.post("/create", createRoom);
router.post("/:roomId/join", joinRoom);
router.post("/:roomId/end", endRoom);

export default router;
