import express from 'express';
import { login, register, resendOTP, verifyOTP } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middlewares/rateLimiters.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, login);

export default router;