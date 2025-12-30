"use client";

export default function Footer() {
    return (
        <footer className="bg-white border-t text-center py-4 text-gray-500 text-sm">
            © {new Date().getFullYear()} Legal Advisor. All rights reserved.
        </footer>
    );
}
