import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentSchemas.js";
import * as paymentService from "../services/paymentService.js";
import { getBookingById } from "../services/bookingService.js";
import prisma from "../lib/prisma.js";

export const createOrderController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    if (validatedData.type === 'SUBSCRIPTION') {
      const order = await paymentService.createRazorpaySubscriptionOrder(
        validatedData.planName || 'Cinelix+',
        validatedData.amount || 499,
        userId
      );
      return res.status(200).json(order);
    }

    if (!validatedData.showId || !validatedData.seatIds) {
      return res.status(400).json({ message: "showId and seatIds are required for movie bookings" });
    }

    const order = await paymentService.createRazorpayOrder(
      validatedData.showId,
      validatedData.seatIds,
      userId,
      (validatedData as any).walletAmount || 0
    );

    return res.status(200).json(order);
  } catch (err: any) {
    next(err);
  }
};

export const verifyPaymentController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For the demo, we'll be more lenient with the input
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, showId, seatIds, type, walletAmount } = req.body;
    const userId = req.user!.userId;

    if (type === 'SUBSCRIPTION') {
      await paymentService.verifyRazorpaySubscription(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId
      );
      
      // Calculate expiry (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Update user membership in DB
      await (prisma.user.update as any)({
        where: { id: userId },
        data: { 
          isPremium: true,
          premiumUntil: expiryDate
        }
      });

      return res.status(200).json({ message: "Subscription activated successfully!" });
    }

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

    // If wallet was used, deduct it now
    if (walletAmount && walletAmount > 0) {
      await (prisma.user.update as any)({
        where: { id: userId },
        data: { walletBalance: { decrement: walletAmount } }
      });
    }

    // Emit real-time update
    const io = req.app.get("io");
    io.to(`show_${showId}`).emit("booking_confirmed", {
      showId,
      confirmedSeats: seatIds
    });

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
