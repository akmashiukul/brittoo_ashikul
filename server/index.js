import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './lib/errorHandler.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

//routes
app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})