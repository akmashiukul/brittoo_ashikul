import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

export const createWithdrawalRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { walletId, withdrawalAmount, paymentGateway, phoneNumber } =
      req.body;
    if (
      !userId ||
      !walletId ||
      !withdrawalAmount ||
      !paymentGateway ||
      !phoneNumber
    ) {
      throw new CustomError(
        "Missing Fields. Please provide all the fields",
        400,
      );
    }
    if (withdrawalAmount <= 0) {
      throw new CustomError("Amount must be greater than zero", 400);
    }
    const wallet = await prisma.bccWallet.findUnique({
      where: {
        userId: user.id,
        id: walletId,
        deletedAt: null,
      },
    });
    if (!wallet) {
      throw new CustomError("User wallet not found", 404);
    }
    if (withdrawalAmount > wallet.availableBalance) {
      throw new CustomError("Not enough available balance", 400);
    }
    const [withdrawalRequest] = await Promise.all([
      prisma.withdrawalRequest.create({
        data: {
          userId,
          walletId,
          withdrawalAmount,
          paymentGateway,
          phoneNumber,
        },
      }),
      prisma.bccWallet.update({
        where: {
          id: wallet.id,
          deletedAt: null,
          userId,
        },
        data: {
          requestedForWithdrawal: {
            increment: withdrawalAmount,
          },
          availableBalance: {
            decrement: withdrawalAmount,
          },
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Withdrawal request placed successfully. Waiting for approval.",
      data: withdrawalRequest,
    });
  } catch (error) {
    console.error("Error in createWithdrawalRequest controller: ", error);
    next(error);
  }
};
