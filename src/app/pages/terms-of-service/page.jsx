'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/pages/home')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="text-blue-700 font-extrabold text-lg flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-blue-600" />
            Legal Advisor AI
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex flex-col gap-4 mb-10 border-b border-slate-100 pb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Agreement of Use
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: July 19, 2026 • Effective Immediately
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering, or using the Legal Advisor AI web application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Scope of Service & Legal Disclaimer
            </h2>
            <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl text-amber-900 text-xs leading-relaxed space-y-1">
              <strong className="font-extrabold uppercase tracking-wide text-amber-950 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Important Disclaimer:
              </strong>
              <p>
                Legal Advisor AI is an AI-powered document review and assistant tool. **We do not provide professional legal advice, counsel, or representation.** The summaries, risk analysis ratings, and alternative clause recommendations are for informational purposes only and do not establish an attorney-client relationship. You must consult a licensed attorney in your jurisdiction before executing any legal document.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. User Responsibilities & File Ownership
            </h2>
            <p>
              You represent and warrant that you own or have the necessary legal rights to upload all contracts, NDAs, and annexures into the Shared Workspace. You retain all intellectual property rights to your uploaded files and generated reports.
            </p>
            <p>
              You agree not to use this service to upload malicious files, decompile codebase interfaces, or violate compliance laws in your local jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. Integration with Google APIs
            </h2>
            <p>
              If you link your Google Workspace, you authorize our application to execute actions on your behalf, including uploading PDFs to Google Drive, generating drafted notice documents in Google Docs, and scheduling calendar event entries. You have the right to revoke OAuth permissions at any time via your Google Account security panel.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              5. Disclaimer of Warranties & Liability Limits
            </h2>
            <p>
              Our services are provided on an "as is" and "as available" basis without warranties of any kind. Legal Advisor AI shall not be liable for any financial losses, compliance fines, or contractual disputes resulting from the use or interpretation of our contract summaries.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              6. Governing Law
            </h2>
            <p>
              These terms shall be governed by and construed in accordance with local regulations, without regard to conflict of law principles. Any dispute arising out of these terms shall be subject to the exclusive jurisdiction of the local courts.
            </p>
          </section>

        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-slate-50 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Legal Advisor AI. All rights reserved.
      </footer>
    </div>
  );
}
