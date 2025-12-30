"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* NAVBAR */}
            <header className="flex justify-between items-center px-10 py-6 bg-white shadow-sm">
                <h1 className="text-2xl font-bold text-blue-700">Legal Advisor</h1>

                <nav className="space-x-6">
                    <Link href="/pages/features" className="text-gray-600 hover:text-blue-600">
                        Features
                    </Link>
                    <Link href="/pages/pricing" className="text-gray-600 hover:text-blue-600">
                        Pricing
                    </Link>
                    <Link href="/pages/login" className="text-blue-600 font-semibold">
                        Login
                    </Link>
                </nav>
            </header>

            {/* HERO */}
            <main className="flex-1 flex items-center justify-center px-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl text-center"
                >
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Smart Legal Guidance, Powered by AI ⚖️
                    </h2>

                    <p className="text-gray-600 text-lg mb-8">
                        Get instant legal insights, document analysis, and expert guidance
                        anytime, anywhere.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link
                            href="/pages/signup"
                            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold"
                        >
                            Get Started
                        </Link>

                        <Link
                            href="/pages/pricing"
                            className="border border-blue-700 text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50"
                        >
                            View Pricing
                        </Link>
                    </div>
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="text-center py-4 text-gray-500 text-sm">
                © {new Date().getFullYear()} Legal Advisor. All rights reserved.
            </footer>
        </div>
    );
}
