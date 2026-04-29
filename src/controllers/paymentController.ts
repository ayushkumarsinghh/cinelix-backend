import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentSchemas.js";
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  handleRazorpayWebhook, 
  createRazorpaySubscriptionOrder, 
  verifyRazorpaySubscription 
} from "../services/paymentService.js";
import { getBookingById } from "../services/bookingService.js";
import prisma from "../lib/prisma.js";

export const createOrderController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user!.userId;

    if (validatedData.type === 'SUBSCRIPTION') {
      const order = await createRazorpaySubscriptionOrder(
        validatedData.planName || 'Cinelix+',
        validatedData.amount || 499,
        userId
      );
      return res.status(200).json(order);
    }

    if (!validatedData.showId || !validatedData.seatIds) {
      return res.status(400).json({ message: "showId and seatIds are required for movie bookings" });
    }

    const order = await createRazorpayOrder(
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, showId, seatIds, type } = req.body;
    const userId = req.user!.userId;

    // Handle Subscription Verification
    if (type === 'SUBSCRIPTION') {
      await verifyRazorpaySubscription(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId
      );
      
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

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

    const bookings = await verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      showId,
      seatIds,
      userId
    );

    // If wallet was used, deduct it now
    const walletAmount = (req.body as any).walletAmount;
    if (walletAmount && walletAmount > 0) {
      await (prisma.user.update as any)({
        where: { id: userId },
        data: { walletBalance: { decrement: walletAmount } }
      });
    }

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`show_${showId}`).emit("booking_confirmed", {
        showId,
        confirmedSeats: seatIds
      });
    }

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
    await handleRazorpayWebhook(req.body, signature);
    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    next(err);
  }
};
