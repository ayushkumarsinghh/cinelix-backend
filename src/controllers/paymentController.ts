import { Request, Response, NextFunction } from "express";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentSchemas.js";
import * as paymentService from "../services/paymentService.js";

export const createOrderController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const userId = req.user.userId;

    const order = await paymentService.createRazorpayOrder(
      validatedData.showId,
      validatedData.seatId,
      validatedData.amount,
      userId
    );

    return res.status(200).json(order);
  } catch (err: any) {
    next(err);
  }
};

export const verifyPaymentController = async (req: any, res: Response, next: NextFunction) => {
  try {
    const validatedData = verifyPaymentSchema.parse(req.body);
    const userId = req.user.userId;

    const booking = await paymentService.verifyRazorpayPayment(
      validatedData.razorpay_order_id,
      validatedData.razorpay_payment_id,
      validatedData.razorpay_signature,
      validatedData.showId,
      validatedData.seatId,
      userId
    );

    return res.status(200).json({ 
      message: "Payment verified and booking confirmed!", 
      booking 
    });
  } catch (err: any) {
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
