import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

export const getUserCreditHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      bccWallet,
      redCacheCredits,
      bccTransactions,
      pendingBccRequests,
      rentalHistory,
    ] = await Promise.all([
      prisma.bccWallet.findUnique({
        where: { userId },
        select: {
          id: true,
          availableBalance: true,
          lockedBalance: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.redCacheCredit.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        include: {
          sourceProduct: {
            select: {
              id: true,
              name: true,
              productSL: true,
              productImages: true,
              pricePerDay: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bccTransaction.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          id: true,
          amount: true,
          paymentGateway: true,
          transactionId: true,
          transactionType: true,
          status: true,
          refundTrxId: true,
          rejectReason: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.bccTransaction.findMany({
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
      }),
      prisma.rentalRequest.findMany({
        where: {
          requesterId: userId,
          deletedAt: null,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              pricePerDay: true,
              productSL: true,
              productImages: true,
            },
          },
          rccUsageDetails: {
            include: {
              redCacheCredit: {
                include: {
                  sourceProduct: {
                    select: {
                      id: true,
                      name: true,
                      productSL: true,
                      pricePerDay: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const totalRccAmount = redCacheCredits.reduce(
      (sum, rcc) => sum + rcc.amount,
      0,
    );
    const totalRccInUse = redCacheCredits.reduce(
      (sum, rcc) => sum + rcc.inUse,
      0,
    );
    const availableRccAmount = totalRccAmount - totalRccInUse;

    const totalBccSpent = bccTransactions
      .filter(
        (tx) => tx.transactionType === "USAGE" && tx.status === "ACCEPTED",
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalBccPurchased = bccTransactions
      .filter(
        (tx) => tx.transactionType === "PURCHASE" && tx.status === "ACCEPTED",
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const completedRentals = rentalHistory.filter(
      (rental) => rental.status === "PRODUCT_RETURNED_TO_OWNER",
    ).length;

    const totalRentalsValue = rentalHistory.reduce(
      (sum, rental) => sum + (rental.usedBccAmount || 0),
      0,
    );

    const rccUsageByProduct = {};
    rentalHistory.forEach((rental) => {
      rental.rccUsageDetails.forEach((usage) => {
        const productId = usage.redCacheCredit.sourceProduct.id;
        const productName = usage.redCacheCredit.sourceProduct.name;

        if (!rccUsageByProduct[productId]) {
          rccUsageByProduct[productId] = {
            productName,
            totalUsed: 0,
            usageCount: 0,
          };
        }

        rccUsageByProduct[productId].totalUsed += usage.usedAmount;
        rccUsageByProduct[productId].usageCount += 1;
      });
    });

    const dashboardData = {
      bccWallet,
      redCacheCredits,
      bccTransactions,
      rentalHistory,
      summary: {
        bcc: {
          lockedBalance: bccWallet?.lockedBalance || 0,
          availableBalance: bccWallet?.availableBalance,
          totalPurchased: totalBccPurchased,
          totalSpent: totalBccSpent,
          pendingBccRequests,
          totalPendingBcc: pendingBccRequests.reduce((sum, bcc) => sum + bcc.amount, 0),
        },
        rcc: {
          totalAmount: totalRccAmount,
          totalInUse: totalRccInUse,
          availableAmount: availableRccAmount,
          totalCredits: redCacheCredits.length,
          usageByProduct: rccUsageByProduct,
        },
        rentals: {
          totalRentals: rentalHistory.length,
          completedRentals,
          totalValue: totalRentalsValue,
          averageRentalValue:
            rentalHistory.length > 0
              ? totalRentalsValue / rentalHistory.length
              : 0,
        },
      },
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching credit history:", error);
    next(error);
  }
};

// Get specific BCC transaction details
const getBccTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.bccTransaction.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
      include: {
        wallet: {
          select: {
            id: true,
            availableBalance: true,
            lockedBalance: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction details",
      error: error.message,
    });
  }
};

// Get specific RCC usage details
const getRccUsageDetails = async (req, res) => {
  try {
    const { rccId } = req.params;
    const userId = req.user.id;

    const rccUsage = await prisma.rentalRequestRccUsage.findMany({
      where: {
        redCacheCredit: {
          id: rccId,
          userId,
        },
      },
      include: {
        rentalRequest: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                productSL: true,
                productImages: true,
              },
            },
          },
        },
        redCacheCredit: {
          include: {
            sourceProduct: {
              select: {
                id: true,
                name: true,
                productSL: true,
                pricePerDay: true
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: rccUsage,
    });
  } catch (error) {
    console.error("Error fetching RCC usage details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching RCC usage details",
      error: error.message,
    });
  }
};
