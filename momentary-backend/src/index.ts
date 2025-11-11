import dotenv from 'dotenv';
dotenv.config(); // This line loads the .env file
import express from 'express';
import type { Request, Response } from 'express';
import apiRoutes from './routes/api'; // 1. Import our new routes
import { runCleanupJob } from './core/storage';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middleware ---
// 2. Add middleware to parse JSON request bodies
const allowedOrigins = [
  "https://momentshare.vercel.app", // Your primary domain
  "http://localhost:5173" // Your local dev environment
  // NOTE: Render will also accept environment variables for other domains.
  // For simplicity, we just add the production URL and rely on Render's
  // built-in handling for the other branches/previews.
];
app.use(cors({
  origin: allowedOrigins // <--- If allowedOrigins is undefined, this can fail
}));
app.use(express.json());
// 3. Add middleware to parse URL-encoded form data (like 'retention')
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (req: Request, res: Response) => {
  res.send('Momentary Backend is Running!');
});

// 4. Use our API routes
//    All routes in 'apiRoutes' will be prefixed with /api
app.use('/api', apiRoutes);

// Start the server
// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);

  console.log(`Storage mode: ${process.env.STORAGE_TYPE}`);
  // 2. Start the cleanup job to run every minute
  // (1000ms * 60 = 1 minute)
  setInterval(runCleanupJob, 60 * 1000); 
  console.log('File cleanup job scheduled to run every 60 seconds.');
});