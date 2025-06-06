import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { calculatePricePerDay } from "../lib/calculatePrice.js";
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
    } = req.body;
    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }
    const owner = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    });
    console.log(owner.email);
    if (!owner) {
      throw new CustomError("Unauthorized", 401);
    }
    if (!req.files || req.files.length === 0) {
      throw new CustomError("At least one product image is required", 400);
    }
    const imagePaths = req.files.map(
      (file) => `/uploads/products/${file.filename}`,
    );
    const pricePerDay = calculatePricePerDay(
      omv,
      productCondition,
      productAge,
      owner.securityScore,
      3,
    );
    const product = await prisma.product.create({
      data: {
        name,
        pricePerDay: parseFloat(pricePerDay),
        productType,
        productCondition,
        productAge: parseInt(productAge),
        omv: parseInt(omv),
        tags,
        productDescription,
        ownerId: req.user.id,
        productImages: imagePaths,
      },
    });
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Cache invalidated:", keys);
    }
    return res.status(201).json({
      success: true,
      message: "Product Listed Successfully",
      product,
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
      minAge,
      maxAge,
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

    if(productId) {
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

    if (minAge || maxAge) {
      filters.productAge = {};
      if (minAge) filters.productAge.gte = parseInt(minAge);
      if (maxAge) filters.productAge.lte = parseInt(maxAge);
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

    const products = await prisma.product.findMany({
      where: {
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
            brittooVerified: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.product.count({
      where: {
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
    } = req.body;

    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }
    const owner = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    });
    const existingProduct = await prisma.product.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    if (existingProduct.ownerId !== req.user.id) {
      throw new CustomError("Unauthorized: You can only update your own products", 403);
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (productType) updateData.productType = productType;
    if (productCondition) updateData.productCondition = productCondition;
    if (productAge) updateData.productAge = parseInt(productAge);
    if (omv) updateData.omv = parseInt(omv);
    if (tags) updateData.tags = tags;
    if (productDescription) updateData.productDescription = productDescription;
    if (omv || productCondition || productAge) {
      const newPrice = calculatePricePerDay(
        omv || existingProduct.omv,
        productCondition || existingProduct.productCondition,
        productAge || existingProduct.productAge,
        owner.securityScore,
        3,
      );
      updateData.pricePerDay = parseFloat(newPrice);
    }

    // Handle image updates
    let updatedImagePaths = [...existingProduct.productImages];
    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages) ? deleteImages : JSON.parse(deleteImages || "[]");
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
      updatedImagePaths = updatedImagePaths.filter((path) => !imagesToDelete.includes(path));
    }

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
      updatedImagePaths = [...updatedImagePaths, ...newImagePaths];
    }

    if (updatedImagePaths.length > 4) {
      throw new CustomError("Total images cannot exceed 4", 400);
    }

    if (updatedImagePaths.length > 0) {
      updateData.productImages = updatedImagePaths;
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
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
      where: { id },
    });

    if (product.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      throw new CustomError("Unauthorized: You can only delete your own products", 403);
    }

    if (product.productImages && product.productImages.length > 0) {
      for (const imagePath of product.productImages) {
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
    }

    await prisma.product.delete({
      where: { id },
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
    console.error(error);
    next(error);
  }
};