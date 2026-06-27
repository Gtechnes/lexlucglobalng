import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CONTENT_MANAGER', 'SUPER_ADMIN', 'BOOKING_MANAGER')
export class UploadsController {
  constructor(private cloudinaryService: CloudinaryService) {}

  /**
   * Upload a single image to Cloudinary
   * Expects multipart/form-data with:
   * - file: image file
   * - folder: (optional) Cloudinary folder path (default: lexluc)
   * - filename: (optional) custom filename without extension
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'lexluc',
      quality: 'auto',
    });

    return {
      success: true,
      data: result,
      message: 'Image uploaded successfully',
    };
  }

  /**
   * Upload service image
   */
  @Post('service')
  @UseInterceptors(FileInterceptor('file'))
  async uploadServiceImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'lexluc/services',
      quality: 'auto',
      transformation: {
        width: 800,
        crop: 'scale',
        quality: 'auto',
      },
    });

    return {
      success: true,
      data: result,
      message: 'Service image uploaded successfully',
    };
  }

  /**
   * Upload tour image
   */
  @Post('tour')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTourImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'lexluc/tours',
      quality: 'auto',
      transformation: {
        width: 1000,
        crop: 'scale',
        quality: 'auto',
      },
    });

    return {
      success: true,
      data: result,
      message: 'Tour image uploaded successfully',
    };
  }

  /**
   * Upload blog image
   */
  @Post('blog')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlogImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      folder: 'lexluc/blog',
      quality: 'auto',
      transformation: {
        width: 1200,
        crop: 'scale',
        quality: 'auto',
      },
    });

    return {
      success: true,
      data: result,
      message: 'Blog image uploaded successfully',
    };
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId Cloudinary public_id (URL encoded)
   */
  @Delete('image/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    // Decode the public_id if it's URL encoded
    const decodedPublicId = decodeURIComponent(publicId);

    await this.cloudinaryService.deleteImage(decodedPublicId);

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}
