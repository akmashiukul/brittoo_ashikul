import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { calculatePricePerDay } from "../lib/calculatePrice.js";
import { calculateSecondHandPrice } from "../lib/calculateSecondHandPrice.js";
import { CustomError } from "../lib/customError.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { productUploadsPath, productOptimizedPath } from "../middlewares/productImageUpload.js";
import { calculateGadgetPricePerDay } from "../helpers/price-calculations/gadgetPricePerDay.js";
import { calculateVehiclePricePerDay } from "../helpers/price-calculations/vehiclePricePerDay.js";
import { calculateHourlyPrice } from "../helpers/price-calculations/calculateHourlyPrice.js";

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
    const optimizedImages = req.files.map(file =>
      `/uploads/products/optimized/${file.filename.replace(/\.[^.]+$/, ".webp")}`
    );

    let pricePerHour;
    let pricePerDay;
    if (productType === "GADGET") {
      pricePerDay = calculateGadgetPricePerDay(
        parseInt(omv),
        productCondition,
        parseInt(productAge),
        owner.securityScore,
        3,
      );
      pricePerHour = calculateHourlyPrice(pricePerDay, 2);
    } else if (productType === "VEHICLE") {
      pricePerDay = calculateVehiclePricePerDay(
        parseInt(omv),
        productCondition,
        parseInt(productAge),
        owner.securityScore,
        3,
      );
      pricePerHour = calculateHourlyPrice(pricePerDay, 2);
    } else {
      pricePerDay = calculatePricePerDay(
        parseInt(omv),
        productCondition,
        parseInt(productAge),
        owner.securityScore,
        3,
      );
    }
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
          optimizedImages,
          secondHandPrice: secondHandPrice,
          pricePerHour: (productType === "GADGET" || productType === "VEHICLE") ? pricePerHour : null,
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

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isVirtual: false,
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
        isVirtual: false,
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
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
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


// Ensure optimized directory exists
if (!fs.existsSync(productOptimizedPath)) {
  fs.mkdirSync(productOptimizedPath, { recursive: true });
}

const processImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize({ width: 800 }) // max width for frontend
    .toFormat("webp", { quality: 80 })
    .toFile(outputPath);
};


