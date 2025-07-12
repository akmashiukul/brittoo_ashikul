import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getUserCreditHistory } from '../controllers/userDashboard.controller.js';

const router = express.Router();

router.get('/credits/credit-history', verifyToken, getUserCreditHistory);

export default router;