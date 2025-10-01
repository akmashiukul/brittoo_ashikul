import express from "express";
import { createOrGetChatRoom, deleteChatRoom, getChatMessages, getMyChatRooms } from "../../controllers/user-controllers/purchaseChat.controller.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Create or get chat room for a product
router.post("/room", verifyToken, createOrGetChatRoom);

// Get all chat rooms for current user
router.get("/rooms", verifyToken, getMyChatRooms);

// Get messages for a specific chat room
router.get("/room/:chatRoomId/messages", verifyToken, getChatMessages);

// Delete chat room
router.delete("/room/:chatRoomId", verifyToken, deleteChatRoom);

export default router;