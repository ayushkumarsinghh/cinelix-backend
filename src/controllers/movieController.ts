import { Request, Response, NextFunction } from "express";
import * as movieService from "../services/movieService.js";

export const getAllMovies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movies = await movieService.getAllMovies();
    return res.status(200).json(movies);
  } catch (err: any) {
    next(err);
  }
};

export const getMovieShows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const shows = await movieService.getMovieShows(id as string);
    return res.status(200).json(shows);
  } catch (err: any) {
    next(err);
  }
};

export const getMovieById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const movie = await movieService.getMovieById(id as string);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.status(200).json(movie);
  } catch (err: any) {
    next(err);
  }
};

export const createMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await movieService.createMovie(req.body);
    return res.status(201).json(movie);
  } catch (err: any) {
    next(err);
  }
};

export const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await movieService.deleteMovie(id as string);
    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err: any) {
    next(err);
  }
};

export const updateMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const movie = await movieService.updateMovie(id as string, req.body);
    return res.status(200).json(movie);
  } catch (err: any) {
    next(err);
  }
};
