import jwt from 'jsonwebtoken';
import { CustomError } from '../lib/customError.js';

export const verifyToken = (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if(authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if(!token) {
    throw new CustomError("BAD REQUEST", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("error in token verfication: ", error)
    next(error);
  }
}