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
  const moviesData = [
    {
      title: "Dune: Part Two",
      duration: 166,
      genre: "Sci-Fi, Adventure",
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
      imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=2070",
      trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w"
    },
    {
      title: "Oppenheimer",
      duration: 180,
      genre: "Biography, Drama",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070",
      trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg"
    },
    {
      title: "Joker: Folie à Deux",
      duration: 138,
      genre: "Crime, Drama, Musical",
      description: "Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital.",
      imageUrl: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=2070",
      trailerUrl: "https://www.youtube.com/embed/xy8aJw1vYHo"
    },
    {
      title: "The Batman",
      duration: 176,
      genre: "Action, Crime, Drama",
      description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
      imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070",
      trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4"
    },
    {
      title: "Gladiator II",
      duration: 148,
      genre: "Action, Adventure, Drama",
      description: "Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum after his home is conquered.",
      imageUrl: "https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=2070",
      trailerUrl: "https://www.youtube.com/embed/4rgYUipGJNo"
    }
  ];

  const movies = [];
  for (const movieData of moviesData) {
    const movie = await prisma.movie.create({ data: movieData });
    movies.push(movie);
  }

  // 4. Create a Theatre
  const theatre = await prisma.theatre.create({
    data: { name: "IMAX Megaplex", location: "Mumbai, BKC" },
  });

  // 5. Create Seats (10 Columns, Block Layout)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const columns = 10;

  for (const row of rows) {
    for (let i = 1; i <= columns; i++) {
      await prisma.seat.create({
        data: {
          theatreId: theatre.id,
          seatNumber: `${row}${i}`,
        },
      });
    }
  }

  // 6. Create Shows
  const show1 = await prisma.show.create({
    data: {
      movieId: movies[0].id,
      theatreId: theatre.id,
      startTime: new Date(new Date().setHours(18, 0, 0, 0)), // 6:00 PM Today
    },
  });

  const show2 = await prisma.show.create({
    data: {
      movieId: movies[1].id,
      theatreId: theatre.id,
      startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours later
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
