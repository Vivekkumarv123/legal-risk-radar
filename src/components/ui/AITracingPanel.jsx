"use client";
import { useState } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, ShieldCheck, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

/**
 * AI Tracing & Observability Panel
 * Displays step-by-step agent execution traces, latencies, status, and privacy-sanitized metadata.
 */
export default function AITracingPanel({ telemetry }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!telemetry || !telemetry.agentTraces || telemetry.agentTraces.length === 0) {
    return null;
  }

  const { traceId, totalLatencyMs, status, agentTraces, documentHash } = telemetry;

  return (
    <div className="my-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">AI Observability & Agent Traces</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-700 text-slate-300">
            {agentTraces.length} Agents
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50">
            {totalLatencyMs}ms
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-mono opacity-80 hidden sm:inline">Trace: {traceId}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Traces Inspector */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-slate-900 border-t border-slate-800">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-slate-400">Trace ID: </span>
              <span className="text-slate-200">{traceId}</span>
            </div>
            <div>
              <span className="text-slate-400">Doc SHA-256: </span>
              <span className="text-slate-300">{documentHash ? `${documentHash.substring(0, 12)}...` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <span className={status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {status}
              </span>
            </div>
          </div>

          {/* Agent Timeline Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Specialist Execution Steps
            </h4>

            {agentTraces.map((step, idx) => {
              const isSuccess = step.status === 'SUCCESS';
              return (
                <div
                  key={step.agentRunId || idx}
                  className="p-3.5 rounded-xl bg-slate-850 border border-slate-800/90 hover:border-slate-700 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-200">{step.agentName}</span>
                      <span className="text-xs text-slate-400 font-mono">({step.model})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-400" /> {step.latencyMs}ms
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{step.task}</p>

                  {step.outputSummary && (
                    <p className="text-xs text-slate-400 font-mono bg-slate-950/40 p-2 rounded border border-slate-800/60">
                      Output: {step.outputSummary}
                    </p>
                  )}

                  {step.error && (
                    <p className="text-xs text-rose-300 font-mono bg-rose-950/50 p-2 rounded border border-rose-900/60">
                      Error: {step.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Grounding & Validation Active
            </span>
            <span>Hallucination risk reduced through specialization & structured validation</span>
          </div>
        </div>
      )}
    </div>
  );
}
