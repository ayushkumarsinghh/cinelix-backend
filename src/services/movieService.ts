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

export const createMovie = async (data: any) => {
  return await prisma.movie.create({
    data: {
      title: data.title,
      duration: parseInt(data.duration),
      genre: data.genre,
      description: data.description,
      imageUrl: data.imageUrl,
      trailerUrl: data.trailerUrl
    }
  });
};

export const deleteMovie = async (id: string) => {
  return await prisma.movie.delete({
    where: { id }
  });
};

export const updateMovie = async (id: string, data: any) => {
  return await prisma.movie.update({
    where: { id },
    data: {
      title: data.title,
      duration: data.duration ? parseInt(data.duration) : undefined,
      genre: data.genre,
      description: data.description,
      imageUrl: data.imageUrl,
      trailerUrl: data.trailerUrl
    }
  });
};
