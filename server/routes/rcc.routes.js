import express from 'express'
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { getUsersAvailableRcc } from '../controllers/rcc.controller.js';

const router = express.Router();

router.get('/available/:userId', verifyToken, verificationMiddleware, getUsersAvailableRcc);

export default router;