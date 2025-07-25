import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { calculatePricePerDay } from "../lib/calculatePrice.js";
import { calculateSecondHandPrice } from "../lib/calculateSecondHandPrice.js";
import { CustomError } from "../lib/customError.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productUploadsDir = path.join(__dirname, "../uploads/products");

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      productType,
      productCondition,
      productAge,
      omv,
      tags,
      productDescription,
      isForSale,
    } = req.body;
    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }
    const owner = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
    });
    if (!owner) {
      throw new CustomError("Unauthorized", 401);
    }

    //uploadImages
    if (!req.files || req.files.length === 0) {
      throw new CustomError("At least one product image is required", 400);
    }
    const imagePaths = req.files.map(
      (file) => `/uploads/products/${file.filename}`,
    );

    const pricePerDay = calculatePricePerDay(
      parseInt(omv),
      productCondition,
      parseInt(productAge),
      owner.securityScore,
      3,
    );
    const secondHandPrice = calculateSecondHandPrice(
      parseInt(omv),
      productCondition,
      parseInt(productAge),
    );
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          pricePerDay: parseFloat(pricePerDay),
          productSL: "TEMP",
          productType,
          productCondition,
          isForSale: isForSale === "false" ? false : true,
          productAge: parseInt(productAge),
          omv: parseInt(omv),
          tags,
          productDescription,
          ownerId: req.user.id,
          productImages: imagePaths,
          secondHandPrice: secondHandPrice,
        },
      });
      const prefix = product.productType.charAt(0);
      const generatedSL = `${prefix}${product.productSlNo}`;
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { productSL: generatedSL },
      });
      const rcc = await tx.redCacheCredit.create({
        data: {
          amount: secondHandPrice,
          userId: req.user.id,
          sourceProductId: updatedProduct.id,
        },
        include: {
          sourceProduct: {
            select: {
              productSL: true
            }
          }
        }
      });
      return { updatedProduct, rcc };
    });
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }
    return res.status(201).json({
      success: true,
      message: "Product Listed Successfully",
      product: result.updatedProduct,
      rcc: result.rcc,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      search = "",
      productType,
      productCondition,
      productAge,
      ownerId,
      page = 1,
      limit = 20,
      productId,
      productSL,
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Cache hit");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache Miss");

    const filters = {};

    if (productId) {
      filters.id = productId;
    }
    if (productSL) {
      filters.productSL = productSL;
    }
    if (productType) {
      filters.productType = productType;
    }

    if (productCondition) {
      filters.productCondition = productCondition;
    }

    if (ownerId) {
      filters.ownerId = ownerId;
    }

    if (productAge) {
      filters.productAge = {
        lte: parseInt(productAge),
      };
    }

    const searchClause = search
      ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { tags: { contains: search, mode: "insensitive" } },
          { productSL: { contains: search, mode: "insensitive" } },
          { productDescription: { contains: search, mode: "insensitive" } },
        ],
      }
      : {};

    console.log(filters);

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...filters,
        ...searchClause,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            securityScore: true,
            brittooVerified: true,
            suspensionCount: true,
            isValidRuetMail: true,
            isVerified: true,
            _count: {
              select: {
                rentedOutProducts: true,
                borrowedProducts: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.product.count({
      where: {
        deletedAt: null,
        ...filters,
        ...searchClause,
      },
    });

    const response = {
      success: true,
      message: "Data fetched successfully",
      products,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting products:", error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate user
    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }

    // Fetch product with rental requests
    const product = await prisma.product.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: {
        rentalRequests: {
          where: {
            status: {
              in: [
                "ACCEPTED_BY_OWNER",
                "PRODUCT_SUBMITTED_BY_OWNER",
                "PRODUCT_COLLECTED_BY_RENTER",
                "PRODUCT_RETURNED_BY_RENTER",
              ],
            },
          },
        },
      },
    });
    if (product.ownerId !== req.user.id && !["ADMIN", "MODERATOR"].includes(req.user.role)) {
      throw new CustomError("Unauthorized to delete this product", 403);
    }
    if (product.rentalRequests.length > 0) {
      throw new CustomError("Cannot delete product with active rental requests. Please handle pending requests first.", 400);
    }
    const refRcc = await prisma.redCacheCredit.findFirst({
      where: { sourceProductId: product.id, deletedAt: null },
    });
    if (refRcc?.inUse > 0) {
      throw new CustomError("Can't delete product. Red Credit referencing this product is in use.", 400);
    }
    if (product.isOnHold) {
      throw new CustomError("Cannot delete product that is currently on hold", 400);
    }
    await prisma.$transaction(async (tx) => {
      await tx.rentalRequest.deleteMany({
        where: {
          productId: product.id,
          status: {
            in: [
              "CANCELLED_BY_RENTER",
              "REJECTED_BY_OWNER",
              "REJECTED_FROM_BRITTOO",
              "PRODUCT_RETURNED_TO_OWNER",
            ],
          },
        },
      });
      if (refRcc) {
        await tx.redCacheCredit.delete({
          where: { id: refRcc.id },
        });
      }
      await tx.product.delete({
        where: { id },
      });
    });
    try {
      const cacheKey = `products:${id}`;
      await redisClient.del(cacheKey);
      console.log("Cache invalidated:", cacheKey);
    } catch (redisError) {
      console.error("Failed to invalidate cache:", redisError);
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new CustomError("Product not found or already deleted", 404);
    }
    console.error(error);
    next(error);
  }
};

