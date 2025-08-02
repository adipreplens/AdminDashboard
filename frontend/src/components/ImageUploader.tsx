'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  onImageDelete: () => void;
  currentImageUrl?: string;
  label?: string;
}

export default function ImageUploader({ 
  onImageUpload, 
  onImageDelete, 
  currentImageUrl, 
  label = "Question Image" 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.imageUrl);
        onImageUpload(data.imageUrl);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    try {
      const filename = preview.split('/').pop();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload-image/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPreview(null);
        onImageDelete();
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="space-y-4">
        {/* Upload Button */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          
          {preview && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Image
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Preview */}
        {preview && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Preview:</p>
            <div className="relative inline-block">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${preview}`}
                alt="Question preview"
                className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                onError={(e) => {
                  console.error('Image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Upload info */}
        <div className="text-xs text-gray-500">
          <p>• Supported formats: JPG, PNG, GIF, WebP</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Images are automatically cleaned up after 24 hours if not used</p>
        </div>
      </div>
    </div>
  );
} 