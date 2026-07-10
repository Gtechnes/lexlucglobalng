/**
 * Cloudinary integration for image uploads and delivery
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB backend limit

/**
 * Compress image file before upload
 * @param file - The image file to compress
 * @param maxSizeMB - Target max size in MB (default 5MB)
 * @returns Compressed file
 */
export async function compressImage(file: File, maxSizeMB: number = 5): Promise<File> {
  // Only compress if file is over the target size
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  const imageCompression = (await import('browser-image-compression')).default;
  
  console.log(`Compressing image: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    preserveAspectRatio: true,
    fileType: file.type.includes('png') ? 'image/png' : 'image/jpeg',
  };

  const compressedFile = await imageCompression(file, options);
  console.log(`Compressed image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

  return compressedFile;
}

/**
 * Validate file type
 * @param file - File to validate
 * @returns true if valid, throws error if invalid
 */
export function validateImageFile(file: File): void {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload JPG, PNG, GIF, or WebP images.');
  }
}

/**
 * Upload an image to Cloudinary via backend
 * IMPORTANT: All uploads go through the backend to avoid CORS issues and rate limiting
 * @param file - The file to upload
 * @param type - Upload type: 'service', 'tour', 'blog', or 'image'
 * @returns Promise with the secure URL of the uploaded image
 */
export async function uploadToCloudinary(
  file: File,
  type: 'service' | 'tour' | 'blog' | 'image' = 'image'
): Promise<string> {
  // Validate file type first
  validateImageFile(file);
  
  console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

  // Compress if over 5MB (will still be under 20MB after compression)
  let uploadFile = file;
  if (file.size > 5 * 1024 * 1024) {
    console.log('Image larger than 5MB, compressing...');
    try {
      uploadFile = await compressImage(file, 5);
    } catch (compressError) {
      console.error('Compression failed, trying original:', compressError);
      // If compression fails, try uploading original if under 20MB
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image too large and compression failed. Please use an image under 20MB.');
      }
      uploadFile = file;
    }
  }

  const formData = new FormData();
  formData.append('file', uploadFile);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

  try {
    const response = await fetch(`${API_URL}/uploads/${type}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Upload failed response:', response.status, error);
      throw new Error(`Upload failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    
    // Backend returns { success: true, data: { secure_url: "..." } }
    const imageUrl = data?.data?.secure_url;
    if (!imageUrl) {
      throw new Error('No URL returned from upload');
    }
    
    return imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Optimize image URL for web delivery
 * @param url - The Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Quality (1-100)
 * @returns Optimized URL
 */
export function optimizeImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return '';

  // If it's not a Cloudinary URL, return as-is
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Extract the base URL and version
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const baseUrl = parts[0];
  const path = parts[1];

  // Build transformation parameters
  const transformations = [];
  
  if (width || height) {
    const dim = [];
    if (width) dim.push(`w_${width}`);
    if (height) dim.push(`h_${height}`);
    transformations.push(dim.join(','));
  }

  if (quality) {
    transformations.push(`q_${quality}`);
  }

  // Add auto format for best compression
  transformations.push('f_auto');

  const transform = transformations.length > 0 ? `/${transformations.join('/')}` : '';
  return `${baseUrl}/upload${transform}/${path}`;
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // This would typically be done from the backend for security
  // Frontend deletion is not recommended as it requires API key exposure
  console.warn('Image deletion should be handled from the backend');
}

/**
 * Get image thumbnail URL
 */
export function getThumbnailUrl(url: string, width: number = 150): string {
  return optimizeImageUrl(url, width, width, 60);
}
