"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* HERO SECTION */}
      <section className="min-h-[80vh] flex items-center justify-center bg-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Legal Guidance, Powered by AI ⚖️
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Understand contracts, detect legal risks, and get expert-level
            insights in seconds — before you sign anything.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/pages/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Get Started
            </Link>

            <Link
              href="/pages/pricing"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              View Pricing
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Legal Advisor?
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                AI Risk Detection
              </h3>
              <p className="text-gray-600">
                Automatically highlights risky clauses and hidden obligations
                in legal documents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Plain English Explanations
              </h3>
              <p className="text-gray-600">
                Legal jargon translated into simple language anyone can
                understand.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your documents stay private with enterprise-grade security and
                encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 bg-white text-center px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Make Confident Legal Decisions
        </h2>
        <p className="text-gray-600 mb-6">
          Join professionals, startups, and individuals using AI to stay
          legally safe.
        </p>

        <Link
          href="/pages/signup"
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-semibold transition"
        >
          Start Free Trial
        </Link>
      </section>

    </div>
  );
}
