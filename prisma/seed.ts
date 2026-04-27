import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.booking.deleteMany();
  await prisma.show.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theatre.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create a Default User (hashed password)
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      id: "6ac4f456-0cb1-4f32-aeb2-89a34ec1f4a2", // Fixed ID
      email: "admin@cinelix.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 3. Create Movies
  const movie1 = await prisma.movie.create({
    data: { 
      title: "Dune: Part Two", 
      duration: 166,
      genre: "Sci-Fi, Adventure",
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop"
    },
  });
  const movie2 = await prisma.movie.create({
    data: { 
      title: "Oppenheimer", 
      duration: 180,
      genre: "Biography, Drama, History",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop"
    },
  });

  // 4. Create a Theatre
  const theatre = await prisma.theatre.create({
    data: { name: "IMAX Megaplex", location: "Mumbai, BKC" },
  });

  // 5. Create Seats (A1 to A10)
  const seats = [];
  for (let i = 1; i <= 10; i++) {
    const seat = await prisma.seat.create({
      data: {
        theatreId: theatre.id,
        seatNumber: `A${i}`,
      },
    });
    seats.push(seat);
  }

  // 6. Create Shows (Today & Tomorrow)
  const show1 = await prisma.show.create({
    data: {
      movieId: movie1.id,
      theatreId: theatre.id,
      startTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM Today
    },
  });

  const show2 = await prisma.show.create({
    data: {
      movieId: movie2.id,
      theatreId: theatre.id,
      startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours later
    },
  });

  console.log("Seeding complete!");
  console.log({
    userEmail: user.email,
    movies: [movie1.title, movie2.title],
    theatre: theatre.name,
    seatsCreated: seats.length,
    showsCreated: 2,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
