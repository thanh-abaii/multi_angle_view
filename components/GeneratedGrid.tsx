import React from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { GeneratedImage } from '../types';

interface GeneratedGridProps {
  images: GeneratedImage[];
}

const GeneratedGrid: React.FC<GeneratedGridProps> = ({ images }) => {
  if (images.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
        <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
        Generated Angles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="p-3 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
              <h3 className="font-semibold text-slate-200">{img.angle}</h3>
            </div>

            {/* Content Area */}
            <div className="relative aspect-square bg-slate-900 flex items-center justify-center group">
              {img.loading ? (
                <div className="flex flex-col items-center gap-3 text-indigo-400 animate-pulse">
                  <RefreshCw className="animate-spin" size={32} />
                  <span className="text-sm font-medium">Generating...</span>
                </div>
              ) : img.error ? (
                 <div className="flex flex-col items-center gap-3 text-red-400 px-4 text-center">
                  <AlertCircle size={32} />
                  <span className="text-sm">{img.error}</span>
                </div>
              ) : (
                <>
                  <img 
                    src={img.imageUrl} 
                    alt={`Generated ${img.angle} view`} 
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a 
                      href={img.imageUrl} 
                      download={`nano-banana-${img.angle}.png`}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                      title="Download"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedGrid;
