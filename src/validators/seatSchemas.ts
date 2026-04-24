import { z } from "zod";

export const lockSeatSchema = z.object({
  showId: z.string().uuid(),
  seatId: z.string(), // Can be string like "A1", "A2"
});
