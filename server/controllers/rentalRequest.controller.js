import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const createRentalRequest = async (req, res, next) => {
  try {
    const {
      productId,
      requesterId,
      ownerId,
      rentalStartDate,
      rentalEndDate,
      totalDays,
      renterCollectionMethod,
      renterPhoneNumber,
      deliveryAddress,
      pickupPoint,
      paidWithBcc,
      bccWalletId,
      usedBccAmount,
      paidWithRcc,
      usedRccData = [],
    } = req.body;

    if (!productId || !requesterId || !ownerId) {
      throw new CustomError("Missing required IDs", 400);
    }
    if (paidWithBcc && !bccWalletId) {
      throw new CustomError("Missing Bcc Wallet Id", 400);
    }
    if (!rentalStartDate || !rentalEndDate || !totalDays) {
      throw new CustomError("Missing rental period info", 400);
    }
    if (
      !renterCollectionMethod ||
      !renterPhoneNumber ||
      renterPhoneNumber.trim() === ""
    ) {
      throw new CustomError(
        "Missing collection method or valid phone number",
        400,
      );
    }
    if (renterCollectionMethod === "HOME" && !deliveryAddress) {
      throw new CustomError("Delivery address required for home delivery", 400);
    }
    if (renterCollectionMethod === "BRITTOO_TERMINAL" && !pickupPoint) {
      throw new CustomError("Pickup point required for terminal pickup", 400);
    }

    // Date validation
    const now = new Date();
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);

    if (startDate <= now) {
      throw new CustomError("Rental start date must be in the future", 400);
    }
    if (endDate <= startDate) {
      throw new CustomError("Rental end date must be after start date", 400);
    }

    // Product validation
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { owner: true },
    });
    if (!product) {
      throw new CustomError("Product not found", 404);
    }
    if (product.isRented) {
      throw new CustomError("Product is already rented", 400);
    }
    if (product.isOnHold) {
      throw new CustomError("Product is currently on hold", 400);
    }
    if (requesterId === ownerId) {
      throw new CustomError("Cannot rent your own product", 400);
    }

    // Check for existing pending request
    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        productId,
        requesterId,
        status: "REQUESTED_BY_RENTER",
      },
    });
    if (existingRequest) {
      throw new CustomError(
        "You already have a pending request for this product",
        400,
      );
    }

    // Validate Bcc
    if (paidWithBcc) {
      const bccWallet = await prisma.bccWallet.findUnique({
        where: { id: bccWalletId },
      });
      if (!bccWallet) {
        throw new CustomError("BCC Wallet not found", 404);
      }
      if (bccWallet.userId !== requesterId) {
        throw new CustomError("BCC Wallet does not belong to requester", 403);
      }
      const availableBalance = bccWallet.availableBalance;
      if (availableBalance < usedBccAmount) {
        throw new CustomError("Insufficient BCC balance", 400);
      }
    }

    // Validate Rcc
    if (paidWithRcc && usedRccData.length > 0) {
      const rccIds = usedRccData.map((item) => item.rccId);
      const rccCredits = await prisma.redCacheCredit.findMany({
        where: {
          id: { in: rccIds },
          userId: requesterId,
        },
      });
      if (rccCredits.length !== rccIds.length) {
        throw new CustomError(
          "Some RCC credits not found or don't belong to requester",
          400,
        );
      }
      // Validate each RCC credit has sufficient balance
      for (const rccUsage of usedRccData) {
        const rccCredit = rccCredits.find((rcc) => rcc.id === rccUsage.rccId);
        const availableAmount = rccCredit.amount - rccCredit.inUse;
        if (availableAmount < rccUsage.selectedAmount) {
          throw new CustomError(
            `Insufficient RCC credit balance for credit ID: ${rccUsage.rccId}`,
            400,
          );
        }
      }
    }

    const rentalStart = new Date(rentalStartDate);
    const submissionDeadline = new Date(
      rentalStart.getTime() - 4 * 60 * 60 * 1000,
    );

    const result = await prisma.$transaction(async (tx) => {
      const rentalRequest = await tx.rentalRequest.create({
        data: {
          productId,
          requesterId,
          ownerId,
          bccWalletId: paidWithBcc ? bccWalletId : null,
          rentalStartDate: new Date(rentalStartDate),
          rentalEndDate: new Date(rentalEndDate),
          submissionDeadline,
          totalDays,
          renterCollectionMethod,
          renterPhoneNumber,
          renterDeliveryAddress:
            renterCollectionMethod === "HOME" ? deliveryAddress : null,
          renterPickupTerminal:
            renterCollectionMethod === "BRITTOO_TERMINAL" ? pickupPoint : null,
          paidWithBcc,
          usedBccAmount: paidWithBcc ? usedBccAmount : null,
          paidWithRcc,
          status: "REQUESTED_BY_RENTER",
        },
        include: {
          product: true,
          requester: true,
          owner: true,
        },
      });

      if (paidWithBcc && usedBccAmount > 0) {
        await tx.bccTransaction.create({
          data: {
            userId: requesterId,
            walletId: bccWalletId,
            rentalRequestId: rentalRequest.id,
            amount: usedBccAmount,
            transactionType: "RENT_DEPOSIT",
          },
        });
        await tx.bccWallet.update({
          where: { id: bccWalletId },
          data: {
            lockedBalance: {
              increment: usedBccAmount,
            },
            availableBalance: {
              decrement: usedBccAmount,
            },
          },
        });
      }

      if (paidWithRcc && usedRccData.length > 0) {
        for (const rccUsage of usedRccData) {
          await tx.redCacheCredit.update({
            where: {
              id: rccUsage.rccId,
            },
            data: {
              inUse: {
                increment: rccUsage.selectedAmount,
              },
            },
          });
          await tx.rentalRequestRccUsage.create({
            data: {
              rentalRequestId: rentalRequest.id,
              redCacheCreditId: rccUsage.rccId,
              usedAmount: rccUsage.selectedAmount,
            },
          });
        }
      }

      return rentalRequest;
    });

    // TODO: emit notification to owner
    res.status(201).json({
      success: true,
      message: "Rental request created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserPlacedRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const placedRequests = await prisma.rentalRequest.findMany({
      where: {
        requesterId: userId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
            pricePerDay: true,
            productType: true,
            productCondition: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            securityScore: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: placedRequests,
      message: "Placed requests fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching placed requests:", error);
    next(error);
  }
};

