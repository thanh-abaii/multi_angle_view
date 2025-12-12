import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertCircle, Layers, Check, X, ZoomIn } from 'lucide-react';
import { GeneratedImage } from '../types';

interface GeneratedGridProps {
  images: GeneratedImage[];
  onRegenerate: (index: number) => void;
}

const GeneratedGrid: React.FC<GeneratedGridProps> = ({ images, onRegenerate }) => {
  const [downloading, setDownloading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Handle Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

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
  const completedCount = images.filter(i => i.imageUrl).length;
  const activeImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Hero Header Section - Compacted for space */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3 px-1 shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
              <Layers className="text-indigo-400" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Generated Angles
            </h2>
            <span className="ml-2 flex items-center justify-center h-6 px-2.5 text-xs font-bold text-indigo-200 bg-indigo-500/20 border border-indigo-500/30 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {completedCount} / {images.length}
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl pl-[50px] truncate">
            Click any image to preview in high resolution or regenerate specific angles.
          </p>
        </div>

        <div className="shrink-0 pl-[50px] md:pl-0">
          <button
            onClick={handleDownloadAll}
            disabled={!hasValidImages || downloading}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-200 border shadow-lg
              ${!hasValidImages 
                ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed shadow-none' 
                : downloading
                  ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-green-900/20'
                  : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-0.5'
              }
            `}
          >
            {downloading ? (
              <>
                <Check size={16} strokeWidth={1.5} /> All Saved
              </>
            ) : (
              <>
                <Download size={16} strokeWidth={1.5} /> Download All
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Grid Container: Flex-1 and min-h-0 allows it to fill remaining space without overflowing parent */}
      <div className="flex-1 min-h-0 pb-1">
        {/* Grid: grid-rows-2 forces exactly 2 rows filling the height */}
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 h-full gap-4">
          {images.map((img, index) => (
            <div 
              key={index} 
              onClick={() => !img.loading && !img.error && setLightboxIndex(index)}
              className={`group relative bg-[#131B2C] rounded-2xl overflow-hidden border border-white/5 
                        transition-all duration-300 ease-out w-full h-full
                        ${!img.loading && !img.error 
                          ? 'hover:scale-[1.01] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] hover:border-[#7D8CFF] cursor-zoom-in z-0 hover:z-10' 
                          : ''}
                        `}
            >
              {/* Removed fixed aspect-ratio, used h-full w-full to fill the grid cell */}
              <div className="w-full h-full relative">
                {img.loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1523]">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <span className="mt-3 text-[10px] font-medium text-indigo-300 tracking-wider uppercase">Rendering</span>
                  </div>
                ) : img.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F1523] px-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-2 text-red-400">
                      <AlertCircle size={16} />
                    </div>
                    <span className="text-[10px] text-red-300 leading-relaxed line-clamp-2">{img.error}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerate(index);
                      }}
                      className="mt-3 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] rounded-md transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw size={10} /> Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <img 
                      src={img.imageUrl} 
                      alt={`Generated ${img.angle} view`} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Actions Overlay (Hover buttons) */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px] bg-black/20">
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerate(index);
                        }}
                        className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-lg"
                        title="Regenerate"
                      >
                        <RefreshCw size={16} />
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Just open full download in current tab or could trigger specific download function
                          const link = document.createElement('a');
                          link.href = img.imageUrl;
                          link.download = `nano-banana-${img.angle}.png`;
                          link.click();
                        }}
                        className="p-2.5 bg-black/60 hover:bg-indigo-600 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all hover:scale-110 shadow-lg"
                        title="Quick Download"
                      >
                        <Download size={16} />
                      </button>

                    </div>
                  </>
                )}
              </div>

              {/* Status Indicator (Top Right) */}
              {!img.loading && !img.error && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="w-6 h-6 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                      <ZoomIn size={12} className="text-white" />
                  </div>
                </div>
              )}

              {/* Pill Label (Bottom Left) */}
              <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                <span className="inline-block px-3 py-1 bg-[#FFFFFF1A] backdrop-blur-md border border-white/10 rounded-full text-[10px] font-semibold text-white tracking-wide shadow-sm">
                  {img.angle}
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors border border-white/10 z-[110]"
          >
            <X size={24} />
          </button>

          {/* Main Content */}
          <div 
            className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group">
              <img 
                src={activeImage.imageUrl} 
                alt={activeImage.angle}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10 bg-[#0F1523]" 
              />
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-1">{activeImage.angle}</h3>
                <p className="text-sm text-slate-400">Generated View</p>
              </div>

              <div className="h-8 w-px bg-white/10 mx-2"></div>

              <a 
                href={activeImage.imageUrl}
                download={`nano-banana-${activeImage.angle.toLowerCase().replace(/\s+/g, '-')}.png`}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
              >
                <Download size={18} strokeWidth={2} />
                Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedGrid;