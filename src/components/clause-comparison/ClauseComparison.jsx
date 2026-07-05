"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    FileText, Upload, ArrowRight, ArrowDown, AlertTriangle,
    CheckCircle, XCircle, Files, Activity, Info, Search, X,
    SlidersHorizontal, Trophy, Percent, Gauge, Sparkles,
    Loader2, ChevronDown, Inbox, ShieldCheck, ShieldAlert,
    BarChart3, Lightbulb, RefreshCcw, Download
} from "lucide-react";
import toast from "react-hot-toast";
import { authenticatedFetch } from "@/utils/auth.utils";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";

/* ============================================================
   PDF export
   ------------------------------------------------------------
   Requires: npm install jspdf
   Generates a text-based (not image-based) PDF so content stays
   selectable, searchable, and readable by screen readers/assistive
   tech. Sets document metadata + language for basic accessibility,
   uses a clear heading hierarchy, generous line-height, and high
   contrast ink colors against a white page.

   IMPORTANT: card backgrounds are measured first, then drawn, then
   the text is drawn on top of them. jsPDF paints in strict call
   order (like a canvas) — drawing a filled panel AFTER its text
   would paint over and hide that text. Every card below goes
   through a measure pass (no ink touches the page) followed by a
   draw pass, so the background is always laid down before the
   words that sit on it.
   ============================================================ */
const PDF_COLORS = {
    ink: [15, 23, 42],        // slate-900
    subtle: [100, 116, 139],  // slate-500
    indigo: [79, 70, 229],    // indigo-600
    rose: [225, 29, 72],      // rose-600
    amber: [217, 119, 6],     // amber-600
    emerald: [5, 150, 105],   // emerald-600
    line: [226, 232, 240],    // slate-200
    panel: [248, 250, 252],   // slate-50
};

// The built-in PDF fonts (Helvetica/Times/Courier) only support the
// WinAnsi (roughly Latin-1 + cp1252) character set. Anything outside
// that — the ₹ rupee sign, arrows, checkmarks, non-Latin scripts —
// either renders as the wrong glyph or drops silently. We map the
// common cases to a safe textual equivalent and strip anything else
// unsupported so we never render a broken/missing character.
const PDF_CHAR_MAP = {
    "\u20B9": "Rs. ",   // ₹ Indian Rupee sign
    "\u2011": "-",       // non-breaking hyphen
    "\u2192": "->",     // →
    "\u2190": "<-",     // ←
    "\u2713": "v",       // ✓
    "\u2717": "x",       // ✗
    "\u00A0": " ",       // non-breaking space
};

function pdfSafe(input) {
    if (input === null || input === undefined) return "";
    let text = String(input);
    for (const [from, to] of Object.entries(PDF_CHAR_MAP)) {
        if (text.includes(from)) text = text.split(from).join(to);
    }
    // Keep tab/newline/CR, printable ASCII, and Latin-1 supplement
    // (covers accented characters, €, £, ¥, ©, ®, ™, curly quotes,
    // em/en dashes, bullets, ellipsis). Drop anything else so the
    // standard fonts never substitute a garbled glyph.
    return text.replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, "");
}

