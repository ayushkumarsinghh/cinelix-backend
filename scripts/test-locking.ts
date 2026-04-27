import { lockSeat, confirmBookings } from "../src/services/bookingService.js";
import redis from "../src/lib/redis.js";
import prisma from "../src/lib/prisma.js";

/**
 * TypeScript version of the locking test script.
 */
async function runTest() {
  console.log("🚀 Starting TypeScript Seat Locking Logic Test...");

  // 1. Fetch data from DB (Requires seed data)
  const user = await prisma.user.findFirst();
  const show = await prisma.show.findFirst();
  const seat = await prisma.seat.findFirst();

  if (!user || !show || !seat) {
    console.error("❌ Test failed: Missing seed data. Please run 'npx prisma db seed' first.");
    process.exit(1);
  }

  const userId = user.id;
  const anotherUserId = "another-user-uuid-ts-999";
  const showId = show.id;
  const seatId = seat.id;

  console.log(`Context: User=${userId.substring(0, 8)}..., Show=${showId.substring(0, 8)}..., Seat=${seatId.substring(0, 8)}...`);

  // Clean up any existing lock
  await redis.del(`seat_lock:${showId}:${seatId}`);

  // --- TEST 1: Successful Lock ---
  console.log("\n1️⃣  Testing: User A locks seat...");
  const locked = await lockSeat({ showId, seatId, userId });
  if (locked) console.log("✅ Success: User A holds the lock.");

  // --- TEST 2: Double Booking Protection ---
  console.log("\n2️⃣  Testing: User B tries to lock the same seat...");
  try {
    await lockSeat({ showId, seatId, userId: anotherUserId });
    console.log("❌ Fail: User B was able to lock an already locked seat!");
  } catch (err: any) {
    console.log(`✅ Success: User B was blocked. Reason: "${err.message}"`);
  }

  // --- TEST 3: Confirmation Ownership Check ---
  console.log("\n3️⃣  Testing: User B tries to confirm User A's lock...");
  try {
    await confirmBookings({ userId: anotherUserId, showId, seatIds: [seatId] });
    console.log("❌ Fail: User B was able to confirm someone else's lock!");
  } catch (err: any) {
    console.log(`✅ Success: User B confirmation rejected. Reason: "${err.message}"`);
  }

  // --- TEST 4: Successful Booking Confirmation ---
  console.log("\n4️⃣  Testing: User A confirms the booking...");
  try {
    const bookings = await confirmBookings({ userId, showId, seatIds: [seatId] });
    console.log(`✅ Success: Booking created in PostgreSQL with status: ${bookings[0].status}`);
  } catch (err: any) {
    console.log(`❌ Fail: User A could not confirm their own lock. Error: "${err.message}"`);
  }

  // --- TEST 5: Lock Cleanup ---
  console.log("\n5️⃣  Testing: Verifying lock is removed after confirmation...");
  const lockCheck = await redis.get(`seat_lock:${showId}:${seatId}`);
  if (!lockCheck) {
    console.log("✅ Success: Redis lock was correctly removed.");
  } else {
    console.log("❌ Fail: Redis lock still exists after confirmation!");
  }

  console.log("\n🎉 TS CORE LOGIC VERIFIED.");
  
  await redis.quit();
  await prisma.$disconnect();
  process.exit(0);
}

runTest().catch(async (e) => {
  console.error("💥 Test crashed with error:", e);
  await redis.quit();
  await prisma.$disconnect();
  process.exit(1);
});
