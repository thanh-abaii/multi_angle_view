import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, ScanLine, X } from 'lucide-react';

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
    <div className="w-full">
      <div
        className={`relative group cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden
          ${currentImage 
            ? 'border border-indigo-500/30 bg-[#0F1523]' 
            : 'border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-[#0F1523] hover:bg-[#131B2C]'
          }
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
          <div className="relative p-2 flex flex-col items-center">
            {/* Image Preview */}
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-800">
              <img 
                src={currentImage} 
                alt="Uploaded Preview" 
                className="w-full h-auto max-h-[400px] object-contain bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-slate-900"
              />
              
              {/* Scanline Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 animate-scan pointer-events-none" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-lg text-white font-medium flex items-center gap-2 hover:bg-white/20 transition-colors">
                  <Upload size={18} /> Replace Source
                </span>
              </div>
            </div>
            
            <div className="w-full flex justify-between items-center mt-3 px-1">
               <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Source_Input_01</span>
               <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] text-slate-400">Active</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors relative">
             {/* Decorative Corner Markers */}
             <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-700 group-hover:border-indigo-500/50 transition-colors"></div>
             <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-700 group-hover:border-indigo-500/50 transition-colors"></div>
             <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-700 group-hover:border-indigo-500/50 transition-colors"></div>
             <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-700 group-hover:border-indigo-500/50 transition-colors"></div>

            <div className="p-5 bg-slate-800/50 rounded-2xl mb-4 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300 ring-1 ring-white/5">
              <ScanLine size={32} />
            </div>
            <p className="text-lg font-semibold text-slate-300">Upload Source Image</p>
            <p className="text-xs font-mono mt-2 opacity-60">Drag & drop or click to browse</p>
          </div>
        )}
      </div>
      
      {/* CSS for Scan Animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadArea;