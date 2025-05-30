import express from 'express';
import { register, resendOTP, verifyOTP } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP)

export default router;