import express from "express";
import { createRentalRequest } from "../controllers/rentalRequest.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";

const router = express.Router();

router.post(
  "/createRequest",
  verifyToken,
  verificationMiddleware,
  createRentalRequest,
);

export default router;
