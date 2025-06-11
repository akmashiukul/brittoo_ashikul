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
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sourceProduct: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully Fetched Pending Credits",
      data: pendingCredits,
      count: pendingCredits.length
    });
  } catch (error) {
    console.error('Error fetching pending credit requests:', error);
    next(error);
  }
};

// Search credit request by transaction ID
const searchCreditByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const creditRequest = await prisma.cacheCredit.findFirst({
      where: {
        transactionId: {
          contains: transactionId,
          mode: 'insensitive'
        },
        isActive: false,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        sourceProduct: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!creditRequest) {
      return res.status(404).json({
        success: false,
        message: 'Credit request not found with this transaction ID'
      });
    }

    res.status(200).json({
      success: true,
      data: creditRequest
    });
  } catch (error) {
    console.error('Error searching credit request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search credit request',
      error: error.message
    });
  }
};

export const acceptCreditRequest = async (req, res) => {
  try {
    const { creditId } = req.params;
    const { adminId } = req.body; // Assuming admin info is passed

    if (!creditId) {
      return res.status(400).json({
        success: false,
        message: 'Credit ID is required'
      });
    }

    // Check if credit request exists and is pending
    const existingCredit = await prisma.cacheCredit.findUnique({
      where: { id: creditId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!existingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Credit request not found'
      });
    }

    if (existingCredit.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Credit request is already accepted'
      });
    }

    if (existingCredit.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Credit request has been rejected'
      });
    }

    // Update credit request to active
    const updatedCredit = await prisma.cacheCredit.update({
      where: { id: creditId },
      data: {
        isActive: true,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // TODO: Log the admin action
    // await prisma.adminLog.create({
    //   data: {
    //     adminId: adminId,
    //     action: 'ACCEPT_CREDIT_REQUEST',
    //     targetId: creditId,
    //     targetType: 'CACHE_CREDIT',
    //     details: `Accepted credit request for user ${existingCredit.user.email}`
    //   }
    // });

    // TODO: Send notification to user
    // await sendCreditApprovalNotification(existingCredit.user);

    res.status(200).json({
      success: true,
      message: 'Credit request accepted successfully',
      data: updatedCredit
    });
  } catch (error) {
    console.error('Error accepting credit request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept credit request',
      error: error.message
    });
  }
};

// Reject credit request
const rejectCreditRequest = async (req, res) => {
  try {
    const { creditId } = req.params;
    const { adminId, reason } = req.body; // Assuming admin info and reason are passed

    if (!creditId) {
      return res.status(400).json({
        success: false,
        message: 'Credit ID is required'
      });
    }

    // Check if credit request exists and is pending
    const existingCredit = await prisma.cacheCredit.findUnique({
      where: { id: creditId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!existingCredit) {
      return res.status(404).json({
        success: false,
        message: 'Credit request not found'
      });
    }

    if (existingCredit.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already accepted credit request'
      });
    }

    if (existingCredit.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Credit request is already rejected'
      });
    }

    // Soft delete the credit request (mark as rejected)
    const rejectedCredit = await prisma.cacheCredit.update({
      where: { id: creditId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Optional: Log the admin action
    // await prisma.adminLog.create({
    //   data: {
    //     adminId: adminId,
    //     action: 'REJECT_CREDIT_REQUEST',
    //     targetId: creditId,
    //     targetType: 'CACHE_CREDIT',
    //     details: `Rejected credit request for user ${existingCredit.user.email}. Reason: ${reason || 'No reason provided'}`
    //   }
    // });

    // Optional: Send notification to user about rejection
    // await sendCreditRejectionNotification(existingCredit.user, reason);

    res.status(200).json({
      success: true,
      message: 'Credit request rejected successfully',
      data: {
        id: rejectedCredit.id,
        rejectedAt: rejectedCredit.deletedAt
      }
    });
  } catch (error) {
    console.error('Error rejecting credit request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject credit request',
      error: error.message
    });
  }
};