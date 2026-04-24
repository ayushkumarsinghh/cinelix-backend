import { Router } from "express";
import { getSeatStatusController } from "../controllers/seatController.js";

const router = Router();

// GET /api/shows/:showId/seats
router.get("/:showId/seats", getSeatStatusController);

export default router;
