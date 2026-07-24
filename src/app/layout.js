import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || "https://legal-risk-radar.vercel.app";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Legal Advisor | AI Contract Risk Analysis & Live Voice Consultation",
    template: "%s | Legal Advisor AI",
  },
  description:
    "Legal Advisor is an AI-powered legal contract risk scanner and real-time voice consultation platform. Highlight hidden liabilities, detect missing clauses, compare contract versions, and export PDF decision briefs before you sign.",
  keywords: [
    "Legal AI",
    "AI Legal Advisor",
    "Contract Analysis",
    "Legal Document Review",
    "Contract Risk Analysis",
    "AI Lawyer",
    "Contract Checker",
    "NDA Review",
    "Employment Contract Analysis",
    "AI-powered contract analysis tool",
    "Free legal document review",
    "Automated contract risk assessment",
    "Legal jargon translator",
    "Contract comparison tool",
    "Legal Risk Radar",
    "Aura AI Consultant",
  ],
  authors: [{ name: "Legal Advisor Team", url: defaultUrl }],
  creator: "Legal Advisor",
  publisher: "Legal Advisor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Legal Advisor | AI Contract Risk Analysis & Live Voice Consultation",
    description:
      "Decode legal jargon instantly. Audit legal agreements, detect missing terms, talk with Aura (Live Voice AI), and export formatted PDF risk decision briefs.",
    url: defaultUrl,
    siteName: "Legal Advisor AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "Legal Advisor AI Contract Risk Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Advisor | AI Legal Risk Scanner & Voice Consultant",
    description:
      "Detect contract risks, missing terms, and negotiate safer terms with AI-powered contract intelligence.",
    creator: "@legaladvisor",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Legal Advisor",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "description":
          "AI-powered legal contract risk scanner, gap analysis, and real-time voice AI consultation platform.",
        "url": defaultUrl,
      },
      {
        "@type": "Organization",
        "name": "Legal Advisor",
        "url": defaultUrl,
        "logo": `${defaultUrl}/logo.svg`,
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID}
        >
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

