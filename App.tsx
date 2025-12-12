import React, { useState } from 'react';
import { Camera, Sparkles, Command, Type } from 'lucide-react';
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
  const [customPrompt, setCustomPrompt] = useState<string>('');
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
    
    // Prepare tasks: Predefined angles + Optional Custom angle
    const tasks: AngleOption[] = [...ANGLES];
    
    if (customPrompt.trim()) {
      tasks.push({
        id: 'custom',
        label: customPrompt.trim(), 
        promptSuffix: customPrompt.trim()
      });
    }
    
    // Initialize results with loading state
    const initialResults: GeneratedImage[] = tasks.map(angle => ({
      // Truncate label if it's too long (mostly for custom prompts)
      angle: angle.id === 'custom' && angle.label.length > 20 ? angle.label.substring(0, 18) + '...' : angle.label,
      imageUrl: '',
      loading: true,
      promptSuffix: angle.promptSuffix
    }));
    setResults(initialResults);

    // Extract base64 data without prefix for API
    const base64Data = originalImage.split(',')[1];
    const mimeType = rawFile.type;

    // Process each angle in parallel
    const promises = tasks.map(async (task, index) => {
      try {
        const generatedUrl = await generateAngleImage(base64Data, mimeType, task.promptSuffix);
        
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
        console.error(`Failed to generate ${task.label}:`, error);
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

    const item = results[index]; // Use state item as source of truth (supports Custom prompts)
    const base64Data = originalImage.split(',')[1];
    const mimeType = rawFile.type;

    // Set loading state for this specific item
    setResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], loading: true, error: undefined };
      return newResults;
    });

    try {
      const generatedUrl = await generateAngleImage(base64Data, mimeType, item.promptSuffix);
      
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
      console.error(`Failed to regenerate ${item.angle}:`, error);
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
    <div className="h-screen overflow-hidden bg-[#0B0F19] text-slate-200 selection:bg-indigo-500/30 flex flex-col font-sans">
      
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

      {/* Main Content Area - Locked Layout */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 py-4 lg:px-8 relative z-10 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Container for split layout */}
        <div className="lg:flex lg:gap-16 xl:gap-24 items-start h-full">
          
          {/* Left Panel - Control Center */}
          <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar pb-8">
            
            {/* Header Info */}
            <div className="space-y-2 shrink-0">
              <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Multi-Angle Generator
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform a single photo into a complete studio showcase using generative AI.
              </p>
            </div>

            {/* Control Panel Card */}
            <div className="bg-[#131B2C]/60 border border-white/[0.02] rounded-2xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Command size={14} /> Control Center
                 </h2>
              </div>
              
              <UploadArea 
                onImageSelected={handleImageSelected} 
                currentImage={originalImage} 
              />

              <div className="mt-4">
                 <div className="flex items-center justify-between mb-2">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Custom Angle
                   </label>
                   <span className="text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/5">Optional</span>
                 </div>
                 <div className="relative group">
                    <input 
                      type="text" 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. Back view..."
                      className="w-full bg-[#0F1523] border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 focus:bg-[#131B2C]"
                    />
                    <div className="absolute right-3 top-3 text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                      <Type size={16} /> 
                    </div>
                 </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || appState === AppState.GENERATING}
                  className={`
                    w-full relative overflow-hidden group px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200
                    ${!originalImage 
                      ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5' 
                      : appState === AppState.GENERATING
                        ? 'bg-indigo-900/50 text-indigo-300 cursor-wait border border-indigo-500/20'
                        : 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:brightness-110 hover:-translate-y-[1px] active:translate-y-[0px] border-t border-indigo-400/50'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {appState === AppState.GENERATING ? (
                      <>
                        <Sparkles className="animate-spin" size={20} strokeWidth={1.5} /> Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} strokeWidth={1.5} /> Generate Angles
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block border-t border-white/5 pt-4 shrink-0">
               <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>v1.1</span>
                  <span>Powered by Gemini</span>
               </div>
            </div>

          </div>

          {/* Right Panel - Content Grid */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {results.length === 0 ? (
               <div className="h-full border border-dashed border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center text-slate-600 p-12">
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
        /* Hide Scrollbar but allow scrolling */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;