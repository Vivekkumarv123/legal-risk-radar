"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
    const plans = [
        {
            name: "Free",
            price: "₹0",
            period: "/month",
            desc: "Best for individuals trying Legal Advisor",
            features: [
                "Limited AI legal chat",
                "Basic document analysis",
                "Community support",
            ],
            button: "Get Started",
            highlight: false,
        },
        {
            name: "Pro",
            price: "₹499",
            period: "/month",
            desc: "For professionals & startups",
            features: [
                "Unlimited AI legal chat",
                "Advanced document review",
                "Risk highlighting",
                "Priority email support",
            ],
            button: "Start Free Trial",
            highlight: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "",
            desc: "For organizations & law firms",
            features: [
                "Everything in Pro",
                "Dedicated account manager",
                "Custom integrations",
                "Enterprise-grade security",
            ],
            button: "Contact Sales",
            highlight: false,
        },
    ];

    return (
        <div className="bg-gray-50 px-6 py-8">

            {/* HEADER */}
            <div className="max-w-3xl mx-auto text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Simple & Transparent Pricing
                </h1>
                <p className="text-gray-600 text-lg">
                    Choose a plan that fits your needs. No hidden fees.
                </p>
            </div>

            {/* PRICING CARDS */}
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {plans.map((plan, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className={`rounded-2xl bg-white p-8 border ${plan.highlight
                                ? "border-blue-600 shadow-lg scale-105"
                                : "border-gray-200 shadow-sm"
                            }`}
                    >
                        {/* PLAN NAME */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {plan.name}
                        </h3>

                        {/* PRICE */}
                        <div className="flex items-end gap-1 mb-4">
                            <span className="text-4xl font-bold text-gray-900">
                                {plan.price}
                            </span>
                            <span className="text-gray-500">{plan.period}</span>
                        </div>

                        {/* DESCRIPTION */}
                        <p className="text-gray-600 mb-6">
                            {plan.desc}
                        </p>

                        {/* FEATURES */}
                        <ul className="space-y-3 mb-8">
                            {plan.features.map((f, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-700">
                                    <Check className="text-green-600" size={18} />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <Link
                            href="/pages/chat"
                            className={`block text-center rounded-xl px-6 py-3 font-semibold transition ${plan.highlight
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                                }`}
                        >
                            {plan.button}
                        </Link>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
