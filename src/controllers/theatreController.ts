import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

export const getAllTheatres = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theatres = await prisma.theatre.findMany({
      include: {
        _count: {
          select: { 
            shows: true,
            seats: true
          }
        }
      }
    });
    return res.status(200).json(theatres);
  } catch (err) {
    next(err);
  }
};

export const createTheatre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location } = req.body;
    
    const theatre = await prisma.theatre.create({
      data: { name, location }
    });

    // Auto-populate with 70 seats for the new theatre
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const seatData = [];
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seatData.push({
          theatreId: theatre.id,
          seatNumber: `${row}${i}`
        });
      }
    }

    await prisma.seat.createMany({
      data: seatData
    });

    return res.status(201).json(theatre);
  } catch (err) {
    next(err);
  }
};

export const deleteTheatre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.theatre.delete({
      where: { id }
    });
    return res.status(200).json({ message: "Theatre deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const fixMissingSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const theatres = await prisma.theatre.findMany({
      include: { _count: { select: { seats: true } } }
    });

    let fixedCount = 0;
    for (const theatre of theatres) {
      if (theatre._count.seats === 0) {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const seatData = [];
        for (const row of rows) {
          for (let i = 1; i <= 10; i++) {
            seatData.push({
              theatreId: theatre.id,
              seatNumber: `${row}${i}`
            });
          }
        }
        await prisma.seat.createMany({ data: seatData });
        fixedCount++;
      }
    }

    return res.status(200).json({ 
      message: `Checked ${theatres.length} theatres. Fixed seats for ${fixedCount} theatres.` 
    });
  } catch (err) {
    next(err);
  }
};
