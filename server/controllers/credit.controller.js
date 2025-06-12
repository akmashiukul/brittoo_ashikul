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

export const getPendingCreditRequests = async (req, res, next) => {
  try {
    const pendingCredits = await prisma.cacheCredit.findMany({
      where: {
        isActive: false,
        deletedAt: null,
        isRejected: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sourceProduct: {
          select: {
            id: true,
            name: true,
          },
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

export const acceptCreditRequest = async (req, res) => {
  try {
    const { creditId } = req.params;

    if (!creditId) {
      return res.status(400).json({
        success: false,
        message: "Credit ID is required",
      });
    }
    const existingCredit = await prisma.cacheCredit.findUnique({
      where: { id: creditId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingCredit) {
      return res.status(404).json({
        success: false,
        message: "Credit request not found",
      });
    }

    if (existingCredit.isActive) {
      return res.status(400).json({
        success: false,
        message: "Credit request is already accepted",
      });
    }

    if (existingCredit.deletedAt) {
      return res.status(400).json({
        success: false,
        message: "Credit request has been rejected",
      });
    }

    const updatedCredit = await prisma.cacheCredit.update({
      where: { id: creditId, isRejected: false },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notification to user
    // await sendCreditApprovalNotification(existingCredit.user);

    res.status(200).json({
      success: true,
      message: "Credit request accepted successfully",
      data: updatedCredit,
    });
  } catch (error) {
    console.error("Error accepting credit request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept credit request",
      error: error.message,
    });
  }
};

export const rejectCreditRequest = async (req, res, next) => {
  try {
    const { creditId } = req.params;
    const { rejectReason } = req.body;
    if (!creditId) {
      throw new CustomError("CreditId required!", 400);
    }
    const existingCredit = await prisma.cacheCredit.findUnique({
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

    const rejectedCredit = await prisma.cacheCredit.update({
      where: { id: creditId },
      data: {
        isRejected: true,
        rejectReason: rejectReason,
      },
    });

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
