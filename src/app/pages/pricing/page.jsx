"use client";

import { ShieldCheck, FileText, MessageCircle, Clock } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <MessageCircle size={28} />,
            title: "AI Legal Chat",
            desc: "Instant answers to legal questions with contextual understanding.",
        },
        {
            icon: <FileText size={28} />,
            title: "Document Review",
            desc: "Upload and analyze contracts, notices, and agreements securely.",
        },
        {
            icon: <ShieldCheck size={28} />,
            title: "Data Security",
            desc: "Your conversations and documents are encrypted and private.",
        },
        {
            icon: <Clock size={28} />,
            title: "24/7 Availability",
            desc: "Legal guidance anytime without waiting for appointments.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-10 py-14">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
                Powerful Features 🚀
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
                    >
                        <div className="text-blue-700 mb-4 flex justify-center">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                        <p className="text-gray-600 text-sm">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
