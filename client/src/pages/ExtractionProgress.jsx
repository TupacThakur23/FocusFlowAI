import React, { useState, useEffect } from "react";
import { Sparkles, Scan, FileText, Eraser, Brain, CheckCircle } from "lucide-react";

/**
 * PHASE 6: Dynamic Extraction Pipeline
 * Rebuilt to reflect real technical stages with a premium feel.
 */
const PIPELINE_STEPS = [
  { id: 1, label: 'SCANNING PAGE', icon: Scan, color: 'text-blue-400' },
  { id: 2, label: 'EXTRACTING CONTENT', icon: FileText, color: 'text-indigo-400' },
  { id: 3, label: 'CLEANING CONTENT', icon: Eraser, color: 'text-violet-400' },
  { id: 4, label: 'GENERATING INSIGHTS', icon: Brain, color: 'text-fuchsia-400' },
  { id: 5, label: 'READY', icon: CheckCircle, color: 'text-emerald-400' }
];

export default function ExtractionProgress({ currentStep = 1, statusText }) {
  const [percent, setPercent] = useState(0);
  
  const current = PIPELINE_STEPS.find(s => s.id === currentStep) || PIPELINE_STEPS[0];
  const Icon = current.icon;

  useEffect(() => {
    const targetMap = { 1: 20, 2: 45, 3: 70, 4: 90, 5: 100 };
    const target = targetMap[currentStep] || 0;
    
    // Smooth transition
    const timer = setTimeout(() => setPercent(target), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-10 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Active Step Indicator */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-2xl relative group ${current.color}`}>
          <div className="absolute inset-0 bg-current opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
          <Icon size={32} className="relative z-10 animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mx-auto w-fit">
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${currentStep < 5 ? 'animate-pulse' : ''} ${current.color}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Phase {currentStep}</span>
          </div>
          <h2 className="text-[18px] font-bold text-white tracking-tight">{current.label}</h2>
          <p className="text-[12px] text-gray-500 font-medium h-4">{statusText || "Initializing extraction..."}</p>
        </div>
      </div>

      {/* Futuristic Progress Bar */}
      <div className="w-full max-w-[340px] h-[8px] bg-white/[0.03] rounded-full overflow-hidden relative border border-white/[0.05] p-[1px]">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-500 rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${percent}%` }}
        >
          {/* Animated Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          
          {/* Leading Edge Point */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#fff,0_0_5px_#fff]" />
        </div>
      </div>

      {/* Mini Step Track */}
      <div className="flex items-center justify-between w-full max-w-[340px] px-2 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.03] -z-10" />
        {PIPELINE_STEPS.map((step) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isCurrent ? 'bg-white scale-150 shadow-[0_0_10px_#fff]' : 
                isActive ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 
                'bg-white/10'
              }`} />
              <span className={`text-[9px] font-black tracking-tighter transition-colors duration-500 ${
                isActive ? 'text-white' : 'text-gray-700'
              }`}>
                {step.id}
              </span>
            </div>
          );
        })}
      </div>

      {/* Feature Badges */}
      <div className="flex items-center gap-8 mt-2 opacity-40">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Semantic Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-fuchsia-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Context Aware</span>
        </div>
      </div>
    </div>
  );
}
