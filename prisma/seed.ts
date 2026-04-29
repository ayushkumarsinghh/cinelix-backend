import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with premium theatrical assets...");

  // 1. Clean existing data
  await prisma.booking.deleteMany();
  await prisma.show.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theatre.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create a Default User (hashed password)
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      id: "6ac4f456-0cb1-4f32-aeb2-89a34ec1f4a2",
      email: "admin@cinelix.com",
      password: hashedPassword,
      role: "ADMIN",
      isPremium: true,
      premiumUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
  });

  // 3. Create Premium Movies with User Provided Posters and Backdrops
  const moviesData = [
    {
      title: "Dune: Part Two",
      duration: 166,
      genre: "Sci-Fi, Adventure",
      description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1HYYqIoovqLVr7DQU9tevo_bMrzQqJ7LQiVnjyK1x5BUHqrjFB_JDtftcR1Sxo1cPE0fPmg&s=10",
      backdropUrl: "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w"
    },
    {
      title: "Deadpool & Wolverine",
      duration: 127,
      genre: "Action, Comedy",
      description: "A weary Wolverine finds himself joining forces with a wisecracking Deadpool to defeat a common enemy.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFs2b42I8mdYGULACpk8zRlBMHFP_ligKNHTuYvnswpNg4rDm87RY2K74SJ-kh6Wtj9mbZiw&s=10",
      backdropUrl: "https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg",
      trailerUrl: "https://www.youtube.com/embed/73_1biulkYk"
    },
    {
      title: "The Batman",
      duration: 176,
      genre: "Action, Crime",
      description: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
      imageUrl: "https://m.media-amazon.com/images/S/pv-target-images/3de84cca07fc963b66a01a5465c2638066119711e89c707ce952555783dd4b4f.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
      trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4"
    },
    {
      title: "Oppenheimer",
      duration: 180,
      genre: "Biography, Drama",
      description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
      imageUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg"
    },
    {
      title: "Barbie",
      duration: 114,
      genre: "Comedy, Adventure",
      description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/0/0b/Barbie_2023_poster.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/nHf61UzkfFno5X1ofIhugCPus2R.jpg",
      trailerUrl: "https://www.youtube.com/embed/pBk4NYhWNMM"
    },
    {
      title: "Spider-Man: Across the Spider-Verse",
      duration: 140,
      genre: "Animation, Action",
      description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0MiAFRF0oxZO8nwPESVBei050PmIs6_46y9pPRkfWS59pFJpi",
      backdropUrl: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      trailerUrl: "https://www.youtube.com/embed/shW9i6k8cB0"
    },
    {
      title: "John Wick: Chapter 4",
      duration: 169,
      genre: "Action, Crime",
      description: "John Wick uncovers a path to defeating The High Table.",
      imageUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcS-ES3DHAOhlf9wJZwUEY1Xjm_W7DuMPaxl_8NiMKLOvwEuP5Al",
      backdropUrl: "https://image.tmdb.org/t/p/original/h8gHn0OzBoaefsYseUByqsmEDMY.jpg",
      trailerUrl: "https://www.youtube.com/embed/yjRHZEUamCc"
    },
    {
      title: "Gladiator II",
      duration: 148,
      genre: "Action, Adventure",
      description: "Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum.",
      imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRYyFenK9oC_4PqB1HBYJhi8uDwgnH81h_836fNspVj-F1yb7oj",
      backdropUrl: "https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
      trailerUrl: "https://www.youtube.com/embed/4rgYUipGJNo"
    },
    {
      title: "Avatar: The Way of Water",
      duration: 192,
      genre: "Action, Adventure",
      description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.",
      imageUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSHAILTOQDx1YgNRjFS2cOQ079UnNqeZra5KCbnSV8N-aWWt34l",
      backdropUrl: "https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      trailerUrl: "https://www.youtube.com/embed/d9MyW72ELq0"
    }
  ];

  const movies = [];
  for (const movieData of moviesData) {
    const movie = await prisma.movie.create({ data: movieData });
    movies.push(movie);
  }

  // 4. Create Theatres
  const theatresRes = [
    await prisma.theatre.create({ data: { name: "CINELIX IMAX MEGAPLEX", location: "MUMBAI, BKC" } }),
    await prisma.theatre.create({ data: { name: "CINELIX PREMIUM SUITE", location: "DELHI, VASANT KUNJ" } }),
    await prisma.theatre.create({ data: { name: "CINELIX STARLIGHT", location: "BENGALURU" } })
  ];

  // 5. Create Seats (7x10 Layout)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  for (const theatre of theatresRes) {
    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        await prisma.seat.create({
          data: {
            theatreId: theatre.id,
            seatNumber: `${row}${i}`,
          },
        });
      }
    }
  }

  // 6. Create Full Schedule
  const showTimes = [11, 15, 18, 21];
  let showCount = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    for (const theatre of theatresRes) {
      for (let j = 0; j < showTimes.length; j++) {
        const hour = showTimes[j];
        const movieIdx = (i + j + theatresRes.indexOf(theatre)) % movies.length;
        
        await prisma.show.create({
          data: {
            movieId: movies[movieIdx].id,
            theatreId: theatre.id,
            startTime: new Date(new Date(date).setHours(hour, 0, 0, 0)),
            price: hour >= 18 ? 450 : 300,
          },
        });
        showCount++;
      }
    }
  }

  console.log(`Successfully seeded ${movies.length} movies and ${showCount} shows.`);
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
