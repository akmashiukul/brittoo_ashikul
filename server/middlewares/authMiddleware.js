import jwt from 'jsonwebtoken';
import { CustomError } from '../lib/customError.js';
import prisma from "../config/prisma.js";
import { safeAuthUserSelect } from '../lib/prismaSelects.js';

export const verifyToken = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    return next(new CustomError("Authorization token missing", 401, "NO_TOKEN_PROVIDED"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: decoded.id,
        deletedAt: null,
      },
      select: safeAuthUserSelect,
    });
    if (!loggedInUser) {
      return next(new CustomError("Access denied or user not found", 403, "USER_VERIFICATION_ERROR"));
    }
    req.user = loggedInUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new CustomError("Token expired", 401, "TOKEN_EXPIRED, Please Log In again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new CustomError("Invalid token", 401, "INVALID_TOKEN, Please Log In again."));
    }
    console.error("Unexpected error in token verification:", error);
    next(error);
  }
};
