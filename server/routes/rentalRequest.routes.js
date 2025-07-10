import express from "express";
import {
  acceptRentalRequest,
  createRentalRequest,
  getOwnerRentalRequests,
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
router.get("/owner-requests", verifyToken, getOwnerRentalRequests);
router.put("/accept/:requestId", verifyToken, verificationMiddleware, acceptRentalRequest);

export default router;
