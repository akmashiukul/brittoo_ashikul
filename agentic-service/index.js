import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import negotiationRoutes from './routes/negotiation.routes.js';
import { errorHandler } from '../server/lib/errorHandler.js';
import connectToDB from './configs/mongodb.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: ["https://brittoo.xyz", "https://www.brittoo.xyz", "http://localhost:5173"],
  credentials: true
}));
app.set('trust proxy', 1);
app.use(express.json());
const port = process.env.PORT || 5001;
connectToDB();

app.use('/api/v2/agents', negotiationRoutes);
app.get('/', (req, res) => res.send('Hello from agentic service!'))


app.use(errorHandler);
app.listen(port, () => console.log(`Agentic service listening on port ${port}!`))