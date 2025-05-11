import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import bcrypt from "bcryptjs";

export const register = async (req, res, next) => {
  const {
    name,
    email,
    password,
    roll,
    latitude,
    longitude,
    selfie,
    id_card_photo,
    ip_address
  } = req.body;
  try {
    let user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      throw new CustomError("User already exists!", 401);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roll,
        latitude,
        longitude,
        selfie,
        id_card_photo,
        ip_address,
      },
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        data: user,
      });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
