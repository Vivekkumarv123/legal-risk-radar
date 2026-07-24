import React from 'react';

/**
 * DocumentViewer: Renders the active shared contract and highlights risk clauses.
 * @param {Object} document - The active document object { name, mimeType, url, summary, riskAnalysis: [...] }
 */
export default function DocumentViewer({ document }) {
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 shadow-md">
        <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          No Active Document
        </span>
        <p className="text-[10px] text-slate-600 max-w-[200px] leading-relaxed">
          Upload a contract in the workspace to analyze risks and highlight critical clauses.
        </p>
      </div>
    );
  }

  // Pre-populate mock risk clauses if not already analysed in DB (for demo purposes)
  const risks = document.riskAnalysis || [
    {
      clause: "All work products and IP created by the Employee during working hours are the exclusive property of the Employer for a term of 99 years.",
      riskLevel: "medium",
      explanation: "A 99-year term is standard in some jurisdictions but excessive. It should match local copyright law expirations.",
      alternativeClause: "All work products and IP created during working hours shall be the property of the Employer, subject to local statutory limits."
    },
    {
      clause: "This Agreement shall be governed by the laws of the State of Delaware, USA, and all disputes will be resolved exclusively in the state courts of Delaware.",
      riskLevel: "high",
      explanation: "Governing law in a foreign jurisdiction exposes you to massive travel, representation, and filing costs in the event of dispute.",
      alternativeClause: "This Agreement shall be governed by and resolved under the jurisdiction of the local courts of the client."
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">
              {document.name}
            </h3>
            <span className="text-[9px] text-slate-500 font-mono">
              {document.isNative ? 'Digital PDF Layout' : 'Scanned Image OCR'}
            </span>
          </div>
        </div>
        <a 
          href={document.url} 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline"
        >
          View in Drive
        </a>
      </div>

      {/* Main Analysis Scroller */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Document Context Summary block */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Document Summary
          </span>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-serif">
            {document.summary}
          </p>
        </div>

        {/* Risk Clauses Section */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            Risk Analysis & Clause Highlights
          </span>

          <ul className="space-y-3.5">
            {risks.map((risk, idx) => {
              const isHigh = risk.riskLevel === 'high';
              const isMed = risk.riskLevel === 'medium';
              
              return (
                <li 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all
                    ${isHigh ? 'bg-rose-950/10 border-rose-900/30' : ''}
                    ${isMed ? 'bg-amber-950/10 border-amber-900/30' : ''}
                    ${!isHigh && !isMed ? 'bg-slate-950/40 border-slate-800/60' : ''}
                  `}
                >
                  {/* Risk Badge Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                      Clause {idx + 1}
                    </span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border
                      ${isHigh ? 'bg-rose-950/50 border-rose-800/80 text-rose-400' : ''}
                      ${isMed ? 'bg-amber-950/50 border-amber-800/80 text-amber-400' : ''}
                      ${!isHigh && !isMed ? 'bg-slate-950/50 border-slate-800 text-slate-400' : ''}
                    `}>
                      {risk.riskLevel} Risk
                    </span>
                  </div>

                  {/* Flagged Clause text */}
                  <div className={`text-xs font-serif italic border-l-2 p-2 rounded-r-lg bg-slate-950/60
                    ${isHigh ? 'border-rose-500 text-rose-100' : ''}
                    ${isMed ? 'border-amber-500 text-amber-100' : ''}
                    ${!isHigh && !isMed ? 'border-slate-600 text-slate-300' : ''}
                  `}>
                    "{risk.clause}"
                  </div>

                  {/* Explanation description */}
                  <div className="text-[11px] text-slate-400 leading-normal">
                    <strong className="text-slate-200">AI Risk Assessment:</strong> {risk.explanation}
                  </div>

                  {/* Wording suggestion */}
                  {risk.alternativeClause && (
                    <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-lg flex flex-col gap-1 text-[11px]">
                      <strong className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4" />
                        </svg>
                        Recommended Alternative Clause:
                      </strong>
                      <p className="text-emerald-100 italic leading-relaxed font-serif mt-0.5">
                        "{risk.alternativeClause}"
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

    </div>
  );
}
