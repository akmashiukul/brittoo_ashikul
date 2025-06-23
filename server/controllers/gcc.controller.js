import prisma from "../config/prisma";
import { CustomError } from "../lib/customError";

export const requestGcc = async (req, res, next) => {
  try {
    const {
      phoneNumber,
      productName,
      depositMethod,
      address,
      city,
      estimatedDepositDateTime,
      droppingPoint,
    } = req.body;

    const userId = req.user.id;
    if (!phoneNumber || !depositMethod || !estimatedDepositDateTime) {
      throw new CustomError("Missing required fields", 400);
    }

    if (depositMethod === "DEPOSIT_FROM_HOME" && (!address || !city)) {
      throw new CustomError(
        "Address and city are required for home pickup",
        400,
      );
    }

    if (depositMethod === "DROP_AT_PUP" && !pickupPointId) {
      throw new CustomError("Pickup point is required for drop-off", 400);
    }

    await prisma.gccRequest.create({
      data: {
        userId,
        phoneNumber,
        productName,
        depositMethod,
        address,
        city,
        estimatedDepositDateTime: new Date(estimatedDepositDateTime),
        droppingPoint,
      },
    });

    res.status(201).json({
      success: true,
      message: "GCC request created successfully",
    });
  } catch (error) {
    console.error("Error creating GCC request:", error);
    next(error);
  }
};

export const acceptGccRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { amount, fee } = req.body;
    const gccRequest = await prisma.gccRequest.findUnique({
      where: {
        id: requestId,
        deletedAt: null,
      },
    });
    if (!gccRequest) {
      throw new CustomError("Gcc request not found", 404);
    }
    if (gccRequest.status !== "PENDING") {
      throw new CustomError("Request already processed", 400);
    }
    const validityStart = new Date();
    const validityEnd = new Date(validityStart);
    validityEnd.setMonth(validityEnd.getMonth() + 1);
    await prisma.$transaction([
      prisma.grayCacheCredit.create({
        data: {
          userId: gccRequest.userId,
          amount,
          fee,
          validityStart,
          validityEnd,
          gccRequestId: gccRequest.id,
        },
      }),
      prisma.gccRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "APPROVED",
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "GCC Request Approved",
    });
  } catch (error) {
    console.error("Error in accepting Gcc Req:", error);
    next(error);
  }
};

export const rejectGccRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { rejectReason } = req.body;
    const gccRequest = await prisma.gccRequest.findUnique({
      where: {
        id: requestId,
        deletedAt: null,
      },
    });
    if (!gccRequest) {
      throw new CustomError("Gcc request not found", 404);
    }

    await prisma.gccRequest.update({
      where: {
        id: requestId,
        deletedAt: null,
      },
      data: {
        rejectReason,
      },
    });

    res.status(200).json({
      success: true,
      message: "GCC Request Rejected",
    });
  } catch (error) {
    console.error("Error in rejecting Gcc Req:", error);
    next(error);
  }
};