export const getOwnerRentalRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rentalRequests = await prisma.rentalRequest.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
            pricePerDay: true,
            productType: true,
            productCondition: true,
            omv: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            securityScore: true,
            emailVerified: true,
            isVerified: true,
            brittooVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: rentalRequests,
      message: "Rental requests fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching rental requests:", error);
    next(error);
  }
};

export const acceptRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const {
      ownerSubmitMethod,
      ownerPhoneNumber,
      ownerSubmitTerminal,
      ownerSubmitAddress,
    } = req.body;

    // Validation
    if (
      !ownerSubmitMethod ||
      !ownerPhoneNumber ||
      ownerPhoneNumber.trim() === ""
    ) {
      throw new CustomError(
        "Submit method and phone number are required",
        400,
        "MISSING_FIELDS",
      );
    }
    if (ownerSubmitMethod === "HOME" && !ownerSubmitAddress) {
      throw new CustomError(
        "Submit address required for home deposit",
        400,
        "MISSING_FIELDS",
      );
    }
    if (ownerSubmitMethod === "BRITTOO_TERMINAL" && !ownerSubmitTerminal) {
      throw new CustomError(
        "Submit terminal not provided",
        400,
        "MISSING_FIELDS",
      );
    }

    const request = await prisma.rentalRequest.findFirst({
      where: {
        id: requestId,
        ownerId: userId,
        status: "REQUESTED_BY_RENTER",
        deletedAt: null,
      },
      include: {
        bccTransactions: {
          where: {
            status: "PENDING",
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!request) {
      throw new CustomError(
        "Rental request not found or already processed",
        404,
        "NOT_FOUND",
      );
    }
    if (request.paidWithBcc && request.bccTransactions.length <= 0) {
      throw new CustomError(
        "Used bcc but transaction unavailable",
        404,
        "NOT_FOUND",
      );
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const upReq = await tx.rentalRequest.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED_BY_OWNER",
          ownerSubmitMethod,
          ownerPhoneNumber: "+880" + ownerPhoneNumber,
          ownerSubmitAddress:
            ownerSubmitMethod === "HOME" ? ownerSubmitAddress : null,
          ownerSubmitTerminal:
            ownerSubmitMethod === "BRITTOO_TERMINAL"
              ? ownerSubmitTerminal
              : null,
        },
        include: {
          product: {
            select: {
              name: true,
              productImages: true,
            },
          },
          requester: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      const bccTransactionId = request.bccTransactions[0].id;
      await tx.bccTransaction.update({
        where: {
          id: bccTransactionId,
        },
        data: {
          status: "ACCEPTED",
          rentalRequestId: requestId,
        },
      });

      return upReq;
    });

    // TODO: Emit notification to renter
    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting rental request:", error);
    next(error);
  }
};

export const rejectRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { rejectReason } = req.body;

    if (!rejectReason || rejectReason.trim() === "") {
      throw new CustomError("Reject reason is required", 400, "MISSING_FIELDS");
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.rentalRequest.findFirst({
        where: {
          id: requestId,
          ownerId: userId,
          status: "REQUESTED_BY_RENTER",
          deletedAt: null,
        },
        include: {
          rccUsageDetails: {
            include: {
              redCacheCredit: true,
            },
          },
          bccWallet: true,
        },
      });

      if (!request) {
        throw new CustomError(
          "Rental request not found or already processed",
          400,
        );
      }

      const updates = [];

      // Handle BCC refund
      if (request.paidWithBcc && request.usedBccAmount && request.bccWalletId) {
        updates.push(
          tx.bccWallet.update({
            where: { id: request.bccWalletId },
            data: {
              availableBalance: { increment: request.usedBccAmount },
              lockedBalance: { decrement: request.usedBccAmount },
            },
          }),
        );
        updates.push(
          tx.bccTransaction.create({
            data: {
              userId: request.requesterId,
              walletId: request.bccWalletId,
              rentalRequestId: request.id,
              amount: request.usedBccAmount,
              status: "ACCEPTED",
              transactionType: "DEPOSIT_REFUND",
            },
          }),
        );
      }

      // Handle RCC refund
      if (request.paidWithRcc && request.rccUsageDetails.length > 0) {
        for (const usage of request.rccUsageDetails) {
          updates.push(
            tx.redCacheCredit.update({
              where: { id: usage.redCacheCreditId },
              data: {
                inUse: { decrement: usage.usedAmount },
              },
            }),
          );
        }
      }

      // Update rental request status
      updates.push(
        tx.rentalRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED_BY_OWNER",
            rejectReason: rejectReason.trim(),
          },
          include: {
            product: {
              select: {
                name: true,
                productImages: true,
              },
            },
            requester: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
      );

      const results = await Promise.all(updates);
      const updatedRequest = results[results.length - 1];
      return updatedRequest;
    });

    // TODO: Emit notification to renter
    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting rental request:", error);
    next(error);
  }
};

