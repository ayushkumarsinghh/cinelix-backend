import prisma from "../lib/prisma.js";

export const getAllMovies = async () => {
  return await prisma.movie.findMany({
    orderBy: { createdAt: "desc" }
  });
};

export const getMovieShows = async (movieId: string) => {
  return await prisma.show.findMany({
    where: { movieId },
    include: {
      theatre: true
    },
    orderBy: { startTime: "asc" }
  });
};

export const getMovieById = async (id: string) => {
  return await prisma.movie.findUnique({
    where: { id }
  });
};
