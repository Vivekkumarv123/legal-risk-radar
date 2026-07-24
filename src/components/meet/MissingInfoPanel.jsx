import React from 'react';

/**
 * MissingInfoPanel: Displays missing information checklist in the consultation room.
 * @param {Array<string>} missingFields - List of missing fields retrieved from state
 */
export default function MissingInfoPanel({ missingFields = [] }) {
  const isEmpty = missingFields.length === 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Gaps Analysis
        </h3>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
          ${isEmpty 
            ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400' 
            : 'bg-amber-950/60 border-amber-800/80 text-amber-400'
          }`}
        >
          {isEmpty ? 'Complete' : `${missingFields.length} Required`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 border border-emerald-800/20 bg-emerald-950/10 rounded-xl text-center">
            <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xs font-semibold text-emerald-400">All Parameters Satisified</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">
              No missing variables. The agent has full information to render a recommendation.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Before presenting a legal decision, the AI Agent requires clarification on the following clauses:
            </p>
            <ul className="space-y-2">
              {missingFields.map((field, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 leading-snug"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">{field}</span>
                    <span className="text-[10px] text-slate-500">Provide verbally or upload an annexure.</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      
      {!isEmpty && (
        <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Speak or type to answer missing details.
        </div>
      )}
    </div>
  );
}
