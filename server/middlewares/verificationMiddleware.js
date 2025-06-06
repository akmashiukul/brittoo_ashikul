import { CustomError } from "../lib/customError.js";

export const verificationMiddleware = (req, res, next) => {
  try {
    if(req.user?.isVerified !== "VERIFIED") {
      throw new CustomError("Access denied, verified user only", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
}