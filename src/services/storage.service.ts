import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { Readable } from 'stream';
import { env } from '../config/env.config';
import { AppError } from '../common/errors/app-error';

export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private testMemoryStore: Map<string, { buffer: Buffer; mimeType: string }>;

  constructor() {
    this.bucketName = env.R2_BUCKET_NAME;
    this.testMemoryStore = new Map();
    this.s3Client = new S3Client({
      region: env.R2_REGION,
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  public generateStorageKey(userId: string, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const uniqueId = crypto.randomUUID();
    return `uploads/${userId}/${uniqueId}${ext}`;
  }

  public generateThumbnailKey(userId: string): string {
    const uniqueId = crypto.randomUUID();
    return `thumbnails/${userId}/${uniqueId}.jpg`;
  }

  public async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    if (env.NODE_ENV === 'test') {
      this.testMemoryStore.set(key, { buffer, mimeType });
      return key;
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      return key;
    } catch (error) {
      console.error('❌ Cloudflare R2 / S3 Upload Error:', error);
      throw new AppError(
        'Failed to store file in object storage service',
        500,
        'https://pipelinex.dev/errors/STORAGE_ERROR'
      );
    }
  }

  public async getFileBuffer(key: string): Promise<Buffer> {
    if (env.NODE_ENV === 'test') {
      const item = this.testMemoryStore.get(key);
      if (!item) {
        throw new AppError('File not found in test storage', 404, 'https://pipelinex.dev/errors/NOT_FOUND');
      }
      return item.buffer;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as Readable;

      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('❌ Cloudflare R2 / S3 Download Buffer Error:', error);
      throw new AppError(
        'Failed to fetch file buffer from object storage',
        500,
        'https://pipelinex.dev/errors/STORAGE_ERROR'
      );
    }
  }

  public async deleteFile(key: string): Promise<void> {
    if (env.NODE_ENV === 'test') {
      this.testMemoryStore.delete(key);
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('❌ Cloudflare R2 / S3 Delete Error:', error);
      throw new AppError(
        'Failed to delete file from object storage service',
        500,
        'https://pipelinex.dev/errors/STORAGE_ERROR'
      );
    }
  }

  public async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    if (env.NODE_ENV === 'test') {
      return `https://${this.bucketName}.r2.cloudflarestorage.com/${key}?X-Amz-Expires=${expiresInSeconds}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      console.error('❌ Cloudflare R2 / S3 Presigned URL Error:', error);
      throw new AppError(
        'Failed to generate secure download URL',
        500,
        'https://pipelinex.dev/errors/STORAGE_ERROR'
      );
    }
  }

  public isKeyInTestStore(key: string): boolean {
    return this.testMemoryStore.has(key);
  }
}

export const storageService = new StorageService();
