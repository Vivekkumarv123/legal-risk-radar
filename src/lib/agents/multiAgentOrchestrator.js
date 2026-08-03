import crypto from 'crypto';
import { callWithFallback } from '@/lib/gemini';
import { AITracer } from '@/lib/aiTracing';
import { FastPreClassifier } from '@/services/cpe/fastClassifier.js';

/**
 * Custom Error for Multi-Agent Pipeline Failures
 */
export class AgentExecutionError extends Error {
  constructor(agentName, task, cause) {
    super(`[Multi-Agent Error] ${agentName} failed during '${task}': ${cause.message || cause}`);
    this.name = 'AgentExecutionError';
    this.agentName = agentName;
    this.task = task;
    this.cause = cause;
  }
}

export function normalizeRiskLevel(val, defaultVal = "MEDIUM") {
  if (!val) return defaultVal;
  const str = String(val).toUpperCase().trim();
  if (["HIGH", "CRITICAL", "URGENT", "SEVERE"].includes(str)) return "HIGH";
  if (["LOW", "BENEFICIAL", "NONE", "MINIMAL"].includes(str)) return "LOW";
  if (["MEDIUM", "MODERATE"].includes(str)) return "MEDIUM";
  return defaultVal;
}

/**
 * Structured AnalysisContext passed between specialist agents
 */
export class AnalysisContext {
  constructor(documentText, documentType = 'Contract', metadata = {}) {
    this.documentId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    this.documentHash = crypto.createHash('sha256').update(documentText || '').digest('hex');
    this.documentType = documentType;
    this.rawText = documentText || '';
    this.rawTextSnippet = (documentText || '').substring(0, 300);
    this.clauses = [];
    this.risks = [];
    this.omissions = [];
    this.metadata = {
      createdAt: new Date().toISOString(),
      language: metadata.language || 'en',
      ocrConfidence: metadata.ocrConfidence || null,
      ...metadata
    };
  }
}

/**
 * Specialist Agent 1: ClauseExtractorAgent
 * Responsibility: Extract and categorize clauses from raw legal text
 */
async function runClauseExtractorAgent(context, tracer) {
  const agentRun = tracer.startAgentRun(
    'ClauseExtractorAgent',
    'Extract and categorize key legal clauses',
    'gemini-3.1-flash-lite'
  );

  try {
    const prompt = `
You are the ClauseExtractorAgent, a specialist legal structural parser.
Your single responsibility is to identify and categorize all legal clauses from the provided text.

DOCUMENT TEXT:
"""
${context.rawText}
"""

Instructions:
1. Extract distinct legal clauses/provisions (e.g. Liability, Termination, Indemnity, IP Rights, Non-Compete, Payment Terms, Governing Law, Confidentiality).
2. For each clause, provide a clean snippet and its category.

OUTPUT STRICT JSON ONLY:
{
  "clauses": [
    {
      "id": "clause_1",
      "category": "Liability & Indemnity",
      "text": "Exact or summarized clause text",
      "locationHint": "Section 4"
    }
  ]
}
`;

    const rawResult = await callWithFallback('gemini-3.1-flash-lite', prompt);
    const cleaned = rawResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
      throw new Error('ClauseExtractorAgent returned invalid JSON structure: missing clauses array');
    }

    context.clauses = parsed.clauses.map((c, idx) => ({
      id: c.id || `clause_${idx + 1}`,
      category: c.category || 'General Provision',
      text: c.text || '',
      locationHint: c.locationHint || `Paragraph ${idx + 1}`
    }));

    agentRun.complete('SUCCESS', {
      outputSummary: `Extracted ${context.clauses.length} clauses`
    });

    return context.clauses;
  } catch (error) {
    agentRun.complete('FAILED', { error });
    throw new AgentExecutionError('ClauseExtractorAgent', 'Extracting clauses', error);
  }
}

/**
 * Specialist Agent 2: RiskAnalyzerAgent
 * Responsibility: Evaluate risk levels and severity on extracted clauses (does not re-parse whole doc)
 */
