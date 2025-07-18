import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const getAllRentalRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { status, search, productId, ownerId, requesterId, productSL } =
      req.query;

    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (productId) where.productId = productId;
    if (ownerId) where.ownerId = ownerId;
    if (requesterId) where.requesterId = requesterId;
    if (productSL) where.productSL = productSL;

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: "insensitive" } } },
        { owner: { name: { contains: search, mode: "insensitive" } } },
        { requester: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [rentalRequests, total] = await Promise.all([
      prisma.rentalRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
          owner: { select: { name: true, phoneNumber: true, email: true } },
          requester: { select: { name: true, phoneNumber: true, email: true } },
          bccWallet: true,
          bccTransactions: true,
          rccUsageDetails: { include: { redCacheCredit: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.rentalRequest.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Rental req data fetched successfully",
      data: rentalRequests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Update rental request status
export const updateRentalRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PRODUCT_SUBMITTED_BY_OWNER",
      "PRODUCT_COLLECTED_BY_RENTER",
      "PRODUCT_RETURNED_BY_RENTER",
      "PRODUCT_RETURNED_TO_OWNER",
    ];

    if (!validStatuses.includes(status)) {
      throw new CustomError("Invalid status value", 400);
    }

    const rentalRequest = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        product: true,
        owner: { select: { name: true, phoneNumber: true, email: true } },
        requester: { select: { name: true, phoneNumber: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Udated rental request status",
      data: rentalRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Reject rental request by Brittoo
export const rejectRentalRequestAdmin = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { brittooRejectReason } = req.body;

    if (
      !brittooRejectReason ||
      typeof brittooRejectReason !== "string" ||
      brittooRejectReason.trim() === ""
    ) {
      return res.status(400).json({ error: "Reject reason is required" });
    }

    const rentalRequest = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED_FROM_BRITTOO",
        brittooRejectReason: brittooRejectReason.trim(),
      },
      include: {
        product: true,
        owner: { select: { name: true, phoneNumber: true, email: true } },
        requester: { select: { name: true, phoneNumber: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Rejected rental request by brittoo",
      data: rentalRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
