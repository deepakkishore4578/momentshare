import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// 1. --- Define the "Contract" ---
// This interface defines the functions any storage service MUST have.
export interface IStorageService {
  save(file: Express.Multer.File): Promise<string>; // Returns the storage key/path
  getDownloadUrl(storageKey: string, originalName: string): Promise<string>;
  delete(storageKey: string): Promise<void>;
}

// 2. --- S3 Storage Implementation ---
class S3Storage implements IStorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME!;
    this.client = new S3Client({
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    console.log('Using S3 Storage');
  }

  async save(file: Express.Multer.File): Promise<string> {
    // Generate a unique key (e.g., 1678886400000-report.pdf)
    const storageKey = `${Date.now()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: fs.createReadStream(file.path), // Stream from multer's temp file
      ContentType: file.mimetype,
    });
    
    await this.client.send(command);
    
    // After streaming to S3, delete the local temp file
    await fs.promises.unlink(file.path);
    
    return storageKey;
  }

  async getDownloadUrl(storageKey: string, originalName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      // Tell S3 to send this as an attachment with the original name
      ResponseContentDisposition: `attachment; filename="${originalName}"`,
    });
    
    // Create a pre-signed URL valid for 5 minutes
    return getSignedUrl(this.client, command, { expiresIn: 300 });
  }

  async delete(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });
    await this.client.send(command);
  }
}

// 3. --- Local Storage Implementation ---
class LocalStorage implements IStorageService {
  private storagePath = path.resolve(process.cwd(), 'uploads');

  constructor() {
    // Ensure the uploads directory exists
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
    console.log('Using Local Storage');
  }

  async save(file: Express.Multer.File): Promise<string> {
    // When using local, the file is already saved by multer.
    // The 'storageKey' is just its full path.
    return file.path;
  }

  async getDownloadUrl(storageKey: string, originalName: string): Promise<string> {
    // For local, the "URL" is just the storage path.
    // Our /download endpoint will handle this path.
    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    try {
      await fs.promises.unlink(storageKey);
    } catch (err: any) {
      // It's okay if the file is already gone
      if (err.code !== 'ENOENT') {
        console.error(`Error deleting local file ${storageKey}:`, err);
      }
    }
  }
}

// 4. --- The "Switch" ---
// This is the single instance our app will use.
// It checks .env and creates the correct service.
let storageService: IStorageService;

if (process.env.STORAGE_TYPE === 's3') {
  storageService = new S3Storage();
} else {
  storageService = new LocalStorage();
}

export default storageService;