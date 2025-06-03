import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageUpload(acceptedFiles[0]);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
        ${isDragActive 
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-102' 
          : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
          <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-center text-lg font-medium">
          {isDragActive
            ? 'Drop your image here...'
            : 'Drag & drop an image here, or click to select'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Supported formats: JPEG, PNG
        </p>
      </div>
    </div>
  );
}