import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const adminMiddleware = (req, res, next) => {
  try {
    if(req.user?.role !== "ADMIN") {
      throw new CustomError("Access denied, Admin only", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
}