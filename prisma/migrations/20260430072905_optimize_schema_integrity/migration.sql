/*
  Warnings:

  - A unique constraint covering the columns `[theatreId,seatNumber]` on the table `Seat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_showId_idx" ON "Booking"("showId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_theatreId_seatNumber_key" ON "Seat"("theatreId", "seatNumber");
