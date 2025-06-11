import express from 'express'
import { buyBcc } from '../controllers/credit.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';

const router = express.Router();

router.post('/bcc/buy', verifyToken, verificationMiddleware, buyBcc);

export default router;