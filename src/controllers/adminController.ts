import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Total Revenue from CONFIRMED bookings
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      include: {
        show: true
      }
    });

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.show.price, 0);
    const totalTickets = confirmedBookings.length;

    // 2. Count Total Movies
    const totalMovies = await prisma.movie.count();

    // 3. Count Total Theatres
    const totalTheatres = await prisma.theatre.count();

    // 4. Most Popular Movie (by booking count)
    const moviesWithBookings = await prisma.movie.findMany({
      include: {
        shows: {
          include: {
            bookings: {
              where: { status: "CONFIRMED" }
            }
          }
        }
      }
    });

    let mostPopularMovie = "N/A";
    let maxBookings = 0;

    moviesWithBookings.forEach(movie => {
      let bookingCount = 0;
      movie.shows.forEach(show => {
        bookingCount += show.bookings.length;
      });

      if (bookingCount > maxBookings) {
        maxBookings = bookingCount;
        mostPopularMovie = movie.title;
      }
    });

    return res.status(200).json({
      totalRevenue,
      totalTickets,
      totalMovies,
      totalTheatres,
      mostPopularMovie
    });
  } catch (err) {
    next(err);
  }
};
