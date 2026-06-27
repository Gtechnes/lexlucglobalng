'use client';

import { useState, useRef } from 'react';
import { useUpload, ImageUploadType } from '@/lib/useUpload';

interface ImageUploadProps {
  onImageSelect: (url: string, publicId: string) => void;
  type?: ImageUploadType;
  label?: string;
  currentImageUrl?: string;
  currentPublicId?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageSelect,
  type = 'image',
  label = 'Upload Image',
  currentImageUrl,
  currentPublicId,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, loading, error, preview, resetUpload } =
    useUpload();
  const [showPreview, setShowPreview] = useState(!!currentImageUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file, type);

    if (result?.success && result.data) {
      onImageSelect(result.data.secure_url, result.data.public_id);
      setShowPreview(true);
    }
  };

  const handleRemoveImage = async () => {
    if (currentPublicId) {
      const success = await deleteImage(currentPublicId);
      if (success) {
        onImageSelect('', '');
        setShowPreview(false);
        resetUpload();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const displayImageUrl = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {showPreview && displayImageUrl && (
        <div className="relative inline-block">
          <img
            src={displayImageUrl}
            alt="Preview"
            className="h-32 w-32 rounded-lg object-cover border border-gray-300"
          />
          {!loading && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label
          className={`relative inline-block ${
            disabled || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || loading}
            className="hidden"
          />
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            ) : (
              'Choose Image'
            )}
          </div>
        </label>

        {loading && (
          <span className="text-sm text-gray-600">
            {Math.round(100)}% uploaded
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <p className="text-xs text-gray-500 mt-2">
        Supported formats: JPEG, PNG, GIF, WebP • Max size: 5MB
      </p>
    </div>
  );
}
