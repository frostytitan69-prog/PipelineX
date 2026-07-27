import sharp from 'sharp';
import { storageService } from '../services/storage.service';

export interface ImageProcessingOutput {
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    space?: string;
    size?: number;
  };
  thumbnailStorageKey: string;
}

export class ImageHandler {
  public static async process(userId: string, buffer: Buffer): Promise<ImageProcessingOutput> {
    const image = sharp(buffer);
    const meta = await image.metadata();

    const metadata = {
      width: meta.width,
      height: meta.height,
      format: meta.format,
      space: meta.space,
      size: buffer.length,
    };

    // Generate 300x300 thumbnail preserving aspect ratio
    const thumbnailBuffer = await image
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailStorageKey = storageService.generateThumbnailKey(userId);

    // Upload thumbnail to Cloudflare R2 / S3
    await storageService.uploadFile(thumbnailStorageKey, thumbnailBuffer, 'image/jpeg');

    console.log(`🖼️ [IMAGE HANDLER] Image processed & thumbnail uploaded | Key: ${thumbnailStorageKey}`);

    return {
      metadata,
      thumbnailStorageKey,
    };
  }
}
