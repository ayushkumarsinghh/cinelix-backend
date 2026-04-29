import { z } from "zod";

export const createOrderSchema = z.object({
  showId: z.string().uuid().optional(),
  seatIds: z.array(z.string()).optional(),
  type: z.enum(["BOOKING", "SUBSCRIPTION"]).optional().default("BOOKING"),
  planName: z.string().optional(),
  amount: z.number().optional(),
  walletAmount: z.number().optional()
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  showId: z.string().uuid().optional(),
  seatIds: z.array(z.string()).optional(),
  type: z.enum(["BOOKING", "SUBSCRIPTION"]).optional().default("BOOKING"),
  walletAmount: z.number().optional()
});
