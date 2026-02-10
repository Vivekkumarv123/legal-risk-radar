'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Search, AlertCircle, Sparkles, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function NotFound() {
    const router = useRouter();
    const [isHovering, setIsHovering] = useState(null);

    return (
        <div className="min-h-screen bg-[#0A0F1E] relative overflow-hidden flex items-center justify-center px-4 py-12 selection:bg-blue-500/30">
            {/* --- Background Effects --- */}
            
            {/* Sophisticated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            
            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/30 rounded-full mix-blend-screen filter blur-[128px] animate-float" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full mix-blend-screen filter blur-[128px] animate-float-delayed" />
            </div>

            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />


            {/* --- Main Content --- */}
            <div className="relative z-10 w-full max-w-5xl mx-auto">
                <div className="text-center space-y-8">
                    
                    {/* Floating Hero Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow group-hover:bg-blue-400/30 transition-all duration-700" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                <AlertCircle className="w-12 h-12 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" strokeWidth={1.5} />
                                <Sparkles className="w-5 h-5 text-cyan-300 absolute -top-2 -right-2 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Typography Section */}
                    <div className="relative space-y-2">
                        <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-blue-900/50 drop-shadow-sm">
                            404
                        </h1>
                        
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Digital Void</span>
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-light max-w-lg mx-auto">
                                The page you're looking for has wandered beyond our jurisdiction. 
                                Let's get you back to familiar territory.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - Optimized Hierarchy */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        
                        {/* 1. Primary CTA: Return Home (Solid Gradient) */}
                        <button
                            onClick={() => router.push('/')}
                            onMouseEnter={() => setIsHovering('home')}
                            onMouseLeave={() => setIsHovering(null)}
                            className="group relative w-full sm:w-auto min-w-[160px] overflow-hidden rounded-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 group-hover:opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <div className="relative flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold shadow-lg shadow-blue-500/25">
                                <Home className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                                <span>Return Home</span>
                            </div>
                        </button>

                        {/* 2. Secondary CTA: Support/Chat (Glass) */}
                        <button
                            onClick={() => router.push('/pages/chat')}
                            className="group w-full sm:w-auto min-w-[160px] relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="relative flex items-center justify-center gap-2 px-8 py-3.5 text-white font-medium">
                                <MessageSquare className="w-4 h-4 text-blue-300 transition-transform duration-300 group-hover:scale-110" />
                                <span>Start Chat</span>
                            </div>
                        </button>

                        {/* 3. Tertiary CTA: Back (Ghost) */}
                        <button
                            onClick={() => router.back()}
                            className="group w-full sm:w-auto min-w-[160px] relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-white/5"
                        >
                            <div className="relative flex items-center justify-center gap-2 px-8 py-3.5 text-slate-400 group-hover:text-white font-medium">
                                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                                <span>Go Back</span>
                            </div>
                        </button>
                    </div>

                    {/* Helper Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-4 pt-12 max-w-3xl mx-auto text-left">
                        {/* Quick Solutions */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm group">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                <Search className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Quick Checks</h3>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full" /> Double-check the URL spelling
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full" /> Try searching our help center
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm group">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors">
                                <Mail className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Need Assistance?</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Our support team is available 24/7 to help you navigate your way back.
                            </p>
                            <button className="text-xs font-medium text-white/70 hover:text-white flex items-center gap-1 transition-colors">
                                Contact Support <ArrowLeft className="w-3 h-3 rotate-180" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-8 border-t border-white/5 mt-8 w-full max-w-md mx-auto">
                        <p className="text-xs text-slate-600 uppercase tracking-widest">
                            Error Code: 404 • Page Not Found
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CSS for Custom Animations --- */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-20px) translateX(10px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-30px) translateX(-15px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
}