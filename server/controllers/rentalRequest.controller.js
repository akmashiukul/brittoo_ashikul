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
    if (!renterCollectionMethod || !renterPhoneNumber) {
      throw new CustomError("Missing collection method or phone number", 400);
    }
    if (renterCollectionMethod === "HOME_DELIVERY" && !deliveryAddress) {
      throw new CustomError("Delivery address required for home delivery", 400);
    }
    if (renterCollectionMethod === "TERMINAL_PICKUP" && !pickupPoint) {
      throw new CustomError("Pickup point required for terminal pickup", 400);
    }

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
    //TODO: Implement this in client asap
    // if (requesterId === ownerId) {
    //   throw new CustomError("Cannot rent your own product", 400);
    // }
    // TODO: (client) Check for existing pending request
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

    //Validate Bcc
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
      const availableBalance = bccWallet.totalBalance - bccWallet.lockedBalance;
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

    const result = await prisma.$transaction(async (tx) => {
      const rentalRequest = await tx.rentalRequest.create({
        data: {
          productId,
          requesterId,
          ownerId,
          bccWalletId: paidWithBcc ? bccWalletId : null,
          rentalStartDate: new Date(rentalStartDate),
          rentalEndDate: new Date(rentalEndDate),
          totalDays,
          renterCollectionMethod,
          renterPhoneNumber,
          deliveryAddress:
            renterCollectionMethod === "HOME_DELIVERY" ? deliveryAddress : null,
          pickupPoint:
            renterCollectionMethod === "TERMINAL_PICKUP" ? pickupPoint : null,
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
        await tx.bccWallet.update({
          where: { id: bccWalletId },
          data: {
            lockedBalance: {
              increment: usedBccAmount,
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

export const acceptRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { ownerDepositMethod, ownerPhoneNumber } = req.body;  

    if (!requestId) {
      throw new CustomError("Request ID is required", 400);
    }

    // Validate deposit method and phone number
    if (!ownerDepositMethod || !ownerPhoneNumber) {
      throw new CustomError(
        "Owner deposit method and phone number are required",
        400,
      );
    }

    // Find the rental request
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: {
        product: true,
        requester: true,
        owner: true,
      },
    });

    if (!rentalRequest) {
      throw new CustomError("Rental request not found", 404);
    }

    if (rentalRequest.status !== "REQUESTED_BY_RENTER") {
      throw new CustomError(
        "Request is not in a state that can be accepted",
        400,
      );
    }

    // Check if product is still available
    if (rentalRequest.product.isRented) {
      throw new CustomError("Product is already rented", 400);
    }

    if (rentalRequest.product.isOnHold) {
      throw new CustomError("Product is currently on hold", 400);
    }

    // Update the rental request
    const updatedRequest = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED_BY_OWNER",
        ownerDepositMethod,
        ownerPhoneNumber,
      },
      include: {
        product: true,
        requester: true,
        owner: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Rental request accepted successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const rejectRentalRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;

    if (!requestId) {
      throw new CustomError("Request ID is required", 400);
    }

    // Find the rental request
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: {
        product: true,
        requester: true,
        owner: true,
        rccUsageDetails: true,
      },
    });

    if (!rentalRequest) {
      throw new CustomError("Rental request not found", 404);
    }

    if (rentalRequest.status !== "REQUESTED_BY_RENTER") {
      throw new CustomError(
        "Request is not in a state that can be rejected",
        400,
      );
    }

    // Handle rejection with transaction to unlock funds
    const result = await prisma.$transaction(async (tx) => {
      // Update rental request status
      const updatedRequest = await tx.rentalRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED_BY_OWNER",
        },
        include: {
          product: true,
          requester: true,
          owner: true,
        },
      });

      // Unlock BCC funds if they were locked
      if (rentalRequest.paidWithBcc && rentalRequest.usedBccAmount > 0) {
        await tx.bccWallet.update({
          where: { id: rentalRequest.bccWalletId },
          data: {
            lockedBalance: {
              decrement: rentalRequest.usedBccAmount,
            },
          },
        });
      }

      // Unlock RCC funds if they were locked
      if (
        rentalRequest.paidWithRcc &&
        rentalRequest.rccUsageDetails.length > 0
      ) {
        const unlockPromises = rentalRequest.rccUsageDetails.map(
          async (usage) => {
            await tx.redCacheCredit.update({
              where: { id: usage.redCacheCreditId },
              data: {
                inUse: {
                  decrement: usage.usedAmount,
                },
              },
            });
          },
        );

        await Promise.all(unlockPromises);
      }

      return updatedRequest;
    });

    res.status(200).json({
      success: true,
      message: "Rental request rejected successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
