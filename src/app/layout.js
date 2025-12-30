import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Legal Risk Radar",
  description:
    "Legal Risk Radar uses Gemini 3 to visually highlight legal risks inside documents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID}
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>

          <Toaster position="top-center" />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
