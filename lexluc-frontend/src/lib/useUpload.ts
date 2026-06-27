'use client';

import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

interface UploadResponse {
  success: boolean;
  data: {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    size: number;
  };
  message: string;
}

export type ImageUploadType = 'service' | 'tour' | 'blog' | 'image';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (
      file: File,
      type: ImageUploadType = 'image',
    ): Promise<UploadResponse | null> => {
      // Validate file
      if (!file) {
        setError('No file selected');
        return null;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setLoading(true);
      setError(null);
      setProgress(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/uploads/${type}`,
          {
            method: 'POST',
            body: formData,
            headers: {
              Authorization: `Bearer ${
                typeof window !== 'undefined'
                  ? localStorage.getItem('authToken')
                  : ''
              }`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Upload failed with status ${response.status}`,
          );
        }

        const data = (await response.json()) as UploadResponse;
        setProgress({ loaded: 100, total: 100, percent: 100 });
        return data;
      } catch (err: any) {
        const errorMsg = err.message || 'Upload failed';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteImage = useCallback(async (publicId: string): Promise<boolean> => {
    if (!publicId) {
      setError('No public ID provided');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const encodedId = encodeURIComponent(publicId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/image/${encodedId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${
              typeof window !== 'undefined'
                ? localStorage.getItem('authToken')
                : ''
            }`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setPreview(null);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || 'Delete failed';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setLoading(false);
    setProgress(null);
    setError(null);
    setPreview(null);
  }, []);

  return {
    uploadImage,
    deleteImage,
    loading,
    progress,
    error,
    preview,
    resetUpload,
  };
}
