import redis from "../lib/redis.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { confirmBooking } from "./bookingService.js";

/**
 * MOCK: Simulates creating a Razorpay order without hitting their API.
 */
export const createRazorpayOrder = async (showId: string, seatId: string, amount: number, userId: string) => {
  // Verify seat lock in Redis
  const lockKey = `seat_lock:${showId}:${seatId}`;
  const lockedBy = await redis.get(lockKey);

  if (lockedBy !== userId) {
    throw new ApiError(403, "Seat lock expired or not owned by user. Please lock the seat again.");
  }

  // Simulate a Razorpay order object
  return {
    id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100,
    currency: "INR",
    status: "created",
    notes: { userId, showId, seatId }
  };
};

/**
 * MOCK: Simulates verifying a Razorpay payment.
 */
export const verifyRazorpayPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  showId: string,
  seatId: string,
  userId: string
) => {
  // In a real app, we'd verify the HMAC signature here.
  // For simulation, we assume any signature starting with 'mock_' is valid.
  if (!razorpay_signature.startsWith("mock_")) {
    console.warn("MOCK: Received a non-mock signature, but allowing it for simulation.");
  }

  // Payment is valid! Confirm the booking in PostgreSQL
  const booking = await confirmBooking({ userId, showId, seatId });
  return booking;
};

/**
 * MOCK: Simulates processing a Razorpay webhook.
 */
export const processWebhook = async (body: any, signature: string) => {
  // For simulation, we just check the event type
  const event = body.event;

  if (event === "payment.captured") {
    const { userId, showId, seatId } = body.payload.payment.entity.notes;
    await confirmBooking({ userId, showId, seatId });
  }
};