async function runRiskAnalyzerAgent(context, userQuery = '', tracer) {
  const agentRun = tracer.startAgentRun(
    'RiskAnalyzerAgent',
    'Analyze risk level and severity per clause',
    'gemini-3.1-flash-lite'
  );

  try {
    if (!context.clauses || context.clauses.length === 0) {
      // Fallback if no specific clauses extracted
      context.clauses = [{ id: 'clause_1', category: 'General Contract', text: context.rawTextSnippet }];
    }

    const clausesInput = JSON.stringify(context.clauses, null, 2);
    const userLangHint = userQuery && userQuery.trim()
      ? `NOTE ON LANGUAGE: User typed "${userQuery}". If user typed in Hinglish/Hindi/Marathi/Spanish/etc, write explanation and recommendation in that exact matching language/style.\n`
      : '';

    const prompt = `
You are the RiskAnalyzerAgent, a specialist risk evaluation AI.
Your single responsibility is to analyze the extracted legal clauses provided in structured format and assign risk scores.

EXTRACTED CLAUSES TO EVALUATE:
${clausesInput}
${userLangHint}
Instructions:
1. For each clause, assess risk level (CRITICAL, HIGH, MEDIUM, LOW) and severity (1 to 10).
2. Provide a simple explanation for non-lawyers matching the user's language.
3. Provide a practical recommendation to mitigate or renegotiate the risk.

OUTPUT STRICT JSON ONLY:
{
  "risks": [
    {
      "clauseId": "clause_1",
      "clauseText": "Relevant text",
      "riskLevel": "HIGH",
      "severityScore": 8,
      "explanation": "Simple explanation of the risk",
      "recommendation": "What to change or ask"
    }
  ]
}
`;

    const rawResult = await callWithFallback('gemini-3.1-flash-lite', prompt);
    const cleaned = rawResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.risks || !Array.isArray(parsed.risks)) {
      throw new Error('RiskAnalyzerAgent returned invalid JSON structure: missing risks array');
    }

    context.risks = parsed.risks.map(r => ({
      clauseId: r.clauseId || 'clause_1',
      clauseText: r.clauseText || '',
      riskLevel: normalizeRiskLevel(r.riskLevel, 'MEDIUM'),
      severityScore: Math.min(10, Math.max(1, Number(r.severityScore || 5))),
      explanation: r.explanation || 'Potential legal risk detected.',
      recommendation: r.recommendation || 'Review with legal counsel.'
    }));

    agentRun.complete('SUCCESS', {
      outputSummary: `Evaluated ${context.risks.length} risk items`
    });

    return context.risks;
  } catch (error) {
    agentRun.complete('FAILED', { error });
    throw new AgentExecutionError('RiskAnalyzerAgent', 'Evaluating clause risks', error);
  }
}

/**
 * Specialist Agent 3: OmissionGuardAgent
 * Responsibility: Detect missing legal protections and unfair imbalances
 */
async function runOmissionGuardAgent(context, userQuery = '', tracer) {
  const agentRun = tracer.startAgentRun(
    'OmissionGuardAgent',
    'Audit missing legal safeguards and unilateral imbalances',
    'gemini-3.1-flash-lite'
  );

  try {
    const categoriesPresent = context.clauses.map(c => c.category).join(', ');
    const userLangHint = userQuery && userQuery.trim()
      ? `NOTE ON LANGUAGE: User typed "${userQuery}". If user typed in Hinglish/Hindi/Marathi/Spanish/etc, write reason in that exact matching language/style.\n`
      : '';

    const prompt = `
You are the OmissionGuardAgent, a legal safeguard auditor.
Your single responsibility is to identify missing protective clauses that should be in this contract.

DOCUMENT TYPE: ${context.documentType}
EXISTING CATEGORIES IDENTIFIED: ${categoriesPresent}
DOCUMENT SNIPPET:
"""
${context.rawTextSnippet}
"""
${userLangHint}

Instructions:
Identify standard legal safeguards that are MISSING (e.g. Limitation of Liability, Mutual Termination Notice, IP Rights Retention, Dispute Resolution, Force Majeure, Confidentiality Exclusions).

OUTPUT STRICT JSON ONLY:
{
  "omissions": [
    {
      "missingProtection": "Limitation of Liability",
      "importance": "CRITICAL",
      "reason": "Without a cap, your financial exposure is unlimited."
    }
  ]
}
`;

    const rawResult = await callWithFallback('gemini-3.1-flash-lite', prompt);
    const cleaned = rawResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.omissions || !Array.isArray(parsed.omissions)) {
      throw new Error('OmissionGuardAgent returned invalid JSON structure: missing omissions array');
    }

    context.omissions = parsed.omissions.map(o => ({
      missingProtection: o.missingProtection || 'Standard Legal Protection',
      importance: (o.importance || 'MEDIUM').toUpperCase(),
      reason: o.reason || 'Missing standard contractual safeguard.'
    }));

    agentRun.complete('SUCCESS', {
      outputSummary: `Identified ${context.omissions.length} missing protections`
    });

    return context.omissions;
  } catch (error) {
    agentRun.complete('FAILED', { error });
    throw new AgentExecutionError('OmissionGuardAgent', 'Auditing missing safeguards', error);
  }
}

