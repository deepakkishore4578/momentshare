import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// --- Define the CORS Configuration Object ---
// CRITICAL: Replace "https://momentshare.vercel.app" with your actual Vercel domain
const allowedOrigins = [
  "https://momentshare.vercel.app", 
  "http://localhost:5173" 
];

const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    optionsSuccessStatus: 204
};

// --- Middleware ---
// Pass the corsOptions object to the cors function
app.use(cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send('Momentary Backend is Running!');
});

// Use our API routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);

  console.log(`Storage mode: ${process.env.STORAGE_TYPE}`);
  // Start the cleanup job to run every minute
  setInterval(runCleanupJob, 60 * 1000); 
  console.log('File cleanup job scheduled to run every 60 seconds.');
});