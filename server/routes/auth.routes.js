import express from 'express';
import { login, register, resendOTP, verifyOTP } from '../controllers/auth.controller.js';
import { loginLimiter, verifyOtpLimiter } from '../middlewares/rateLimiters.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { verifyUser } from '../controllers/verification.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtpLimiter, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, login);
router.post("/verify-user", verifyToken, uploadMiddleware, verifyUser);

export default router;