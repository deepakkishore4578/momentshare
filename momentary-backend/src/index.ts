import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// CRITICAL FIX: Define the Vercel URL directly as the allowed origin.
// REPLACE "https://momentshare.vercel.app" with YOUR exact Vercel domain.
const VERCEL_FRONTEND_URL = "https://momentshare.vercel.app"; 

const corsOptions = {
    origin: VERCEL_FRONTEND_URL, // Pass the single string here
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    optionsSuccessStatus: 204
};

// --- Middleware ---
// Express now receives a clean cors function call with a single string option.
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