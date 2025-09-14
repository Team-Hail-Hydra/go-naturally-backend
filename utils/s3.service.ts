import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();


// Validate required environment variables
const requiredEnvVars = {
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
  S3_BUCKET_SECRET_ACCESS_KEY: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
  S3_BUCKET_REGION: process.env.S3_BUCKET_REGION || "ap-south-1"
};

console.log("Loading S3 configuration from environment variables...");
console.log("S3_BUCKET_NAME:", requiredEnvVars.S3_BUCKET_NAME ? "set" : "NOT SET");
console.log("S3_BUCKET_ACCESS_KEY_ID:", requiredEnvVars.S3_BUCKET_ACCESS_KEY_ID ? "set" : "NOT SET");
console.log("S3_BUCKET_SECRET_ACCESS_KEY:", requiredEnvVars.S3_BUCKET_SECRET_ACCESS_KEY ? "set" : "NOT SET");
console.log("S3_BUCKET_REGION:", requiredEnvVars.S3_BUCKET_REGION);

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("Missing required environment variables:", missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log("S3 Configuration:", {
  bucket: requiredEnvVars.S3_BUCKET_NAME,
  region: requiredEnvVars.S3_BUCKET_REGION,
  hasAccessKey: !!requiredEnvVars.S3_BUCKET_ACCESS_KEY_ID,
  hasSecretKey: !!requiredEnvVars.S3_BUCKET_SECRET_ACCESS_KEY,
  endpoint: process.env.STORAGE_URL || "default AWS S3"
});

// Configure S3 client
const s3Client = new S3Client({
  region: requiredEnvVars.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: requiredEnvVars.S3_BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: requiredEnvVars.S3_BUCKET_SECRET_ACCESS_KEY!,
  },
  // For Supabase or custom S3 endpoints
  endpoint: process.env.STORAGE_URL || undefined,
  forcePathStyle: process.env.STORAGE_URL ? true : false,
});

const BUCKET_NAME = requiredEnvVars.S3_BUCKET_NAME!;

export interface UploadResult {
  key: string;
  url: string;
  location: string;
}

/**
 * Upload a file to S3
 * @param fileBuffer - The file buffer
 * @param fileName - Original file name
 * @param contentType - MIME type of the file
 * @param folder - Optional folder prefix
 * @returns Upload result with key and URL
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  try {
    console.log("Upload attempt:", {
      bucket: BUCKET_NAME,
      fileName,
      contentType,
      folder,
      fileSize: fileBuffer.length
    });

    // Generate unique file name
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Upload parameters
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Make the object publicly readable (optional)
      // ACL: "public-read" as ObjectCannedACL,
    };

    console.log("Upload params:", {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      BodyLength: fileBuffer.length
    });

    // Upload to S3
    const command = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(command);
    
    console.log("Upload successful:", result);

    // Generate the public URL
    const baseUrl = process.env.PUBLIC_STORAGE_URL || `https://${BUCKET_NAME}.s3.${requiredEnvVars.S3_BUCKET_REGION}.amazonaws.com`;
    const url = `${baseUrl}/${key}`;

    return {
      key,
      url,
      location: url,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    console.error("Upload parameters were:", {
      bucket: BUCKET_NAME,
      hasBuffer: !!fileBuffer,
      bufferLength: fileBuffer?.length,
      fileName,
      contentType
    });
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a presigned URL for downloading a file
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

/**
 * Delete a file from S3
 * @param key - S3 object key
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
}