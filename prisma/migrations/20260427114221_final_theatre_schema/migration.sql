-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "description" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 250.0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
