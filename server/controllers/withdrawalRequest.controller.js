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
    if (parseInt(withdrawalAmount) <= 0) {
      throw new CustomError("Amount must be greater than zero", 400);
    }
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.bccWallet.findUnique({
        where: { userId, id: walletId, deletedAt: null },
      });
      if (!wallet) {
        throw new CustomError("User wallet not found", 404);
      }
      if (parseInt(withdrawalAmount) > wallet.availableBalance) {
        throw new CustomError("Not enough available balance", 400);
      }
      const [withdrawalRequest, updatedWallet] = await Promise.all([
        tx.withdrawalRequest.create({
          data: {
            userId,
            walletId,
            withdrawalAmount: parseInt(withdrawalAmount),
            paymentGateway,
            phoneNumber: "+880" + phoneNumber,
          },
        }),
        tx.bccWallet.update({
          where: { id: wallet.id, deletedAt: null, userId },
          data: {
            requestedForWithdrawal: { increment: parseInt(withdrawalAmount) },
            availableBalance: { decrement: parseInt(withdrawalAmount) },
          },
        }),
      ]);
      return { withdrawalRequest, updatedWallet };
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request placed successfully. Waiting for approval.",
      data: {
        updatedWallet: result.updatedWallet,
        withdrawalRequest: result.withdrawalRequest,
      },
    });
  } catch (error) {
    console.error("Error in createWithdrawalRequest controller: ", error);
    next(error);
  }
};

export const getMyWithdrawalRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      throw new CustomError("User id not provided", 400);
    }
    const usersWithdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: {
        userId,
      },
      include: {
        wallet: true,
      },
    });
    res.status(201).json({
      success: true,
      message: "Withdrawal requests fetched successfully",
      data: usersWithdrawalRequests,
    });
  } catch (error) {
    console.error("Error in getUsersWithdrawalRequests controller: ", error);
    next(error);
  }
};

export const getAllWithdrawalRequests = async (req, res, next) => {
  try {
    const { page = "1", limit = "10", status, phoneNumber } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (phoneNumber) where.phoneNumber = { contains: phoneNumber };

    const [withdrawalRequests, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { name: true, email: true } },
          wallet: true,
          bccTransaction: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.withdrawalRequest.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      message: "Withdrawal requests fetched successfully",
      data: withdrawalRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error in getUsersWithdrawalRequests controller: ", error);
    next(error);
  }
};
