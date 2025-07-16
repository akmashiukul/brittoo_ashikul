import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  getAllUsers,
  getUserCreditHistory,
  getUserDetails,
  getUserPlacedRequestsAdmin,
  getUserRecievedRequestsAdmin,
  suspendUser,
  verifyUser,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/", verifyToken, adminMiddleware, getAllUsers);
router.get("/:userId", verifyToken, adminMiddleware, getUserDetails);
router.get(
  "/admin/credit-history/:userId",
  verifyToken,
  adminMiddleware,
  getUserCreditHistory,
);
router.get(
  "/placed-requests/:userId",
  verifyToken,
  adminMiddleware,
  getUserPlacedRequestsAdmin,
);
router.get(
  "/recieved-requests/:userId",
  verifyToken,
  adminMiddleware,
  getUserRecievedRequestsAdmin,
);

// User states controll
router.put("/verify/:userId", verifyToken, adminMiddleware, verifyUser);
router.put("/suspend/:userId", verifyToken, adminMiddleware, suspendUser);

export default router;
