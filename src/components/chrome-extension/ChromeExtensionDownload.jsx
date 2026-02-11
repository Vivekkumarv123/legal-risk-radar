"use client";
import { 
  Download, Chrome, CheckCircle, AlertCircle, 
  Copy, FileText, MousePointer2, ExternalLink, 
  Terminal, ShieldCheck, Box
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ChromeExtensionDownload() {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Command copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 text-slate-900 font-sans antialiased">
            {/* Top Navigation / Breadcrumb Placeholder */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6 uppercase tracking-widest">
                <span>Deployments</span>
                <span>/</span>
                <span className="text-slate-900">Chrome Extension v1.0.4</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Column: Documentation & Steps */}
                <div className="lg:col-span-8 space-y-10">
                    <section>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                            Manual Deployment Guide
                        </h1>
                        <p className="mt-2 text-slate-600 max-w-2xl leading-relaxed">
                            Install the Legal Risk Radar extension manually for local testing or enterprise environments where the Web Store is restricted.
                        </p>
                    </section>

                    <div className="space-y-0 border-l border-slate-200 ml-4">
                        {/* Step 1 */}
                        <div className="relative pl-10 pb-10">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-sm" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">01. Source Acquisition</h3>
                            <p className="text-sm text-slate-600 mb-4">Download the production-ready distribution package. This contains the compiled assets and v3 manifest.</p>
                            <a
                                href="/downloads/chrome-extension.zip"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-all text-sm font-medium shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download build-v1.0.4.zip
                            </a>
                        </div>

                        {/* Step 2 */}
                        <div className="relative pl-10 pb-10">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white shadow-sm" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">02. Environment Setup</h3>
                            <p className="text-sm text-slate-600 mb-3">Initialize the extension manager by navigating to the internal URI:</p>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-md p-2 max-w-sm group">
                                <Terminal className="w-4 h-4 text-slate-400" />
                                <code className="text-xs font-mono text-slate-700 flex-1">chrome://extensions/</code>
                                <button onClick={() => copyToClipboard('chrome://extensions/')} className="text-slate-400 hover:text-slate-900">
                                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative pl-10">
                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white shadow-sm" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">03. Unpacked Loading</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Enable <span className="font-semibold text-slate-900">Developer Mode</span>, select <span className="font-semibold text-slate-900">Load Unpacked</span>, and target the root directory of the unzipped package.
                            </p>
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-md flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800 leading-normal">
                                    <strong>Permissions Note:</strong> Ensure your browser policy allows "Unpacked Extensions". Contact your IT administrator if the button is disabled.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Specs & Support */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Technical Specs Card */}
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Technical Specifications</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Manifest Version</span>
                                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">v3</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Build Size</span>
                                <span className="text-slate-900">48.2 KB</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Compliance</span>
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                    <ShieldCheck className="w-3 h-3" /> SOC2 Ready
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features Indicator */}
                    <div className="p-5 border border-slate-200 rounded-lg space-y-4">
                        <h4 className="text-sm font-bold text-slate-900">Capabilities</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-start text-sm text-slate-600">
                                <Box className="w-4 h-4 text-blue-500 mt-0.5" />
                                <span>Direct DOM node analysis</span>
                            </li>
                            <li className="flex gap-3 items-start text-sm text-slate-600">
                                <Box className="w-4 h-4 text-blue-500 mt-0.5" />
                                <span>PDF selection bridge</span>
                            </li>
                        </ul>
                    </div>

                    {/* Support Link */}
                    <div className="p-4 bg-slate-900 rounded-lg text-white">
                        <p className="text-xs font-medium text-slate-400 mb-1">Internal Support</p>
                        <p className="text-sm mb-4">Enterprise SLA covers installation and API troubleshooting.</p>
                        <button className="w-full flex items-center justify-center gap-2 py-2 bg-white text-slate-900 rounded font-bold text-xs hover:bg-slate-100 transition-colors">
                            Open Support Ticket
                            <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Verification Footer */}
            <footer className="mt-16 pt-8 border-t border-slate-100">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <p className="text-xs text-slate-400">
                        &copy; 2026 Legal Risk Radar. For authorized internal use only.
                    </p>
                    <div className="flex gap-6 text-xs font-medium text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Security Overview</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">v1.0.4 Changelog</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}