import { z } from "zod";

export const createOrderSchema = z.object({
  showId: z.string().uuid(),
  seatId: z.string(),
  amount: z.number().positive(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  showId: z.string().uuid(),
  seatId: z.string(),
});
