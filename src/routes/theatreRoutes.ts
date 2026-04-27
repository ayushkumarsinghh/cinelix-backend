import { Router } from "express";
import { getAllTheatres, createTheatre, deleteTheatre } from "../controllers/theatreController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", getAllTheatres);
router.post("/", authMiddleware, adminMiddleware, createTheatre);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTheatre);

export default router;
