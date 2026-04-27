import { Response, NextFunction } from "express";
import * as bookingService from "../services/bookingService.js";

export const getBookingHistoryController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const bookings = await bookingService.getUserBookings(userId);

    return res.status(200).json(bookings);
  } catch (err: any) {
    next(err);
  }
};

export const deleteBookingController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await bookingService.deleteBooking(id);
    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err: any) {
    next(err);
  }
};
export const verifyBookingController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    return res.status(200).json(booking);
  } catch (err: any) {
    next(err);
  }
};

export const redeemBookingController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await bookingService.redeemBooking(id);
    return res.status(200).json({ message: "Ticket redeemed successfully" });
  } catch (err: any) {
    next(err);
  }
};
