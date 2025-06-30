import express from 'express';
import { checkPassword, login, register, resendOTP, verifyOTP } from '../controllers/auth.controller.js';
import { loginLimiter, verifyOtpLimiter } from '../middlewares/rateLimiters.js';
import { uploadMiddleware } from '../middlewares/uploadMiddleware.js';
import { verifyUser } from '../controllers/verification.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { verificationMiddleware } from '../middlewares/verificationMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtpLimiter, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, login);
router.post("/verify-user", verifyToken, uploadMiddleware, verifyUser);
router.post('/check-password', verifyToken, verificationMiddleware, checkPassword);

export default router;