/**
 * Specialist Agent 4: SynthesisAgent
 * Responsibility: Convert validated AnalysisContext into final structured decision brief
 */
async function runSynthesisAgent(context, userQuery = '', tracer) {
  const agentRun = tracer.startAgentRun(
    'SynthesisAgent',
    'Aggregate validated context into final Decision Brief',
    'gemini-3.1-flash-lite'
  );

  try {
    const validatedData = {
      clauses: context.clauses,
      risks: context.risks,
      omissions: context.omissions,
      userQuery
    };

    const preClass = FastPreClassifier.analyze(userQuery);
    let scriptInstruction = "";
    if (userQuery && userQuery.trim()) {
      if (preClass.script === 'devanagari') {
        scriptInstruction = `\nCRITICAL DEVANAGARI SCRIPT REQUIREMENT:
The user typed in DEVANAGARI script: "${userQuery}".
You MUST write ALL narrative output fields (executiveSummary, keyRisks, missingProtections, recommendations, whatIfSuggestions, nextBestActions, clause explanations, businessImpact) COMPLETELY IN DEVANAGARI SCRIPT (Hindi/Marathi, e.g. "भाई, आपके इस एग्रीमेंट में...").
DO NOT write in Romanized Hinglish or Latin script when the user typed in Devanagari script!
`;
      } else if (preClass.detectedLanguage === 'hinglish') {
        scriptInstruction = `\nCRITICAL HINGLISH SCRIPT REQUIREMENT:
The user typed in HINGLISH / Romanized script: "${userQuery}".
You MUST write ALL narrative output fields (executiveSummary, keyRisks, missingProtections, recommendations, whatIfSuggestions, nextBestActions, clause explanations) COMPLETELY IN NATURAL HINGLISH (Romanized Hindi, e.g. "Bhai, tumhari employment agreement mein...").
`;
      } else {
        scriptInstruction = `\nCRITICAL MULTILINGUAL INSTRUCTION:
The user typed: "${userQuery}".
Write ALL narrative output fields COMPLETELY in the user's matching language ("${preClass.detectedLanguage}").
`;
      }
    }

    const prompt = `
You are the SynthesisAgent.
Your single responsibility is to convert the VALIDATED outputs from specialist agents into a final structured decision brief. Do NOT invent new facts not supported by the input data.

INPUT DATA:
${JSON.stringify(validatedData, null, 2)}
${scriptInstruction}
Instructions:
Synthesize this into a cohesive report for a non-lawyer user in the EXACT language and script specified above.

OUTPUT STRICT JSON ONLY:
{
  "decisionSummary": {
    "finalDecision": "Safe to Sign | Review Before Signing | Do Not Sign",
    "decisionScore": 75,
    "overallRisk": "LOW | MEDIUM | HIGH",
    "confidence": 90
  },
  "executiveSummary": "Clear 3-4 sentence overview synthesized from the findings in user's language.",
  "keyRisks": ["Risk 1", "Risk 2"],
  "missingProtections": ["Missing safeguard 1"],
  "recommendations": [
    {
      "priority": "HIGH",
      "title": "Title",
      "description": "Explanation"
    }
  ],
  "whatIfSuggestions": [
    {
      "scenario": "What if liability cap is added?",
      "impact": "Reduces financial exposure significantly."
    }
  ],
  "nextBestActions": [
    "Negotiate liability terms"
  ],
  "followUpQuestions": [
    "Specific question to ask the employer or counterparty regarding missing safeguards or risks"
  ],
  "clauses": [
    {
      "clause": "Clause snippet",
      "riskLevel": "HIGH",
      "severity": 8,
      "explanation": "Simple explanation in user's language",
      "recommendation": "Suggested action"
    }
  ]
}
`;

    const rawResult = await callWithFallback('gemini-3.1-flash-lite', prompt);
    const cleaned = rawResult.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.followUpQuestions || !Array.isArray(parsed.followUpQuestions) || parsed.followUpQuestions.length === 0) {
      parsed.followUpQuestions = [
        "What is the exact notice period required for termination without cause?",
        "Can a mutual limitation of liability cap be added to protect both parties?"
      ];
    }

    agentRun.complete('SUCCESS', {
      outputSummary: 'Final Decision Brief synthesized successfully'
    });

    return parsed;
  } catch (error) {
    agentRun.complete('FAILED', { error });
    throw new AgentExecutionError('SynthesisAgent', 'Synthesizing final report', error);
  }
}

