import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  currentImage: string | null;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageSelected, currentImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden
          ${currentImage ? 'border-indigo-500/50 bg-slate-800' : 'border-slate-600 hover:border-indigo-400 bg-slate-800/50 hover:bg-slate-800'}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {currentImage ? (
          <div className="relative p-4 flex flex-col items-center">
            <img 
              src={currentImage} 
              alt="Uploaded Preview" 
              className="max-h-64 rounded-lg shadow-lg object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <span className="text-white font-medium flex items-center gap-2">
                <Upload size={20} /> Change Image
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">Original Image</p>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <div className="p-4 bg-slate-700/50 rounded-full mb-4 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
              <ImageIcon size={32} />
            </div>
            <p className="text-lg font-medium text-slate-200">Drop an image here</p>
            <p className="text-sm mt-1">or click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;
