'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * AvatarContainer: Implements the reactive State Machine Avatar.
 * Transitions smoothly between Idle, Listening, Thinking, and Speaking.
 * Powered by Framer Motion and custom AI asset imagery.
 * @param {string} state - idle | listening | thinking | speaking
 */
export default function AvatarContainer({ state }) {
  // Glow color variants depending on the active state
  const getGlowColor = () => {
    switch (state) {
      case 'listening':
        return 'rgba(59, 130, 246, 0.4)'; // Sleek Blue
      case 'thinking':
        return 'rgba(167, 139, 250, 0.5)'; // Soft Purple
      case 'speaking':
        return 'rgba(16, 185, 129, 0.4)'; // Legal Green
      case 'idle':
      default:
        return 'rgba(156, 163, 175, 0.2)'; // Calming Slate Grey
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Background radial soft light gradient */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${getGlowColor()} 0%, rgba(15, 23, 42, 0) 70%)`
        }}
      />

      {/* Main Avatar Canvas Area */}
      <div className="relative w-64 h-64 flex items-center justify-center z-10">

        {/* State: IDLE - Slow breathing outer aura */}
        {state === 'idle' && (
          <motion.div
            className="absolute w-52 h-52 rounded-full border border-slate-700/30 bg-slate-800/10"
            animate={{ scale: [0.97, 1.03, 0.97] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        )}

        {/* State: LISTENING - Concentric rippling rings */}
        {state === 'listening' && (
          <>
            <motion.div
              className="absolute w-56 h-56 rounded-full border border-blue-500/20 bg-blue-500/5"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-64 h-64 rounded-full border border-blue-400/10"
              animate={{ scale: [0.95, 1.25, 0.95], opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
            />
          </>
        )}

        {/* State: THINKING - Rotating rings */}
        {state === 'thinking' && (
          <>
            <motion.div
              className="absolute w-48 h-48 rounded-full border-t-2 border-r-2 border-purple-500 border-l border-b border-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            <motion.div
              className="absolute w-52 h-52 rounded-full border-b-2 border-l-2 border-purple-400 border-t border-r border-transparent"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </>
        )}

        {/* State: SPEAKING - Expandable voice waves */}
        {state === 'speaking' && (
          <div className="absolute flex items-center justify-between w-40 h-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2.5 bg-emerald-500 rounded-full"
                animate={{
                  height: [20, i === 2 ? 80 : i % 2 === 0 ? 50 : 35, 20]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i * 0.1),
                  ease: "easeInOut",
                  repeatType: "reverse"
                }}
              />
            ))}
          </div>
        )}

        {/* Core Center Node: Rendered AI Avatar Image */}
        <motion.div
          className={`w-36 h-36 rounded-full overflow-hidden flex items-center justify-center shadow-xl border relative z-20 transition-all duration-500 bg-slate-950
            ${state === 'listening' ? 'border-blue-500/85 shadow-blue-500/20 scale-105' : ''}
            ${state === 'thinking' ? 'border-purple-500/85 shadow-purple-500/20' : ''}
            ${state === 'speaking' ? 'border-emerald-500/85 shadow-emerald-500/30' : ''}
            ${state === 'idle' ? 'border-slate-700/85 shadow-slate-500/10' : ''}
          `}
          layoutId="avatarCore"
        >
          <motion.img
            src="/aura_avatar.png"
            alt="Aura AI"
            className="w-full h-full object-cover select-none pointer-events-none"
            animate={state === 'speaking' ? {
              scale: [1, 1.06, 1],
            } : state === 'listening' ? {
              scale: [1, 1.02, 1],
            } : {}}
            transition={state === 'speaking' ? {
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut"
            } : state === 'listening' ? {
              repeat: Infinity,
              duration: 2.0,
              ease: "easeInOut"
            } : {}}
          />

          {/* Thinking Spinner Overlay */}
          {state === 'thinking' && (
            <div className="absolute inset-0 bg-purple-950/45 backdrop-blur-xs flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-purple-300/30 border-t-purple-500 animate-spin" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Subtitle status tag */}
      <div className="mt-8 text-center select-none">
        <h3 className={`text-lg font-bold tracking-wide transition-colors duration-500
          ${state === 'listening' ? 'text-blue-400' : ''}
          ${state === 'thinking' ? 'text-purple-400' : ''}
          ${state === 'speaking' ? 'text-emerald-400' : ''}
          ${state === 'idle' ? 'text-slate-300' : ''}
        `}>
          {state === 'idle' && 'Aura (Idle)'}
          {state === 'listening' && 'Listening...'}
          {state === 'thinking' && 'Analyzing case...'}
          {state === 'speaking' && 'Speaking...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          {state === 'idle' && 'Ready. Ask a question or share a contract.'}
          {state === 'listening' && 'Recording PCM feed at 16kHz.'}
          {state === 'thinking' && 'Processing data tokens.'}
          {state === 'speaking' && 'Streaming response at 24kHz.'}
        </p>
      </div>
    </div>
  );
}
