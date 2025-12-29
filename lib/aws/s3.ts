import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

export async function getSignedUrlForObject(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function uploadDocumentToS3(
  fileBuffer: Buffer,
  sessionId: string,
  fileType: 'front' | 'back' | 'face-crop' | 'liveness',
  contentType: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = contentType.split('/')[1];
  const key = `documents/${sessionId}/${fileType}-${timestamp}.${extension}`;

  return await uploadToS3(fileBuffer, key, contentType);
}

export function getS3BucketName(): string {
  return BUCKET_NAME;
}

export { s3Client, BUCKET_NAME };