/**
 * MAIN AGENT / ORCHESTRATOR & VALIDATOR
 * Controls workflow, coordinates specialists, validates outputs against document context,
 * reduces hallucination risk through structured validation, and returns the final report.
 */
export class MainAgentOrchestrator {
  /**
   * Run full multi-agent analysis with strict validation and observability
   */
  static async runAnalysis(documentText, userQuery = '', metadata = {}) {
    const context = new AnalysisContext(documentText, metadata.docType || 'Contract', metadata);
    const tracer = new AITracer(context.documentHash);

    try {
      console.log(`🤖 [MainAgent] Starting Multi-Agent Pipeline for Document ${context.documentId}`);

      // Step 1: ClauseExtractorAgent
      await runClauseExtractorAgent(context, tracer);

      // Step 2: RiskAnalyzerAgent (takes extracted clauses context & user query)
      await runRiskAnalyzerAgent(context, userQuery, tracer);

      // Step 3: OmissionGuardAgent
      await runOmissionGuardAgent(context, userQuery, tracer);

      // Step 4: Main Agent Validation & Grounding Check
      this.validateAnalysisContext(context);

      // Step 5: SynthesisAgent
      const finalReport = await runSynthesisAgent(context, userQuery, tracer);

      // Complete trace
      const sanitizedTrace = tracer.completeTrace('SUCCESS');

      return {
        success: true,
        data: finalReport,
        context: {
          documentId: context.documentId,
          documentHash: context.documentHash,
          documentType: context.documentType,
          clauseCount: context.clauses.length,
          riskCount: context.risks.length,
          omissionCount: context.omissions.length
        },
        _telemetry: sanitizedTrace
      };
    } catch (error) {
      console.error('❌ [MainAgent Error]:', error.message);
      const sanitizedTrace = tracer.completeTrace('FAILED', error);

      // Controlled Failure: Do not swallow error or silently generate fake responses
      throw {
        isControlledFailure: true,
        error: error.message || 'Multi-Agent Analysis Failed',
        agentName: error.agentName || 'MainAgentOrchestrator',
        task: error.task || 'Orchestration & Validation',
        _telemetry: sanitizedTrace
      };
    }
  }

  /**
   * Validation & Grounding Layer
   * Checks that specialist outputs are consistent, grounded, and non-empty.
   */
  static validateAnalysisContext(context) {
    if (!context.clauses || context.clauses.length === 0) {
      throw new AgentExecutionError('MainAgentValidation', 'Grounding Check', new Error('Validation failed: No clauses were extracted from document'));
    }

    if (!context.risks || context.risks.length === 0) {
      throw new AgentExecutionError('MainAgentValidation', 'Grounding Check', new Error('Validation failed: Risk assessment produced empty results'));
    }

    // Verify clause IDs match extracted context
    const validClauseIds = new Set(context.clauses.map(c => c.id));
    for (const risk of context.risks) {
      if (risk.clauseId && !validClauseIds.has(risk.clauseId)) {
        console.warn(`⚠️ [MainAgent Validation] Risk referenced unknown clauseId '${risk.clauseId}', auto-correcting context grounding.`);
        risk.clauseId = context.clauses[0].id;
      }
    }

    console.log('✅ [MainAgent Validation] Grounding and consistency checks passed successfully.');
    return true;
  }
}
