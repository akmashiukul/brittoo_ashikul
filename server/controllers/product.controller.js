import prisma from "../config/prisma.js";
import redisClient from "../config/redis.js";
import { calculatePricePerDay } from "../lib/calculatePrice.js";
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
    } = req.body;

    if (!req.user || !req.user.id) {
      throw new CustomError("Unauthorized: No user authenticated", 401);
    }

    const owner = await prisma.user.findUniqueOrThrow({
      where: {
        id: req.user.id
      }
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
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json(cached);
    }

    const filters = {};

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
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting products:", error);
    next(error);
  }
};
