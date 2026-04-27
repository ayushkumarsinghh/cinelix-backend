import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import seatRoutes from "./routes/seatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import prisma from "./lib/prisma.js";
import redis from "./lib/redis.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// Environment validation
const requiredEnv = ["DATABASE_URL", "JWT_SECRET", "REDIS_URL"];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`CRITICAL: Missing environment variable ${env}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Cinelix Backend is running" });
});

// Error Handler (Must be last)
app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    // Database check
    await prisma.$connect();
    console.log(`Database: Connected to PostgreSQL`);

    // Redis check
    await redis.ping();
    console.log(`Redis: Connected and Responsive`);

    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Critical connection error during startup:", error);
    process.exit(1);
  }
});
