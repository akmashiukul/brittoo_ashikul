import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { getAllUsers, getUserCreditHistory, getUserDetails } from "../controllers/user.controller.js";
const router = express.Router();

router.get('/', verifyToken, adminMiddleware, getAllUsers);
router.get('/:userId', verifyToken, adminMiddleware, getUserDetails);
router.get('/admin/credit-history', verifyToken, adminMiddleware, getUserCreditHistory);

export default router;
