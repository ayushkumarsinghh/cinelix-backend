import { Router } from "express";
import { getAllMovies, getMovieShows, getMovieById, createMovie, deleteMovie, updateMovie } from "../controllers/movieController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

// GET /api/movies
router.get("/", getAllMovies);

// POST /api/movies (Admin Only)
router.post("/", authMiddleware, adminMiddleware, createMovie);

// PATCH /api/movies/:id (Admin Only)
router.patch("/:id", authMiddleware, adminMiddleware, updateMovie);

// DELETE /api/movies/:id (Admin Only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteMovie);

// GET /api/movies/:id
router.get("/:id", getMovieById);

// GET /api/movies/:id/shows
router.get("/:id/shows", getMovieShows);

export default router;
