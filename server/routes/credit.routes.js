import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getUserCreditHistory } from '../controllers/credits.controller.js';

const router = express.Router();

router.get('/user/credit-history', verifyToken, getUserCreditHistory);

export default router;