export const cancelRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { cancelReason } = req.body;

    if (!cancelReason || cancelReason.trim() === "") {
      throw new CustomError("Cancel reason is required", 400, "MISSING_FIELDS");
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.rentalRequest.findFirst({
        where: {
          id: requestId,
          requesterId: userId,
          status: {
            in: ["REQUESTED_BY_RENTER", "ACCEPTED_BY_OWNER"],
          },
          deletedAt: null,
        },
        include: {
          rccUsageDetails: {
            include: {
              redCacheCredit: true,
            },
          },
          bccWallet: true,
        },
      });

      if (!request) {
        throw new CustomError(
          "Rental request not found or already processed",
          400,
        );
      }

      const updates = [];

      // Handle BCC refund
      if (request.paidWithBcc && request.usedBccAmount && request.bccWalletId) {
        updates.push(
          tx.bccWallet.update({
            where: { id: request.bccWalletId },
            data: {
              availableBalance: { increment: request.usedBccAmount },
              lockedBalance: { decrement: request.usedBccAmount },
            },
          }),
        );
        updates.push(
          tx.bccTransaction.create({
            data: {
              userId: request.requesterId,
              walletId: request.bccWalletId,
              rentalRequestId: request.id,
              amount: request.usedBccAmount,
              status: "ACCEPTED",
              transactionType: "DEPOSIT_REFUND",
            },
          }),
        );
      }

      // Handle RCC refund
      if (request.paidWithRcc && request.rccUsageDetails.length > 0) {
        for (const usage of request.rccUsageDetails) {
          updates.push(
            tx.redCacheCredit.update({
              where: { id: usage.redCacheCreditId },
              data: {
                inUse: { decrement: usage.usedAmount },
              },
            }),
          );
        }
      }

      // Update rental request status
      updates.push(
        tx.rentalRequest.update({
          where: { id: requestId },
          data: {
            status: "CANCELLED_BY_RENTER",
            cancelReason: cancelReason.trim(),
          },
          include: {
            product: {
              select: {
                name: true,
                productImages: true,
              },
            },
            requester: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
      );

      const results = await Promise.all(updates);
      const updatedRequest = results[results.length - 1];
      return updatedRequest;
    });

    // TODO: Emit notification to owner
    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: "Rental request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling rental request:", error);
    next(error);
  }
};
