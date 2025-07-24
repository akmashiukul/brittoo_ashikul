import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { holdProduct } from '../controllers/adminDashboard.controller.js';

const router = express.Router();

router.put("/hold/:productId", verifyToken, adminMiddleware, holdProduct);

export default router;