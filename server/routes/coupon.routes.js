import express from 'express'
import { verifyToken } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { activateCoupon, createCoupon, deactivateCoupon, deleteCoupon, getAllCoupons, getCouponById } from '../controllers/coupon.controller.js';

const router = express.Router();

router.get('/', verifyToken, adminMiddleware, getAllCoupons);
router.post('/', verifyToken, adminMiddleware, createCoupon);

// Get coupon by ID
router.get('/:id', verifyToken, adminMiddleware, getCouponById);

// Activate coupon
router.put('/:id/activate', verifyToken, adminMiddleware, activateCoupon);

// Deactivate coupon
router.put('/:id/deactivate', verifyToken, adminMiddleware, deactivateCoupon);

// Delete coupon
router.delete('/:id', verifyToken, adminMiddleware, deleteCoupon);

export default router;