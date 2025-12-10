import React, { useState } from 'react';
import { Camera, Sparkles, Command } from 'lucide-react';
import UploadArea from './components/UploadArea';
import GeneratedGrid from './components/GeneratedGrid';
import { generateAngleImage } from './services/geminiService';
import { AngleOption, GeneratedImage, AppState } from './types';

// Define the angles we want to generate
const ANGLES: AngleOption[] = [
  { id: 'front', label: 'Front View', promptSuffix: 'straight-on front view' },
  { id: 'left', label: 'Left Side View', promptSuffix: 'view from the left side profile' },
  { id: 'top', label: 'High Angle View', promptSuffix: 'high angle view looking down from above' },
  { id: 'bottom', label: 'Low Angle View', promptSuffix: 'low angle view looking up from below' },
  { id: 'iso', label: 'Isometric View', promptSuffix: '3/4 isometric view' },
  { id: 'zoom-in', label: 'Zoom In', promptSuffix: 'extreme close-up zoom in view' },
  { id: 'zoom-out', label: 'Zoom Out', promptSuffix: 'distant wide-angle zoom out view' },
  { id: 'fisheye', label: 'Fisheye View', promptSuffix: 'distorted fisheye lens view' },
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [results, setResults] = useState<GeneratedImage[]>([]);

  // Convert uploaded file to base64 for preview and processing
  const handleImageSelected = (file: File) => {
    setRawFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setOriginalImage(e.target.result as string);
        setResults([]); // Reset results on new upload
        setAppState(AppState.IDLE);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!originalImage || !rawFile) return;

    setAppState(AppState.GENERATING);
    
    // Initialize results with loading state
    const initialResults: GeneratedImage[] = ANGLES.map(angle => ({
      angle: angle.label,
      imageUrl: '',
      loading: true
    }));
    setResults(initialResults);

    // Extract base64 data without prefix for API
    const base64Data = originalImage.split(',')[1];
    const mimeType = rawFile.type;

    // Process each angle in parallel
    const promises = ANGLES.map(async (angle, index) => {
      try {
        const generatedUrl = await generateAngleImage(base64Data, mimeType, angle.promptSuffix);
        
        // Update the specific result item as soon as it's ready
        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = {
            ...newResults[index],
            imageUrl: generatedUrl,
            loading: false
          };
          return newResults;
        });
      } catch (error) {
        console.error(`Failed to generate ${angle.label}:`, error);
        // Extract specific error message
        const errorMessage = error instanceof Error ? error.message : "Generation failed";

        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = {
            ...newResults[index],
            loading: false,
            error: errorMessage
          };
          return newResults;
        });
      }
    });

    await Promise.all(promises);
    setAppState(AppState.COMPLETE);
  };

  // Logic to regenerate a single specific angle
  const handleRegenerate = async (index: number) => {
    if (!originalImage || !rawFile) return;

    const angle = ANGLES[index];
    const base64Data = originalImage.split(',')[1];
    const mimeType = rawFile.type;

    // Set loading state for this specific item
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], loading: true, error: undefined };
      return newResults;
    });

    try {
      const generatedUrl = await generateAngleImage(base64Data, mimeType, angle.promptSuffix);
      
      setResults(prev => {
        const newResults = [...prev];
        newResults[index] = {
          ...newResults[index],
          imageUrl: generatedUrl,
          loading: false
        };
        return newResults;
      });
    } catch (error) {
      console.error(`Failed to regenerate ${angle.label}:`, error);
      // Extract specific error message
      const errorMessage = error instanceof Error ? error.message : "Retry failed";
      
      setResults(prev => {
        const newResults = [...prev];
        newResults[index] = {
          ...newResults[index],
          loading: false,
          error: errorMessage
        };
        return newResults;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 selection:bg-indigo-500/30 flex flex-col font-sans">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
              <Camera size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">NanoBanana <span className="text-slate-500 font-light">Studio</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 border border-white/5 bg-white/5 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              gemini-2.5-flash-image
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Split Layout */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 py-8 lg:px-8 relative z-10">
        
        <div className="lg:flex lg:gap-10 items-start">
          
          {/* Left Panel (1/3 Width) - Sticky Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-8 lg:sticky lg:top-24">
            
            {/* Header Info */}
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Multi-Angle Generator
              </h1>
              <p className="text-slate-400 text-base leading-relaxed">
                Transform a single photo into a complete studio showcase using generative AI.
              </p>
            </div>

            {/* Control Panel */}
            <div className="bg-[#131B2C]/80 border border-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Command size={14} /> Control Center
                 </h2>
              </div>
              
              {/* Upload Section */}
              <UploadArea 
                onImageSelected={handleImageSelected} 
                currentImage={originalImage} 
              />

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || appState === AppState.GENERATING}
                  className={`
                    w-full relative overflow-hidden group px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl
                    ${!originalImage 
                      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5' 
                      : appState === AppState.GENERATING
                        ? 'bg-indigo-900/50 text-indigo-300 cursor-wait border border-indigo-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 border border-indigo-500'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {appState === AppState.GENERATING ? (
                      <>
                        <Sparkles className="animate-spin" size={20} /> Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} /> Generate Angles
                      </>
                    )}
                  </span>
                  {originalImage && appState !== AppState.GENERATING && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block border-t border-white/5 pt-6">
               <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>v1.0.0</span>
                  <span>Powered by Gemini</span>
               </div>
            </div>

          </div>

          {/* Right Panel (2/3 Width) - Content */}
          <div className="flex-1 mt-12 lg:mt-0 min-h-[600px]">
            {/* Placeholder state if no results yet */}
            {results.length === 0 ? (
               <div className="h-full border border-dashed border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center text-slate-600 p-12 min-h-[500px]">
                 <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                    <Camera size={32} className="opacity-40" />
                 </div>
                 <h3 className="text-xl font-medium text-slate-300 mb-2">Ready to Create</h3>
                 <p className="max-w-md text-center text-slate-500">
                   Upload a clear image of a subject on the left to generate 8 unique camera angles instantly.
                 </p>
               </div>
            ) : (
               <GeneratedGrid 
                 images={results} 
                 onRegenerate={handleRegenerate}
               />
            )}
          </div>

        </div>
      </main>

      {/* Tailwind Custom Animation Styles */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default App;