export const updateProductAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      productType,
      productCondition,
      productAge,
      omv,
      tags,
      productDescription,
      deleteImages,
      isForSale,
    } = req.body;

    // Check if the user is an admin
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new CustomError('Unauthorized: Admin access required', 403);
    }

    // Fetch the product with owner securityScore and redCacheCredits
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        owner: {
          select: { securityScore: true },
        },
        redCacheCredits: true,
      },
    });

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (isForSale) updateData.isForSale = isForSale === 'true';
    if (productType) updateData.productType = productType;
    if (productCondition) updateData.productCondition = productCondition;
    if (productAge) updateData.productAge = parseInt(productAge);
    if (omv) updateData.omv = parseInt(omv);
    if (tags) updateData.tags = tags;
    if (productDescription) updateData.productDescription = productDescription;

    let newSecondHandPrice;
    if (omv || productCondition || productAge) {
      const finalOmv = omv ? parseInt(omv) : product.omv;
      const finalCondition = productCondition || product.productCondition;
      const finalAge = productAge ? parseInt(productAge) : product.productAge;
      const newPrice = calculatePricePerDay(
        finalOmv,
        finalCondition,
        finalAge,
        product.owner.securityScore,
        3,
      );
      newSecondHandPrice = calculateSecondHandPrice(
        finalOmv,
        finalCondition,
        finalAge,
      );
      updateData.pricePerDay = parseFloat(newPrice);
      updateData.secondHandPrice = newSecondHandPrice;
    }

    // Handle image updates
    let updatedImagePaths = [...product.productImages];
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : JSON.parse(deleteImages || '[]');
      for (const imagePath of imagesToDelete) {
        const fullPath = path.join(productUploadsDir, path.basename(imagePath));
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Deleted image: ${fullPath}`);
          }
        } catch (err) {
          console.error(`Error deleting image ${fullPath}:`, err);
        }
      }
      updatedImagePaths = updatedImagePaths.filter(
        (path) => !imagesToDelete.includes(path),
      );
    }

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
      updatedImagePaths = [...updatedImagePaths, ...newImagePaths];
    }

    if (updatedImagePaths.length > 4) {
      throw new CustomError('Total images cannot exceed 4', 400);
    }

    if (updatedImagePaths.length > 0) {
      updateData.productImages = updatedImagePaths;
    }

    // Update product and RedCacheCredit in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productUpdate = await tx.product.update({
        where: { id },
        data: updateData,
      });

      if ((omv || productCondition || productAge) && product.redCacheCredits) {
        await tx.redCacheCredit.update({
          where: { id: product.redCacheCredits.id },
          data: { amount: newSecondHandPrice },
        });
      }

      return productUpdate;
    });

    // Invalidate cache
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log('Cache invalidated:', keys);
    }

    return res.status(200).json({
      success: true,
      message: 'Product Updated Successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};