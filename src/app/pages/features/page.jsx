"use client";

import { useState } from "react";
import { 
    FileText, 
    Download, 
    Chrome, 
    Book, 
    Mic, 
    ArrowRight,
    CheckCircle,
    Star,
    Zap
} from "lucide-react";
import ClauseComparison from "../../../components/clause-comparison/ClauseComparison";
import PDFReportGenerator from "../../../components/pdf-report/PDFReportGenerator";
import LegalGlossary from "../../../components/legal-glossary/LegalGlossary";
import VoiceInterface from "../../../components/voice-interface/VoiceInterface";

export default function FeaturesPage() {
    const [activeFeature, setActiveFeature] = useState('overview');
    const [sampleAnalysis] = useState({
        summary: "This contract contains several high-risk clauses that require immediate attention.",
        riskLevel: "High",
        risks: [
            { title: "Unlimited Liability Clause", description: "The contract contains an unlimited liability clause that could expose you to significant financial risk.", level: "high" },
            { title: "Vague Termination Terms", description: "The termination clause lacks specific conditions and timelines.", level: "medium" },
            { title: "Missing Force Majeure", description: "No force majeure clause to protect against unforeseen circumstances.", level: "low" }
        ],
        recommendations: [
            "Negotiate a liability cap to limit your financial exposure",
            "Request specific termination conditions and notice periods",
            "Add a comprehensive force majeure clause"
        ]
    });

    const features = [
        {
            id: 'comparison',
            title: 'Contract Clause Comparison',
            description: 'Compare two contracts side-by-side to identify missing clauses, differences, and similarities',
            icon: <FileText className="text-blue-600" size={24} />,
            status: 'New',
            component: <ClauseComparison />
        },
        {
            id: 'pdf-reports',
            title: 'Downloadable Risk Reports',
            description: 'Generate comprehensive PDF reports of your legal risk analysis',
            icon: <Download className="text-green-600" size={24} />,
            status: 'New',
            component: <PDFReportGenerator analysisData={sampleAnalysis} />
        },
        {
            id: 'chrome-extension',
            title: 'Chrome Extension',
            description: 'Analyze legal content on any webpage with our browser extension',
            icon: <Chrome className="text-orange-600" size={24} />,
            status: 'Beta',
            component: (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <Chrome className="mx-auto mb-4 text-orange-600" size={64} />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Legal Risk Radar Extension</h3>
                    <p className="text-gray-600 mb-6">
                        Install our Chrome extension to analyze legal content on any webpage. 
                        Right-click on selected text to get instant legal risk analysis.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Features</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Right-click context menu</li>
                                <li>• Floating analysis button</li>
                                <li>• Quick legal term lookup</li>
                                <li>• Instant risk assessment</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Installation</h4>
                            <ol className="text-sm text-gray-600 space-y-1">
                                <li>1. Download extension file</li>
                                <li>2. Open Chrome Extensions</li>
                                <li>3. Enable Developer mode</li>
                                <li>4. Load unpacked extension</li>
                            </ol>
                        </div>
                    </div>
                    <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                        Download Extension (Beta)
                    </button>
                </div>
            )
        },
        {
            id: 'glossary',
            title: 'Legal Glossary Pop-ups',
            description: 'Interactive legal dictionary with comprehensive Indian law terms',
            icon: <Book className="text-purple-600" size={24} />,
            status: 'New',
            component: <LegalGlossary />
        },
        {
            id: 'voice',
            title: 'Indian Language Voices',
            description: 'Voice interface supporting 12+ Indian languages for accessibility',
            icon: <Mic className="text-red-600" size={24} />,
            status: 'New',
            component: <VoiceInterface />
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <Zap size={16} />
                            Latest Features
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Enhanced Legal Analysis Tools
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover our latest features designed to make legal analysis more comprehensive, 
                            accessible, and user-friendly for everyone.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Feature Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h3 className="font-bold text-gray-900 mb-4">Features</h3>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveFeature('overview')}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                        activeFeature === 'overview'
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Overview
                                </button>
                                {features.map(feature => (
                                    <button
                                        key={feature.id}
                                        onClick={() => setActiveFeature(feature.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                                            activeFeature === feature.id
                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {feature.icon}
                                            <span className="text-sm">{feature.title}</span>
                                        </div>
                                        {feature.status && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                feature.status === 'New' 
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {feature.status}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Feature Content */}
                    <div className="lg:col-span-3">
                        {activeFeature === 'overview' ? (
                            <div className="space-y-8">
                                {/* Overview Header */}
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        Future Enhancements Now Available
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        We've implemented the most requested features to make legal analysis 
                                        more powerful and accessible. Here's what's new:
                                    </p>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {features.map(feature => (
                                            <div
                                                key={feature.id}
                                                onClick={() => setActiveFeature(feature.id)}
                                                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    {feature.icon}
                                                    {feature.status && (
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            feature.status === 'New' 
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {feature.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {feature.description}
                                                </p>
                                                <div className="flex items-center text-blue-600 text-sm font-medium">
                                                    Try it now <ArrowRight size={14} className="ml-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Benefits Section */}
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Why These Features Matter</h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle className="text-blue-600" size={24} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Comprehensive Analysis</h4>
                                            <p className="text-sm text-gray-600">
                                                Compare contracts, generate reports, and get detailed insights
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Star className="text-green-600" size={24} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Better Accessibility</h4>
                                            <p className="text-sm text-gray-600">
                                                Voice interface and multi-language support for all users
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Zap className="text-purple-600" size={24} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Seamless Integration</h4>
                                            <p className="text-sm text-gray-600">
                                                Browser extension and glossary for instant legal help
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {features.find(f => f.id === activeFeature)?.component}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}