import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";
import * as authService from "../services/authService.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.registerUser(validatedData);

    return res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getUserProfile(userId);

    return res.status(200).json(user);
  } catch (err: any) {
    next(err);
  }
};
