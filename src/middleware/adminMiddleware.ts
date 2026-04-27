import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";
import { ApiError } from "./errorMiddleware.js";

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user as any).role !== "ADMIN") {
    return next(new ApiError(403, "Forbidden. Admin access required."));
  }
  next();
};
