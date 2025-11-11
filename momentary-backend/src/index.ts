import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';

// CRITICAL FIX: Use require() to guarantee Express gets a middleware function
const cors = require('cors') as express.RequestHandler; 

const app = express();
const PORT = process.env.PORT || 8080;

// --- Define the CORS Configuration Object ---
const allowedOrigins = [
  "https://momentshare.vercel.app", // Your Vercel domain
  "http://localhost:5173" 
];

const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    optionsSuccessStatus: 204
};

// --- Middleware ---
// CRITICAL FIX: The cors function is used here
app.use(cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send('Momentary Backend is Running!');
});

app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
  console.log(`Storage mode: ${process.env.STORAGE_TYPE}`);
  setInterval(runCleanupJob, 60 * 1000); 
  console.log('File cleanup job scheduled to run every 60 seconds.');
});