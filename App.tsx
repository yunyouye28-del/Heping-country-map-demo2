import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Info, MousePointer2 } from 'lucide-react';

const App: React.FC = () => {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="relative w-full h-full bg-black font-sans text-slate-300">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* SVG Noise Filter */}
      <svg className="hidden">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
        </filter>
      </svg>
      
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay z-20"
        style={{ filter: 'url(#noiseFilter)' }}
      ></div>
      {/* Scanline/Grid overlay for City feel */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]"></div>


      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none z-30 flex justify-between items-start">
        <div className="pointer-events-auto mix-blend-difference text-white">
          <h1 className="text-3xl font-light tracking-[0.2em] mb-2 font-serif uppercase">Memories</h1>
          <p className="text-xs max-w-xs leading-relaxed tracking-widest uppercase opacity-80">
            Lost in the city. Find the nature within.
          </p>
        </div>
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="pointer-events-auto p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white"
        >
          <Info size={24} strokeWidth={1} />
        </button>
      </div>

      {/* Interaction Hint */}
      {showInfo && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000 animate-pulse mix-blend-difference text-white z-30">
            <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase">
                <MousePointer2 size={12} />
                <span>Scroll Forward to Enter</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;