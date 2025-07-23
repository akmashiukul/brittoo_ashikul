import express from "express";
import { productImageUpload } from "../middlewares/productImageUpload.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", verifyToken, verificationMiddleware, productImageUpload, createProduct);
router.put("/:id", verifyToken, verificationMiddleware, productImageUpload, updateProduct);
router.delete("/:id", verifyToken, verificationMiddleware, deleteProduct);

export default router;
