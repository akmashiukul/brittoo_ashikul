import { CustomError } from "../lib/customError.js";

export const verificationMiddleware = (req, res, next) => {
  try {
    if(req.user?.isVerified !== "VERIFIED") {
      throw new CustomError("Access denied! Only verified users can perform this operation", 403);
    }
    next();
  } catch (error) {
    next(error);
  }
}