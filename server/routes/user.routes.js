import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { getAllUsers, getUserDetails } from "../controllers/user.controller.js";
const router = express.Router();

router.get('/', verifyToken, adminMiddleware, getAllUsers);
router.get('/:userId', verifyToken, adminMiddleware, getUserDetails);

export default router;
