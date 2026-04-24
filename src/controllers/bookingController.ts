import { Response, NextFunction } from "express";
import * as bookingService from "../services/bookingService.js";

export const getBookingHistoryController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const bookings = await bookingService.getUserBookings(userId);

    return res.status(200).json({ bookings });
  } catch (err: any) {
    next(err);
  }
};
