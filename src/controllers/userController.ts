import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../middleware/errorMiddleware.js';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isPremium: true,
      premiumUntil: true,
      walletBalance: true,
      createdAt: true,
      _count: {
        select: { bookings: true }
      }
    } as any
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(user);
};

export const updatePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid current password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return res.status(200).json({ message: "Password updated successfully" });
};

export const cancelMembership = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isPremium: false,
      premiumUntil: null
    }
  });

  return res.status(200).json({ message: "Membership cancelled successfully" });
};
