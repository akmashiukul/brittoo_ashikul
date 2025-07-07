import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

export const buyBcc = async (req, res, next) => {
  try {
    const { paymentGateway, amount, transactionId, trxNo } = req.body;
    const user = req.user;

    if (!paymentGateway || !amount || !transactionId || !trxNo) {
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

    let wallet = await prisma.bccWallet.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!wallet) {
      wallet = await prisma.bccWallet.create({
        data: {
          userId: user.id,
          totalBalance: 0,
          lockedBalance: 0,
        },
      });
    }
    const bccTransaction = await prisma.bccTransaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        amount: parseInt(amount),
        paymentGateway,
        transactionId,
        numberUsedInTrx: trxNo,
        transactionType: "PURCHASE",
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Blue Cache Credit purchase request submitted. Awaiting verification.",
      data: bccTransaction,
    });
  } catch (error) {
    console.error("Error in purchaseBcc Controller: ", error);
    next(error);
  }
};

export const getPendingCreditRequests = async (req, res, next) => {
  try {
    const pendingCredits = await prisma.bccTransaction.findMany({
      where: {
        status: "PENDING",
        transactionType: "PURCHASE",
        deletedAt: null,
      },
      include: {
        user: {
          select: safeAuthUserSelect,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully Fetched Pending Credits",
      data: pendingCredits,
      count: pendingCredits.length,
    });
  } catch (error) {
    console.error("Error fetching pending credit requests:", error);
    next(error);
  }
};

export const acceptBCCRequest = async (req, res, next) => {
  try {
    const { creditId } = req.params;
    if (!creditId) {
      throw new CustomError("Credit ID is required", 400);
    }
    const existingCredit = await prisma.bccTransaction.findUnique({
      where: {
        id: creditId,
        deletedAt: null,
      },
      include: {
        wallet: true,
      },
    });
    if (!existingCredit) {
      throw new CustomError("Credit request not found", 404);
    }
    if (existingCredit.status !== "PENDING") {
      throw new CustomError("Only pending requests can be accepted", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.bccTransaction.update({
        where: { id: creditId },
        data: {
          status: "ACCEPTED",
          updatedAt: new Date(),
        },
      });
      await tx.bccWallet.update({
        where: { id: existingCredit.walletId },
        data: {
          totalBalance: {
            increment: existingCredit.amount,
          },
        },
      });
    });

    // TODO: Send notification to user
    res.status(200).json({
      success: true,
      message: "Credit request accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting credit request:", error);
    next(error);
  }
};

export const rejectBCCRequest = async (req, res, next) => {
  try {
    const { creditId } = req.params;
    const { rejectReason, refundTrxId } = req.body;

    const existingCredit = await prisma.bccTransaction.findUnique({
      where: { id: creditId, deletedAt: null },
    });
    if (!existingCredit) {
      throw new CustomError("Credit request not found", 404);
    }
    if (existingCredit.status === "ACCEPTED") {
      throw new CustomError(
        "Cannot reject an already accepted credit request",
        400,
      );
    }
    if (existingCredit.status === "REJECTED") {
      throw new CustomError("Credit request is already rejected", 400);
    }
    await prisma.bccTransaction.update({
      where: { id: creditId },
      data: {
        status: "REJECTED",
        rejectReason: rejectReason,
        refundTrxId,
        updatedAt: new Date(),
      },
    });

    // TODO: Send notification to user about rejection
    res.status(200).json({
      success: true,
      message: "Credit request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting credit request:", error);
    next(error);
  }
};

export const getUsersAvailableBcc = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const wallet = await prisma.bccWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return res.status(200).json({
        success: true,
        isWalletPresent: false,
        message: "User wallet not found",
        data: {
          totalBalance: 0,
          availableBalance: 0,
          lockedBalance: 0,
        },
      });
    }

    res.status(200).json({
      success: true,
      isWalletPresent: true,
      message: "Successfully fetched user's BCC wallet balance",
      data: wallet,
    });
  } catch (error) {
    console.error("Error in getUsersAvailableBcc controller:", error);
    next(error);
  }
};
