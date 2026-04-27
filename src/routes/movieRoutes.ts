import { Router } from "express";
import { getAllMovies, getMovieShows, getMovieById } from "../controllers/movieController.js";

const router = Router();

// GET /api/movies
router.get("/", getAllMovies);

// GET /api/movies/:id
router.get("/:id", getMovieById);

// GET /api/movies/:id/shows
router.get("/:id/shows", getMovieShows);

export default router;
