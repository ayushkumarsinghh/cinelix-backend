import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentSchemas.js";
import * as paymentService from "../services/paymentService.js";
import { sendTicketEmail } from "../services/mailerService.js";
import { getBookingById } from "../services/bookingService.js";
import prisma from "../lib/prisma.js";

export const createOrderController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    const order = await paymentService.createRazorpayOrder(
      validatedData.showId,
      validatedData.seatIds,
      userId
    );

    return res.status(200).json(order);
  } catch (err: any) {
    next(err);
  }
};

export const verifyPaymentController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For the demo, we'll be more lenient with the input
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, showId, seatIds } = req.body;
    const userId = req.user!.userId;

    if (!showId || !seatIds) {
      return res.status(400).json({ message: "Missing showId or seatIds in verification" });
    }

    const bookings = await paymentService.verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      showId,
      seatIds,
      userId
    );

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`show_${showId}`).emit("booking_confirmed", {
      showId,
      confirmedSeats: seatIds
    });

    // Send Ticket Email in background
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && bookings.length > 0) {
          const detail = await getBookingById(bookings[0].id);
          const seatsData = await prisma.seat.findMany({ where: { id: { in: seatIds } } });
          const seatNumbers = seatsData.map(s => s.seatNumber);
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          
          if (detail) {
            await sendTicketEmail(user.email, {
              movie: detail.show.movie,
              show: detail.show,
              theatre: detail.show.theatre,
              seats: seatNumbers,
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${frontendUrl}/verify/${bookings[0].id}`
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to send ticket email:", emailErr);
      }
    })();

    return res.status(200).json({ 
      message: "Payment verified and booking confirmed!", 
      bookings 
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    next(err);
  }
};

export const handleWebhookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    await paymentService.processWebhook(req.body, signature);
    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    next(err);
  }
};
