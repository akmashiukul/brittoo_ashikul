import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "ALL",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      AND: [
        { deletedAt: null },
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { roll: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},

        status === "VERIFIED"
          ? { isVerified: "VERIFIED" }
          : status === "PENDING"
            ? { isVerified: "PENDING" }
            : status === "UNVERIFIED"
              ? { isVerified: "UNVERIFIED" }
              : status === "SUSPENDED"
                ? { isSuspended: true }
                : {},
      ],
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: safeAuthUserSelect,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const stats = await prisma.user.groupBy({
      by: ["isVerified", "brittooVerified", "isSuspended"],
      _count: true,
      where: { deletedAt: null },
    });

    const summary = {
      totalUsers,
      verified: stats
        .filter((s) => s.isVerified === "VERIFIED")
        .reduce((acc, s) => acc + s._count, 0),
      pending: stats
        .filter((s) => s.isVerified === "PENDING")
        .reduce((acc, s) => acc + s._count, 0),
      unverified: stats
        .filter((s) => s.isVerified === "UNVERIFIED")
        .reduce((acc, s) => acc + s._count, 0),
      brittooVerified: stats
        .filter((s) => s.brittooVerified === true)
        .reduce((acc, s) => acc + s._count, 0),
      suspended: stats
        .filter((s) => s.isSuspended === true)
        .reduce((acc, s) => acc + s._count, 0),
    };

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit),
        },
        summary,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    next(error);
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        bccWallet: {
          include: {
            bccTransactions: {
              orderBy: { createdAt: 'desc' },
              take: 20, // Get recent transactions
            },
          },
        },
        bccTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        redCacheCredits: {
          orderBy: { createdAt: 'desc' },
        },
        rentedOutProducts: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            productType: true,
            productCondition: true,
            pricePerDay: true,
            isOnHold: true,
            createdAt: true,
            renters: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        borrowedProducts: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            productType: true,
            productCondition: true,
            pricePerDay: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        rentalRequestsMade: {
          select: {
            id: true,
            status: true,
            submissionDeadline: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                productType: true,
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        rentalRequestsReceived: {
          select: {
            id: true,
            status: true,
            submissionDeadline: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                productType: true,
              },
            },
            requester: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Calculate wallet and credit summary
    const walletSummary = {
      availableBalance: user.bccWallet?.availableBalance || 0,
      lockedBalance: user.bccWallet?.lockedBalance || 0,
      totalBalance: (user.bccWallet?.availableBalance || 0) + (user.bccWallet?.lockedBalance || 0),
    };

    const creditSummary = {
      totalRedCredits: user.redCacheCredits.reduce(
        (sum, c) => sum + c.amount,
        0,
      ),
      totalRedCreditsInUse: user.redCacheCredits.reduce(
        (sum, c) => sum + c.inUse,
        0,
      ),
      availableRedCredits: user.redCacheCredits.reduce(
        (sum, c) => sum + (c.amount - c.inUse),
        0,
      ),
    };

    // Calculate BCC transaction summary
    const bccTransactionSummary = {
      totalDeposits: user.bccTransactions
        .filter((t) => t.transactionType === "PURCHASE_BCC" && t.status === "ACCEPTED")
        .reduce((sum, t) => sum + t.amount, 0),
      totalWithdrawals: user.bccTransactions
        .filter((t) => t.transactionType === "MONEY_WITHDRAWAL" && t.status === "ACCEPTED")
        .reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: user.bccTransactions
        .filter((t) => t.status === "PENDING")
        .reduce((sum, t) => sum + t.amount, 0),
      rejectedTransactions: user.bccTransactions
        .filter((t) => t.status === "REJECTED")
        .reduce((sum, t) => sum + t.amount, 0),
    };

    res.json({
      success: true,
      data: {
        user,
        walletSummary,
        creditSummary,
        bccTransactionSummary,
        stats: {
          totalProductsRented: user.rentedOutProducts.length,
          totalProductsBorrowed: user.borrowedProducts.length,
          totalRequestsMade: user.rentalRequestsMade.length,
          totalRequestsReceived: user.rentalRequestsReceived.length,
        },
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

export const getUserCreditHistory = async (req, res, next) => {
  try {
    const userId = req.params;

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
          rentalRequestId: true,
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
          transactionType: "PURCHASE_BCC",
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
        (tx) =>
          tx.transactionType === "RENT_DEPOSIT" && tx.status === "ACCEPTED",
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
          totalPendingBcc: pendingBccRequests.reduce(
            (sum, bcc) => sum + bcc.amount,
            0,
          ),
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