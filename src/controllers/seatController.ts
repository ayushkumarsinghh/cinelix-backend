import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { lockSeats } from "../services/bookingService.js";
import { lockSeatSchema } from "../validators/seatSchemas.js";
import * as seatService from "../services/seatService.js";

export const lockSeatController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = lockSeatSchema.parse(req.body);
    const userId = req.user!.userId;

    await lockSeats({ userId, ...validatedData });

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`show_${validatedData.showId}`).emit("seat_update", {
      showId: validatedData.showId,
      lockedSeats: validatedData.seatIds,
      lockedBy: userId
    });

    return res.status(200).json({ 
      message: "Seats locked successfully", 
      expiresAt: Date.now() + 300000 
    });
  } catch (err: any) {
    next(err);
  }
};

export const getSeatStatusController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showId } = req.params;
    const seats = await seatService.getSeatStatus(showId as string);
    return res.status(200).json(seats);
  } catch (err: any) {
    next(err);
  }
};
