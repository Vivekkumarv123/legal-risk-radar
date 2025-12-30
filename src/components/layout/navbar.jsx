"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const linkClass = (path) =>
        `relative text-sm font-medium transition ${pathname === path
            ? "text-blue-600"
            : "text-gray-600 hover:text-blue-600"
        }`;

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-10 py-4">

                {/* LOGO */}
                <Link
                    href="/"
                    className="text-2xl font-bold text-blue-700 tracking-tight"
                >
                    Legal Advisor
                </Link>

                {/* NAV LINKS */}
                <nav className="flex items-center gap-8">
                    <Link href="/pages/features" className={linkClass("/pages/features")}>
                        Features
                        <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-600 transition-all group-hover:w-full" />
                    </Link>

                    <Link href="/pages/pricing" className={linkClass("/pages/pricing")}>
                        Pricing
                    </Link>

                    {/* CTA BUTTON */}
                    <Link
                        href="/pages/login"
                        className="ml-4 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Login
                    </Link>
                </nav>
            </div>
        </header>
    );
}
