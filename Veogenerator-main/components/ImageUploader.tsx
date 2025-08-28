import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageUploaderProps {
  onImageSelect: (base64: string | null, mimeType: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        alert("Harap pilih file gambar yang valid (PNG, JPEG, WEBP).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        onImageSelect(base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">Gambar Referensi (Opsional)</label>
      <div className="w-full aspect-video bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative group">
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Pratinjau referensi" className="object-contain h-full w-full rounded-lg" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100"
              aria-label="Hapus gambar"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button onClick={triggerFileInput} className="flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors">
              <UploadIcon className="h-10 w-10 mb-2" />
              <span className="text-sm">Klik untuk mengunggah gambar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;