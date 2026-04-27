import prisma from "../lib/prisma.js";
import redis from "../lib/redis.js";
import { ApiError } from "../middleware/errorMiddleware.js";

export const getSeatStatus = async (showId: string) => {
  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: { theatre: { include: { seats: true } } }
  });

  if (!show || !show.theatre) {
    throw new ApiError(404, "Show or Theatre not found");
  }

  const allSeats = show.theatre.seats;

  const bookings = await prisma.booking.findMany({
    where: { showId, status: "CONFIRMED" },
    select: { seatId: true }
  });

  const bookedSeatIds = new Set(bookings.map(b => b.seatId));

  const seatStatuses = await Promise.all(
    allSeats.map(async (seat: any) => {
      let status = "AVAILABLE";

      if (bookedSeatIds.has(seat.id)) {
        status = "BOOKED";
      } else {
        const lockKey = `seat_lock:${showId}:${seat.id}`;
        const isLocked = await redis.get(lockKey);
        if (isLocked) {
          status = "LOCKED";
        }
      }

      const rowMatch = seat.seatNumber.match(/^([A-Z]+)(\d+)$/);
      const row = rowMatch ? rowMatch[1] : 'A';
      const number = rowMatch ? parseInt(rowMatch[2], 10) : 1;

      return {
        id: seat.id,
        row,
        number,
        status
      };
    })
  );

  return seatStatuses;
};
