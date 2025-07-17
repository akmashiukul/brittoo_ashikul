import express from "express";
import { createWithdrawalRequest, getUsersWithdrawalRequests } from "../controllers/withdrawalRequest.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { verificationMiddleware } from "../middlewares/verificationMiddleware.js";

const router = express.Router();

router.post(
  "/request",
  verifyToken,
  verificationMiddleware,
  createWithdrawalRequest,
);
router.get(
  "/",
  verifyToken,
  verificationMiddleware,
  getUsersWithdrawalRequests,
);

export default router;
