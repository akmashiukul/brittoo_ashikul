import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./lib/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cors from 'cors';
import { multerErrorHandler } from "./lib/multerErrorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import bccRoutes from './routes/bcc.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())
const PORT = process.env.PORT || 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes
app.get("/", (req, res) => {
  res.send("Britto Server is Running....");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/credit/bcc", bccRoutes);
app.use("/api/v1/users", userRoutes);

app.use(errorHandler);
app.use(multerErrorHandler);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is dancing on http://localhost:${PORT} \n${new Date(Date.now()).toLocaleTimeString()}
    `);
});

// ngrok http --url=evolving-champion-bullfrog.ngrok-free.app 80