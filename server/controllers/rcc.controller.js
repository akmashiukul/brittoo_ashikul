import prisma from "../config/prisma.js";
import { CustomError } from "../lib/customError.js";
import { Resend } from "resend";
const resend = new Resend(`${process.env.RESEND_API_KEY}`);

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

    const result = await prisma.$transaction(async (prismaTx) => {
      const virtualProduct = await prismaTx.product.create({
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

      const giftRCC = await prismaTx.redCacheCredit.create({
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

      return { virtualProduct, giftRCC };
    });


    await resend.emails.send({
      from: "Brittoo <notifications@brittoo.xyz>",
      to: targetUser.email,
      subject: `Congratulations! You have received RCC From Brittoo.`,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdecea;">
      <div style="text-align: center; padding: 20px; background-color: #fff5f5; border-radius: 8px; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);">
        <h2 style="color: #b91c1c; font-size: 24px; margin-bottom: 20px;">
          Congratulations! You've Received ${amount} Red Cache Credits From Brittoo 🟥
        </h2>
        <p style="color: #991b1b; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Start your rental journey with Brittoo now. Use this credit and rent anything you want.
        </p>
        <a href="${process.env.CLIENT_BASE_URL}/dashboard/my-credits" 
           style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; margin: 20px 0;">
          View Credits
        </a>
        <p style="color: #7f1d1d; font-size: 14px; line-height: 1.5;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </div>
  `,
    });

    res.status(201).json({
      success: true,
      message: 'Gift credit successfully added to user account',
      data: result.giftRCC
    });
  } catch (error) {
    console.error('Gift credit error:', error);
    next(error);
  }
}