import express from "express";
import {
  createRentalRequest,
  getUserPlacedRequests
} from "../controllers/rentalRequest.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";

const router = express.Router();

router.post(
  "/create-request",
  verifyToken,
  verificationMiddleware,
  createRentalRequest,
);
router.get("/placed-requests", verifyToken, getUserPlacedRequests);

export default router;
