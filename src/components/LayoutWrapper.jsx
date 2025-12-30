"use client";

import { usePathname } from "next/navigation";
import Navbar from "./layout/navbar";
import Footer from "./layout/footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideLayout =
    pathname.startsWith("/pages/chat") ||
    pathname.startsWith("/pages/private-chat");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideLayout && <Navbar />}

      <main className="flex-1">
        {children}
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}
