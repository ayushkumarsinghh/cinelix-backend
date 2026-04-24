import { Router } from "express";
import { lockSeatController, getSeatStatusController } from "../controllers/seatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// POST /api/seats/lock (Protected)
router.post("/lock", authMiddleware, lockSeatController);

export default router;
