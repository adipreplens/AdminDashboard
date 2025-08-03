'use client';

import React, { useState } from 'react';

interface ImageUploaderProps {
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  currentImageUrl?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, currentImageUrl }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://admindashboard-x0hk.onrender.com/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onImageChange(file, data.imageUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null, null);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      {currentImageUrl ? (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Uploaded diagram" 
            className="max-w-full h-auto max-h-64 mx-auto rounded"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div>
          <div className="text-2xl mb-2">📷</div>
          <div className="text-gray-600 mb-2">Upload a diagram or image</div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
            }`}>
              {uploading ? 'Uploading...' : 'Choose File'}
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 