async function buildComparisonPDF({ comparison, contract1Name, contract2Name }) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });

    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const MARGIN = 48;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const BOTTOM_LIMIT = PAGE_H - MARGIN - 30;
    let y = MARGIN;
    let pageNum = 1;

    // When `measuring` is true, layout primitives advance a virtual
    // cursor and skip every actual ink/page-break operation. This lets
    // us run a card's content twice: once to learn its height, once to
    // really draw it, with the background rect drawn in between.
    let measuring = false;
    let measureHeight = 0;

    doc.setProperties({
        title: "Contract Comparison Report",
        subject: `Comparison of ${pdfSafe(contract1Name) || "Contract 1"} vs ${pdfSafe(contract2Name) || "Contract 2"}`,
        creator: "Clause Comparison Engine",
        author: "Clause Comparison Engine",
    });
    if (typeof doc.setLanguage === "function") doc.setLanguage("en-US");

    const footer = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...PDF_COLORS.subtle);
        doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 24, { align: "right" });
        doc.text("Clause Comparison Engine - Confidential", MARGIN, PAGE_H - 24);
    };

    const newPage = () => {
        footer();
        doc.addPage();
        pageNum += 1;
        y = MARGIN;
    };

    const ensureSpace = (needed) => {
        if (measuring) return;
        if (y + needed > BOTTOM_LIMIT) newPage();
    };

    const heading = (text, { size = 16, gapBefore = 18, gapAfter = 10, color = PDF_COLORS.ink } = {}) => {
        if (measuring) return;
        ensureSpace(size + gapBefore + gapAfter);
        y += gapBefore;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.text(pdfSafe(text), MARGIN, y);
        y += gapAfter;
    };

    const divider = () => {
        if (measuring) return;
        ensureSpace(14);
        y += 4;
        doc.setDrawColor(...PDF_COLORS.line);
        doc.setLineWidth(0.75);
        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 14;
    };

    // Draws (or, in measuring mode, just measures) a block of wrapped
    // text and advances the cursor.
    const paragraph = (text, { size = 10.5, color = PDF_COLORS.ink, lineHeight = 15, bold = false, indent = 0 } = {}) => {
        const safe = pdfSafe(text);
        if (!safe) return;
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(safe, CONTENT_W - indent);
        if (measuring) {
            measureHeight += lines.length * lineHeight;
            return;
        }
        doc.setTextColor(...color);
        lines.forEach((line) => {
            ensureSpace(lineHeight);
            doc.text(line, MARGIN + indent, y);
            y += lineHeight;
        });
    };

    // A single "LABEL      VALUE" row (fixed one-line height).
    const labelValueRow = (label, value, { color = PDF_COLORS.ink } = {}) => {
        if (measuring) {
            measureHeight += 18;
            return;
        }
        ensureSpace(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...PDF_COLORS.subtle);
        doc.text(pdfSafe(label).toUpperCase(), MARGIN, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(...color);
        doc.text(pdfSafe(value), MARGIN + 170, y);
        y += 18;
    };

    // Manual vertical spacer usable inside a card's build function.
    const spacer = (amount) => {
        if (measuring) {
            measureHeight += amount;
            return;
        }
        y += amount;
    };

    const riskColor = (level) => {
        const l = (level || "").toString().toUpperCase();
        if (l === "HIGH") return PDF_COLORS.rose;
        if (l === "LOW") return PDF_COLORS.emerald;
        return PDF_COLORS.amber;
    };

    // Renders a self-contained "card": measures the content produced by
    // buildFn, ensures the whole card fits before starting (so the
    // background never gets split awkwardly across a page break),
    // paints the background panel, then draws the real content on top.
    const card = (buildFn, { fill = PDF_COLORS.panel, borderColor = PDF_COLORS.line } = {}) => {
        measuring = true;
        measureHeight = 0;
        buildFn();
        const contentHeight = measureHeight;
        measuring = false;

        ensureSpace(contentHeight + 28);

        const panelTop = y - 4;
        doc.setFillColor(...fill);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.75);
        doc.roundedRect(MARGIN - 10, panelTop, CONTENT_W + 20, contentHeight + 24, 6, 6, "FD");

        y += 10;
        buildFn();
        y += 18;
    };

    /* ---------- Cover ---------- */
    doc.setFillColor(...PDF_COLORS.ink);
    doc.rect(0, 0, PAGE_W, 150, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Contract Comparison Report", MARGIN, 70);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text(pdfSafe(`${contract1Name || "Contract 1"}  vs  ${contract2Name || "Contract 2"}`), MARGIN, 96);
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated ${new Date().toLocaleString()}`, MARGIN, 116);
    y = 190;

    const exec = comparison?.executiveSummary;
    const scorecard = comparison?.scorecard;
    const winnerByCategory = comparison?.winnerByCategory || [];
    const clauseComparison = comparison?.clauseComparison?.length ? comparison.clauseComparison : (comparison?.criticalDifferences || []);
    const missing1 = comparison?.missingClauses?.contract1 || [];
    const missing2 = comparison?.missingClauses?.contract2 || [];
    const aligned = comparison?.alignedClauses || [];
    const negotiations = comparison?.negotiationSuggestions || [];

    const contractLabel = (key) => {
        if (key === "Contract 1") return contract1Name || "Contract 1";
        if (key === "Contract 2") return contract2Name || "Contract 2";
        return key || "-";
    };

    /* ---------- Executive summary ---------- */
    if (exec) {
        heading("Executive summary", { size: 15, gapBefore: 6 });
        card(() => {
            paragraph(`Recommended: ${contractLabel(exec.recommendedContract)}`, { bold: true, size: 12, color: PDF_COLORS.indigo });
            if (exec.winnerReason) paragraph(exec.winnerReason, { color: PDF_COLORS.subtle });
            spacer(6);
            labelValueRow("Overall similarity", `${exec.overallSimilarity ?? 0}%`);
            labelValueRow("Risk level", exec.riskLevel || "-", { color: riskColor(exec.riskLevel) });
            labelValueRow("AI confidence", `${exec.confidence ?? 0}%`);
            labelValueRow("Missing clauses", missing1.length + missing2.length);
            labelValueRow("Changed clauses", clauseComparison.length);
            labelValueRow("Matching clauses", aligned.length);
        });
    }

    /* ---------- Scorecard ---------- */
    if (scorecard) {
        divider();
        heading("Scorecard", { size: 15, gapBefore: 4 });
        paragraph(`${contract1Name || "Contract 1"}  vs  ${contract2Name || "Contract 2"}`, { color: PDF_COLORS.subtle, size: 9.5 });
        y += 4;
        const rows = [
            ["Overall score", scorecard.contract1?.overallScore, scorecard.contract2?.overallScore],
            ["Risk score", scorecard.contract1?.riskScore, scorecard.contract2?.riskScore],
            ["Protection score", scorecard.contract1?.protectionScore, scorecard.contract2?.protectionScore],
            ["Clarity score", scorecard.contract1?.clarityScore, scorecard.contract2?.clarityScore],
        ];
        rows.forEach(([label, a, b]) => {
            ensureSpace(18);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(...PDF_COLORS.ink);
            doc.text(label, MARGIN, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...PDF_COLORS.subtle);
            doc.text(`${a ?? "-"}   vs   ${b ?? "-"}`, MARGIN + CONTENT_W - 110, y, { align: "right" });
            y += 18;
        });

        if (winnerByCategory.length > 0) {
            y += 4;
            paragraph("Winner by category", { bold: true, size: 11 });
            winnerByCategory.forEach((w) => {
                paragraph(`- ${w.category} : ${contractLabel(w.winner)}${w.reason ? `  (${w.reason})` : ""}`, { size: 10, color: PDF_COLORS.subtle, indent: 6 });
            });
        }
        y += 8;
    }

    /* ---------- Missing clauses ---------- */
    if (missing1.length || missing2.length) {
        divider();
        heading("Missing clauses", { size: 15, gapBefore: 4, color: PDF_COLORS.rose });
        const renderMissingGroup = (label, items) => {
            if (!items.length) return;
            paragraph(label, { bold: true, size: 10.5, color: PDF_COLORS.subtle });
            y += 2;
            items.forEach((item) => {
                card(() => {
                    paragraph(item.title || "Untitled clause", { bold: true, size: 11 });
                    if (item.importance) labelValueRow("Importance", item.importance, { color: riskColor(item.importance) });
                    if (item.description) paragraph(item.description, { color: PDF_COLORS.subtle, indent: 4 });
                    if (item.impact) paragraph(`Business impact: ${item.impact}`, { indent: 4 });
                }, { fill: [255, 241, 242], borderColor: [254, 205, 211] });
            });
        };
        renderMissingGroup(`Absent in ${contract2Name || "Contract 2"}`, missing1);
        renderMissingGroup(`Absent in ${contract1Name || "Contract 1"}`, missing2);
    }

    /* ---------- Key differences ---------- */
    if (clauseComparison.length) {
        divider();
        heading("Key differences", { size: 15, gapBefore: 4, color: PDF_COLORS.amber });
        clauseComparison.forEach((d) => {
            card(() => {
                paragraph(d.title || "Untitled clause", { bold: true, size: 11.5 });
                if (d.severity) labelValueRow("Severity", d.severity, { color: riskColor(d.severity) });
                spacer(2);
                paragraph(`${contract1Name || "Contract 1"}: ${d.contract1 || "-"}`, { indent: 4 });
                paragraph(`${contract2Name || "Contract 2"}: ${d.contract2 || "-"}`, { indent: 4 });
                if (d.difference) paragraph(`What changed: ${d.difference}`, { indent: 4, color: PDF_COLORS.subtle });
                if (d.businessImpact) paragraph(`Business impact: ${d.businessImpact}`, { indent: 4, color: PDF_COLORS.subtle });
                if (d.recommendation) paragraph(`Recommendation: ${d.recommendation}`, { indent: 4, color: PDF_COLORS.indigo });
                if (d.winner) paragraph(`Favors: ${contractLabel(d.winner)}`, { indent: 4, bold: true });
            }, { fill: [255, 251, 235], borderColor: [253, 230, 138] });
        });
    }

    /* ---------- Matching clauses ---------- */
    if (aligned.length) {
        divider();
        heading("Matching clauses", { size: 15, gapBefore: 4, color: PDF_COLORS.emerald });
        aligned.forEach((a) => {
            card(() => {
                paragraph(a.title || "Untitled clause", { bold: true, size: 11 });
                if (a.summary) paragraph(a.summary, { color: PDF_COLORS.subtle, indent: 4 });
            }, { fill: [236, 253, 245], borderColor: [167, 243, 208] });
        });
    }

    /* ---------- Negotiation recommendations ---------- */
    if (negotiations.length) {
        divider();
        heading("AI recommendations", { size: 15, gapBefore: 4, color: PDF_COLORS.indigo });
        negotiations.forEach((n) => {
            card(() => {
                paragraph(n.title || "Recommendation", { bold: true, size: 11 });
                if (n.priority) labelValueRow("Priority", n.priority, { color: riskColor(n.priority) });
                if (n.description) paragraph(n.description, { color: PDF_COLORS.subtle, indent: 4 });
            }, { fill: [238, 242, 255], borderColor: [199, 210, 254] });
        });
    }

    footer();
    return doc;
}

const RISK_STYLES = {
    HIGH: "bg-rose-50 text-rose-700 border-rose-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function RiskBadge({ level, className = "" }) {
    const safe = (level || "MEDIUM").toString().toUpperCase();
    const dot = safe === "HIGH" ? "bg-rose-500" : safe === "LOW" ? "bg-emerald-500" : "bg-amber-500";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${RISK_STYLES[safe] || RISK_STYLES.MEDIUM} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
            {safe}
        </span>
    );
}

function matchText(query, ...fields) {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
}

function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ============================================================
   Accordion — smooth height animation via CSS grid-rows, no JS
   measuring and no extra animation dependency required.
   ============================================================ */
function Accordion({ id, title, icon: Icon, description, count, tone = "slate", defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);
    const toneMap = {
        slate: "bg-slate-100 text-slate-600",
        rose: "bg-rose-100 text-rose-600",
        amber: "bg-amber-100 text-amber-600",
        emerald: "bg-emerald-100 text-emerald-600",
        indigo: "bg-indigo-100 text-indigo-600",
    };
    return (
        <section aria-labelledby={`${id}-heading`} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <h3 id={`${id}-heading`} className="contents">
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    aria-controls={`${id}-panel`}
                    className="w-full min-h-[72px] px-5 sm:px-6 py-4 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-3xl"
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
                            <Icon size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 tracking-tight text-[15px] sm:text-base truncate">{title}</span>
                                {count !== undefined && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">{count}</span>
                                )}
                            </div>
                            {description && <p className="text-xs text-slate-500 mt-0.5 truncate sm:whitespace-normal">{description}</p>}
                        </div>
                    </div>
                    <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
            </h3>
            <div id={`${id}-panel`} role="region" className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-3">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

function EmptyRow({ icon: Icon = Inbox, text }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
            <Icon size={26} aria-hidden="true" />
            <p className="text-sm italic">{text}</p>
        </div>
    );
}

/* ============================================================
   Overview metric card
   ============================================================ */
function MetricCard({ icon: Icon, label, value, sublabel, tone = "slate" }) {
    const toneMap = {
        slate: "text-slate-700 bg-slate-50 border-slate-200",
        indigo: "text-indigo-700 bg-indigo-50 border-indigo-100",
        rose: "text-rose-700 bg-rose-50 border-rose-100",
        amber: "text-amber-700 bg-amber-50 border-amber-100",
        emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    };
    return (
        <div className={`rounded-2xl border p-4 sm:p-5 ${toneMap[tone]}`}>
            <div className="flex items-center justify-between mb-3">
                <Icon size={16} aria-hidden="true" />
            </div>
            <div className="text-2xl sm:text-[28px] font-black tracking-tight leading-none mb-1">{value}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</div>
            {sublabel && <div className="text-[11px] mt-1 opacity-60">{sublabel}</div>}
        </div>
    );
}

/* ============================================================
   Score comparison bar (contract1 vs contract2, one metric)
   ============================================================ */
function ScoreRow({ label, a, b, winnerKey }) {
    const max = Math.max(a || 0, b || 0, 1);
    return (
        <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>{label}</span>
                <span className="tabular-nums">{a ?? "–"} vs {b ?? "–"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${winnerKey === "contract1" ? "bg-indigo-600" : "bg-slate-300"}`} style={{ width: `${((a || 0) / max) * 100}%` }} />
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${winnerKey === "contract2" ? "bg-indigo-600" : "bg-slate-300"}`} style={{ width: `${((b || 0) / max) * 100}%` }} />
                </div>
            </div>
        </div>
    );
}

export default function ClauseComparison() {
    const [contracts, setContracts] = useState({ contract1: null, contract2: null });
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [planDetails, setPlanDetails] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState("");
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    // --- UI-only state (search / filter / drag feedback) ---
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [dragOver, setDragOver] = useState({ contract1: false, contract2: false });
    const resultsRef = useRef(null);

    // Names of the contracts that produced the current `comparison`,
    // captured before the file inputs get cleared post-analysis.
    const [resultFileNames, setResultFileNames] = useState({ contract1: "Contract 1", contract2: "Contract 2" });

    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const [subRes, usageRes] = await Promise.all([
                    authenticatedFetch('/api/subscription'),
                    authenticatedFetch('/api/usage')
                ]);

                const subJson = await subRes.json();
                if (subJson.success) {
                    setSubscription(subJson.subscription);
                    setPlanDetails(subJson.planDetails);
                }

                const usageJson = await usageRes.json();
                if (usageJson.success) {
                    setUsage(usageJson.currentUsage);
                }
            } catch (error) {
                if (error.message !== 'Authentication required') {
                    console.error('Plan fetch error:', error);
                }
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchPlanData();
    }, []);

    const getDailyLimit = () => {
        if (!planDetails) return 0;
        return planDetails.limits?.dailyContractComparisons ?? (planDetails.features?.contractComparison ? -1 : 0);
    };

    const getDailyUsed = () => {
        if (!usage) return 0;
        const todayKey = new Date().toISOString().slice(0, 10);
        return usage.dailyContractComparisons?.[todayKey] || 0;
    };

    const handleFileUpload = (contractKey, file) => {
        setContracts(prev => ({ ...prev, [contractKey]: file }));
    };

    const compareContracts = async () => {
        if (!contracts.contract1 || !contracts.contract2) return;
        if (loadingPlan) return;

        if (!subscription || !planDetails) {
            toast.error('Please log in to compare contracts');
            return;
        }

        const limit = getDailyLimit();
        const used = getDailyUsed();
        if (limit !== -1 && used >= limit) {
            setUpgradeMessage(`You've reached your daily limit (${limit}/day).`);
            setShowUpgrade(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('contract1', contracts.contract1);
        formData.append('contract2', contracts.contract2);

        try {
            const response = await authenticatedFetch('/api/compare-contracts', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setUpgradeMessage(result.upgradeMessage || result.error || 'Upgrade required.');
                    setShowUpgrade(true);
                    return;
                }
                toast.error(result.error || 'Comparison failed');
                return;
            }

            // Preserve the file names used for this run before inputs are cleared.
            setResultFileNames({
                contract1: contracts.contract1?.name || "Contract 1",
                contract2: contracts.contract2?.name || "Contract 2",
            });
            setComparison(result.comparison || null);

            const usageRes = await authenticatedFetch('/api/usage');
            const usageJson = await usageRes.json();
            if (usageJson.success) setUsage(usageJson.currentUsage);

        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Scroll to results once they land, then clear the file inputs.
    useEffect(() => {
        if (!loading && comparison && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setContracts({ contract1: null, contract2: null });

            try {
                const el1 = document.getElementById('contract1');
                const el2 = document.getElementById('contract2');
                if (el1) el1.value = '';
                if (el2) el2.value = '';
            } catch (e) {
                // non-fatal if DOM nodes are not present (server render, tests)
            }
        }
    }, [loading, comparison]);

    const contractLabel = (key) => {
        if (key === "Contract 1") return resultFileNames.contract1;
        if (key === "Contract 2") return resultFileNames.contract2;
        return key || "—";
    };

    const handleDownloadPdf = useCallback(async () => {
        if (!comparison || downloadingPdf) return;
        setDownloadingPdf(true);
        try {
            const doc = await buildComparisonPDF({
                comparison,
                contract1Name: resultFileNames.contract1,
                contract2Name: resultFileNames.contract2,
            });
            const safeName = (s) => (s || "contract").replace(/\.[^/.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").slice(0, 40);
            doc.save(`comparison-${safeName(resultFileNames.contract1)}-vs-${safeName(resultFileNames.contract2)}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Could not generate the PDF. Please try again.');
        } finally {
            setDownloadingPdf(false);
        }
    }, [comparison, downloadingPdf, resultFileNames]);

    // ---- Derived / normalized data straight from the real schema ----
    const exec = comparison?.executiveSummary;
    const scorecard = comparison?.scorecard;
    const winnerByCategory = comparison?.winnerByCategory || [];
    const clauseComparison = comparison?.clauseComparison?.length ? comparison.clauseComparison : (comparison?.criticalDifferences || []);
    const missing1 = comparison?.missingClauses?.contract1 || [];
    const missing2 = comparison?.missingClauses?.contract2 || [];
    const aligned = comparison?.alignedClauses || [];
    const negotiations = comparison?.negotiationSuggestions || [];

    const filteredMissing1 = useMemo(() => missing1.filter(m =>
        matchText(searchQuery, m.title, m.description) &&
        (activeFilter === "all" || activeFilter === "missing" || activeFilter === (m.importance || "").toLowerCase())
    ), [missing1, searchQuery, activeFilter]);

    const filteredMissing2 = useMemo(() => missing2.filter(m =>
        matchText(searchQuery, m.title, m.description) &&
        (activeFilter === "all" || activeFilter === "missing" || activeFilter === (m.importance || "").toLowerCase())
    ), [missing2, searchQuery, activeFilter]);

    const filteredDifferences = useMemo(() => clauseComparison.filter(d =>
        matchText(searchQuery, d.title, d.difference, d.legalImpact, d.businessImpact) &&
        (activeFilter === "all" || activeFilter === "modified" || activeFilter === (d.severity || "").toLowerCase())
    ), [clauseComparison, searchQuery, activeFilter]);

    const filteredAligned = useMemo(() => aligned.filter(a =>
        matchText(searchQuery, a.title, a.summary) &&
        (activeFilter === "all" || activeFilter === "matching")
    ), [aligned, searchQuery, activeFilter]);

    const showMissing = activeFilter === "all" || activeFilter === "missing" || ["high", "medium", "low"].includes(activeFilter);
    const showDifferences = activeFilter === "all" || activeFilter === "modified" || ["high", "medium", "low"].includes(activeFilter);
    const showAligned = activeFilter === "all" || activeFilter === "matching";

    const filters = [
        { id: "all", label: "All" },
        { id: "missing", label: "Missing" },
        { id: "modified", label: "Modified" },
        { id: "matching", label: "Matching" },
        { id: "high", label: "High risk" },
        { id: "medium", label: "Medium risk" },
        { id: "low", label: "Low risk" },
    ];

    const hasComparison = !!comparison;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10 space-y-10 min-h-screen bg-[#FAFAFB]">

            {/* ================= HERO HEADER ================= */}
            <header className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-widest border border-indigo-100">
                    <Sparkles size={13} aria-hidden="true" /> AI-Powered Analysis
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    Clause Comparison <span className="text-indigo-600">Engine</span>
                </h1>
                <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
                    Upload two versions of a contract to surface differences, missing protections, and verified matches — in plain business language.
                </p>
            </header>

            {/* ================= UPLOAD AREA ================= */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 relative max-w-4xl mx-auto">
                <div className="hidden lg:flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-white p-4 rounded-full border border-slate-200 shadow-xl text-indigo-600 ring-8 ring-[#FAFAFB]">
                        <Files size={26} aria-hidden="true" />
                    </div>
                </div>

                {['contract1', 'contract2'].map((key, index) => (
                    <UploadCard
                        key={key}
                        id={key}
                        title={`Contract ${index + 1}`}
                        file={contracts[key]}
                        isDragOver={dragOver[key]}
                        onDragStateChange={(state) => setDragOver(prev => ({ ...prev, [key]: state }))}
                        onUpload={(file) => handleFileUpload(key, file)}
                        onRemove={() => handleFileUpload(key, null)}
                    />
                ))}
            </div>

            {/* ================= COMPARE ACTION ================= */}
            <div className="flex flex-col items-center gap-3">
                <button
                    onClick={compareContracts}
                    disabled={!contracts.contract1 || !contracts.contract2 || loading}
                    className="group relative cursor-pointer inline-flex items-center gap-3 bg-indigo-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" aria-hidden="true" /> Analyzing contracts…
                        </>
                    ) : (
                        <>
                            Start comparison
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </>
                    )}
                </button>
                {(!contracts.contract1 || !contracts.contract2) && !loading && (
                    <span className="text-xs text-slate-400 font-medium">Select both files to proceed</span>
                )}
            </div>

            {/* ================= LOADING EXPERIENCE ================= */}
            {loading && (
                <div aria-live="polite" className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white border border-indigo-100 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Activity size={20} className="animate-pulse" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm">AI is reading both contracts…</p>
                            <p className="text-xs text-slate-500 mt-0.5">This usually takes under a minute. Feel free to wait here.</p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent animate-[shimmer_1.6s_infinite]" style={{ backgroundSize: "200% 100%" }} />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {[0, 1].map(i => (
                            <div key={i} className="h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 to-transparent animate-[shimmer_1.6s_infinite]" style={{ backgroundSize: "200% 100%", animationDelay: `${i * 0.2}s` }} />
                            </div>
                        ))}
                    </div>
                    <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
                </div>
            )}

            {/* ================= RESULTS ================= */}
            {hasComparison && !loading && (
                <div ref={resultsRef} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-mt-6">
                    <hr className="border-slate-200" />

                    {/* --- Results header + PDF export --- */}
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Analysis complete</p>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {resultFileNames.contract1} <span className="text-slate-400 font-medium">vs</span> {resultFileNames.contract2}
                            </h2>
                        </div>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf}
                            aria-label="Download comparison report as PDF"
                            className="inline-flex items-center justify-center gap-2.5 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            {downloadingPdf ? (
                                <>
                                    <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Preparing PDF…
                                </>
                            ) : (
                                <>
                                    <Download size={17} aria-hidden="true" /> Download PDF report
                                </>
                            )}
                        </button>
                    </div>

                    {/* --- Verdict banner --- */}
                    {exec && (
                        <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                <Trophy size={22} className="text-amber-300" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Recommended</p>
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1.5">{contractLabel(exec.recommendedContract)}</h2>
                                <p className="text-sm text-white/70 leading-relaxed">{exec.winnerReason}</p>
                            </div>
                        </div>
                    )}

                    {/* --- Overview dashboard --- */}
                    {exec && (
                        <div className="max-w-5xl mx-auto">
                            <SectionHeading
                                icon={Gauge}
                                title="Comparison overview"
                                description="A quick read on similarity, risk, and where the contracts differ."
                            />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                                <MetricCard icon={Percent} label="Overall similarity" value={`${exec.overallSimilarity ?? 0}%`} tone="indigo" />
                                <MetricCard icon={ShieldAlert} label="Risk level" value={exec.riskLevel || "—"} tone={exec.riskLevel === "HIGH" ? "rose" : exec.riskLevel === "LOW" ? "emerald" : "amber"} />
                                <MetricCard icon={XCircle} label="Missing clauses" value={missing1.length + missing2.length} tone="rose" />
                                <MetricCard icon={AlertTriangle} label="Changed clauses" value={clauseComparison.length} tone="amber" />
                                <MetricCard icon={CheckCircle} label="Matching clauses" value={aligned.length} tone="emerald" />
                                <MetricCard icon={ShieldCheck} label="AI confidence" value={`${exec.confidence ?? 0}%`} tone="slate" />
                            </div>
                        </div>
                    )}

                    {/* --- Scorecard --- */}
                    {scorecard && (
                        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <SectionHeading icon={BarChart3} title="Scorecard" description="How each contract stacks up, side by side." />
                            <div className="flex items-center gap-6 text-xs font-bold text-slate-500 mt-4 mb-5">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> {resultFileNames.contract1}</span>
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> {resultFileNames.contract2}</span>
                            </div>
                            <div className="space-y-4">
                                <ScoreRow label="Overall score" a={scorecard.contract1?.overallScore} b={scorecard.contract2?.overallScore} winnerKey={scorecard.contract1?.overallScore >= scorecard.contract2?.overallScore ? "contract1" : "contract2"} />
                                <ScoreRow label="Risk score" a={scorecard.contract1?.riskScore} b={scorecard.contract2?.riskScore} winnerKey={scorecard.contract1?.riskScore <= scorecard.contract2?.riskScore ? "contract1" : "contract2"} />
                                <ScoreRow label="Protection score" a={scorecard.contract1?.protectionScore} b={scorecard.contract2?.protectionScore} winnerKey={scorecard.contract1?.protectionScore >= scorecard.contract2?.protectionScore ? "contract1" : "contract2"} />
                                <ScoreRow label="Clarity score" a={scorecard.contract1?.clarityScore} b={scorecard.contract2?.clarityScore} winnerKey={scorecard.contract1?.clarityScore >= scorecard.contract2?.clarityScore ? "contract1" : "contract2"} />
                            </div>

                            {winnerByCategory.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Winner by category</p>
                                    <div className="grid sm:grid-cols-2 gap-2.5">
                                        {winnerByCategory.map((w, i) => (
                                            <div key={i} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 text-sm">
                                                <Trophy size={14} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">{w.category} <span className="font-normal text-slate-500">— {contractLabel(w.winner)}</span></p>
                                                    {w.reason && <p className="text-xs text-slate-500 mt-0.5">{w.reason}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- Search + filters --- */}
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sticky top-2 z-20">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <label htmlFor="clause-search" className="sr-only">Search clauses</label>
                            <input
                                id="clause-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, description, or category…"
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-9 py-3 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                        <div role="group" aria-label="Filter clauses" className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(f.id)}
                                    aria-pressed={activeFilter === f.id}
                                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                        activeFilter === f.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- Missing clauses --- */}
                    {showMissing && (
                        <div className="max-w-5xl mx-auto">
                            <Accordion id="missing" title="Missing clauses" icon={XCircle} tone="rose" count={filteredMissing1.length + filteredMissing2.length}
                                description="Protections present in one contract but absent from the other.">
                                {filteredMissing1.length === 0 && filteredMissing2.length === 0 ? (
                                    <EmptyRow icon={ShieldCheck} text="No missing clauses match your filters." />
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <MissingGroup label={`Absent in ${resultFileNames.contract2}`} items={filteredMissing1} />
                                        <MissingGroup label={`Absent in ${resultFileNames.contract1}`} items={filteredMissing2} />
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    )}

                    {/* --- Key differences --- */}
                    {showDifferences && (
                        <div className="max-w-5xl mx-auto">
                            <Accordion id="differences" title="Key differences" icon={AlertTriangle} tone="amber" count={filteredDifferences.length}
                                description="Clauses that exist in both contracts but differ in meaning or terms." defaultOpen>
                                {filteredDifferences.length === 0 ? (
                                    <EmptyRow icon={CheckCircle} text="No differences match your filters." />
                                ) : (
                                    <div className="space-y-4">
                                        {filteredDifferences.map((d, i) => (
                                            <DifferenceCard key={i} diff={d} contractLabel={contractLabel} contract1Name={resultFileNames.contract1} contract2Name={resultFileNames.contract2} />
                                        ))}
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    )}

                    {/* --- Matching clauses --- */}
                    {showAligned && (
                        <div className="max-w-5xl mx-auto">
                            <Accordion id="matching" title="Matching clauses" icon={CheckCircle} tone="emerald" count={filteredAligned.length}
                                description="Terms that are functionally aligned across both contracts.">
                                {filteredAligned.length === 0 ? (
                                    <EmptyRow icon={Inbox} text="No matching clauses to show." />
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {filteredAligned.map((a, i) => (
                                            <SimilarCard key={i} clause={a} />
                                        ))}
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    )}

                    {/* --- AI recommendations --- */}
                    {negotiations.length > 0 && (
                        <div className="max-w-5xl mx-auto">
                            <Accordion id="recommendations" title="AI recommendations" icon={Lightbulb} tone="indigo" count={negotiations.length}
                                description="Negotiation points worth raising before signing." defaultOpen>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {negotiations.map((n, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h4 className="font-bold text-indigo-950 text-sm leading-snug">{n.title}</h4>
                                                <RiskBadge level={n.priority} />
                                            </div>
                                            <p className="text-sm text-indigo-900/70 leading-relaxed">{n.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </Accordion>
                        </div>
                    )}
                </div>
            )}

            <UpgradePrompt
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                feature="contract_comparison"
                currentPlan={subscription?.planId || "basic"}
                currentPlanExpiry={subscription?.endDate || null}
                message={upgradeMessage}
            />
        </div>
    );
}

/* --- Modular Helper Components --- */

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Icon size={17} aria-hidden="true" />
            </span>
            <div>
                <h2 className="font-black text-slate-900 tracking-tight text-lg">{title}</h2>
                {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}

function UploadCard({ id, title, file, onUpload, onRemove, isDragOver, onDragStateChange }) {
    const handleDrop = (e) => {
        e.preventDefault();
        onDragStateChange(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) onUpload(dropped);
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); onDragStateChange(true); }}
            onDragLeave={() => onDragStateChange(false)}
            onDrop={handleDrop}
            className={`relative transition-all rounded-[2.2rem] p-0.5 ${
                isDragOver ? 'bg-indigo-400 scale-[1.01]' : file ? 'bg-indigo-200' : 'bg-white shadow-sm hover:shadow-md'
            }`}
        >
            <div
                className={`border-2 border-dashed rounded-[2rem] p-6 sm:p-7 text-center bg-white transition-colors ${
                    isDragOver ? 'border-indigo-500 bg-indigo-50/40' : file ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-300'
                }`}
            >
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                    className="hidden"
                    id={id}
                />

                <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                        file ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                    }`}
                    aria-hidden="true"
                >
                    {file ? <FileText size={30} strokeWidth={1.5} /> : <Upload size={28} strokeWidth={1.5} />}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">{title}</h3>
                <p className="text-sm text-slate-500 mb-1">
                    {isDragOver ? "Drop it here" : "Drag and drop, or click to browse"}
                </p>
                <p className="text-[11px] text-slate-400 mb-5">Supports PDF, DOC, DOCX</p>

                <div className="flex items-center justify-center gap-2">
                    <label
                        htmlFor={id}
                        className="cursor-pointer bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
                    >
                        {file ? 'Replace file' : 'Select file'}
                    </label>
                    {file && (
                        <button
                            onClick={onRemove}
                            aria-label={`Remove ${file.name}`}
                            className="text-sm font-bold px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {file && (
                    <div className="mt-4 inline-flex items-center gap-2 text-indigo-700 bg-indigo-50/60 py-1.5 px-3 rounded-full text-xs font-bold border border-indigo-100 max-w-full">
                        <CheckCircle size={13} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-indigo-400 font-normal shrink-0">· {formatFileSize(file.size)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function MissingGroup({ label, items }) {
    if (!items?.length) return null;
    return (
        <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
            {items.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-rose-900">{item.title}</p>
                        <RiskBadge level={item.importance} />
                    </div>
                    {item.description && <p className="text-xs text-rose-700/80 leading-relaxed">{item.description}</p>}
                    {item.impact && (
                        <div className="mt-3 p-3 bg-white/70 rounded-xl border border-rose-200 text-xs">
                            <span className="font-bold text-rose-900 block mb-1">Business impact</span>
                            <p className="text-rose-800/90 leading-relaxed">{item.impact}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function DifferenceCard({ diff, contractLabel, contract1Name, contract2Name }) {
    return (
        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100">
            <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-bold text-slate-900">{diff.title}</span>
                <RiskBadge level={diff.severity} />
            </div>

            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch mb-3">
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 truncate">{contract1Name || "Contract 1"}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{diff.contract1 || "—"}</p>
                </div>
                <div className="flex sm:flex-col items-center justify-center text-amber-500 shrink-0">
                    <ArrowDown size={16} className="hidden sm:block" aria-hidden="true" />
                    <ArrowRight size={16} className="sm:hidden" aria-hidden="true" />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 truncate">{contract2Name || "Contract 2"}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{diff.contract2 || "—"}</p>
                </div>
            </div>

            {diff.difference && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3"><span className="font-bold text-slate-900">What changed: </span>{diff.difference}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
                {diff.businessImpact && (
                    <div className="p-3 bg-white rounded-xl border border-amber-200/70 text-xs">
                        <span className="font-bold text-amber-700 uppercase tracking-widest text-[10px] block mb-1">Business impact</span>
                        <p className="text-slate-600 leading-relaxed">{diff.businessImpact}</p>
                    </div>
                )}
                {diff.recommendation && (
                    <div className="p-3 bg-white rounded-xl border border-indigo-200/70 text-xs">
                        <span className="font-bold text-indigo-700 uppercase tracking-widest text-[10px] block mb-1">Recommendation</span>
                        <p className="text-slate-600 leading-relaxed">{diff.recommendation}</p>
                    </div>
                )}
            </div>

            {diff.winner && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Trophy size={13} className="text-amber-500" aria-hidden="true" /> Favors {contractLabel(diff.winner)}
                </div>
            )}
        </div>
    );
}

function SimilarCard({ clause }) {
    const [expanded, setExpanded] = useState(false);
    const summary = clause.summary || "";
    const isLong = summary.length > 140;
    return (
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900 leading-tight mb-1">{clause.title}</p>
            {summary && (
                <>
                    <p className={`text-xs text-emerald-700/80 leading-relaxed ${!expanded && isLong ? "line-clamp-2" : ""}`}>{summary}</p>
                    {isLong && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="text-[11px] font-bold text-emerald-700 mt-1.5 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
                        >
                            {expanded ? "Show less" : "Show more"}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}