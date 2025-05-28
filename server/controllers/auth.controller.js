import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { isValidRuetEmail } from "../lib/emailValidator.js";

const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const register = async (req, res, next) => {
  const { name, email, password, latitude, longitude, ip_address } =
    req.body;
  try {
    if(!isValidRuetEmail(email)) {
      throw new CustomError("The Email is not a valid student mail", 401);
    }
    let user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      throw new CustomError("User already exists!", 401);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const roll = email.split("@")[0];

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roll,
        latitude,
        longitude,
        ip_address,
        otpExpiry,
        otp,
      },
    });

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your Brittoo OTP Code",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = user;
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
