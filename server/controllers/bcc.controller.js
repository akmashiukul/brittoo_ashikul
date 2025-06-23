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

    const blueCacheCredit = await prisma.blueCacheCredit.create({
      data: {
        userId: user.id,
        amount: parseInt(amount),
        paymentGateway,
        transactionId,
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
    if (existingCredit.deletedAt) {
      throw new CustomError("Credit request has been rejected", 401);
    }
    await prisma.blueCacheCredit.update({
      where: { id: creditId, isRejected: false },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    // TODO: Send notification to user
    // await sendCreditApprovalNotification(existingCredit.user);
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
    if (!creditId) {
      throw new CustomError("CreditId required!", 400);
    }
    const existingCredit = await prisma.blueCacheCredit.findUnique({
      where: { id: creditId },
    });
    if (!existingCredit) {
      throw new CustomError("Credit request not found", 401);
    }
    if (existingCredit.isActive) {
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
        isRejected: true,
        rejectReason: rejectReason,
        refundTrxIds: updatedRefundTrxArr,
      },
    });
    // TODO:
    // Send notification to user about rejection
    res.status(200).json({
      success: true,
      message: "Credit request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting credit request:", error);
    next(error);
  }
};
