import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import negotiationRoutes from './routes/negotiation.routes.js';

dotenv.config();
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5001;

app.use('/api/v2/agents', negotiationRoutes);


app.get('/', (req, res) => res.send('Hello from agentic service!'))
app.listen(port, () => console.log(`Agentic service listening on port ${port}!`))