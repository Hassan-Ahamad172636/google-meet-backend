import express from "express";
import { addCallLog, endCallLog, getRoomLogs } from "../controllers/callLogs.controller.js";

const router = express.Router();

router.post("/", addCallLog);
router.put("/:logId/leave", endCallLog);
router.get("/:roomId", getRoomLogs);

export default router;
