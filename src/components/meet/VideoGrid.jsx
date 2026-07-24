import React, { useEffect, useRef, useState } from 'react';

/**
 * VideoGrid: Renders local user webcam feed or screen sharing feed and mic activity.
 * @param {boolean} isMuted - Microphone mute state
 * @param {boolean} isCameraOff - Camera toggle state
 * @param {boolean} isScreenSharing - Screen sharing toggle state
 */
export default function VideoGrid({ isMuted = false, isCameraOff = false, isScreenSharing = false }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activeStream = null;

    async function startStream() {
      // 1. Prioritize screen share if toggle is active
      if (isScreenSharing) {
        try {
          const mediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
          });
          activeStream = mediaStream;
          setStream(mediaStream);
          setError(null);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }

          // Handle if user stops screen sharing via browser native bar
          mediaStream.getVideoTracks()[0].onended = () => {
            setStream(null);
          };
        } catch (err) {
          console.error('Error accessing screen share:', err);
          setError('Screen share cancelled');
        }
        return;
      }

      // 2. Standard Webcam Feed
      if (isCameraOff) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
          audio: false // Audio is handled separately by useGeminiLive hook
        });
        
        activeStream = mediaStream;
        setStream(mediaStream);
        setError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Camera blocked or unavailable');
      }
    }

    startStream();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOff, isScreenSharing]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-lg">
      
      {/* Video Canvas Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center bg-slate-950 relative">
        {(isCameraOff && !isScreenSharing) || error ? (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
              {error ? error : 'Camera is muted'}
            </span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isScreenSharing ? '' : 'scale-x-[-1]'}`} // Avoid mirroring screen contents
          />
        )}

        {/* User Identity Overlay tag */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {isScreenSharing ? 'You (Sharing Screen)' : 'You (Client)'}
        </div>

        {/* Muted indicator overlay on top right */}
        {isMuted && (
          <div className="absolute top-4 right-4 z-10 bg-rose-950/70 border border-rose-800/80 p-2 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
