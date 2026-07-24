'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Clock, FileText, ArrowRight, Shield, Radio,
  HelpCircle, ShieldCheck, ArrowLeft, Video,
  Search, Calendar, Trash2, X
} from 'lucide-react';
import { authenticatedFetch } from '@/utils/auth.utils';

export default function LegalConsultationDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Search, Filter & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Custom Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Custom Confirmation Dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: null,
    isDanger: true
  });

  // Custom Alert state (shown post delete success)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await authenticatedFetch('/api/consultation');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching consultations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const handleStartConsultation = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await authenticatedFetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to create consultation session');
      }

      const data = await res.json();
      const newSession = data.data;

      // Redirect to the live room
      router.push(`/pages/legal-consultation/${newSession.consultationId}`);
    } catch (err) {
      console.error('Error starting room:', err);
      setAlertModal({
        isOpen: true,
        title: "Couldn't start a session",
        message: 'Check your connection and try again.'
      });
      setCreating(false);
    }
  };

  const showConfirm = (title, message, confirmText, onConfirm, isDanger = true) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      onConfirm,
      isDanger
    });
  };

  const handleDeleteSession = (consultationId, e) => {
    e.stopPropagation();
    showConfirm(
      'Delete this session?',
      `This removes ${consultationId} and its recorded exchanges from your history. This can't be undone.`,
      'Delete session',
      async () => {
        setDeleting(true);
        try {
          const res = await authenticatedFetch(`/api/consultation/${consultationId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            setSessions(prev => prev.filter(s => s.consultationId !== consultationId));
            setCurrentPage(prev => {
              const newFilteredCount = sessions.filter(s => s.consultationId !== consultationId).length;
              const maxPages = Math.ceil(newFilteredCount / pageSize) || 1;
              return prev > maxPages ? maxPages : prev;
            });
            // Close confirm modal and trigger custom success alert dialog
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            setAlertModal({
              isOpen: true,
              title: 'Session deleted',
              message: 'That consultation has been removed from your history.'
            });
          } else {
            throw new Error('Failed to delete consultation');
          }
        } catch (err) {
          console.error('Delete failed:', err);
          setAlertModal({
            isOpen: true,
            title: "Couldn't delete that session",
            message: 'Please try again.'
          });
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  const handleDeleteAllSessions = () => {
    showConfirm(
      'Clear all sessions?',
      "Every past consultation and its brief will be removed from your history. This can't be undone.",
      'Clear all',
      async () => {
        setDeleting(true);
        try {
          const res = await authenticatedFetch('/api/consultation', {
            method: 'DELETE'
          });
          if (res.ok) {
            setSessions([]);
            setCurrentPage(1);
            // Close confirm modal and trigger custom success alert dialog
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            setAlertModal({
              isOpen: true,
              title: 'History cleared',
              message: 'All past consultation sessions have been removed.'
            });
          } else {
            throw new Error('Failed to clear history');
          }
        } catch (err) {
          console.error('Clear failed:', err);
          setAlertModal({
            isOpen: true,
            title: "Couldn't clear your history",
            message: 'Please try again.'
          });
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  // Helper to generate days of custom calendar grid
  const getDaysInMonth = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDayIndex = new Date(y, m, 1).getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();

    const days = [];
    // Add empty slots for offset padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Add actual days
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(y, m, d));
    }
    return days;
  };

  const isFutureDate = (dayDate) => {
    if (!dayDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(dayDate);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate.getTime() > today.getTime();
  };

  // Filter sessions based on search terms and date picker
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.consultationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.decisionBrief?.decision && session.decisionBrief.decision.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDate = true;
    if (dateFilter) {
      const createdAtDate = session.createdAt ? session.createdAt.substring(0, 10) : '';
      matchesDate = createdAtDate === dateFilter;
    }

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredSessions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  // --- Presentation-only helpers (no data/shape changes) ---
  const formatSessionTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${date} · ${time}`;
  };

  const ConfidenceRing = ({ value }) => {
    const size = 34;
    const stroke = 3;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value ?? 0));
    const offset = c - (pct / 100) * c;
    const color = pct >= 80 ? '#45D6C4' : '#E0A63A';
    return (
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262B35" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}>
          {pct}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E7E8EC] p-6 md:p-10 flex flex-col items-center relative page-enter-anim">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Newsreader', serif; }
        .font-body { font-family: 'IBM Plex Sans', sans-serif; }
        .font-data { font-family: 'IBM Plex Mono', monospace; }
      `}</style>
      <style jsx>{`
        @keyframes pageSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-enter-anim {
          animation: pageSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes softPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .live-dot { animation: softPulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-[95%] font-body">

        {/* Back Navigation */}
        <div className="mb-8 w-full text-left">
          <button
            onClick={() => router.push('/pages/private-chat')}
            className="flex items-center gap-2 text-xs bg-[#12151B] hover:bg-[#1C202B] border border-[#1D212A] hover:border-[#2C3241] px-4 py-2.5 rounded-full text-[#E7E8EC] hover:text-[#FFFFFF] transition-all font-semibold cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#C9A24B]" />
            Back to Dashboard
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9A24B] font-data">
              Counsel Sessions
            </span>
            <h1 className="font-display text-4xl mt-2 text-[#F2F2F4]">
              Consultation rooms
            </h1>
            <p className="text-[#8D93A0] text-sm mt-2 leading-relaxed max-w-md">
              Start a live session with your AI counsel, or return to a room already in progress.
            </p>
          </div>

          <button
            onClick={handleStartConsultation}
            disabled={creating}
            className="flex items-center justify-center gap-2 bg-[#C9A24B] hover:bg-[#D9B562] text-[#0B0D12] font-bold py-3 px-6 rounded-full shadow-[0_0_0_1px_rgba(201,162,75,0.35)] hover:shadow-[0_0_24px_rgba(201,162,75,0.25)] transition-all duration-300 disabled:opacity-60 cursor-pointer text-sm shrink-0"
          >
            {creating ? (
              <span className="w-4 h-4 border-2 border-[#0B0D12]/30 border-t-[#0B0D12] rounded-full animate-spin shrink-0" />
            ) : (
              <Video className="w-4 h-4" />
            )}
            {creating ? 'Opening room…' : 'Start a session'}
          </button>
        </div>

        {/* Feature ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1D212A] rounded-2xl overflow-hidden mb-10 border border-[#1D212A]">
          <div className="bg-[#0F1218] p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[#45D6C4]/10 text-[#45D6C4] shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-[#DADCE1]">Live voice &amp; video</h3>
              <p className="text-xs text-[#767C89] mt-1 leading-relaxed">
                Speak naturally with your AI counsel — low-latency audio keeps the conversation flowing.
              </p>
            </div>
          </div>
          <div className="bg-[#0F1218] p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[#C9A24B]/10 text-[#C9A24B] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-[#DADCE1]">Guided review</h3>
              <p className="text-xs text-[#767C89] mt-1 leading-relaxed">
                A structured agent walks through gaps, extracts terms, and audits your documents.
              </p>
            </div>
          </div>
          <div className="bg-[#0F1218] p-5 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-[#DADCE1]">Decision briefs</h3>
              <p className="text-xs text-[#767C89] mt-1 leading-relaxed">
                Every session ends with a recommendation, a confidence rating, and an exportable summary.
              </p>
            </div>
          </div>
        </div>

        {/* Consultation History Section */}
        <div className="bg-[#12151B] border border-[#1D212A] rounded-2xl shadow-xl relative">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-wrap gap-4">
            <h2 className="text-sm font-semibold text-[#DADCE1] flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#C9A24B]" />
              History
            </h2>

            {/* Batch delete button */}
            {sessions.length > 0 && (
              <button
                onClick={handleDeleteAllSessions}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-[#E5484D]/10 border border-[#E5484D]/30 hover:border-[#E5484D]/50 text-[#E5484D] font-semibold rounded-lg text-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* Search & Custom Date Filters */}
          {sessions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center px-6 mb-2 z-30 relative">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#5C616D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by session or decision…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-[#0B0D12] border border-[#1D212A] rounded-xl focus:outline-none focus:border-[#C9A24B]/50 text-[#DADCE1] placeholder:text-[#5C616D] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C616D] hover:text-[#DADCE1]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Custom Calendar Dropdown */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full sm:w-48 pl-9 pr-9 py-2 text-xs text-left bg-[#0B0D12] border border-[#1D212A] rounded-xl focus:outline-none focus:border-[#C9A24B]/50 text-[#DADCE1] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{dateFilter ? dateFilter : 'Filter by date'}</span>
                  <Calendar className="w-3.5 h-3.5 text-[#5C616D] shrink-0" />
                </button>
                {dateFilter && (
                  <button
                    onClick={() => {
                      setDateFilter('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-[#5C616D] hover:text-[#DADCE1]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {showCalendar && (
                  <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 bg-[#12151B] border border-[#1D212A] rounded-2xl p-4 shadow-2xl z-40 w-64">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                        className="p-1 hover:bg-[#1D212A] rounded text-[#8D93A0] hover:text-[#DADCE1] cursor-pointer text-xs"
                      >
                        &lt;
                      </button>
                      <span className="text-xs font-semibold text-[#DADCE1] font-data">
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                        className="p-1 hover:bg-[#1D212A] rounded text-[#8D93A0] hover:text-[#DADCE1] cursor-pointer text-xs"
                      >
                        &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#5C616D] mb-1.5">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(calendarDate).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} />;
                        const isFuture = isFutureDate(day);
                        const formatted = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                        const isSelected = dateFilter === formatted;

                        return (
                          <button
                            key={idx}
                            disabled={isFuture}
                            onClick={() => {
                              setDateFilter(formatted);
                              setCurrentPage(1);
                              setShowCalendar(false);
                            }}
                            className={`h-7 w-7 text-[10px] rounded-lg flex items-center justify-center font-semibold transition-all cursor-pointer
                              ${isFuture
                                ? 'text-[#3A3F4A] cursor-not-allowed opacity-40 bg-transparent'
                                : isSelected
                                  ? 'bg-[#C9A24B] text-[#0B0D12] font-bold'
                                  : 'text-[#B7BBC4] hover:bg-[#1D212A] hover:text-white'
                              }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between border-t border-[#1D212A] pt-3 mt-3">
                      <button
                        onClick={() => {
                          setDateFilter('');
                          setShowCalendar(false);
                        }}
                        className="text-[10px] font-semibold text-[#E5484D] hover:text-[#F16468] cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="text-[10px] font-semibold text-[#8D93A0] hover:text-[#DADCE1] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-3 pb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-7 h-7 border-2 border-[#C9A24B]/20 border-t-[#C9A24B] rounded-full animate-spin" />
                <span className="text-xs text-[#5C616D]">Loading your sessions…</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#1D212A] rounded-xl m-3">
                <HelpCircle className="w-9 h-9 text-[#2A2E38] mb-3" />
                <h3 className="text-sm font-semibold text-[#8D93A0]">No sessions yet</h3>
                <p className="text-xs text-[#5C616D] mt-1 max-w-sm">
                  Open a room to review contracts, walk through compliance gaps, and leave with a clear brief.
                </p>
                <button
                  onClick={handleStartConsultation}
                  className="mt-5 text-xs text-[#C9A24B] font-semibold hover:text-[#D9B562] flex items-center gap-1 cursor-pointer"
                >
                  Start your first session <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#1D212A] rounded-xl m-3">
                <Search className="w-7 h-7 text-[#3A3F4A] mb-2" />
                <h3 className="text-xs font-semibold text-[#8D93A0]">Nothing matches that search</h3>
                <p className="text-[10px] text-[#5C616D] mt-1">
                  Try a different term or clear your filters.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col divide-y divide-[#1A1D24]">
                  {paginatedSessions.map((session) => {
                    const isCompleted = session.status === 'completed' || !!session.decisionBrief?.decision;
                    const isLive = !isCompleted;
                    const turns = session.transcript?.length || 0;

                    return (
                      <div
                        key={session.consultationId}
                        onClick={() => router.push(`/pages/legal-consultation/${session.consultationId}`)}
                        className="group flex items-center gap-4 px-3 py-4 rounded-xl hover:bg-[#161A21] transition-colors cursor-pointer"
                      >
                        {/* status orb */}
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border
                            ${isLive
                              ? 'border-[#45D6C4]/30 bg-[#45D6C4]/10 text-[#45D6C4]'
                              : 'border-[#C9A24B]/30 bg-[#C9A24B]/10 text-[#C9A24B]'
                            }`}
                          >
                            {isLive ? <Radio className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </div>
                          {isLive && (
                            <span className="live-dot absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#45D6C4] ring-2 ring-[#12151B]" />
                          )}
                        </div>

                        {/* main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-data text-[12px] text-[#DADCE1] truncate">
                              {session.consultationId}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded
                              ${isLive
                                ? 'bg-[#45D6C4]/10 text-[#45D6C4]'
                                : 'bg-[#C9A24B]/10 text-[#C9A24B]'
                              }`}
                            >
                              {isLive ? 'Live' : 'Brief ready'}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#767C89] mt-1 flex items-center gap-2 font-data">
                            <span>{formatSessionTime(session.createdAt)}</span>
                            <span className="text-[#2A2E38]">•</span>
                            <span>{turns} exchange{turns === 1 ? '' : 's'}</span>
                          </div>
                          {session.decisionBrief?.decision && (
                            <p className="text-xs text-[#9CA1AC] mt-1.5 truncate">
                              <span className="text-[#DADCE1] font-medium">{session.decisionBrief.decision}</span>
                              {session.decisionBrief.reason?.[0] && (
                                <span className="text-[#6A707C]"> — {session.decisionBrief.reason[0]}</span>
                              )}
                            </p>
                          )}
                        </div>

                        {/* confidence ring */}
                        {session.decisionBrief?.confidence != null && (
                          <ConfidenceRing value={session.decisionBrief.confidence} />
                        )}

                        {/* rejoin / view */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/pages/legal-consultation/${session.consultationId}`);
                          }}
                          className="hidden sm:flex items-center gap-1 text-xs text-[#C9A24B] hover:text-[#D9B562] font-semibold cursor-pointer shrink-0"
                        >
                          {isCompleted ? 'View brief' : 'Rejoin'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {/* delete */}
                        <button
                          onClick={(e) => handleDeleteSession(session.consultationId, e)}
                          className="opacity-0 group-hover:opacity-100 text-[#5C616D] hover:text-[#E5484D] p-1.5 rounded-lg transition-all duration-200 cursor-pointer shrink-0"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#1D212A] pt-5 mt-2 px-3 flex-wrap gap-4">
                    <span className="text-xs text-[#5C616D] font-data">
                      {startIndex + 1}–{Math.min(endIndex, filteredSessions.length)} of {filteredSessions.length}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-transparent border border-[#1D212A] rounded-lg text-xs font-medium text-[#B7BBC4] hover:border-[#2A2E38] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all cursor-pointer
                            ${currentPage === page
                              ? 'bg-[#C9A24B] border-[#C9A24B] text-[#0B0D12]'
                              : 'bg-transparent border-[#1D212A] hover:border-[#2A2E38] text-[#8D93A0]'
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-transparent border border-[#1D212A] rounded-lg text-xs font-medium text-[#B7BBC4] hover:border-[#2A2E38] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D12]/80 backdrop-blur-sm p-4">
          <div className="bg-[#14171E] border border-[#1D212A] rounded-2xl p-6 max-w-sm w-full shadow-2xl font-body">
            <h3 className="font-display text-lg text-[#F2F2F4] mb-2">{confirmDialog.title}</h3>
            <p className="text-xs text-[#8D93A0] mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-transparent hover:bg-[#1D212A] border border-[#2A2E38] text-[#B7BBC4] font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                disabled={deleting}
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                }}
                className={`px-4 py-2 font-semibold rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-75
                  ${confirmDialog.isDanger
                    ? 'bg-[#E5484D] hover:bg-[#F16468] text-white'
                    : 'bg-[#C9A24B] hover:bg-[#D9B562] text-[#0B0D12]'
                  }`}
              >
                {deleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0 mr-1.5" />
                ) : null}
                {deleting ? 'Working…' : confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / status alert modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D12]/80 backdrop-blur-sm p-4">
          <div className="bg-[#14171E] border border-[#1D212A] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center font-body">
            <div className="w-11 h-11 rounded-full bg-[#45D6C4]/10 border border-[#45D6C4]/30 text-[#45D6C4] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg text-[#F2F2F4] mb-2">{alertModal.title}</h3>
            <p className="text-xs text-[#8D93A0] mb-6 leading-relaxed">{alertModal.message}</p>
            <button
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-2 bg-[#C9A24B] hover:bg-[#D9B562] text-[#0B0D12] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}