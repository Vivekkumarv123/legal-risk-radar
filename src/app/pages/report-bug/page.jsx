"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Bug, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

// Enterprise-grade reusable label component for consistency
const FormLabel = ({ children, required }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

// Helper for dynamic classes
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReportBug() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState({}); // Track field interactions for validation
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        severity: "medium",
        category: "general",
        steps: "",
        expected: "",
        actual: ""
    });
    
    const [screenshots, setScreenshots] = useState([]);

    // Visual Severity Options (Better than a dropdown)
    const severityOptions = [
        { value: "low", label: "Low", description: "Minor cosmetic issue", color: "bg-emerald-100 text-emerald-800 border-emerald-200", selectedBorder: "border-emerald-500 ring-emerald-200" },
        { value: "medium", label: "Medium", description: "Functionality impaired", color: "bg-blue-100 text-blue-800 border-blue-200", selectedBorder: "border-blue-500 ring-blue-200" },
        { value: "high", label: "High", description: "Feature broken", color: "bg-orange-100 text-orange-800 border-orange-200", selectedBorder: "border-orange-500 ring-orange-200" },
        { value: "critical", label: "Critical", description: "System crash/Data loss", color: "bg-red-100 text-red-800 border-red-200", selectedBorder: "border-red-500 ring-red-200" }
    ];

    const categoryOptions = [
        { value: "general", label: "General Issue" },
        { value: "ui", label: "User Interface (UI/UX)" },
        { value: "performance", label: "Performance / Latency" },
        { value: "security", label: "Security Vulnerability" },
        { value: "api", label: "API / Backend Error" },
        { value: "billing", label: "Billing & Account" },
    ];

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        
        if (screenshots.length + files.length > 3) {
            toast.error("Maximum 3 screenshots allowed");
            return;
        }

        // Optional: Add file size/type check here
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) toast.error("Only image files are allowed");

        setScreenshots(prev => [...prev, ...validFiles]);
    };

    const removeScreenshot = (index) => {
        setScreenshots(prev => prev.filter((_, i) => i !== index));
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ title: true, description: true }); // Show errors on all required fields
        
        if (!formData.title || !formData.description) {
            toast.error("Please fill in the required fields highlighted in red");
            return;
        }

        setSubmitting(true);
        try {
            // Simulation of API call
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
            screenshots.forEach((file, index) => submitData.append(`screenshot${index}`, file));

            // NOTE: Replace with your actual API endpoint
            /* const res = await fetch('/api/bug-report', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: submitData
            });
            if (!res.ok) throw new Error('Failed');
            */
            
            // Simulating network delay for demo
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSubmitted(true);
            toast.success('Bug report submitted successfully');
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit bug report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Success State Component
    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Report Received</h2>
                    <p className="text-slate-600 mb-8 text-lg">
                        Thanks for helping us improve. Our engineering team has been notified and will review your report shortly.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                        >
                            Submit Another Report
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            aria-label="Go Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <Bug className="w-5 h-5 text-red-600" />
                            <h1 className="text-lg font-bold text-slate-900">Bug Reporter</h1>
                        </div>
                    </div>
                    <div className="text-sm text-slate-500 hidden sm:block">
                        Ticket ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">NEW</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Section 1: Core Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Issue Details</h2>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Step 1 of 3</span>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Title */}
                                    <div>
                                        <FormLabel required>Bug Title</FormLabel>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            onBlur={() => handleBlur('title')}
                                            placeholder="E.g., Dashboard fails to load when date filter is applied"
                                            className={cn(
                                                "w-full px-4 py-2.5 bg-white text-slate-900 border rounded-lg focus:outline-none focus:ring-2 transition-all shadow-sm placeholder:text-slate-400",
                                                touched.title && !formData.title 
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                            )}
                                        />
                                        {touched.title && !formData.title && (
                                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> Title is required
                                            </p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <FormLabel>Category</FormLabel>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                                            >
                                                {categoryOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Severity - Visual Selector */}
                                    <div>
                                        <FormLabel>Severity Level</FormLabel>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            {severityOptions.map((option) => (
                                                <label 
                                                    key={option.value}
                                                    className={cn(
                                                        "relative flex items-start p-3 cursor-pointer rounded-lg border transition-all duration-200",
                                                        formData.severity === option.value 
                                                            ? `${option.color} ${option.selectedBorder} ring-1` 
                                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                                                    )}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="severity"
                                                        value={option.value}
                                                        checked={formData.severity === option.value}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                                                        className="mt-1 sr-only"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-sm">{option.label}</span>
                                                            {formData.severity === option.value && (
                                                                <CheckCircle className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <p className={cn(
                                                            "text-xs mt-0.5",
                                                            formData.severity === option.value ? "opacity-80" : "text-slate-500"
                                                        )}>
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Technical Details</h2>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Step 2 of 3</span>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Description */}
                                    <div>
                                        <FormLabel required>Description</FormLabel>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            onBlur={() => handleBlur('description')}
                                            rows={4}
                                            placeholder="Please describe the bug in detail..."
                                            className={cn(
                                                "w-full px-4 py-3 bg-white text-slate-900 border rounded-lg focus:outline-none focus:ring-2 transition-all shadow-sm placeholder:text-slate-400 resize-y min-h-[100px]",
                                                touched.description && !formData.description 
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                            )}
                                        />
                                    </div>

                                    {/* Steps / Expected / Actual */}
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <FormLabel>Steps to Reproduce</FormLabel>
                                            <textarea
                                                value={formData.steps}
                                                onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                                                rows={4}
                                                placeholder={`1. Navigate to 'Settings'\n2. Click on 'Profile'\n3. Upload avatar...`}
                                                className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm font-mono text-sm placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <FormLabel>Expected Behavior</FormLabel>
                                                <textarea
                                                    value={formData.expected}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, expected: e.target.value }))}
                                                    rows={3}
                                                    placeholder="The avatar should update immediately."
                                                    className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <FormLabel>Actual Behavior</FormLabel>
                                                <textarea
                                                    value={formData.actual}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, actual: e.target.value }))}
                                                    rows={3}
                                                    placeholder="The screen freezes and shows error 500."
                                                    className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Evidence */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Attachments</h2>
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Step 3 of 3</span>
                                </div>
                                <div className="p-6">
                                    <FormLabel>Screenshots (Max 3)</FormLabel>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Attach screenshots or error logs to help us resolve the issue faster. Supported: JPG, PNG.
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {screenshots.map((file, index) => (
                                            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeScreenshot(index)}
                                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {screenshots.length < 3 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                                            >
                                                <div className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                                    <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Upload</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Report
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Sidebar / Tips */}
                    <div className="hidden lg:block space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sticky top-24">
                            <div className="flex items-start gap-3 mb-4">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <h3 className="font-bold text-blue-900">Reporting Tips</h3>
                            </div>
                            <ul className="space-y-4 text-sm text-blue-800">
                                <li className="flex gap-2">
                                    <span className="font-bold text-blue-500">•</span>
                                    <span>
                                        <strong className="block text-blue-900 mb-1">Be Specific</strong>
                                        "It doesn't work" is hard to fix. "The Submit button is disabled on Safari" is helpful.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-blue-500">•</span>
                                    <span>
                                        <strong className="block text-blue-900 mb-1">Include Steps</strong>
                                        Can you reproduce the bug 100% of the time? If so, tell us exactly how.
                                    </span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-blue-500">•</span>
                                    <span>
                                        <strong className="block text-blue-900 mb-1">Screenshots</strong>
                                        A picture is worth 1000 lines of logs. Please attach one if UI related.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}