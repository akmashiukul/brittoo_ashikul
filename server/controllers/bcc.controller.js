import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { userSafeSelect } from "../lib/prismaSelects.js";

export const buyBcc = async (req, res, next) => {
  try {
    const { paymentGateway, amount, transactionId, trxNo } = req.body;
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

    const blueCacheCredit = await prisma.blueCacheCredit.create({
      data: {
        userId: user.id,
        amount: parseInt(amount),
        paymentGateway,
        transactionId,
        trxNo
      },
    });

    res.status(201).json({
      success: true,
      message: "Blue Credit purchase request submitted. Awaiting verification.",
      data: blueCacheCredit,
    });
  } catch (error) {
    console.error("Error in purchaseBcc Controller: ", error);
    next(error);
  }
};

export const getPendingCreditRequests = async (req, res, next) => {
  try {
    const pendingCredits = await prisma.blueCacheCredit.findMany({
      where: {
        status: "PENDING",
        deletedAt: null,
      },
      include: {
        user: {
          select: userSafeSelect,
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
    const existingCredit = await prisma.blueCacheCredit.findUnique({
      where: {
        id: creditId,
        deletedAt: null,
      },
    });
    if (!existingCredit) {
      throw new CustomError("Credit request not found", 404);
    }
    await prisma.blueCacheCredit.update({
      where: { id: creditId },
      data: {
        status: "ACCEPTED",
        updatedAt: new Date(),
      },
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
    const existingCredit = await prisma.blueCacheCredit.findUnique({
      where: { id: creditId },
    });
    if (!existingCredit) {
      throw new CustomError("Credit request not found", 401);
    }
    if (existingCredit.status === "ACCEPTED") {
      throw new CustomError(
        "Cannot reject an already accepted credit request",
        400,
      );
    }
    if (existingCredit.deletedAt) {
      throw new CustomError("Credit request is already rejected", 400);
    }

    const updatedRefundTrxArr = [...existingCredit.refundTrxIds, refundTrxId];

    await prisma.blueCacheCredit.update({
      where: { id: creditId },
      data: {
        status: "REJECTED",
        rejectReason: rejectReason,
        refundTrxIds: updatedRefundTrxArr,
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
    const result = await prisma.blueCacheCredit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        status: 'ACCEPTED',
        deletedAt: null
      }
    });

    const totalBcc = result._sum.amount ?? 0;

    res.status(200).json({
      success: true,
      message: "Successfully fetched accumulated Blue Cache Credits",
      data: totalBcc,
    });
  } catch (error) {
    console.error("Error in getUsersAvailableBcc controller:", error);
    next(error);
  }
}