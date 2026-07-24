import React from 'react';
import { motion } from 'framer-motion';

/**
 * ConfidenceMeter: Renders the dynamic confidence percentage and verified factors checklist.
 * @param {number} confidence - The AI confidence percentage (0 to 100)
 * @param {Array<Object>} factors - [{ factor: string, status: 'verified' | 'warning' | 'error' }]
 */
export default function ConfidenceMeter({ confidence = 0, factors = [] }) {
  // Determine color theme based on confidence levels
  const getColorClass = () => {
    if (confidence >= 80) return 'text-emerald-400 stroke-emerald-500 bg-emerald-950/20 border-emerald-800/30';
    if (confidence >= 50) return 'text-amber-400 stroke-amber-500 bg-amber-950/20 border-amber-800/30';
    return 'text-rose-400 stroke-rose-500 bg-rose-950/20 border-rose-800/30';
  };

  // SVG circle configurations for radial meter
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Decision Confidence
        </h3>
        <span className="text-[9px] font-bold text-slate-500 uppercase">
          Audit Trial
        </span>
      </div>

      <div className="flex items-center gap-5 mb-5 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        {/* Radial SVG Circle Progress */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90">
            {/* Background tracking circle */}
            <circle
              className="stroke-slate-800"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={radius}
              cx="40"
              cy="40"
            />
            {/* Foreground filling circle */}
            <motion.circle
              className="transition-all duration-1000 ease-out"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: offset }}
              initial={{ strokeDashoffset: circumference }}
              r={radius}
              cx="40"
              cy="40"
              style={{
                stroke: confidence >= 80 ? '#10b981' : confidence >= 50 ? '#f59e0b' : '#f43f5e',
                strokeLinecap: 'round'
              }}
            />
          </svg>
          <span className="absolute text-sm font-extrabold text-slate-100">
            {confidence}%
          </span>
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-200">Confidence Rating</span>
          <p className="text-[10px] text-slate-500 leading-normal">
            Calculated dynamically based on structural completeness and clause safety checks.
          </p>
        </div>
      </div>

      {/* Factors checklist */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {factors.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-6">
            Awaiting document metrics...
          </div>
        ) : (
          <ul className="space-y-1.5">
            {factors.map((f, idx) => (
              <li 
                key={idx} 
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/30 border border-slate-800/40"
              >
                <span className="text-slate-300 truncate max-w-[170px]">{f.factor}</span>
                <span className="shrink-0 flex items-center">
                  {f.status === 'verified' ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                      ✓ verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
                      ⚠ pending
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
