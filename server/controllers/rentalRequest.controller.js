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
    if (requesterId === ownerId) {
      throw new CustomError("Cannot rent your own product", 400);
    }
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
          //create Submission deadline 
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



export const getUserPlacedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const placedRequests = await prisma.rentalRequest.findMany({
      where: {
        requesterId: userId,
        status: {
          in: ['REQUESTED_BY_RENTER', 'ACCEPTED_BY_OWNER', 'PRODUCT_SUBMITTED_BY_OWNER']
        },
        deletedAt: null
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
            ownerId: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            securityScore: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: placedRequests,
      message: 'Placed requests fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching placed requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getOwnerRentalRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rentalRequests = await prisma.rentalRequest.findMany({
      where: {
        ownerId: userId,
        status: {
          in: ['REQUESTED_BY_RENTER', 'ACCEPTED_BY_OWNER', 'PRODUCT_SUBMITTED_BY_OWNER']
        },
        deletedAt: null
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
            omv: true
          }
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
            brittooVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: rentalRequests,
      message: 'Rental requests fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Accept rental request
export const acceptRentalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { ownerDepositMethod, ownerPhoneNumber, pickupPoint } = req.body;

    // Validate request exists and belongs to owner
    const request = await prisma.rentalRequest.findFirst({
      where: {
        id: requestId,
        ownerId: userId,
        status: 'REQUESTED_BY_RENTER',
        deletedAt: null
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found or already processed'
      });
    }

    // Update rental request status
    const updatedRequest = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: 'ACCEPTED_BY_OWNER',
        ownerDepositMethod,
        ownerPhoneNumber,
        pickupPoint,
        submissionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      include: {
        product: {
          select: {
            name: true,
            productImages: true
          }
        },
        requester: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: 'Rental request accepted successfully'
    });
  } catch (error) {
    console.error('Error accepting rental request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reject rental request
export const rejectRentalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { rejectReason } = req.body;

    if (!rejectReason || rejectReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reject reason is required'
      });
    }

    // Validate request exists and belongs to owner
    const request = await prisma.rentalRequest.findFirst({
      where: {
        id: requestId,
        ownerId: userId,
        status: 'REQUESTED_BY_RENTER',
        deletedAt: null
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found or already processed'
      });
    }

    // Update rental request status
    const updatedRequest = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED_BY_OWNER',
        rejectReason: rejectReason.trim()
      },
      include: {
        product: {
          select: {
            name: true,
            productImages: true
          }
        },
        requester: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedRequest,
      message: 'Rental request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting rental request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};