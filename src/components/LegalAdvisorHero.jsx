"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const texts = [
    "Simplify complex legal documents in seconds.",
    "Identify hidden risks before you sign.",
    "Get instant AI-powered legal guidance."
];

export default function LegalAdvisorHero() {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const currentText = texts[index];

        if (!isDeleting && subIndex < currentText.length) {
            setTimeout(() => {
                setText(currentText.substring(0, subIndex + 1));
                setSubIndex(subIndex + 1);
            }, 50);
        } else if (!isDeleting && subIndex === currentText.length) {
            setTimeout(() => setIsDeleting(true), 1200);
        } else if (isDeleting && subIndex > 0) {
            setTimeout(() => {
                setText(currentText.substring(0, subIndex - 1));
                setSubIndex(subIndex - 1);
            }, 30);
        } else if (isDeleting && subIndex === 0) {
            setIsDeleting(false);
            setIndex((index + 1) % texts.length);
        }
    }, [subIndex, index, isDeleting]);

    return (
        <div className="hidden md:flex w-1/2 
      bg-gradient-to-br from-blue-50 via-blue-100/70 to-blue-200/50
      text-blue-900 p-12 flex-col justify-center  backdrop-blur-sm rounded-r-4xl">

            <Image
                src="/logo.svg"
                width={500}
                height={500}
                alt="Legal Risk Radar"
                className="w-25 h-25 animate-pulse justify-center relative z-10"
            />

            <div className="text-2xl font-medium min-h-[64px] text-blue-800">
                {text}
                <span className="animate-pulse text-blue-600">|</span>
            </div>

            <button
                onClick={() => router.push("/pages/chat")}
                className="mt-8 w-fit 
          bg-blue-600/90 text-white 
          px-8 py-3 rounded-full font-semibold text-lg
          hover:bg-blue-700 transition-all shadow-md"
            >
                Try Legal Advisor
            </button>

            <p className="text-sm opacity-70 mt-10 text-blue-700">
                ⚖️ Secure · Trusted · AI Powered
            </p>
        </div>
    );
}
