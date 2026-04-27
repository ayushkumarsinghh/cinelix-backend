import { Router } from "express";
import { getBookingHistoryController, deleteBookingController, verifyBookingController, redeemBookingController } from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

// GET /api/bookings/me (Protected)
router.get("/me", authMiddleware, getBookingHistoryController);

// GET /api/bookings/verify/:id (Public for QR scans)
router.get("/verify/:id", verifyBookingController);

// POST /api/bookings/redeem/:id (Check-in)
router.post("/redeem/:id", redeemBookingController);

// DELETE /api/bookings/:id (Admin Only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteBookingController);

export default router;
