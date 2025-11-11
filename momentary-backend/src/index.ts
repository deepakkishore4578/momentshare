import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';
import cors from 'cors';

// CRITICAL: Get PORT from environment or default to 8080.
// Use 'as string' to handle the process.env property safely.
const PORT = (process.env.PORT || 8080) as string | number; 

// CRITICAL FIX: Convert the port to an integer for app.listen
const LISTEN_PORT = parseInt(PORT as string, 10); 

const app = express();

// --- Define the CORS Configuration Object ---
// Vercel URL is defined here for final deployment safety
const VERCEL_FRONTEND_URL = "https://momentshare.vercel.app"; 

const corsOptions = {
    origin: VERCEL_FRONTEND_URL, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    optionsSuccessStatus: 204
};

// --- Middleware ---
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send('Momentary Backend is Running!');
});

app.use('/api', apiRoutes);

// Start the server
// CRITICAL FIX: Use LISTEN_PORT and bind to host '0.0.0.0'
app.listen(LISTEN_PORT, '0.0.0.0', () => { 
  console.log(`Server is listening on http://0.0.0.0:${LISTEN_PORT}`); 
  console.log(`Storage mode: ${process.env.STORAGE_TYPE}`);
  setInterval(runCleanupJob, 60 * 1000); 
  console.log('File cleanup job scheduled to run every 60 seconds.');
});