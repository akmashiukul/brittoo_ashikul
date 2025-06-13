import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { getAllUsers } from "../controllers/user.controller.js";
const router = express.Router();

router.get('/', verifyToken, adminMiddleware, getAllUsers);

export default router;
