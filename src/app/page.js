import React from 'react'
import HomePage from './pages/home/page'

export const metadata = {
  title: "Legal Advisor | AI Contract Risk Analysis & Live Voice Consultation",
  description:
    "Audit legal agreements, detect missing terms, receive real-time live voice consultation with Aura, and export PDF decision briefs.",
  alternates: {
    canonical: "https://legal-risk-radar.vercel.app",
  },
}

export default function page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does the Live Voice AI Consultation (Aura) work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI legal consultant, Aura, uses real-time WebSockets to communicate via natural voice and video. You can discuss contract terms verbally, ask follow-up questions, and receive a structured Decision Brief upon completing your session."
        }
      },
      {
        "@type": "Question",
        "name": "What is Gaps Analysis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gaps Analysis identifies what is missing from a contract. It flags omitted liability caps, missing IP ownership carve-outs, unlisted termination rights, and missing confidentiality protections before you sign."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download the analysis as a PDF report?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! After analyzing any contract or ending a live consultation session, you can export a professionally formatted PDF Decision Brief complete with risk scores, clause breakdowns, and recommended negotiation points."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Side-by-Side Contract Comparison tool work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can upload two versions of a contract (e.g. initial draft vs revised agreement). Our AI compares them clause-by-clause, highlighting subtle changes, risk score shifts, and newly added restrictive terms."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePage />
    </>
  )
}

