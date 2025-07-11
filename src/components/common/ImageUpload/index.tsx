"use client";
import React, { useState, useRef } from 'react';
import { IoCloudUpload, IoClose, IoImage } from 'react-icons/io5';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (uploading) return;

    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}: Only image files are allowed`);
        return false;
      }
      
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`${file.name}: File size must be less than ${maxFileSize}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const newImages = [...images, ...result.urls];
        onImagesChange(newImages);
        
        if (result.errors && result.errors.length > 0) {
          alert('Some files had issues:\n' + result.errors.join('\n'));
        }
      } else {
        alert(result.error || 'Upload failed');
        if (result.details) {
          console.error('Upload details:', result.details);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Delete from Supabase Storage if it's a Supabase URL
      if (imageUrl.includes('supabase')) {
        await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
          method: 'DELETE',
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50/10'
            : 'border-gray-600 hover:border-gray-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <IoCloudUpload className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-300 mb-2">
            {uploading ? 'Uploading...' : 'Drag and drop images here, or'}
          </p>
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading || images.length >= maxImages}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Browse Files'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to {maxFileSize}MB ({images.length}/{maxImages} images)
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.filter(img => img && img.trim() !== '').length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.filter(img => img && img.trim() !== '').map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMDAgMTUwQzEyNy42MTQgMTUwIDE1MCAxMjcuNjE0IDE1MCAxMDBDMTUwIDcyLjM4NTggMTI3LjYxNCA1MCAxMDAgNTBDNzIuMzg1OCA1MCA1MCA3Mi4zODU4IDUwIDEwMEM1MCAxMjcuNjE0IDcyLjM4NTggMTUwIDEwMCAxNTBaIiBmaWxsPSIjNkI3Mjg4Ii8+CjxwYXRoIGQ9Ik04NSA5MEM4NS4zMzMzIDg3LjMzMzMgODYuNzUgODUuMjUgODkuMjUgODMuNzVDOTEuNzUgODIuMjUgOTQuNSA4MS41IDk3LjUgODEuNUMxMDAuNSA4MS41IDEwMy4yNSA4Mi4yNSAxMDUuNzUgODMuNzVDMTA4LjI1IDg1LjI1IDEwOS42NjcgODcuMzMzMyAxMTAgOTBWMTEwSDEwMFY5NSIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <IoClose className="text-sm" />
              </button>
              
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.filter(img => img && img.trim() !== '').length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <IoImage className="text-4xl mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 