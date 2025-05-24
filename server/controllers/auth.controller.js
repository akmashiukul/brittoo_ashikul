import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const register = async (req, res, next) => {
  const { name, email, password, roll, latitude, longitude, ip_address } =
    req.body;
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
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const otpExpiry = Date.now();

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roll,
        latitude,
        longitude,
        ip_address,
        
      },
    });

    

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
