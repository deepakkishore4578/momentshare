import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api';
import { runCleanupJob } from './core/storage';
import cors from 'cors'; // <-- Use this standard import

const app = express();
const PORT = process.env.PORT || 8080;

// --- Define the CORS Configuration Object ---
const allowedOrigins = [
  "https://momentshare.vercel.app", // Your primary domain
  "http://localhost:5173" // Your local dev environment
];

const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", 
    optionsSuccessStatus: 204
};

// --- Middleware ---
// CRITICAL: Use the standard cors import and options object
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