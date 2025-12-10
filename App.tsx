import React, { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import UploadArea from './components/UploadArea';
import GeneratedGrid from './components/GeneratedGrid';
import { generateAngleImage } from './services/geminiService';
import { AngleOption, GeneratedImage, AppState } from './types';

// Define the angles we want to generate
const ANGLES: AngleOption[] = [
  { id: 'front', label: 'Front View', promptSuffix: 'straight-on front view' },
  { id: 'left', label: 'Left Side View', promptSuffix: 'view from the left side profile' },
  { id: 'top', label: 'Top-Down View', promptSuffix: 'top-down overhead view' },
  { id: 'bottom', label: 'Bottom View', promptSuffix: 'view from directly below' },
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
        setResults(prev => {
          const newResults = [...prev];
          newResults[index] = {
            ...newResults[index],
            loading: false,
            error: "Generation failed"
          };
          return newResults;
        });
      }
    });

    await Promise.all(promises);
    setAppState(AppState.COMPLETE);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
              <Camera size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NanoBanana <span className="text-indigo-400 font-light">Studio</span></span>
          </div>
          <div className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">
            gemini-2.5-flash-image
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Multi-Angle Generator
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Upload a subject and let AI reimagine it from different perspectives.
          </p>
        </div>

        {/* Upload Section */}
        <UploadArea 
          onImageSelected={handleImageSelected} 
          currentImage={originalImage} 
        />

        {/* Action Button - Sticky if needed, but placed centrally here */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleGenerate}
            disabled={!originalImage || appState === AppState.GENERATING}
            className={`
              relative overflow-hidden group px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl
              ${!originalImage 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : appState === AppState.GENERATING
                  ? 'bg-indigo-900 text-indigo-300 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25 hover:-translate-y-1'
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {appState === AppState.GENERATING ? (
                <>
                  <Sparkles className="animate-spin" size={20} /> Generating Angles...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Generate Camera Angles
                </>
              )}
            </span>
            {originalImage && appState !== AppState.GENERATING && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
            )}
          </button>
        </div>

        {/* Results Grid */}
        <GeneratedGrid images={results} />
        
        {/* Footer info */}
        {results.length > 0 && appState === AppState.COMPLETE && (
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>Generated by Gemini 2.5 Flash Image ("Nano Banana")</p>
          </div>
        )}
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