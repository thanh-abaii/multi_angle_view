import React, { useState } from 'react';
import { Download, RefreshCw, AlertCircle, Layers, Check } from 'lucide-react';
import { GeneratedImage } from '../types';

interface GeneratedGridProps {
  images: GeneratedImage[];
  onRegenerate: (index: number) => void;
}

const GeneratedGrid: React.FC<GeneratedGridProps> = ({ images, onRegenerate }) => {
  const [downloading, setDownloading] = useState(false);

  if (images.length === 0) return null;

  const handleDownloadAll = async () => {
    setDownloading(true);
    const validImages = images.filter(img => img.imageUrl && !img.loading && !img.error);
    
    // Download sequentially with a small delay to avoid browser blocking
    for (let i = 0; i < validImages.length; i++) {
      const img = validImages[i];
      const link = document.createElement('a');
      link.href = img.imageUrl;
      link.download = `nano-banana-${img.angle.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTimeout(() => setDownloading(false), 1000);
  };

  const hasValidImages = images.some(img => img.imageUrl && !img.loading && !img.error);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Layers className="text-indigo-500" size={24} />
          <span>Generated Angles</span>
          <span className="text-xs font-normal text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full ml-2">
            {images.filter(i => i.imageUrl).length} / {images.length}
          </span>
        </h2>

        <button
          onClick={handleDownloadAll}
          disabled={!hasValidImages || downloading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
            ${!hasValidImages 
              ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' 
              : downloading
                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                : 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500'
            }
          `}
        >
          {downloading ? (
            <>
              <Check size={16} /> All Saved
            </>
          ) : (
            <>
              <Download size={16} /> Download All
            </>
          )}
        </button>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="group relative bg-[#131B2C] rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 shadow-2xl transition-all duration-300 hover:shadow-indigo-900/10 hover:-translate-y-1"
          >
            {/* Status / Image Container */}
            <div className="aspect-square w-full relative">
              {img.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1523]">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className="mt-4 text-xs font-medium text-indigo-300 tracking-wider uppercase">Rendering</span>
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1523] px-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3 text-red-400">
                    <AlertCircle size={20} />
                  </div>
                  <span className="text-xs text-red-300 leading-relaxed">{img.error}</span>
                  <button 
                    onClick={() => onRegenerate(index)}
                    className="mt-4 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-md transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : (
                <>
                  <img 
                    src={img.imageUrl} 
                    alt={`Generated ${img.angle} view`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Actions Overlay (Hidden by default, shown on hover) */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                    
                    <button 
                      onClick={() => onRegenerate(index)}
                      className="p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-lg"
                      title="Regenerate"
                    >
                      <RefreshCw size={20} />
                    </button>

                    <a 
                      href={img.imageUrl} 
                      download={`nano-banana-${img.angle}.png`}
                      className="p-3 bg-black/60 hover:bg-indigo-600 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-lg"
                      title="Download"
                    >
                      <Download size={20} />
                    </a>

                  </div>
                </>
              )}
            </div>

            {/* Floating Label */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-md border border-white/5 shadow-lg">
                {img.angle}
              </span>
              
              {!img.loading && !img.error && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   {/* Clean indicator icon */}
                   <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratedGrid;