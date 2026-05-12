import React, { useState, useEffect, useRef } from "react";
import { Database, BrainCircuit, Sparkles, Search } from "lucide-react";

const stages = [
  { threshold: 0,   message: "Scanning webpage structure..." },
  { threshold: 20,  message: "Extracting readable content..." },
  { threshold: 40,  message: "Filtering unnecessary elements..." },
  { threshold: 60,  message: "Building contextual understanding..." },
  { threshold: 80,  message: "Generating AI insights..." },
  { threshold: 95,  message: "Ready for interaction." },
];

const mockTopics = ["Artificial Intelligence", "Neural Networks", "Machine Learning", "Large Language Models", "Cognitive Computing"];

export default function ExtractionProgress({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(stages[0].message);
  const [detectedTopics, setDetectedTopics] = useState([]);
  // Use a ref to always have the latest onComplete without it being a dep
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Use local mutable variable so the interval doesn't depend on React state
    let prog = 0;
    let topicsAdded = 0;
    let finished = false;

    const interval = setInterval(() => {
      if (finished) return;

      // Non-linear progress for realism
      const increment = prog < 40 ? 4 : prog < 75 ? 2 : prog < 95 ? 1 : 0.5;
      prog = Math.min(prog + increment, 100);

      setProgress(prog);

      // Update stage message
      const stage = [...stages].reverse().find(s => prog >= s.threshold);
      if (stage) setCurrentStage(stage.message);

      // Reveal topics progressively after 40%
      if (prog > 40 && topicsAdded < mockTopics.length) {
        const expected = Math.floor((prog - 40) / 12);
        while (topicsAdded < expected && topicsAdded < mockTopics.length) {
          const capturedIdx = topicsAdded;
          setDetectedTopics(prev => [...prev, mockTopics[capturedIdx]]);
          topicsAdded++;
        }
      }

      // Done
      if (prog >= 100) {
        finished = true;
        clearInterval(interval);
        setTimeout(() => onCompleteRef.current(), 600);
      }
    }, 150);

    // Cleanup: cancel timer if component unmounts before finishing
    return () => {
      finished = true;
      clearInterval(interval);
    };
  }, []); // intentionally empty — runs once on mount

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-10 animate-in fade-in duration-500">
      
      {/* ── LIVE STATUS HEADER ── */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
           <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">AI Analysis Status • LIVE</span>
        </div>
        <h2 className="text-[15px] font-bold text-white/90 transition-all duration-300">{currentStage}</h2>
      </div>

      {/* ── PROGRESS BAR (COMET STYLE) ── */}
      <div className="w-full max-w-[320px] h-[6px] bg-white/[0.05] rounded-full overflow-hidden relative border border-white/[0.03]">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
           {/* Comet Glowing Edge */}
           <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/30 to-transparent blur-sm" />
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff]" />
        </div>
      </div>

      {/* ── DETECTED TOPICS (LIVE REVEAL) ── */}
      <div className="flex flex-col items-center gap-4 w-full px-10">
         <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <Search size={12} /> Detected Context
         </div>
         <div className="flex flex-wrap justify-center gap-2 min-h-[60px]">
            {detectedTopics.length === 0 ? (
               <span className="text-[11px] text-gray-700 italic">Listening for page context...</span>
            ) : (
              detectedTopics.map((topic, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-bold text-blue-400/80 animate-in zoom-in-90 fade-in duration-500"
                >
                  {topic}
                </div>
              ))
            )}
         </div>
      </div>

      {/* ── MICRO-INTERACTIONS ── */}
      <div className="grid grid-cols-3 gap-8 text-gray-600">
         <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${progress > 20 ? 'opacity-100' : 'opacity-20'}`}>
            <Database size={16} className={progress > 20 ? 'text-blue-500/50' : ''} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Parsing</span>
         </div>
         <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${progress > 50 ? 'opacity-100' : 'opacity-20'}`}>
            <BrainCircuit size={16} className={progress > 50 ? 'text-violet-500/50' : ''} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Mapping</span>
         </div>
         <div className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${progress > 80 ? 'opacity-100' : 'opacity-20'}`}>
            <Sparkles size={16} className={progress > 80 ? 'text-emerald-500/50' : ''} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Insights</span>
         </div>
      </div>
    </div>
  );
}
