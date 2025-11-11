import * as fs from 'fs'
import storageService from './storageService';
// This interface defines the "shape" of our metadata
export interface FileMetadata {
  originalName: string; // e.g., 'report.pdf'
  storageKey: string;    // e.g., 'uploads/report.pdf'
  expiryTime: number;     // e.g., 1678886400000 (a future timestamp)
}

// This is our in-memory database.
// The key (string) will be the 4-character code.
// The value (FileMetadata) will be the object above.
export const fileDatabase = new Map<string, FileMetadata>();

/**
 * Generates a random 4-character alphanumeric code.
 * In a real app, you'd check for collisions, but this is fine for now.
 */
export function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculates the expiry timestamp.
 * @param retentionMinutes - The retention time as a string (e.g., "10").
 * @returns A future time in milliseconds.
 */
export function calculateExpiry(retentionMinutes: string): number {
  // Convert string to number, default to 10 if invalid
  const minutes = parseInt(retentionMinutes, 10) || 10;
  // Date.now() is in milliseconds, so multiply minutes * 60 * 1000
  return Date.now() + (minutes * 60 * 1000);
}

// ... in src/core/storage.ts

export async function runCleanupJob() { // Make the function async
  console.log('Running cleanup job...');
  const now = Date.now();

  for (const [code, metadata] of fileDatabase.entries()) {

    if (now > metadata.expiryTime) {
      console.log(`File ${code} (${metadata.originalName}) has expired. Deleting...`);

      // 1. Delete using the storage service (works for S3 or Local)
      try {
        await storageService.delete(metadata.storageKey);
        console.log(`Successfully deleted from storage: ${metadata.storageKey}`);
      } catch (err) {
        console.error(`Error deleting from storage ${metadata.storageKey}:`, err);
      }

      // 2. Remove from database
      fileDatabase.delete(code);
    }
  }
  console.log(`Cleanup complete. Database size: ${fileDatabase.size}`);
}