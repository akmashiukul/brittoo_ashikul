import express from 'express';
import { negotiatePrice } from '../controllers/negotiation.controller.js';
import { negotiationRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/negotiate', negotiationRateLimiter, negotiatePrice);

export default router;