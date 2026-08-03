import crypto from 'crypto';

/**
 * AI Tracing & Observability Engine
 * Tracks multi-agent execution steps with privacy-first metadata sanitization.
 */
export class AITracer {
  constructor(documentHash = '') {
    this.traceId = `trace_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.documentHash = documentHash;
    this.startTime = Date.now();
    this.agentTraces = [];
    this.status = 'IN_PROGRESS';
    this.error = null;
  }

  /**
   * Start tracking an individual agent task run
   */
  startAgentRun(agentName, task, model = 'gemini-3.1-flash-lite') {
    const agentRunId = `run_${agentName}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const startMs = Date.now();

    return {
      agentRunId,
      agentName,
      task,
      model,
      startMs,
      complete: (status = 'SUCCESS', { outputSummary = '', tokenUsage = null, error = null } = {}) => {
        const latencyMs = Date.now() - startMs;
        const traceRecord = {
          agentRunId,
          agentName,
          task,
          model,
          latencyMs,
          status,
          error: error ? (error.message || String(error)) : null,
          tokenUsage: tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          outputSummary: outputSummary ? String(outputSummary).substring(0, 200) + (outputSummary.length > 200 ? '...' : '') : 'Completed'
        };

        this.agentTraces.push(traceRecord);
        return traceRecord;
      }
    };
  }

  /**
   * Mark overall trace completed
   */
  completeTrace(status = 'SUCCESS', error = null) {
    this.status = status;
    this.totalLatencyMs = Date.now() - this.startTime;
    if (error) {
      this.error = error.message || String(error);
    }
    return this.getSanitizedTrace();
  }

  /**
   * Produce a privacy-sanitized trace output suitable for telemetry and response payloads.
   * Avoids storing or returning raw full text contract prompts.
   */
  getSanitizedTrace() {
    return {
      traceId: this.traceId,
      documentHash: this.documentHash,
      totalLatencyMs: this.totalLatencyMs || (Date.now() - this.startTime),
      status: this.status,
      error: this.error,
      agentCount: this.agentTraces.length,
      agentTraces: this.agentTraces.map(t => ({
        agentRunId: t.agentRunId,
        agentName: t.agentName,
        task: t.task,
        model: t.model,
        latencyMs: t.latencyMs,
        status: t.status,
        error: t.error,
        tokenUsage: t.tokenUsage,
        outputSummary: t.outputSummary
      }))
    };
  }
}
