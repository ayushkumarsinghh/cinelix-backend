import redis from "../lib/redis.js";
import { ApiError } from "../middleware/errorMiddleware.js";
import { confirmBookings } from "./bookingService.js";

/**
 * MOCK: Simulates creating a Razorpay order without hitting their API.
 */
export const createRazorpayOrder = async (showId: string, seatIds: string[], userId: string) => {
  // Verify all seat locks in Redis
  for (const seatId of seatIds) {
    const lockKey = `seat_lock:${showId}:${seatId}`;
    const lockedBy = await redis.get(lockKey);

    if (lockedBy !== userId) {
      throw new ApiError(403, `Seat lock for ${seatId} expired or not owned by user.`);
    }
  }

  // Calculate amount: 250 per seat + 30 convenience fee
  const amount = (seatIds.length * 250) + 30;

  // Simulate a Razorpay order object
  return {
    orderId: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
    amount: amount * 100, // Razorpay expects paise
    currency: "INR",
    status: "created",
    keyId: "rzp_test_mock", // Dummy key for frontend
    bookingId: "mock_booking_id",
    notes: { userId, showId, seatIds: seatIds.join(",") }
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
  seatIds: string[],
  userId: string
) => {
  // For simulation, we assume any mock signature is valid and skip strict lock checks
  // to prevent demo failures if the 5-minute lock expired during chat.
  console.log(`MOCK: Verifying payment for user ${userId}, show ${showId}, seats ${seatIds.join(",")}`);
  
  const bookings = await confirmBookings({ userId, showId, seatIds });
  return bookings;
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
