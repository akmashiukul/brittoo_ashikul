import express from 'express'
import { acceptCreditRequest, buyBcc, getPendingCreditRequests, rejectCreditRequest } from '../controllers/credit.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/bcc/buy', verifyToken, verificationMiddleware, buyBcc);
router.get('/bcc/pending', verifyToken, adminMiddleware, getPendingCreditRequests);
router.post('/bcc/accept/:creditId', verifyToken, adminMiddleware, acceptCreditRequest);
router.put('/bcc/reject/:creditId', verifyToken, adminMiddleware, rejectCreditRequest);

export default router;