import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface UploadOptions {
  folder?: string;
  filename?: string;
  quality?: 'auto' | number;
  transformation?: Record<string, any>;
}

@Injectable()
export class CloudinaryService {
  constructor() {
    this.initializeCloudinary();
  }

  private initializeCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary credentials not found in environment variables',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

/**
 * Upload a file to Cloudinary
 * @param file Express file object from multer
 * @param options Upload options including folder and filename
 * @returns Cloudinary upload response with secure_url and public_id
 */
async uploadImage(
  file: Express.Multer.File,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResponse> {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  // Validate file type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    throw new BadRequestException(
      'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
    );
  }

  // Validate file size (20MB max for blog images)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    throw new BadRequestException(
      'File size exceeds 20MB limit. Please upload a smaller image.',
    );
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'lexluc',
          public_id: options.filename,
          resource_type: 'auto',
          quality: options.quality || 'auto',
          ...options.transformation,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
            });
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  } catch (error: any) {
    throw new InternalServerErrorException(
      `Failed to upload image to Cloudinary: ${error?.message || 'Unknown error'}`,
    );
  }
}

  /**
   * Delete an image from Cloudinary by public_id
   * @param publicId Cloudinary public_id
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required for deletion');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image: ${result.result}`);
      }
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to delete image from Cloudinary: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get image metadata
   * @param publicId Cloudinary public_id
   */
  async getImageMetadata(publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    try {
      const metadata = await cloudinary.api.resource(publicId);
      return {
        url: metadata.secure_url,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.bytes,
        createdAt: metadata.created_at,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to get image metadata: ${error?.message || 'Unknown error'}`,
      );
    }
  }
}
