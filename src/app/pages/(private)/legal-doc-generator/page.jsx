"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Mail, Download, Upload, Plus, Trash2, CheckCircle2,
  AlertCircle, ArrowLeft, Loader2, Sparkles, Send, ShieldAlert,
  Calendar, Check, Settings, Eye, CheckSquare, PenLine, FileCode, History,
  Copy, RefreshCw, X, ChevronRight, Sliders, FileCheck, Sparkle,
  Image as ImageIcon, Wand2, HelpCircle
} from "lucide-react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import DocumentEditor from "@/components/editor/DocumentEditor";
import html2canvas from "html2canvas-pro";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

if (typeof window !== "undefined") {
  window.html2canvas = html2canvas;
}

// Inline helper: empty fallback placeholders
const ph = (value, label) => (value && String(value).trim() ? value : `[${label}]`);

const applyMailMergeToHtml = (html, row) => {
  if (!html) return html;
  return html.replace(
    /<span[^>]*data-variable-key="([\w]+)"[^>]*>([\s\S]*?)<\/span>/gi,
    (match, key) => {
      const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") {
        return `<span data-variable-key="${key}" class="merged-variable font-bold" style="background-color: transparent !important; border: none !important; color: inherit !important; padding: 0 !important;">${row[foundKey]}</span>`;
      }
      return match;
    }
  );
};

