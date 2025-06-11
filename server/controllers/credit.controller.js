import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const buyBcc = async (req, res, next) => {
  try {
    const { paymentGateway, amount, transactionId } = req.body;
    const user = req.user;

    if (!paymentGateway || !amount || !transactionId) {
      throw new CustomError(
        "Payment gateway, amount, and transaction ID are required",
        400,
      );
    }
    if (amount <= 0) {
      throw new CustomError("Amount must be greater than zero", 400);
    }
    if (!user || !user.id) {
      throw new CustomError("User Not Authenticated!", 403);
    }

    const cacheCredit = await prisma.cacheCredit.create({
      data: {
        userId: user.id,
        amount: parseInt(amount),
        creditType: "BLUE_CC",
        sourceType: "MONEY",
        paymentGateway,
        transactionId,
        validityStart: new Date(),
        validityEnd: new Date("2100-01-01"),
        isActive: false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Blue Credit purchase request submitted. Awaiting verification.",
      data: cacheCredit,
    });
  } catch (error) {
    console.error("Error in purchaseBcc Controller: ", error);
    next(error);
  }
};
