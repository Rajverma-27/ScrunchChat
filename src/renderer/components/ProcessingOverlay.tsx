import React from 'react';
import { useAppStore } from '../store/appStore';
import { BrainCircuit } from 'lucide-react';

const ProcessingOverlay: React.FC = () => {
  const { processingProgress } = useAppStore();

  const getStageText = (progress: number) => {
    if (progress < 20) return 'Loading AI model into memory...';
    if (progress < 50) return 'Analyzing conversation context...';
    if (progress < 80) return 'Extracting action items and decisions...';
    if (progress < 100) return 'Generating final summaries...';
    return 'Finalizing...';
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0f0f23]/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-md w-full bg-[#1a1a2e] border border-[#6366f1]/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] flex flex-col items-center text-center">
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#6366f1] rounded-full blur-xl opacity-20 animate-pulse-glow"></div>
          <div className="w-20 h-20 bg-[#16213e] rounded-2xl border border-[#6366f1]/50 flex items-center justify-center relative z-10 shadow-xl">
            <BrainCircuit size={40} className="text-[#818cf8] animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Processing Chat</h2>
        <p className="text-[#94a3b8] text-sm mb-8 h-5">{getStageText(processingProgress)}</p>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#818cf8]">{processingProgress}%</span>
            <span className="text-white/40">~15s remaining</span>
          </div>
          <div className="h-2 w-full bg-[#0f0f23] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#c084fc] transition-all duration-300 ease-out"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
        </div>
        
        <p className="mt-6 text-xs text-white/30 flex items-center gap-2">
          Local processing active. No data leaves your machine.
        </p>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
