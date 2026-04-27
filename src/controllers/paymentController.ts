import { Request, Response, NextFunction } from "express";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentSchemas.js";
import * as paymentService from "../services/paymentService.js";

export const createOrderController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user.userId;

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

export const verifyPaymentController = async (req: any, res: Response, next: NextFunction) => {
  try {
    // For the demo, we'll be more lenient with the input
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, showId, seatIds } = req.body;
    const userId = req.user.userId;

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
