import { Router } from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/admin/stats
router.get("/stats", authMiddleware, adminMiddleware, getDashboardStats);

export default router;
