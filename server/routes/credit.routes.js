import express from 'express'
import { buyBcc, getPendingCreditRequests } from '../controllers/credit.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/bcc/buy', verifyToken, verificationMiddleware, buyBcc);
router.get('/bcc/pending', verifyToken, adminMiddleware, getPendingCreditRequests);

export default router;