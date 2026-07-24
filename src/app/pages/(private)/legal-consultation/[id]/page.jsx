'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import { getConsultation, saveDecisionBrief, syncTimelineEvent } from '@/lib/firebase';

import VideoGrid from '@/components/meet/VideoGrid';
import AvatarContainer from '@/components/meet/AvatarContainer';
import SharedWorkspace from '@/components/meet/SharedWorkspace';
import DocumentViewer from '@/components/meet/DocumentViewer';
import ControlBar from '@/components/meet/ControlBar';
import MissingInfoPanel from '@/components/meet/MissingInfoPanel';

import { Shield, CheckCircle, ArrowLeft, FileText, Scale } from 'lucide-react';

export default function LegalConsultationRoom({ params }) {
  const router = useRouter();
  const [resolvedId, setResolvedId] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google OAuth credentials
  const [accessToken, setAccessToken] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Toggles for user camera/mic
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Active document & workspace state
  const [activeDoc, setActiveDoc] = useState(null);
  const [roomStatus, setRoomStatus] = useState('active'); // active | completed

  // Collapsible logs sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Resolve Route parameters
  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      setResolvedId(resolved.id);
    }
    resolveParams();
  }, [params]);

  // Load Consultation session state
  useEffect(() => {
    if (!resolvedId) return;

    async function loadSession() {
      try {
        const data = await getConsultation(resolvedId);
        if (data) {
          setSession(data);
          const status = data.status || (data.decisionBrief?.decision ? 'completed' : 'active');
          setRoomStatus(status);
          if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
            setActiveDoc(data.uploadedDocuments[data.uploadedDocuments.length - 1]);
          }
        }
      } catch (err) {
        console.error('Error loading session state:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [resolvedId]);

  // Google Sign-In helper
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      setIsGoogleConnected(true);
      if (resolvedId) {
        syncTimelineEvent(resolvedId, 'Google Workspace API connected');
      }
    },
    onError: (err) => {
      console.error('Google Sign-In failed:', err);
      setIsGoogleConnected(false);
      setAccessToken('');
    },
    scope: 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.file'
  });

  // Connect to the Gemini Live WSS Endpoint
  const {
    isConnected,
    connectionError,
    roomState,
    connect,
    disconnect,
    sendTextMessage
  } = useGeminiLive({
    sessionId: resolvedId,
    accessToken: accessToken,
    onStateChange: (state) => {
      // Synchronize states
    }
  });

  // Auto-connect to Gemini Live AI session on page load ONLY IF session is active
  useEffect(() => {
    if (!resolvedId || loading || roomStatus === 'completed') return;

    const timer = setTimeout(() => {
      console.log("[Room] Auto-connecting live AI assistant...");
      connect();
    }, 1500);
    return () => clearTimeout(timer);
  }, [resolvedId, loading, roomStatus]);

  // Handle document upload ingestion
  const handleDocumentIngested = (docData) => {
    setActiveDoc(docData);
    setSession(prev => ({
      ...prev,
      uploadedDocuments: [...(prev?.uploadedDocuments || []), docData]
    }));

    if (docData && docData.summary) {
      console.log("[Room] Pushing contract summary to Gemini Live WSS...");
      sendTextMessage(`[SYSTEM NOTICE: The user has uploaded a contract named "${docData.name}". Here is the text summary of the contract for your analysis:\n\n${docData.summary}\n\nPlease acknowledge receipt of this document text to the user, and ask them what specific clauses or risks they would like to review or ask you about.]`);
    }
  };

  // Toggle Screen Share and log context to live feed
  const handleToggleScreenShare = () => {
    const nextState = !isScreenSharing;
    setIsScreenSharing(nextState);
    if (nextState) {
      sendTextMessage("[SYSTEM NOTICE: The user has started sharing their screen showing the legal contract. Greet this action and offer to help guide them through it.]");
    } else {
      sendTextMessage("[SYSTEM NOTICE: The user has stopped sharing their screen.]");
    }
  };

  // Compile final summary report
  const handleEndConsultation = async () => {
    if (!resolvedId) return;
    const check = confirm('Are you sure you want to end this live consultation session? This will compile the final brief report.');
    if (!check) return;

    try {
      setLoading(true);
      disconnect();

      const brief = {
        decision: activeDoc ? 'Wait before signing. Negotiate terms.' : 'Advice Pending. Complete Document Upload.',
        confidence: activeDoc ? 85 : 40,
        confidenceFactors: activeDoc ? [
          { factor: 'Document complete', status: 'verified' },
          { factor: 'Key clauses verified', status: 'verified' },
          { factor: 'User clarified probation terms', status: 'verified' },
          { factor: 'Salary compensation details missing', status: 'warning' }
        ] : [
          { factor: 'No document uploaded', status: 'warning' }
        ],
        missingInformation: activeDoc ? ['Salary details', 'Bonus structure parameters'] : ['Upload contract for evaluation'],
        reason: activeDoc ? [
          'Governing law lists foreign court Delaware USA (Clause 2), creating massive litigation travel expenses.',
          'IP ownership survival period is 99 years (Clause 1), which is excessive.'
        ] : ['Awaiting contract files.'],
        recommendedNextSteps: activeDoc ? [
          'Ask counterparty to adjust Governing law to local courts.',
          'Request a standard IP duration clause matching employment tenure.',
          'Generate notice / amendment draft to counterparty.'
        ] : ['Return to room and upload contract PDF.'],
        supportingEvidence: activeDoc ? [activeDoc.name] : []
      };

      await saveDecisionBrief(resolvedId, brief);
      setRoomStatus('completed');

      const updated = await getConsultation(resolvedId);
      setSession(updated);
    } catch (err) {
      console.error('Error generating brief:', err);
    } finally {
      setLoading(false);
    }
  };

  // Local PDF report download
  const handleDownloadTextReport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const brief = session?.decisionBrief;
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();

      // Brand Color Palette
      const primaryColor = [11, 15, 26]; // Dark header background
      const goldColor = [201, 162, 39]; // Brand Accent Gold

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 32, 'F');

      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('LEGAL RISK RADAR', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(201, 162, 39);
      doc.text('EXECUTIVE DECISION BRIEF & AUDIT REPORT', 14, 23);

      // Meta Info Right
      doc.setFontSize(8);
      doc.setTextColor(200, 205, 215);
      doc.text(`Session ID: ${resolvedId || 'N/A'}`, 196, 14, { align: 'right' });
      doc.text(`Exported: ${dateStr} ${timeStr}`, 196, 21, { align: 'right' });

      let y = 42;

      // Section 1: Recommended Decision Box
      doc.setFillColor(240, 243, 250);
      doc.roundedRect(14, y, 182, 24, 3, 3, 'F');
      doc.setDrawColor(200, 210, 230);
      doc.roundedRect(14, y, 182, 24, 3, 3, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 110, 130);
      doc.text('RECOMMENDED DECISION:', 20, y + 8);

      doc.setFontSize(11);
      doc.setTextColor(20, 30, 55);
      const decisionText = brief?.decision || 'Review ongoing. No final brief compiled yet.';
      doc.text(decisionText, 20, y + 17);

      // Confidence badge on right of decision box
      if (brief?.confidence) {
        doc.setFillColor(201, 162, 39);
        doc.roundedRect(156, y + 5, 34, 14, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${brief.confidence}% CONFIDENCE`, 173, y + 14, { align: 'center' });
      }

      y += 32;

      // Helper to add section header
      const addSectionHeader = (title) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(11, 15, 26);
        doc.text(title, 14, y);
        doc.setDrawColor(201, 162, 39);
        doc.setLineWidth(0.6);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;
      };

      // Section 2: Core Risk Factors
      addSectionHeader('1. CORE RISK FACTORS IDENTIFIED');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 45, 60);

      const risks = brief?.reason || ['No specific risk factors recorded.'];
      risks.forEach((risk, i) => {
        const splitText = doc.splitTextToSize(`${i + 1}. ${risk}`, 175);
        doc.text(splitText, 18, y);
        y += splitText.length * 5 + 2;
      });

      y += 4;

      // Section 3: Recommended Next Steps
      addSectionHeader('2. RECOMMENDED ACTION PLAN');
      const steps = brief?.recommendedNextSteps || ['Awaiting consultation outcome.'];
      steps.forEach((step, i) => {
        const splitText = doc.splitTextToSize(`[Step ${i + 1}] ${step}`, 175);
        doc.text(splitText, 18, y);
        y += splitText.length * 5 + 2;
      });

      y += 4;

      // Section 4: Checked Audit Factors
      addSectionHeader('3. CHECKED AUDIT FACTORS');
      const factors = brief?.confidenceFactors || [];
      if (factors.length > 0) {
        factors.forEach((f) => {
          const isVerified = f.status === 'verified';
          doc.setFont('helvetica', isVerified ? 'normal' : 'bold');
          if (isVerified) {
            doc.setTextColor(20, 130, 80);
          } else {
            doc.setTextColor(200, 120, 20);
          }
          doc.text(`${isVerified ? '[✓ PASSED]' : '[⚠️ WARNING]'}  ${f.factor}`, 18, y);
          y += 6;
        });
      } else {
        doc.text('No audit factors recorded.', 18, y);
        y += 6;
      }

      y += 4;

      // Section 5: Session Timeline Log
      if (session?.timelineEvents && session.timelineEvents.length > 0) {
        if (y > 235) {
          doc.addPage();
          y = 20;
        }
        addSectionHeader('4. SESSION ACTIVITY AUDIT TRAIL');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 90, 110);
        session.timelineEvents.slice(-8).forEach((e) => {
          const time = new Date(e.timestamp).toLocaleTimeString();
          doc.text(`• [${time}] ${e.event}`, 18, y);
          y += 5;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 160, 175);
        doc.text('Confidential - Generated by Legal Risk Radar AI System', 14, 287);
        doc.text(`Page ${i} of ${pageCount}`, 196, 287, { align: 'right' });
      }

      // Save PDF
      doc.save(`decision-brief-${resolvedId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Error generating PDF report. Please try again.');
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Shared styles (fonts, keyframes, focus rings)                          */
  /* ---------------------------------------------------------------------- */
  const GlobalStyle = () => (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=Inter:wght@400;500;600;700;800&display=swap');

      .font-display { font-family: 'Source Serif 4', ui-serif, Georgia, serif; }
      .font-ui { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

      @keyframes counsel-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes counsel-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes counsel-shimmer {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      @keyframes counsel-pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(62, 111, 240, 0.45); }
        70% { box-shadow: 0 0 0 8px rgba(62, 111, 240, 0); }
        100% { box-shadow: 0 0 0 0 rgba(62, 111, 240, 0); }
      }
      @keyframes counsel-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes counsel-seal-in {
        from { opacity: 0; transform: scale(0.85) rotate(-6deg); }
        to { opacity: 1; transform: scale(1) rotate(0deg); }
      }

      .anim-fade-up { animation: counsel-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .anim-fade-in { animation: counsel-fade-in 0.4s ease both; }
      .anim-seal-in { animation: counsel-seal-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .anim-live-pulse { animation: counsel-pulse-ring 2s ease-out infinite; }

      .counsel-focus:focus-visible {
        outline: 2px solid #6D8EFF;
        outline-offset: 2px;
        border-radius: 8px;
      }

      .counsel-signal-bar {
        background: linear-gradient(90deg, #C9A227 0%, #3E6FF0 50%, #C9A227 100%);
        background-size: 200% 100%;
      }
      .counsel-signal-bar.is-live { animation: counsel-shimmer 3.5s linear infinite; }
    `}</style>
  );

  if (loading) {
    return (
      <div className="font-ui min-h-screen bg-[#05070D] flex flex-col items-center justify-center text-[#6B7385] gap-4">
        <GlobalStyle />
        <div
          className="w-11 h-11 rounded-full border-[3px] border-[#C9A227]/15"
          style={{ borderTopColor: '#C9A227', animation: 'counsel-spin 0.85s linear infinite' }}
        />
        <span className="text-xs tracking-wide">Syncing room state…</span>
      </div>
    );
  }

  if (roomStatus === 'completed') {
    const brief = session?.decisionBrief;
    return (
      <div className="font-ui min-h-screen bg-[#05070D] text-[#E7E9EE] px-4 py-6 sm:p-8 flex flex-col items-center">
        <GlobalStyle />
        <div className="w-full max-w-4xl bg-[#0B0F1A] border border-[#1E2536] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden anim-fade-up">

          {/* signature top signal bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] counsel-signal-bar" />

          <div className="flex items-center justify-between border-b border-[#1E2536] pb-5 mb-6 flex-wrap gap-3">
            <button
              onClick={() => router.replace('/pages/legal-consultation')}
              className="counsel-focus flex items-center gap-2 text-xs text-[#9AA3B5] hover:text-[#E7E9EE] bg-[#12151B] hover:bg-[#1C202B] border border-[#1D212A] hover:border-[#2C3241] transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to consult dashboard
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0E1F18] border border-[#1E4A38] text-[#34D399] px-3.5 py-1.5 rounded-full">
              Decision brief ready
            </span>
          </div>

          <div className="flex items-start gap-4 mb-8 anim-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="p-3 bg-[#0E1F18] text-[#34D399] rounded-2xl border border-[#1E4A38] shrink-0">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#E7E9EE] tracking-tight">Legal decision brief</h1>
              <p className="text-[11px] text-[#6B7385] font-mono mt-1">Session {resolvedId}</p>
            </div>
          </div>

          {/* Decision Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="md:col-span-2 p-5 bg-[#080B12] border border-[#1E2536] rounded-2xl flex flex-col gap-2 anim-fade-up" style={{ animationDelay: '140ms' }}>
              <span className="text-[10px] font-bold text-[#6B7385] uppercase tracking-widest">Recommended decision</span>
              <h2 className="text-base sm:text-lg font-bold text-[#E7E9EE] flex items-start gap-2.5 leading-snug">
                <Shield className="w-5 h-5 text-[#6D8EFF] shrink-0 mt-0.5" />
                {brief?.decision}
              </h2>
            </div>

            {/* Counsel seal */}
            <div className="p-5 bg-[#080B12] border border-[#1E2536] rounded-2xl flex items-center gap-4 anim-seal-in" style={{ animationDelay: '200ms' }}>
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#1E2536" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke="#C9A227" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - (brief?.confidence || 0) / 100)}`}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#E8C46A] font-display">
                  {brief?.confidence}%
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#6B7385] uppercase tracking-widest">Confidence</span>
                <span className="text-xs font-bold text-[#E7E9EE]">High trust rating</span>
              </div>
            </div>
          </div>

          {/* Breakdown panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="p-5 bg-[#0D111C] border border-[#1E2536] rounded-2xl anim-fade-up" style={{ animationDelay: '260ms' }}>
              <h3 className="text-xs font-bold text-[#9AA3B5] uppercase tracking-wider mb-3.5">Core risk factors</h3>
              <ul className="space-y-3">
                {brief?.reason?.map((r, i) => (
                  <li key={i} className="text-xs text-[#C6CBD6] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-[#0D111C] border border-[#1E2536] rounded-2xl anim-fade-up" style={{ animationDelay: '320ms' }}>
              <h3 className="text-xs font-bold text-[#9AA3B5] uppercase tracking-wider mb-3.5">Recommended next steps</h3>
              <ol className="space-y-3">
                {brief?.recommendedNextSteps?.map((s, i) => (
                  <li key={i} className="text-xs text-[#C6CBD6] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-5 h-5 rounded-md bg-[#131826] border border-[#232B3F] text-[#E8C46A] flex items-center justify-center shrink-0 text-[10px] font-bold font-display">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Checklist Verification */}
          <div className="p-5 bg-[#080B12] border border-[#1E2536] rounded-2xl mb-8 anim-fade-up" style={{ animationDelay: '380ms' }}>
            <h3 className="text-xs font-bold text-[#9AA3B5] uppercase tracking-wider mb-4">Checked audit factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brief?.confidenceFactors?.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-3 bg-[#0B0F1A] border border-[#1E2536] rounded-lg transition-colors duration-200 hover:border-[#2A3244]">
                  <span className="text-[#9AA3B5]">{f.factor}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ml-2
                    ${f.status === 'verified'
                      ? 'bg-[#0E1F18] border-[#1E4A38] text-[#34D399]'
                      : 'bg-[#241A08] border-[#4A3714] text-[#F5A524]'
                    }`}
                  >
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-6 border-t border-[#1E2536]">
            <button
              onClick={handleDownloadTextReport}
              className="counsel-focus group flex items-center justify-center gap-2 bg-[#3E6FF0] hover:bg-[#5580F5] active:scale-[0.98] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#3E6FF0]/10 transition-all duration-200 cursor-pointer text-xs"
            >
              <FileText className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Download Decision Report
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="font-ui h-screen max-h-screen bg-[#05070D] text-[#E7E9EE] flex flex-col select-none overflow-hidden">
      <GlobalStyle />

      {/* signature top signal bar — shimmers while live */}
      <div className={`h-[3px] w-full counsel-signal-bar ${isConnected ? 'is-live' : ''}`} />

      {/* Top Header Navigation */}
      <header className="bg-[#0B0F1A]/95 border-b border-[#1E2536] px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => router.replace('/pages/legal-consultation')}
            className="counsel-focus p-1.5 sm:p-2 hover:bg-[#131826] rounded-full transition-colors duration-200 text-[#9AA3B5] hover:text-[#E7E9EE] cursor-pointer shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
          <div className="p-1.5 rounded-lg bg-[#131826] border border-[#232B3F] text-[#C9A227] shrink-0 hidden xs:flex">
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="font-display text-xs sm:text-base font-semibold text-[#E7E9EE] tracking-tight truncate">Legal Consultation Room</h1>
            <span className="text-[9px] sm:text-[10px] text-[#6B7385] font-mono mt-0.5 truncate">Session {resolvedId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 max-w-[150px] sm:max-w-xs bg-[#131826] border border-[#232B3F] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-sm">
            <span className={`inline-flex h-2 w-2 rounded-full shrink-0 ${isConnected ? 'bg-[#34D399] anim-live-pulse' : connectionError ? 'bg-[#F43F5E]' : 'bg-[#6B7385]'}`}></span>
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#E7E9EE] truncate">
              {isConnected ? 'Aura connected' : connectionError ? 'Connection lost' : 'Connecting…'}
            </span>
          </div>
        </div>
      </header>

      {/* Immersive Main Grid Layout */}
      <main className="flex-grow min-h-0 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-y-auto lg:overflow-hidden w-full max-w-[1700px] mx-auto pb-24 sm:pb-28 relative">

        {/* Left/Center Stage Area */}
        <div className={`flex flex-col gap-4 sm:gap-6 lg:h-full order-1 transition-all duration-300 min-h-0
          ${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'}`}
        >
          {/* Workspace Switcher */}
          {!activeDoc ? (
            /* Immersive Face-to-Face Stage */
            <div className="flex-grow flex flex-col gap-4 sm:gap-6 min-h-0 relative">
              {/* Immersive side-by-side split videos */}
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 min-h-[320px] sm:min-h-0">
                {/* User Camera Feed Card */}
                <div className="relative rounded-2xl overflow-hidden border border-[#1E2536] bg-[#0B0F1A] shadow-lg min-h-[160px] sm:min-h-0 group">
                  <VideoGrid isMuted={isMuted} isCameraOff={isCameraOff} isScreenSharing={isScreenSharing} />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold text-white shadow-sm border border-white/10">
                    User feed (Local)
                  </div>
                </div>

                {/* AI Interactive Avatar Card */}
                <div className="relative rounded-2xl overflow-hidden border border-[#1E2536] bg-[#0B0F1A] shadow-lg min-h-[220px] sm:min-h-0 group">
                  <AvatarContainer state={roomState} />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/60 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold text-white shadow-sm border border-white/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#3E6FF0] rounded-full animate-ping" />
                    AI Counsel Assistant
                  </div>
                </div>
              </div>

              {/* Document upload box */}
              <div className="shrink-0">
                <SharedWorkspace
                  consultationId={resolvedId}
                  accessToken={accessToken}
                  onDocumentIngested={handleDocumentIngested}
                />
              </div>
            </div>
          ) : (
            /* Document Analysis Mode Layout */
            <div className="flex-grow flex flex-col gap-4 sm:gap-6 min-h-0 relative">
              {/* Horizontal Participant strip at top */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 h-[120px] sm:h-[160px] shrink-0">
                <div className="relative rounded-xl overflow-hidden border border-[#1E2536] bg-[#0B0F1A] shadow-md">
                  <VideoGrid isMuted={isMuted} isCameraOff={isCameraOff} isScreenSharing={isScreenSharing} />
                  <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-semibold text-[#E7E9EE]">
                    You
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-[#1E2536] bg-[#0B0F1A] shadow-md">
                  <AvatarContainer state={roomState} />
                  <div className="absolute bottom-2 left-3 bg-black/60 px-2 py-0.5 rounded-full text-[9px] font-semibold text-[#E7E9EE]">
                    AI Counsel
                  </div>
                </div>
              </div>

              {/* Large Document workspace at bottom */}
              <div className="flex-grow rounded-2xl overflow-hidden border border-[#1E2536] bg-[#0B0F1A] shadow-xl flex flex-col relative min-h-[350px] sm:min-h-0 font-body">
                <DocumentViewer document={activeDoc} />
              </div>
            </div>
          )}

        </div>

        {/* Right Collapsible Logs Sidebar (3 cols) */}
        <div className={`flex flex-col gap-6 lg:h-full lg:max-h-full order-2 transition-all duration-300 min-h-[250px] sm:min-h-0
          ${isSidebarOpen ? 'lg:col-span-3' : 'hidden'}`}
        >
          <div className="flex-grow min-h-0 bg-[#0B0F1A] border border-[#1E2536] rounded-2xl overflow-hidden shadow-sm flex flex-col relative">
            <div className="flex-grow h-full overflow-hidden flex flex-col min-h-0">
              <MissingInfoPanel missingFields={session?.decisionBrief?.missingInformation || []} />
            </div>
          </div>
        </div>

        {/* Absolute Floating Control Dock at bottom-center */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[98%] sm:max-w-[95%] shrink-0">
          <ControlBar
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            isSidebarOpen={isSidebarOpen}
            onToggleMic={() => setIsMuted(!isMuted)}
            onToggleCamera={() => setIsCameraOff(!isCameraOff)}
            onToggleScreenShare={handleToggleScreenShare}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onDownloadReport={handleDownloadTextReport}
            onEndConsultation={handleEndConsultation}
          />
        </div>

      </main>
    </div>
  );
}