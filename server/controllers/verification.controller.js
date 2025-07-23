import prisma from "../config/prisma.js";
import jwt from 'jsonwebtoken';
import { CustomError } from "../lib/customError.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const verifyUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new CustomError("Email is required", 400);
    }

    if (!req.files || !req.files.idCard || !req.files.selfie) {
      throw new CustomError("Both ID card and selfie images are required", 400);
    }

    const idCardFile = req.files.idCard[0];
    const selfieFile = req.files.selfie[0];

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.isVerified === "VERIFIED") {
      throw new CustomError("User is already verified", 400);
    }

    if (user.isVerified === "PENDING") {
      throw new CustomError("You have already requested for verification", 400);
    }
    // Delete old images from Cloudinary if they exist
    if (user.idCardFront && user.idCardFront !== "absent") {
      const publicId = user.idCardFront.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted ID card from Cloudinary: ${publicId}`);
      } catch (err) {
        console.error(`Error deleting ID card ${publicId}:`, err);
      }
    }

    if (user.selfie && user.selfie !== "absent") {
      const publicId = user.selfie.split("/").slice(-2).join("/").split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted selfie from Cloudinary: ${publicId}`);
      } catch (err) {
        console.error(`Error deleting selfie ${publicId}:`, err);
      }
    }

    // Upload new images to Cloudinary
    const idCardUrl = await uploadToCloudinary(idCardFile);
    const selfieUrl = await uploadToCloudinary(selfieFile);

    if (!idCardUrl || !selfieUrl) {
      throw new CustomError("Failed to upload one or more images", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        idCardFront: idCardUrl,
        selfie: selfieUrl,
        isVerified: "PENDING",
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: updatedUser.isVerified,
        isSuspended: user.isSuspended,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10d" },
    );

    const { password: _, otp: __, otpExpiry: ___, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      user: safeUser,
      token,
      message: "Verification documents uploaded successfully. Your submission is now under review.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB per file.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};