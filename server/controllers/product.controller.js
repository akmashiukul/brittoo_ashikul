import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { calculatePricePerDay } from "../lib/calculatePrice.js";
import { calculateSecondHandPrice } from "../lib/calculateSecondHandPrice.js";
import { CustomError } from "../lib/customError.js";

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
    if (!req.files || req.files.length === 0) {
      throw new CustomError("At least one product image is required", 400);
    }
    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(async (file) => await uploadToCloudinary(file))
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
          productImages: imageUrls, // Store Cloudinary URLs
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

    await redisClient.setEx(cacheKey, 20, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting products:", error);
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
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

    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }

    const owner = await prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
    });

    const existingProduct = await prisma.product.findUniqueOrThrow({
      where: { id: id },
    });

    if (existingProduct.ownerId !== req.user.id) {
      throw new CustomError(
        "Unauthorized: You can only update your own products",
        403,
      );
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (isForSale) updateData.isForSale = isForSale === "false" ? false : true;
    if (productType) updateData.productType = productType;
    if (productCondition) updateData.productCondition = productCondition;
    if (productAge) updateData.productAge = parseInt(productAge);
    if (omv) updateData.omv = parseInt(omv);
    if (tags) updateData.tags = tags;
    if (productDescription) updateData.productDescription = productDescription;

    if (omv || productCondition || productAge) {
      const newPrice = calculatePricePerDay(
        omv ? parseInt(omv) : existingProduct.omv,
        productCondition || existingProduct.productCondition,
        productAge ? parseInt(productAge) : existingProduct.productAge,
        owner.securityScore,
        3,
      );
      const newSecondHandPrice = calculateSecondHandPrice(
        omv ? parseInt(omv) : existingProduct.omv,
        productCondition || existingProduct.productCondition,
        productAge ? parseInt(productAge) : existingProduct.productAge,
      );

      updateData.pricePerDay = parseFloat(newPrice);
      updateData.secondHandPrice = parseFloat(newSecondHandPrice);
    }

    // Handle image updates
    let updatedImageUrls = [...existingProduct.productImages];
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : JSON.parse(deleteImages || "[]");

      for (const imageUrl of imagesToDelete) {
        // Extract public ID/url from Cloudinary URL
        const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`);
        } catch (err) {
          console.error(`Error deleting image ${publicId}:`, err);
        }
      }
      updatedImageUrls = updatedImageUrls.filter(
        (url) => !imagesToDelete.includes(url),
      );
    }

    if (req.files && req.files.length > 0) {
      const newImageUrls = await Promise.all(
        req.files.map(async (file) => await uploadToCloudinary(file)),
      );
      updatedImageUrls = [...updatedImageUrls, ...newImageUrls];
    }

    if (updatedImageUrls.length > 4) {
      throw new CustomError("Total images cannot exceed 4", 400);
    }

    if (updatedImageUrls.length > 0) {
      updateData.productImages = updatedImageUrls;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: updateData,
    });

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

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }
    const product = await prisma.product.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: {
        rentalRequests: {
          where: {
            status: {
              in: [
                'REQUESTED_BY_RENTER',
                'ACCEPTED_BY_OWNER',
                'PRODUCT_SUBMITTED_BY_OWNER',
                'PRODUCT_COLLECTED_BY_RENTER',
                'PRODUCT_RETURNED_BY_RENTER',
              ]
            }
          }
        },
      }
    });

    if (product.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      throw new CustomError(
        "Unauthorized: You can only delete your own products",
        403,
      );
    }
    const refRcc = await prisma.redCacheCredit.findFirst({
      where: {
        sourceProductId: product.id
      }
    });
    if (refRcc.inUse > 0) {
      throw new CustomError("Can't delete product. Red Credit referencing this product is in use.", 400);
    }
    if (product.rentalRequests.length > 0) {
      throw new CustomError("Cannot delete product with active rental requests. Please handle pending requests first.", 400);
    }
    if (product.isOnHold) {
      throw new CustomError("Cannot delete product that is currently on hold", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
      await tx.redCacheCredit.update({
        where: {
          sourceProductId: product.id
        },
        data: {
          deletedAt: new Date()
        }
      });
    })

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
    console.error(error);
    next(error);
  }
};
