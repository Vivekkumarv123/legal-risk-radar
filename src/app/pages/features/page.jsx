"use client";

import { ShieldCheck, FileText, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="bg-gray-50 px-6 py-10">

            {/* HEADER */}
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Powerful Features 🚀
                </h1>
                <p className="text-gray-600 text-lg">
                    Everything you need to understand legal documents and make
                    confident decisions — powered by AI.
                </p>
            </div>

            {/* FEATURES GRID */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition"
                    >
                        {/* ICON */}
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            {f.icon}
                        </div>

                        {/* TITLE */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {f.title}
                        </h3>

                        {/* DESCRIPTION */}
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {f.desc}
                        </p>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
