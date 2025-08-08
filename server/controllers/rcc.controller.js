import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";

export const getUsersAvailableRcc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const availableRcc = await prisma.redCacheCredit.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        sourceProduct: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully fetched accumulated Red Cache Credits",
      data: availableRcc
    });
  } catch (error) {
    console.error("Error in geUsersAvailableRcc controller: ", error);
    next(error);
  }
}

export const giftRcc = async (req, res, next) => {
  try {
    const {
      userId,
      amount,
      validityDays,
      giftReason = "",
    } = req.body;

    const adminId = req.user.id;
    if (!userId || !amount) {
      throw new CustomError('User ID and amount are required', 400)
    }
    if (parseInt(amount) <= 0) {
      throw new CustomError('Amount must be greater than 0', 400);
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!targetUser) {
      throw new CustomError('User not found', 404);
    }
    const validityDate = validityDays ?
      new Date(Date.now() + (parseInt(validityDays) * 24 * 60 * 60 * 1000)) :
      null;

    const virtualProduct = await prisma.product.create({
      data: {
        productSL: `GIFT-${Date.now()}`,
        name: `Gift Credit - ${amount} BDT`,
        productType: 'OTHERS',
        productCondition: 'NEW',
        productAge: 1,
        omv: parseInt(amount),
        secondHandPrice: parseInt(amount),
        tags: 'gift,credit,admin',
        productDescription: `Gift credit of ${amount} BDT`,
        quantity: 1,
        ownerId: adminId,
        isForSale: false,
        isVirtual: true,
        virtualType: 'GIFT_CREDIT',
        isBrittooVerified: true,
        pricePerDay: 0
      }
    });
    const giftRCC = await prisma.redCacheCredit.create({
      data: {
        amount: parseInt(amount),
        inUse: 0,
        userId: userId,
        sourceProductId: virtualProduct.id,
        isGiftCredit: true,
        validityDate: validityDate,
        giftReason,
        giftedBy: adminId
      }
    });
    res.status(201).json({
      success: true,
      message: 'Gift credit successfully added to user account',
      data: giftRCC
    });
  } catch (error) {
    console.error('Gift credit error:', error);
    next(error);
  }
}