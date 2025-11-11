import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import storageService from '../core/storageService';
// 1. Import our new storage and helper functions
import {
  fileDatabase,
  generateCode,
  calculateExpiry,
  FileMetadata
} from '../core/storage';

// Multer config (no change here)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ dest: 'temp-uploads/'});
const router = Router();

// /api/upload endpoint
// ... in src/routes/api.ts

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const retention = req.body.retention; // "10", "20", or "30"

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // 1. Save the file using the service (sends to S3 or local)
    const storageKey = await storageService.save(file);

    // 2. Generate code and save metadata (this logic is the same)
    const code = generateCode();
    const expiryTime = calculateExpiry(retention);

    const metadata: FileMetadata = {
      originalName: file.originalname,
      storageKey: storageKey, // Use the key from the service
      expiryTime: expiryTime,
    };

    fileDatabase.set(code, metadata);
    console.log(`File stored with code: ${code} (key: ${storageKey})`);

    res.status(201).json({ code: code });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Server error');
  }
});

// ... in src/routes/api.ts

router.get('/download/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    if (!code) {
      return res.status(400).send('No code provided.');
    }

    const metadata = fileDatabase.get(code);
    if (!metadata) {
      return res.status(404).send('File not found or has expired.');
    }

    if (Date.now() > metadata.expiryTime) {
      return res.status(404).send('File not found or has expired.');
    }

    // 1. Get the download URL from the service
    const urlOrPath = await storageService.getDownloadUrl(
      metadata.storageKey,
      metadata.originalName
    );

    // 2. Handle the response
    if (process.env.STORAGE_TYPE === 's3') {
      // If it's S3, redirect the user to the pre-signed URL
      res.redirect(urlOrPath);
    } else {
      // If it's local, use res.download on the path
      res.download(urlOrPath, metadata.originalName);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Server error');
  }
});


export default router;