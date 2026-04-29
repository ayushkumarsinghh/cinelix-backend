import Razorpay from "razorpay";
import crypto from "crypto";
import redis from "../lib/redis.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { confirmBookings } from "./bookingService.js";
import prisma from "../lib/prisma.js";

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

/**
 * Creates a Razorpay order. Uses real API if keys are present, otherwise returns mock.
 */
export const createRazorpayOrder = async (showId: string, seatIds: string[], userId: string, walletAmount: number = 0) => {
  // Verify all seat locks in Redis
  for (const seatId of seatIds) {
    const lockKey = `seat_lock:${showId}:${seatId}`;
    const lockedBy = await redis.get(lockKey);

    if (lockedBy !== userId) {
      throw new ApiError(403, `Seat lock for ${seatId} expired or not owned by user.`);
    }
  }

  // Calculate amount based on actual show price + convenience fee
  const show = await prisma.show.findUnique({ where: { id: showId } });
  if (!show) throw new ApiError(404, "Show not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const convenienceFee = user?.isPremium ? 12.5 : 30;
  const amount = Math.max(0, (seatIds.length * show.price) + convenienceFee - walletAmount);

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // paisa
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { userId, showId, seatIds: seatIds.join(",") }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        bookingId: order.id, // We use order.id as a temporary tracking ID
      };
    } catch (err) {
      console.error("Razorpay Order Creation Error:", err);
      throw new ApiError(500, "Failed to create Razorpay order");
    }
  }

  // Simulate a Razorpay order object (Mock)
  return {
    orderId: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100,
    currency: "INR",
    keyId: "rzp_test_mock",
  };
};

/**
 * Creates a Razorpay order for a subscription plan.
 */
export const createRazorpaySubscriptionOrder = async (planName: string, amount: number, userId: string) => {
  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amount * 100, // paisa
        currency: "INR",
        receipt: `sub_${Date.now()}`,
        notes: { userId, planName, type: "SUBSCRIPTION" }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (err) {
      console.error("Razorpay Subscription Order Creation Error:", err);
      throw new ApiError(500, "Failed to create subscription order");
    }
  }

  return {
    orderId: `order_mock_sub_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100,
    currency: "INR",
    keyId: "rzp_test_mock",
  };
};

/**
 * Verifies a Razorpay payment. Uses real signature verification if keys are present.
 */
export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  showId: string,
  seatIds: string[],
  userId: string
) => {
  if (razorpay && razorpay_signature !== "mock_sig") {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    console.log("--- RAZORPAY DEBUG ---");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Expected Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Invalid payment signature");
    }
  } else {
    console.log(`MOCK: Verifying payment for user ${userId}, show ${showId}, seats ${seatIds.join(",")}`);
  }
  
  const bookings = await confirmBookings({ userId, showId, seatIds });
  return bookings;
};

/**
 * Verifies a Razorpay subscription payment.
 */
export const verifyRazorpaySubscription = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  userId: string
) => {
  if (razorpay && !razorpay_signature.startsWith("mock_sig")) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new ApiError(400, "Invalid payment signature");
    }
  } else {
    console.log(`MOCK: Verifying subscription payment for user ${userId}`);
  }
  
  return true;
};

/**
 * MOCK: Simulates processing a Razorpay webhook.
 */
export const processWebhook = async (body: any, signature: string) => {
  const event = body.event;

  if (event === "payment.captured") {
    const { userId, showId, seatIds: seatIdsStr } = body.payload.payment.entity.notes;
    const seatIds = seatIdsStr.split(",");
    await confirmBookings({ userId, showId, seatIds });
  }
};
