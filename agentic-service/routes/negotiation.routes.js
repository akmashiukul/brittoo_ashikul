import express from 'express';
import { negotiatePrice } from '../controllers/negotiation.controller.js';
import { negotiationRateLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/negotiate', negotiationRateLimiter, authMiddleware, negotiatePrice);

export default router;