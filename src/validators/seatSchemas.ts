import { z } from "zod";

export const lockSeatSchema = z.object({
  showId: z.string().uuid(),
  seatIds: z.array(z.string()),
});
