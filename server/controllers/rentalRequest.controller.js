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
      usedBccAmount,
      paidWithRcc,
      usedRccData = [],
    } = req.body;

    if (!productId || !requesterId || !ownerId) {
      throw new CustomError("Missing required IDs", 400);
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
      include: { owner: true }
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
    // TODO: impl this in frontend asap
    if (requesterId === ownerId) {
      throw new CustomError("Cannot rent your own product", 400);
    }
    // TODO: also impl this in frontend. if this user already requested for this
    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        productId,
        requesterId,
        status: "REQUESTED_BY_RENTER"
      }
    });
    if (existingRequest) {
      throw new CustomError("You already have a pending request for this product", 400);
    }


    let rccCreditsToUpdate = [];
    if (paidWithRcc && usedRccData.length > 0) {
      const rccIds = usedRccData.map(item => item.rccId);
      const totalUsedRccAmount = usedRccData.reduce((sum, item) => sum + item.selectedAmount, 0);
      
      // Verify RCCs belong to requester && are available
      const rccCredits = await prisma.redCacheCredit.findMany({
        where: {
          id: { in: rccIds },
          userId: requesterId,
        }
      });
      if (rccCredits.length !== rccIds.length) {
        throw new CustomError("Invalid or unavailable RCC credits", 400);
      }

      // Check if RCC has sufficient balance for the selected amount
      for (const usedRcc of usedRccData) {
        const rccCredit = rccCredits.find(rcc => rcc.id === usedRcc.rccId);
        if (!rccCredit) {
          throw new CustomError(`RCC credit ${usedRcc.rccId} not found`, 400);
        }
        const availableAmount = rccCredit.amount - rccCredit.inUse;
        if (availableAmount < usedRcc.selectedAmount) {
          throw new CustomError(`Insufficient balance in RCC credit ${usedRcc.rccId}`, 400);
        }
      }

      const requiredAmount = product.pricePerDay * totalDays;
      const totalPaidAmount = totalUsedRccAmount + (usedBccAmount || 0);
      if (totalPaidAmount !== requiredAmount) {
        throw new CustomError(`Total payment (${totalPaidAmount}) doesn't match rental cost (${requiredAmount})`, 400);
      }
      rccCreditsToUpdate = usedRccData.map(item => ({
        ...rccCredits.find(rcc => rcc.id === item.rccId),
        selectedAmount: item.selectedAmount
      }));
    }

    // validate usedBcc prsnt or not
    if (paidWithBcc && usedBccAmount) {
      const userBccCredits = await prisma.blueCacheCredit.findMany({
        where: {
          userId: requesterId,
          status: "ACCEPTED"
        }
      });
      const totalBccAvailable = userBccCredits.reduce((sum, bcc) => sum + (bcc.amount - bcc.inUse), 0);
      if (totalBccAvailable < usedBccAmount) {
        throw new CustomError("Insufficient BCC credits", 400);
      }
    }

    // =====================CREATE RENTAL REQ=====================
    const rentalRequest = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.rentalRequest.create({
        data: {
          productId,
          requesterId,
          ownerId,
          rentalStartDate: new Date(rentalStartDate),
          rentalEndDate: new Date(rentalEndDate),
          totalDays,
          renterCollectionMethod,
          renterPhoneNumber,
          deliveryAddress,
          pickupPoint,
          paidWithBcc: paidWithBcc || false,
          usedBccAmount,
          paidWithRcc: paidWithRcc || false,
          usedRCCs: paidWithRcc ? { connect: usedRccData.map(item => ({ id: item.rccId })) } : undefined
        },
        include: {
          product: true,
          requester: true,
          owner: true
        }
      });
      if (paidWithRcc && rccCreditsToUpdate.length > 0) {
        for (const rccData of rccCreditsToUpdate) {
          await tx.redCacheCredit.update({
            where: { id: rccData.id },
            data: { 
              inUse: rccData.inUse + rccData.selectedAmount,
            }
          });
        }
      }
      if (paidWithBcc && usedBccAmount) {
        const userBccCredits = await tx.blueCacheCredit.findMany({
          where: {
            userId: requesterId,
            status: "ACCEPTED"
          },
          orderBy: { createdAt: 'asc' }
        });

        let remainingAmount = usedBccAmount;
        
        for (const bcc of userBccCredits) {
          if (remainingAmount <= 0) break;
          
          const availableAmount = bcc.amount - bcc.inUse;
          const amountToUse = Math.min(remainingAmount, availableAmount);
          
          await tx.blueCacheCredit.update({
            where: { id: bcc.id },
            data: { inUse: bcc.inUse + amountToUse }
          });
          
          remainingAmount -= amountToUse;
        }
      }

      return newRequest;
    });

    res.status(201).json({
      success: true,
      message: "Rental request created successfully",
      data: rentalRequest
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};