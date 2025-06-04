import prisma from "../config/prisma.js";
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
      ownerId,
    } = req.body;

    const imagePaths = req.files.map(
      (file) => `/uploads/products/${file.filename}`,
    );

    const owner = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!owner) {
      throw new CustomError("Unauthorized", 403);
    }

    pricePerDay = calculatePricePerDay(omv, productCondition, productAge, owner.safetyScore, 3);

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
        ownerId,
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
      limit = 10,
    } = req.query;

    const filters = {};

    // Apply filters if present
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

    // Build OR search clause for name, tags, description
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

    res.json({
      data: products,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error getting products:", error);
    next(error);
  }
};
