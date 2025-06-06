import express from "express";
import { productImageUpload } from "../middlewares/productImageUpload.js";
import { createProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", verifyToken, productImageUpload, createProduct);
router.put("/:id", verifyToken, productImageUpload, updateProduct);

export default router;