export const updateProductUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      isForSale,
      isAvailable,
      askingPrice,
      minPrice
    } = req.body;
    if (!req.user) {
      throw new CustomError("Unauthorized", 403);
    }

    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        owner: { select: { securityScore: true, name: true } },
        redCacheCredits: true,
      },
    });

    const normalizeBool = (val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val.toLowerCase() === "true";
      return false;
    };

    const isForSaleBool = normalizeBool(isForSale);
    const isAvailableBool = normalizeBool(isAvailable);

    // Prepare update data
    const updateData = {};
    if (isForSaleBool !== undefined) updateData.isForSale = isForSaleBool;
    if (isAvailableBool !== undefined) updateData.isAvailable = isAvailableBool;
    if (updateData.isForSale) {
      updateData.askingPrice = parseInt(askingPrice);
      updateData.minPrice = parseInt(minPrice);
    }

    // Update product + credits in transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const productUpdate = await tx.product.update({
        where: { id },
        data: updateData,
      });

      if (updateData.isAvailable == false && product.redCacheCredits) {
        await tx.redCacheCredit.update({
          where: { id: product.redCacheCredits.id },
          data: {
            isFrozen: true,
          },
        });
      }
      return productUpdate;
    });

    // Invalidate cache
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }
    console.log(`Product: ${product.name} Updated By: `, product.owner.name)

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
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

    if (!req.user || req.user.role !== "ADMIN") {
      throw new CustomError("Unauthorized: Admin access required", 403);
    }

    // Fetch product
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        owner: { select: { securityScore: true } },
        redCacheCredits: true,
      },
    });

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (isForSale) updateData.isForSale = isForSale === "true";
    if (productType) updateData.productType = productType;
    if (productCondition) updateData.productCondition = productCondition;
    if (productAge) updateData.productAge = parseInt(productAge);
    if (omv) updateData.omv = parseInt(omv);
    if (tags) updateData.tags = tags;
    if (productDescription) updateData.productDescription = productDescription;

    // Price recalculation if needed
    let newSecondHandPrice;
    if (omv || productCondition || productAge || productType) {
      const finalOmv = omv ? parseInt(omv) : product.omv;
      const finalCondition = productCondition || product.productCondition;
      const finalAge = productAge ? parseInt(productAge) : product.productAge;

      console.log("final cond: ", finalCondition)
      if (updateData.productType === "GADGET") {
        console.log("Old ppd: ", product.pricePerDay)
        const newPricePerDay = calculateGadgetPricePerDay(
          parseInt(finalOmv),
          finalCondition,
          parseInt(finalAge),
          product.owner.securityScore,
          3,
        );
        const newPricePerHour = calculateHourlyPrice(newPricePerDay, 2);
        updateData.pricePerDay = parseFloat(newPricePerDay);
        updateData.pricePerHour = parseFloat(newPricePerHour);
      } else if (updateData.productType === "VEHICLE") {
        const newPricePerDay = calculateVehiclePricePerDay(
          parseInt(finalOmv),
          finalCondition,
          parseInt(finalAge),
          product.owner.securityScore,
          3,
        );
        const newPricePerHour = calculateHourlyPrice(newPricePerDay, 2);
        updateData.pricePerDay = parseFloat(newPricePerDay);
        updateData.pricePerHour = parseFloat(newPricePerHour);
      } else {
        const newPricePerDay = calculatePricePerDay(
          parseInt(finalOmv),
          finalCondition,
          parseInt(finalAge),
          product.owner.securityScore,
          3,
        );
        updateData.pricePerDay = parseFloat(newPricePerDay);
      }
      newSecondHandPrice = calculateSecondHandPrice(
        parseInt(finalOmv),
        finalCondition,
        parseInt(finalAge),
      );
      updateData.secondHandPrice = parseFloat(newSecondHandPrice);
    }

    // Handle image updates
    let updatedImagePaths = [...product.productImages];
    let updatedOptimizedPaths = [...product.optimizedImages];

    // 1 - Handle deleted images
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : JSON.parse(deleteImages || "[]");

      for (const imagePath of imagesToDelete) {
        const filename = path.basename(imagePath);
        const fullPath = path.join(productUploadsPath, filename);
        const optimizedPath = path.join(productOptimizedPath, filename.replace(/\.[^.]+$/, ".webp"));

        try {
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
          console.log(`Deleted image + optimized: ${filename}`);
        } catch (err) {
          console.error(`Error deleting image ${filename}:`, err);
        }
      }

      updatedImagePaths = updatedImagePaths.filter((p) => !imagesToDelete.includes(p));
      updatedOptimizedPaths = updatedOptimizedPaths.filter((p) => {
        const filename = path.basename(p);
        return !imagesToDelete.some((orig) => path.basename(orig).replace(/\.[^.]+$/, ".webp") === filename);
      });
    }

    // 2 - Handle new uploaded images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const originalPath = `/uploads/products/${file.filename}`;
        const optimizedFilename = file.filename.replace(/\.[^.]+$/, ".webp");
        const optimizedPath = `/uploads/products/optimized/${optimizedFilename}`;

        updatedImagePaths.push(originalPath);
        updatedOptimizedPaths.push(optimizedPath);

        // Process async
        const inputPath = path.join(productUploadsPath, file.filename);
        const outputPath = path.join(productOptimizedPath, optimizedFilename);
        await processImage(inputPath, outputPath);
      }
    }

    // Validate total image count
    if (updatedImagePaths.length > 4) {
      throw new CustomError("Total images cannot exceed 4", 400);
    }

    if (updatedImagePaths.length > 0) {
      updateData.productImages = updatedImagePaths;
      updateData.optimizedImages = updatedOptimizedPaths;
    }

    // Update product + credits in transaction
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

    // 🚀 Invalidate cache
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
