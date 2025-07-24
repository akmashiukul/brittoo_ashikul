import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { CustomError } from "../lib/customError.js";

export const holdProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;
    if (!productId) {
      throw new CustomError("Product Id Required", 400);
    }
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        deletedAt: null
      }
    });
    if (!product) {
      throw new CustomError("Product Not Found", 404);
    }
    const updateHoldBool = status === 'HOLD';
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        isOnHold: updateHoldBool
      }
    });
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }
    res.status(200).json({
      success: true,
      message: "Product Hold Successfull",
      data: updatedProduct
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
}