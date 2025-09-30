import express from "express";
import { getAllPurchaseRequests, updatePurchasePaymentStatus, updatePurchaseRequestStatus } from "../../controllers/admin-controllers/purchaseRequestAdmin.controller";
import { adminMiddleware } from "../../middlewares/adminMiddleware";

const router = express.Router();

// Admin routes
router.get("/all", adminMiddleware, getAllPurchaseRequests);
router.put("/:requestId/status", adminMiddleware, updatePurchaseRequestStatus);
router.put("/:requestId/payment-status", adminMiddleware, updatePurchasePaymentStatus);

export default router;