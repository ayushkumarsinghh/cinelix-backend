import redis from "../lib/redis.js";
import prisma from "../lib/prisma.js";

type SeatLockParams = {
  showId: string;
  seatId: string;
  userId: string;
};

/**
 * Attempts to lock a seat in Redis for a specific show.
 */
export async function lockSeat({ showId, seatId, userId }: SeatLockParams): Promise<boolean> {
  const key = `seat_lock:${showId}:${seatId}`;

  // NX: Only set if the key does not exist
  // EX 300: Expire in 300 seconds (5 minutes)
  const result = await redis.set(key, userId, "EX", 300, "NX");

  if (!result) {
    throw new Error("Seat is already locked by another user.");
  }

  return true;
}

/**
 * Confirms a booking by checking the lock ownership and saving to PostgreSQL.
 */
export async function confirmBooking({ userId, showId, seatId }: SeatLockParams): Promise<any> {
  const key = `seat_lock:${showId}:${seatId}`;
  
  // Verify that the current user actually holds the lock
  const lockedBy = await redis.get(key);

  if (lockedBy !== userId) {
    throw new Error("Seat lock expired or not owned by this user. Please try locking again.");
  }

  // Atomically save booking in PostgreSQL
  const booking = await prisma.booking.create({
    data: {
      userId,
      showId,
      seatId,
      status: "CONFIRMED"
    }
  });

  // Once confirmed in DB, we can safely remove the temporary Redis lock
  await redis.del(key);

  return booking;
}

/**
 * Fetches the booking history for a specific user.
 */
export async function getUserBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      show: {
        include: {
          movie: true,
          theatre: true
        }
      },
      seat: true
    },
    orderBy: { createdAt: "desc" }
  });
}
