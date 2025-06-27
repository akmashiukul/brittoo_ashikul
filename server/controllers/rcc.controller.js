import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { userSafeSelect } from "../lib/prismaSelects.js";

export const getUserInactiveRcc = async (req, res, next) => {
  try {
    
  } catch (error) {
    console.error("Error in geUserInactiveRcc controller: ", error);
    next(error);
  }
}