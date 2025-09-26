import { verifyToken } from "../grpc/authClient.js";
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const result = await verifyToken(token);
    if(!result.valid) {
      return res.status(403).json({ message: result.error });
    }
    req.user = { name: result.name, id: result.id };
    next();
  } catch (error) {
    console.error("gRPC error:", error);
    res.status(500).json({ message: "Auth service unavailable" });
  }
}