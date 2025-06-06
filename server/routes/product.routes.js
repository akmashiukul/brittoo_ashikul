import express from "express";
import { productImageUpload } from "../middlewares/productImageUpload.js";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", verifyToken, productImageUpload, createProduct);
router.put("/:id", verifyToken, productImageUpload, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