// Signature Pad canvas drawer
const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const lastPoint = useRef(null);

  const drawGuide = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#cbd5e1";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, canvas.height - 22);
    ctx.lineTo(canvas.width - 16, canvas.height - 22);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("Sign above the line", 16, canvas.height - 8);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      drawGuide(ctx, canvas);
    }
  }, []);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!hasStroke) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStroke(true);
    }
    const p = getPoint(e);
    lastPoint.current = p;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = getPoint(e);
    const prev = lastPoint.current;
    const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2 };

    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
    ctx.stroke();

    lastPoint.current = p;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setHasStroke(false);
    drawGuide(ctx, canvas);
    onSave("");
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (hasStroke) {
      const dataUrl = canvas.toDataURL("image/png");
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs relative">
        <canvas
          ref={canvasRef}
          width={360}
          height={100}
          className="w-full h-24 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {hasStroke && (
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute top-2 right-2 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

// Built-in Template Bodies
const HTML_TEMPLATES = {
  OFFER_LETTER: `<p>We are pleased to offer you the position of <strong><span data-variable-key="position">Position Designation</span></strong> at <strong><span data-variable-key="companyName">Company Name</span></strong>. We were impressed with your background and believe you will make significant contributions to our team.</p>
<p><strong>1. Position & Duties:</strong> You will serve as <span data-variable-key="position">Position Designation</span>, performing duties assigned by company management. Your start date will be <span data-variable-key="joiningDate">Joining Date</span>.</p>
<p><strong>2. Compensation:</strong> Your starting annual base salary will be <strong><span data-variable-key="salary">Annual Salary</span></strong>, payable in accordance with the Company's standard payroll schedule.</p>
<p><strong>3. At-Will Employment:</strong> This offer is for at-will employment, meaning either you or the Company may terminate the relationship at any time, with or without cause or advance notice.</p>
<p>To accept this offer, please sign and return this agreement by your start date.</p>`,

  NDA: `<p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into between <strong><span data-variable-key="companyName">Company Name</span></strong> and <strong><span data-variable-key="counterpartyName">Counterparty Name</span></strong> (<span data-variable-key="counterpartyEmail">Counterparty Email</span>) for the purpose of <strong><span data-variable-key="purpose">Disclosure Purpose</span></strong>.</p>
<p><strong>1. Confidential Information:</strong> Both parties agree to protect proprietary technical, commercial, and business data disclosed during negotiations.</p>
<p><strong>2. Term & Obligations:</strong> The confidentiality obligations under this Agreement shall remain in effect for a duration of <span data-variable-key="termYears">Term in Years</span> years from the date of disclosure.</p>
<p><strong>3. Non-Use Restrictions:</strong> Neither party shall use Confidential Information for any purpose other than evaluating potential strategic collaboration.</p>
<p><strong>4. Jurisdiction:</strong> This Agreement shall be governed by and construed in accordance with the laws of <span data-variable-key="jurisdiction">Jurisdiction</span>.</p>`,

  LEASE: `<p>This Residential Rental Agreement ("Lease") is entered into between:</p>
<p><strong>Landlord:</strong> <span data-variable-key="companyName">Landlord / Company Name</span></p>
<p><strong>Tenant:</strong> <span data-variable-key="tenantName">Tenant Name</span> (<span data-variable-key="tenantEmail">Tenant Email</span>)</p>
<p><strong>1. Premises:</strong> Landlord hereby leases to Tenant the premises located at: <span data-variable-key="premisesAddress">Premises Address</span>.</p>
<p><strong>2. Lease Term:</strong> This lease shall run for a duration of <span data-variable-key="leaseMonths">Lease Term in Months</span> months, starting on <span data-variable-key="joiningDate">Start Date</span>.</p>
<p><strong>3. Rent:</strong> Tenant agrees to pay a monthly rent of <strong><span data-variable-key="monthlyRent">Monthly Rent</span></strong> on or before the 5th day of each calendar month.</p>
<p><strong>4. Security Deposit:</strong> Tenant shall deposit the sum of <span data-variable-key="securityDeposit">Security Deposit</span> as security deposit prior to move-in.</p>`,

  NOTICE: `<p>Under instructions from our client <strong><span data-variable-key="companyName">Company Name</span></strong>, we serve you with this Legal Breach Notice:</p>
<p><strong>1. Statement of Claim:</strong> You have committed material breaches under the terms of our contract. Specifically: <span data-variable-key="breachDescription">Breach Description</span>.</p>
<p><strong>2. Outstanding Amount:</strong> You owe our client the sum of <strong><span data-variable-key="amountOwed">Amount Owed</span></strong>.</p>
<p><strong>3. Demand:</strong> You are hereby called upon to pay the sum stated above, or cure the breach, within <span data-variable-key="noticeDays">Notice Period in Days</span> days of receipt of this notice.</p>
<p><strong>4. Legal Remedies:</strong> Failure to comply will compel our client to initiate appropriate legal proceedings in a court of competent jurisdiction.</p>`,

  CUSTOM: `<p>Type or paste your raw contract ideas below, then click <strong>Polish with AI & Render Preview</strong> to transform them into formal legal terms!</p>`
};

const GALLERY_TEMPLATES = [
  { id: "OFFER_LETTER", title: "Job Offer Letter", desc: "Corporate placement & hiring agreement", theme: "blue", icon: FileText, badge: "Popular" },
  { id: "NDA", title: "Mutual NDA Agreement", desc: "Confidentiality & IP data protection", theme: "blue", icon: ShieldAlert, badge: "Security" },
  { id: "LEASE", title: "Residential Lease", desc: "Landlord tenant rental agreement", theme: "black", icon: Calendar, badge: "Property" },
  { id: "NOTICE", title: "Legal Demand Notice", desc: "Official contract breach notification", theme: "red", icon: AlertCircle, badge: "Notice" },
  { id: "CUSTOM", title: "Custom Document", desc: "Write raw ideas & polish with AI", theme: "blue", icon: Plus, badge: "Custom AI" }
];

const EMPTY_FORM = {
  candidateName: "",
  candidateEmail: "",
  position: "",
  salary: "",
  joiningDate: "",
  companyName: "Legal Advisor Technologies",
  companyTagline: "Enterprise Decision Intelligence",
  companyPhone: "+1 (800) 555-0199",
  companyEmail: "legal@legaladvisor.com",
  companyAddress: "100 Innovation Way, Suite 400",
  senderName: "Alex Morgan",
  senderTitle: "Managing Director",
  recipientAddress: "",
  themeColor: "blue",
  counterpartyName: "",
  counterpartyEmail: "",
  purpose: "Strategic Collaboration & Tech Evaluation",
  termYears: "3",
  jurisdiction: "Delaware, USA",
  landlordName: "",
  tenantName: "",
  tenantEmail: "",
  premisesAddress: "",
  leaseMonths: "12",
  monthlyRent: "$2,500",
  securityDeposit: "$2,500",
  defaulterName: "",
  defaulterEmail: "",
  defaulterAddress: "",
  breachDescription: "",
  amountOwed: "",
  noticeDays: "15"
};

export default function LegalDocGenerator() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("preview"); // "preview" | "editor"
  const [templateType, setTemplateType] = useState("OFFER_LETTER");
  const [logoBase64, setLogoBase64] = useState("");
  const [logoName, setLogoName] = useState("");
  const [footerText, setFooterText] = useState("Confidential — Legal Advisor");

  // Editor states
  const [title, setTitle] = useState("Job Offer Letter");
  const [editorContent, setEditorContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState(null);

  // Signature & Stamp
  const [signatureMethod, setSignatureMethod] = useState("text"); // "text" | "draw" | "upload"
  const [signatureBase64, setSignatureBase64] = useState("");
  const [stampMethod, setStampMethod] = useState("generate"); // "none" | "generate" | "upload"
  const [stampBase64, setStampBase64] = useState("");

  // Form State
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [isSendingMail, setIsSendingMail] = useState(false);

  // AI Scoped Polish Assistant Panel
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState("");
  const [aiOutputText, setAiOutputText] = useState("");
  const [isAiRunning, setIsAiRunning] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Initial setup: load template
  useEffect(() => {
    if (!currentDocId) {
      setEditorContent(HTML_TEMPLATES[templateType]);
      const tmpl = GALLERY_TEMPLATES.find(t => t.id === templateType);
      setTitle(`${tmpl.title} - Draft`);
    }
  }, [templateType]);

  // Sync email default content
  useEffect(() => {
    const recipientName = formData.candidateName || formData.counterpartyName || formData.tenantName || formData.defaulterName || "Recipient";
    const docName = templateType.replace("_", " ");
    const compLabel = ph(formData.companyName, "Company Name");

    setMailSubject(`Action Required: ${docName} — ${compLabel}`);
    setMailBody(`Dear ${recipientName},\n\nPlease review and execute the attached ${docName} document.\n\nBest regards,\n${compLabel}`);
    setFooterText(`Confidential — ${compLabel}`);
  }, [formData.companyName, formData.candidateName, formData.counterpartyName, formData.tenantName, formData.defaulterName, templateType]);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setLogoBase64(reader.result);
      reader.readAsDataURL(file);
      toast.success("Company logo uploaded successfully!");
    }
  };

  // Signature Image Upload
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSignatureBase64(reader.result);
      reader.readAsDataURL(file);
      toast.success("Signature image uploaded!");
    }
  };

  // Stamp Seal Image Upload
  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStampBase64(reader.result);
      reader.readAsDataURL(file);
      toast.success("Official stamp seal uploaded!");
    }
  };

  // AI Raw Idea Polish Action
  const handleRunAiPolish = async (action = "polish", targetLang = "") => {
    const textToProcess = aiInputText.trim() || editorContent.replace(/<[^>]*>/g, "").substring(0, 800);
    if (!textToProcess) {
      toast.error("Please enter a raw idea or text to polish.");
      return;
    }

    setIsAiRunning(true);
    try {
      const response = await fetch("/api/legal-doc-generator/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`
        },
        body: JSON.stringify({
          content: textToProcess,
          templateType,
          action,
          targetLanguage: targetLang
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setAiOutputText(result.polishedText);
        const formattedHtml = result.polishedText
          .split("\n\n")
          .map(para => `<p>${para.trim()}</p>`)
          .join("");
        setEditorContent(formattedHtml);
        toast.success("AI polished agreement & updated preview!");
      } else {
        toast.error(result.error || "AI polishing failed.");
      }
    } catch (err) {
      toast.error("AI service error.");
    } finally {
      setIsAiRunning(false);
    }
  };

  // Start fresh document
  const handleNewDocument = () => {
    setCurrentDocId(null);
    const tmpl = GALLERY_TEMPLATES.find(t => t.id === templateType);
    setTitle(`${tmpl.title} - Draft`);
    setEditorContent(HTML_TEMPLATES[templateType]);
    setFormData({ ...EMPTY_FORM });
    setSignatureBase64("");
    setStampBase64("");
    toast.success("Started new document draft");
  };

  // Dynamic theme swatches
  const THEME_HEX = {
    blue: "#2563eb",
    black: "#1e293b",
    gold: "#d97706",
    red: "#dc2626"
  };
  const themeHex = THEME_HEX[formData.themeColor] || THEME_HEX.blue;

  // Client-Side HTML-to-PDF rendering logic
  const handleDownloadPdf = async () => {
    const element = document.getElementById("document-print-area");
    if (!element) return;

    toast.loading("Rendering PDF report...", { id: "pdf-gen" });

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      doc.html(element, {
        x: 0,
        y: 0,
        html2canvas: {
          scale: 0.75,
          useCORS: true,
          logging: false
        },
        callback: function (docInstance) {
          docInstance.save(`${title.toLowerCase().replace(/\s+/g, "_")}.pdf`);
          toast.success("PDF report downloaded successfully!", { id: "pdf-gen" });
        }
      });
    } catch (err) {
      toast.error("PDF generation failed", { id: "pdf-gen" });
    }
  };

  // Send Email with PDF Attachment
  const handleSendSingleEmail = async () => {
    const recipientEmail = formData.candidateEmail || formData.counterpartyEmail || formData.tenantEmail || formData.defaulterEmail;
    if (!recipientEmail) {
      toast.error("Please enter a recipient email address.");
      return;
    }

    setIsSendingMail(true);
    const element = document.getElementById("document-print-area");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

    doc.html(element, {
      x: 0,
      y: 0,
      html2canvas: { scale: 0.75, useCORS: true, logging: false },
      callback: async function (docInstance) {
        const pdfBase64 = docInstance.output("datauristring");
        const docName = `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`;

        try {
          const response = await fetch("/api/legal-doc-generator/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`
            },
            body: JSON.stringify({
              to: recipientEmail,
              subject: mailSubject,
              emailBody: mailBody,
              pdfBase64,
              fileName: docName
            })
          });

          const result = await response.json();
          if (response.ok && result.success) {
            toast.success(`Agreement shared successfully to ${recipientEmail}!`);
            setEmailModalOpen(false);
          } else {
            toast.error(result.error || "Failed to send email.");
          }
        } catch (err) {
          toast.error("Network error while sending email.");
        } finally {
          setIsSendingMail(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-100" suppressHydrationWarning>
      
      {/* ================= HEADER NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3.5 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pages/private-chat" className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <FileText size={18} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-none">Legal Document Studio</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated agreement drafting & AI polish</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewDocument}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> New Draft
            </button>

            {/* AI Polish Trigger Button */}
            <button
              onClick={() => setAiPanelOpen(true)}
              className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Wand2 size={14} className="text-blue-600" /> Polish with AI
            </button>

            <button
              onClick={handleDownloadPdf}
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* ================= TEMPLATE SELECTOR GALLERY ================= */}
      <div className="bg-white border-b border-slate-200/80 py-5 px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-600" /> Select Document Template
            </span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${viewMode === "preview" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"}`}
              >
                <Eye size={13} className="inline mr-1" /> A4 Preview
              </button>
              <button
                onClick={() => setViewMode("editor")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${viewMode === "editor" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"}`}
              >
                <PenLine size={13} className="inline mr-1" /> Rich Editor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {GALLERY_TEMPLATES.map((item) => {
              const Icon = item.icon;
              const isSelected = templateType === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTemplateType(item.id);
                    setFormData(prev => ({ ...prev, themeColor: item.theme }));
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                    isSelected 
                      ? "bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20" 
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs ${isSelected ? "text-blue-900" : "text-slate-800"}`}>{item.title}</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE AREA ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PARAMETERS & BRANDING FORM (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Document Title Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Document Identifier Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 px-4 py-2.5 rounded-xl text-slate-900 text-xs font-semibold transition"
              placeholder="Agreement title"
            />
          </div>

          {/* Template Variables Form */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare size={16} className="text-blue-600" /> Contract Variable Inputs
              </h3>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {templateType === "OFFER_LETTER" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Candidate Full Name</label>
                    <input type="text" name="candidateName" value={formData.candidateName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Candidate Email</label>
                    <input type="email" name="candidateEmail" value={formData.candidateEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. john@example.com" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Designation Role</label>
                    <input type="text" name="position" value={formData.position} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Senior Software Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Annual Salary</label>
                      <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. $85,000" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Joining Date</label>
                      <input type="text" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. June 15, 2026" />
                    </div>
                  </div>
                </>
              )}

              {templateType === "NDA" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Counterparty Company / Name</label>
                    <input type="text" name="counterpartyName" value={formData.counterpartyName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Acme Innovations Inc." />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Counterparty Email</label>
                    <input type="email" name="counterpartyEmail" value={formData.counterpartyEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. legal@acme.com" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Disclosure Purpose</label>
                    <input type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. evaluating technology merger" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Term in Years</label>
                      <input type="text" name="termYears" value={formData.termYears} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Jurisdiction</label>
                      <input type="text" name="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Delaware, USA" />
                    </div>
                  </div>
                </>
              )}

              {templateType === "LEASE" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tenant Name</label>
                    <input type="text" name="tenantName" value={formData.tenantName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Sarah Connor" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tenant Email</label>
                    <input type="email" name="tenantEmail" value={formData.tenantEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. sarah@example.com" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Premises Address</label>
                    <input type="text" name="premisesAddress" value={formData.premisesAddress} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. 742 Evergreen Terrace, Apt 4B" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Monthly Rent</label>
                      <input type="text" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. $2,500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Security Deposit</label>
                      <input type="text" name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. $2,500" />
                    </div>
                  </div>
                </>
              )}

              {templateType === "NOTICE" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Defaulter Party Name</label>
                    <input type="text" name="defaulterName" value={formData.defaulterName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Global Tech LLC" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Defaulter Email</label>
                    <input type="email" name="defaulterEmail" value={formData.defaulterEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. contact@globaltech.com" suppressHydrationWarning />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Breach Details</label>
                    <textarea name="breachDescription" value={formData.breachDescription} onChange={handleInputChange} rows={2} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Failure to remit milestone payment due May 1st" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Amount Owed</label>
                      <input type="text" name="amountOwed" value={formData.amountOwed} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. $14,500" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Notice Days</label>
                      <input type="text" name="noticeDays" value={formData.noticeDays} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. 15" />
                    </div>
                  </div>
                </>
              )}

              {templateType === "CUSTOM" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Recipient Name</label>
                    <input type="text" name="candidateName" value={formData.candidateName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Acme Partners / Jane Smith" />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Recipient Email</label>
                    <input type="email" name="candidateEmail" value={formData.candidateEmail} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. partner@acme.com" suppressHydrationWarning />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Type Raw Agreement Ideas or Requirements</label>
                    <textarea
                      rows={5}
                      value={aiInputText}
                      onChange={(e) => setAiInputText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-3 rounded-xl text-xs font-medium text-slate-900 leading-relaxed shadow-xs"
                      placeholder="e.g. Need a 6 month software development agreement for $8,000 total paid in 2 milestones. 30 days termination notice, client gets full IP ownership upon final payment, and 1 year non-disclosure clause..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunAiPolish("polish")}
                    disabled={isAiRunning}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                  >
                    {isAiRunning ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
                    <span>Polish with AI & Render Preview</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Company Branding & Logo Upload */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings size={16} className="text-blue-600" /> Header Branding & Company Logo
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Logo Image</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                    <ImageIcon size={14} /> Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoName && <span className="text-xs text-slate-500 truncate">{logoName}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Header Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Legal Advisor Corp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Signatory Name</label>
                  <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Alex Morgan" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Signatory Title</label>
                  <input type="text" name="senderTitle" value={formData.senderTitle} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white p-2.5 rounded-xl text-xs font-semibold" placeholder="e.g. Managing Director" />
                </div>
              </div>
            </div>
          </div>

          {/* Signature Pad & Official Stamp Seal */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PenLine size={16} className="text-blue-600" /> Digital Signature & Seal Stamp
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSignatureMethod("text")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${signatureMethod === "text" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Typed Name
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMethod("draw")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${signatureMethod === "draw" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMethod("upload")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${signatureMethod === "upload" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Upload Image
                </button>
              </div>

              {signatureMethod === "draw" && (
                <SignaturePad onSave={(base64) => setSignatureBase64(base64)} />
              )}

              {signatureMethod === "upload" && (
                <div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                    <Upload size={14} /> Choose Signature PNG
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                  </label>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Official Stamp Seal</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStampMethod("none")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${stampMethod === "none" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() => setStampMethod("generate")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${stampMethod === "generate" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Generated Seal
                  </button>
                  <button
                    type="button"
                    onClick={() => setStampMethod("upload")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${stampMethod === "upload" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Upload Seal
                  </button>
                </div>
              </div>

              {stampMethod === "upload" && (
                <div>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                    <Upload size={14} /> Upload Seal Image
                    <input type="file" accept="image/*" onChange={handleStampUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW / RICH EDITOR (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Toolbar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Theme:</span>
              {["blue", "black", "gold", "red"].map((colorKey) => (
                <button
                  key={colorKey}
                  onClick={() => setFormData(prev => ({ ...prev, themeColor: colorKey }))}
                  className={`w-5 h-5 rounded-full border-2 transition ${formData.themeColor === colorKey ? "scale-110 border-slate-900" : "border-transparent"}`}
                  style={{ backgroundColor: THEME_HEX[colorKey] }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Mail size={14} className="text-blue-600" /> Share Email
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>

          {/* View Mode: A4 Preview vs Rich Editor */}
          {viewMode === "editor" ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Rich Document Text Editor</h3>
              <DocumentEditor
                content={editorContent}
                onChange={(newContent) => setEditorContent(newContent)}
              />
            </div>
          ) : (
            /* High-Parity Printable A4 Document Sheet */
            <div className="bg-slate-200/60 p-4 sm:p-8 rounded-3xl border border-slate-300/80 shadow-inner overflow-x-auto flex justify-center">
              <div
                id="document-print-area"
                className="bg-white rounded-none shadow-2xl relative transition-all"
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  padding: "48px 56px",
                  boxSizing: "border-box",
                  fontFamily: "Georgia, Cambria, serif"
                }}
              >
                {/* Document Accent Header Bar */}
                <div 
                  className="h-2 w-full mb-6 rounded-xs"
                  style={{ backgroundColor: themeHex }}
                />

                {/* Header Branding & Custom Company Logo */}
                <div className="flex items-start justify-between border-b pb-6 mb-8" style={{ borderColor: "#e2e8f0" }}>
                  <div className="flex items-center gap-4">
                    {logoBase64 && (
                      <img src={logoBase64} alt="Company Logo" className="h-12 max-w-[140px] object-contain" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
                        {ph(formData.companyName, "Company Name")}
                      </h2>
                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                        {ph(formData.companyTagline, "Enterprise Legal Intelligence")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-sans leading-snug">
                    <p>{ph(formData.companyAddress, "Company Address")}</p>
                    <p>{ph(formData.companyEmail, "company@email.com")}</p>
                  </div>
                </div>

                {/* Recipient & Meta Section */}
                <div className="flex justify-between items-start mb-8 text-xs font-sans">
                  <div>
                    <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block mb-1">To</span>
                    <p className="font-bold text-slate-900 font-serif">
                      {ph(formData.candidateName || formData.counterpartyName || formData.tenantName || formData.defaulterName, "Recipient Name")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block mb-1">Date</span>
                    <p className="text-slate-700" suppressHydrationWarning>{isMounted ? new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : ""}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div 
                  className="text-xs leading-relaxed text-slate-800 space-y-4 font-serif"
                  dangerouslySetInnerHTML={{
                    __html: applyMailMergeToHtml(editorContent, formData)
                  }}
                />

                {/* Signatures & Stamp Seal Section */}
                <div className="mt-16 pt-6 border-t border-slate-200 flex items-end justify-between font-sans">
                  <div className="flex flex-col">
                    <span className="text-xs italic text-slate-500 font-serif mb-2">Sincerely,</span>
                    <div className="h-12 my-1 flex items-center">
                      {(signatureMethod === "draw" || signatureMethod === "upload") && signatureBase64 ? (
                        <img src={signatureBase64} alt="Signature" className="h-10 object-contain" />
                      ) : (
                        <span className="font-serif italic text-blue-900 font-bold text-base tracking-wide">
                          {ph(formData.senderName, "Authorized Signatory")}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 text-xs font-serif">{ph(formData.senderName, "Authorized Signatory")}</span>
                    <span className="text-[10px] text-slate-500">{ph(formData.senderTitle, "Title")}</span>
                  </div>

                  {/* Official Stamp Seal */}
                  <div className="pr-4">
                    {stampMethod === "upload" && stampBase64 ? (
                      <img src={stampBase64} alt="Seal" className="w-16 h-16 object-contain" />
                    ) : stampMethod === "generate" ? (
                      <div className="w-16 h-16 rounded-full border-2 border-double flex flex-col items-center justify-center text-[7px] font-bold border-blue-900 text-blue-900">
                        <span className="text-[6px] font-serif uppercase tracking-tighter">{(formData.companyName || "COMPANY").substring(0, 10)}</span>
                        <span className="text-[5px]">SEAL</span>
                        <span className="text-[6px] font-serif">AUTHORIZED</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="absolute bottom-10 left-14 right-14 flex items-center justify-between text-[9px] text-slate-400 font-sans pt-3 border-t border-slate-200">
                  <span className="uppercase">{footerText}</span>
                  <span>Page 1 of 1</span>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* ================= AI RAW IDEA POLISH MODAL ================= */}
      <AnimatePresence>
        {aiPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wand2 className="text-blue-600" size={20} /> AI Raw Idea Polish Assistant
                </h3>
                <button onClick={() => setAiPanelOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type Raw Idea or Unformatted Requirements</label>
                  <textarea
                    rows={4}
                    value={aiInputText}
                    onChange={(e) => setAiInputText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-medium"
                    placeholder="e.g. Need a 6 month freelance agreement for web development at $50/hr with 30 days termination notice and client retaining IP."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunAiPolish("polish")}
                    disabled={isAiRunning}
                    className="px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAiRunning ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} Polish into Legal Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRunAiPolish("simplify")}
                    disabled={isAiRunning}
                    className="px-3.5 py-2 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 disabled:opacity-50"
                  >
                    Simplify Language
                  </button>
                </div>

                {aiOutputText && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-900">Polished AI Output</label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {aiOutputText}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAiPanelOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= EMAIL SHARE MODAL ================= */}
      <AnimatePresence>
        {emailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="text-blue-600" size={18} /> Share Document via Email
                </h3>
                <button onClick={() => setEmailModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={formData.candidateEmail || formData.counterpartyEmail || formData.tenantEmail || formData.defaulterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                    placeholder="recipient@example.com"
                    suppressHydrationWarning
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendSingleEmail}
                  disabled={isSendingMail}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSendingMail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send Email</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}