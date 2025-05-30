import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { uploadsDirPath } from "../middlewares/uploadMiddleware.js";


export const verifyUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!req.files || !req.files.idCard || !req.files.selfie) {
      return res.status(400).json({ success: false, message: "Both ID card and selfie images are required" });
    }

    const idCardFile = req.files.idCard[0];
    const selfieFile = req.files.selfie[0];

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      fs.unlinkSync(idCardFile.path);
      fs.unlinkSync(selfieFile.path);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.is_verified === "VERIFIED") {
      fs.unlinkSync(idCardFile.path);
      fs.unlinkSync(selfieFile.path);
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if (user.id_card_front && user.id_card_front !== "absent") {
      const oldIdCardPath = path.join(uploadsDirPath, user.id_card_front);
      if (fs.existsSync(oldIdCardPath)) fs.unlinkSync(oldIdCardPath);
    }

    if (user.selfie && user.selfie !== "absent") {
      const oldSelfiePath = path.join(uploadsDirPath, user.selfie);
      if (fs.existsSync(oldSelfiePath)) fs.unlinkSync(oldSelfiePath);
    }

    await prisma.user.update({
      where: { email },
      data: {
        id_card_front: idCardFile.filename,
        selfie: selfieFile.filename,
        is_verified: "PENDING",
      },
    });

    res.status(200).json({
      success: true,
      message: "Verification documents uploaded successfully. Your submission is now under review.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    if (req.files) {
      ["idCard", "selfie"].forEach((field) => {
        if (req.files[field]) {
          req.files[field].forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
      });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File size too large. Maximum size is 5MB per file." });
    }
    res.status(500).json({ success: false, message: "Internal server error. Please try again later." });
  }
};