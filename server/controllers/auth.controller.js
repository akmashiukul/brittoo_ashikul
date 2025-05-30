import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { isValidRuetEmail } from "../lib/emailValidator.js";
import jwt from "jsonwebtoken";

const resend = new Resend(`${process.env.RESEND_API_KEY}`);

export const register = async (req, res, next) => {
  const { name, email, password, latitude, longitude, ip_address } = req.body;

  try {
    if (!isValidRuetEmail(email)) {
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
    const otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
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
        otp_expiry,
        otp,
        otp_sent_count: 1,
        last_otp_sent_date: new Date(),
      },
    });

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your Brittoo OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Brittoo!</h2>
          <p>Your OTP verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p><strong>Important:</strong> This code expires in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    const { password: _, otp: __, otp_expiry: ___, ...safeUser } = user;
    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to your email.",
      user: safeUser
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    if (!isValidRuetEmail(email)) {
      throw new CustomError("The Email is not a valid student mail", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.email_verified) {
      throw new CustomError("Email is already verified", 400);
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let currentOtpCount = 0;

    if (
      user.last_otp_sent_date &&
      new Date(user.last_otp_sent_date) > twentyFourHoursAgo
    ) {
      currentOtpCount = user.otp_sent_count;
    } else {
      // More than 24 hours ago
      currentOtpCount = 2;
    }

    // Check 24-hour limit (max 3 OTPs in 24 hours)
    if (currentOtpCount >= 30) {
      const timeUntilReset = user.last_otp_sent_date
        ? new Date(
            new Date(user.last_otp_sent_date).getTime() + 24 * 60 * 60 * 1000,
          )
        : new Date();

      const hoursLeft = Math.ceil((timeUntilReset - now) / (60 * 60 * 1000));

      throw new CustomError(
        `24-hour OTP limit reached. Please try again in ${hoursLeft} hour(s).`,
        429,
      );
    }

    const lastOtpTime = user.otp_expiry
      ? new Date(user.otp_expiry).getTime() - 5 * 60 * 1000
      : 0;
    const timeSinceLastOtp = Date.now() - lastOtpTime;
    const minWaitTime = 60 * 1000;

    if (timeSinceLastOtp < minWaitTime) {
      const waitTime = Math.ceil((minWaitTime - timeSinceLastOtp) / 1000);
      throw new CustomError(
        `Please wait ${waitTime} seconds before requesting a new OTP`,
        429,
      );
    }

    const newOtp = Math.floor(10000 + Math.random() * 90000).toString();
    const newOtp_expiry = new Date(Date.now() + 5 * 60 * 1000);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otp: newOtp,
        otp_expiry: newOtp_expiry,
        otp_sent_count: currentOtpCount + 1,
        last_otp_sent_date: now,
      },
    });

    await resend.emails.send({
      from: "Brittoo <verify@brittoo.xyz>",
      to: email,
      subject: "Your Brittoo OTP Code - Resent",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>OTP Resent</h2>
          <p>Your new OTP verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
            ${newOtp}
          </div>
          <p><strong>Important:</strong> This code expires in 5 minutes.</p>
          <p>Remaining OTP requests in 24 hours: ${3 - updatedUser.otp_sent_count}</p>
          <p>If you didn't request this code, please secure your account immediately.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        email,
        otp_sent_count: updatedUser.otp_sent_count,
        remainingAttempts: 3 - updatedUser.otp_sent_count,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  console.log(req.body)

  try {
    if (!email || !otp) {
      throw new CustomError("Email and OTP are required", 400);
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    if (user.email_verified) {
      throw new CustomError("Email is already verified", 400);
    }
    if (user.otp !== otp) {
      throw new CustomError("Invalid OTP", 401);
    }
    if (user.otp_expiry < new Date()) {
      throw new CustomError("OTP has expired", 401);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otp_expiry: null,
        email_verified: true,
        otp_sent_count: 0,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    const { password: _, otp: __, otp_expiry: ___, ...safeUser } = updatedUser;
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: safeUser,
      token
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
