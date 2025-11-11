import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';
import * as cors from 'cors'; // CRITICAL FIX: Import as *

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
// CRITICAL FIX: Use .default to call the function
app.use(cors.default(corsOptions)); 

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
  // ... (rest of startup logs and job schedule)
});