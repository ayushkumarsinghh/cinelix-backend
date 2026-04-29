import { Router } from "express";
import { getAllShows, getShowById, createShow, getAllTheatres } from "../controllers/showController.js";
import { getSeatStatusController } from "../controllers/seatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

// GET /api/shows (Admin view)
router.get("/", getAllShows);

// GET /api/shows/:id
router.get("/:id", getShowById);

// POST /api/shows (Admin Only)
router.post("/", authMiddleware, adminMiddleware, createShow);

// GET /api/theatres
router.get("/theatres", getAllTheatres);

// GET /api/shows/:showId/seats
router.get("/:showId/seats", getSeatStatusController);

export default router;
