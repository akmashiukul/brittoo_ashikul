import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { userSafeSelect } from "../lib/prismaSelects.js";

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
        select: userSafeSelect,
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
        blueCacheCredits: {
          orderBy: { createdAt: 'desc'}
        },
        redCacheCredits: true,
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

    const creditSummary = {
      totalBlueCredits: user.blueCacheCredits.reduce(
        (sum, c) => sum + c.amount,
        0,
      ),
      totalRedCredits: user.redCacheCredits.reduce(
        (sum, c) => sum + c.amount,
        0,
      ),
      pendingBCC: user.blueCacheCredits
        .filter((c) => !c.isActive && !c.isRejected)
        .reduce((sum, c) => sum + c.amount, 0),
      rejectedBCC: user.blueCacheCredits
        .filter((c) => c.isRejected)
        .reduce((sum, c) => sum + c.amount, 0),
    };

    res.json({
      success: true,
      data: {
        user,
        creditSummary,
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
