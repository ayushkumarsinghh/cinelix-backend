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
  const result = await redis.set(key, userId, "EX", 300, "NX");
  if (!result) {
    throw new Error(`Seat ${seatId} is already locked by another user.`);
  }
  return true;
}

export async function lockSeats({ showId, seatIds, userId }: { showId: string, seatIds: string[], userId: string }): Promise<void> {
  const lockedSeats: string[] = [];
  try {
    for (const seatId of seatIds) {
      await lockSeat({ showId, seatId, userId });
      lockedSeats.push(seatId);
    }
  } catch (error) {
    // Rollback: unlock seats that were locked before the failure
    for (const seatId of lockedSeats) {
      await redis.del(`seat_lock:${showId}:${seatId}`);
    }
    throw error;
  }
}

/**
 * Confirms multiple bookings by checking the lock ownership and saving to PostgreSQL.
 */
export async function confirmBookings({ userId, showId, seatIds }: { userId: string, showId: string, seatIds: string[] }): Promise<any[]> {
  const bookings = [];

  for (const seatId of seatIds) {
    const key = `seat_lock:${showId}:${seatId}`;
    const lockedBy = await redis.get(key);

    // In mock/demo mode, we allow confirmation even if lock expired, 
    // as long as it's not locked by SOMEONE ELSE.
    if (lockedBy && lockedBy !== userId) {
      throw new Error(`Seat ${seatId} is now locked by another user.`);
    }

    // Check if booking already exists (idempotency)
    const existingBooking = await prisma.booking.findFirst({
      where: { showId, seatId, userId }
    });

    if (existingBooking) {
      bookings.push(existingBooking);
      continue;
    }

    // Save booking in PostgreSQL
    const booking = await prisma.booking.create({
      data: {
        userId,
        showId,
        seatId,
        status: "CONFIRMED"
      }
    });
    bookings.push(booking);

    // Remove the lock
    await redis.del(key);
  }

  return bookings;
}

/**
 * Fetches the booking history for a specific user, grouped by transaction.
 */
export async function getUserBookings(userId: string) {
  const individualBookings = await prisma.booking.findMany({
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

  // Group individual seat bookings by their createdAt time (simulating a transaction)
  // In a real app, we would have an 'orderId' field to group these.
  const grouped = new Map();

  for (const b of individualBookings) {
    // Use showId + truncated createdAt (seconds) as a group key
    const timeKey = new Date(b.createdAt).getTime();
    const groupKey = `${b.showId}_${Math.floor(timeKey / 1000)}`;

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: b.id,
        status: b.status,
        createdAt: b.createdAt,
        totalAmount: 0, // Will calculate
        show: {
          startTime: b.show.startTime,
          theatre: {
            name: b.show.theatre.name
          },
          movie: {
            title: b.show.movie.title,
            imageUrl: b.show.movie.imageUrl,
            duration: b.show.movie.duration
          }
        },
        seats: []
      });
    }

    const group = grouped.get(groupKey);
    
    // Parse seat row/number from seatNumber (e.g. "A1")
    const rowMatch = b.seat.seatNumber.match(/^([A-Z]+)(\d+)$/);
    const row = rowMatch ? rowMatch[1] : 'A';
    const number = rowMatch ? parseInt(rowMatch[2], 10) : 1;

    group.seats.push({
      id: b.seat.id,
      row,
      number
    });
    
    // Calculate amount (250 per seat)
    group.totalAmount += 250;
  }

  // Add the 30 convenience fee to each group
  const finalBookings = Array.from(grouped.values()).map(g => {
    g.totalAmount += 30;
    return g;
  });

  return finalBookings;
}

export async function deleteBooking(id: string) {
  return await prisma.booking.delete({
    where: { id }
  });
}

export async function getBookingById(id: string) {
  const b = await prisma.booking.findUnique({
    where: { id },
    include: {
      show: {
        include: {
          movie: true,
          theatre: true
        }
      },
      seat: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });

  if (!b) return null;

  const rowMatch = b.seat.seatNumber.match(/^([A-Z]+)(\d+)$/);
  const row = rowMatch ? rowMatch[1] : 'A';
  const number = rowMatch ? parseInt(rowMatch[2], 10) : 1;

  return {
    id: b.id,
    status: b.status,
    isUsed: b.isUsed,
    createdAt: b.createdAt,
    userEmail: b.user.email,
    show: {
      startTime: b.show.startTime,
      theatre: {
        name: b.show.theatre.name,
        location: b.show.theatre.location
      },
      movie: {
        title: b.show.movie.title,
        imageUrl: b.show.movie.imageUrl,
        duration: b.show.movie.duration
      }
    },
    seat: {
      id: b.seat.id,
      seatNumber: b.seat.seatNumber,
      row,
      number
    },
    totalAmount: b.show.price
  };
}

export async function redeemBooking(id: string) {
  return await prisma.booking.update({
    where: { id },
    data: { isUsed: true }
  });
}
