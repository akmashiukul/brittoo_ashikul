import express from "express";
import { productImageUpload } from "../middlewares/productImageUpload.js";
import { createProduct, getProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", productImageUpload, createProduct);

export default router;
