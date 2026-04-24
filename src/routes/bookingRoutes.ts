import { Router } from "express";
import { getBookingHistoryController } from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/bookings/me (Protected)
router.get("/me", authMiddleware, getBookingHistoryController);

export default router;
