import { Request, Response, NextFunction } from "express";
import { lockSeat } from "../services/bookingService.js";
import { lockSeatSchema } from "../validators/seatSchemas.js";
import * as seatService from "../services/seatService.js";

export const lockSeatController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = lockSeatSchema.parse(req.body);
    const userId = req.user.userId;

    await lockSeat({ userId, ...validatedData });

    return res.status(200).json({ 
      message: "Seat locked successfully", 
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
    return res.status(200).json({ seats });
  } catch (err: any) {
    next(err);
  }
};
