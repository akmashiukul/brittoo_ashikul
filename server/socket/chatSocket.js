import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { safeAuthUserSelect } from "../lib/prismaSelects.js";

let io;

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173", // Specify exact origin
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Socket Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log("Socket auth attempt, token present:", !!token);

      if (!token) {
        console.error("No token provided in socket auth");
        return next(new Error("Auth token missing in socket auth middleware"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded for user:", decoded.id);

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
          deletedAt: null
        },
        select: safeAuthUserSelect,
      });

      if (!user) {
        console.error("User not found:", decoded.id);
        return next(new Error("Access denied or user not found"));
      }

      if (user.isSuspended) {
        console.error("User is suspended:", decoded.id);
        return next(new Error("Account is suspended"));
      }

      socket.user = user;
      socket.userId = user.id;
      console.log("Socket auth successful for user:", user.id);
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      if (error.name === "TokenExpiredError") {
        return next(new Error("Token expired"));
      }
      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid token"));
      }
      next(new Error("Authentication error"));
    }
  });

  // On connect
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket ID: ${socket.id})`);
    onlineUsers.set(socket.userId, socket.id);
    io.emit("user_online", { userId: socket.userId });

    socket.on("join_room", async ({ chatRoomId }) => {
      try {
        console.log(`User ${socket.userId} attempting to join room: ${chatRoomId}`);

        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            id: chatRoomId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId }
            ]
          }
        });

        if (!chatRoom) {
          console.error(`Access denied: User ${socket.userId} not part of room ${chatRoomId}`);
          socket.emit("error", { message: "Access denied to this chat room" });
          return;
        }

        socket.join(chatRoomId);
        console.log(`✅ User ${socket.userId} joined room: ${chatRoomId}`);

        // Mark messages as read
        await prisma.message.updateMany({
          where: {
            chatRoomId,
            senderId: { not: socket.userId },
            isRead: false
          },
          data: {
            isRead: true
          }
        });

        socket.to(chatRoomId).emit("messages_read", { chatRoomId });
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join chat room" });
      }
    });

    // Send message
    socket.on("send_message", async ({ chatRoomId, content }) => {
      try {
        console.log(`📨 User ${socket.userId} sending message to room: ${chatRoomId}`);

        // Verify user is part of this chat room
        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            id: chatRoomId,
            OR: [
              { buyerId: socket.userId },
              { sellerId: socket.userId }
            ]
          },
          include: {
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } }
          }
        });

        if (!chatRoom) {
          console.error(`Access denied: User ${socket.userId} not part of room ${chatRoomId}`);
          socket.emit("error", { message: "Access denied to this chat room" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            chatRoomId,
            senderId: socket.userId,
            content: content.trim()
          },
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        });

        console.log(`✅ Message created:`, message.id);

        // Send the message to all users in this room
        io.to(chatRoomId).emit("new_message", {
          ...message,
          chatRoomId
        });

        // PUSH notifications for offline users
        const recipientId = socket.userId === chatRoom.buyerId ? chatRoom.sellerId : chatRoom.buyerId;
        if (!onlineUsers.has(recipientId)) {
          console.log(`📲 Recipient ${recipientId} is offline, send push notification`);
          // TODO: Implement push notification
        }
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ chatRoomId, isTyping }) => {
      socket.to(chatRoomId).emit("user_typing", {
        userId: socket.userId,
        isTyping
      });
    });

    // Leave room
    socket.on("leave_room", (chatRoomId) => {
      socket.leave(chatRoomId);
      console.log(`User ${socket.userId} left room ${chatRoomId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User ${socket.userId} disconnected: ${reason}`);
      onlineUsers.delete(socket.userId);
      io.emit("user_offline", { userId: socket.userId });
    });
  });

  console.log("✅ Socket.IO initialized successfully");

  return io;
}

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
}