'use client';

import React from 'react';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  PhoneOff, Sidebar
} from 'lucide-react';

/**
 * ControlBar: Floating room actions dock (similar to Google Meet / Zoom).
 * Fully mobile-responsive dock layout.
 */
export default function ControlBar({
  isMuted = false,
  isCameraOff = false,
  isScreenSharing = false,
  isSidebarOpen = true,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleSidebar,
  onEndConsultation
}) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 py-2 sm:py-3 bg-[#0B0F1A]/90 backdrop-blur-xl border border-[#1E2536] rounded-full shadow-2xl z-30 select-none max-w-full overflow-x-auto">
      
      {/* Left Dock: Media Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mic Toggle */}
        <button
          onClick={onToggleMic}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer
            ${isMuted 
              ? 'bg-rose-600/90 border-rose-500 text-white hover:bg-rose-600' 
              : 'bg-[#131826] border-[#2A3244] text-[#E7E9EE] hover:bg-[#1C2335] hover:text-white'
            }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer
            ${isCameraOff 
              ? 'bg-rose-600/90 border-rose-500 text-white hover:bg-rose-600' 
              : 'bg-[#131826] border-[#2A3244] text-[#E7E9EE] hover:bg-[#1C2335] hover:text-white'
            }`}
          title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer
            ${isScreenSharing 
              ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500' 
              : 'bg-[#131826] border-[#2A3244] text-[#E7E9EE] hover:bg-[#1C2335] hover:text-white'
            }`}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share contract screen'}
        >
          <ScreenShare className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Dock: Sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-3 border-l border-[#1E2536] pl-2 sm:pl-6 border-r pr-2 sm:pr-6 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 cursor-pointer
            ${isSidebarOpen 
              ? 'bg-blue-900/40 border-blue-500 text-[#6D8EFF]' 
              : 'bg-[#131826] border-[#2A3244] text-[#E7E9EE] hover:bg-[#1C2335]'
            }`}
          title={isSidebarOpen ? 'Hide meeting notes panel' : 'Show meeting notes panel'}
        >
          <Sidebar className="w-4 h-4" />
        </button>
      </div>

      {/* Right Dock: Leave room consultation */}
      <div className="shrink-0">
        <button
          onClick={onEndConsultation}
          className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg shadow-rose-600/10 transition-all active:scale-95 cursor-pointer"
          title="End session & build summary brief"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">End session</span>
          <span className="sm:hidden">End</span>
        </button>
      </div>

    </div>
  );
}
