import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

export const getAllShows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shows = await prisma.show.findMany({
      include: {
        movie: true,
        theatre: true
      },
      orderBy: { startTime: "asc" }
    });
    return res.status(200).json(shows);
  } catch (err: any) {
    next(err);
  }
};

export const getShowById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: req.params.id as string },
      include: {
        movie: true,
        theatre: true
      }
    });
    if (!show) return res.status(404).json({ message: "Show not found" });
    return res.status(200).json(show);
  } catch (err: any) {
    next(err);
  }
};

export const createShow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, theatreId, startTime } = req.body;
    const start = new Date(startTime);

    // 1. Get the movie to know its duration
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) throw new Error("Movie not found");

    const end = new Date(start.getTime() + movie.duration * 60000 + 15 * 60000); // 15 min buffer

    // 2. Check for overlaps in the same theatre
    const overlappingShow = await prisma.show.findFirst({
      where: {
        theatreId,
        OR: [
          {
            startTime: {
              lte: end,
              gte: start
            }
          },
          {
            startTime: { lte: start }
          }
        ]
      },
      include: { movie: true }
    });

    if (overlappingShow) {
      const existingStart = new Date(overlappingShow.startTime);
      const existingEnd = new Date(existingStart.getTime() + overlappingShow.movie.duration * 60000 + 15 * 60000);
      
      if (start < existingEnd && end > existingStart) {
        return res.status(400).json({ 
          message: `Theatre busy: ${overlappingShow.movie.title} ends at ${existingEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
        });
      }
    }

    const show = await prisma.show.create({
      data: {
        movieId,
        theatreId,
        startTime: start
      },
      include: {
        movie: true,
        theatre: true
      }
    });
    return res.status(201).json(show);
  } catch (err: any) {
    next(err);
  }
};

export const getAllTheatres = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theatres = await prisma.theatre.findMany();
    return res.status(200).json(theatres);
  } catch (err: any) {
    next(err);
  }
};
