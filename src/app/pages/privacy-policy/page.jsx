'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Lock className="w-3.5 h-3.5" />
            Privacy & Trust
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: July 19, 2026 • Effective Immediately
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              1. Overview & Commitment
            </h2>
            <p>
              At Legal Advisor AI, your privacy is our top priority. Because we analyze confidential business agreements, contracts, and personal disclosures, we implement bank-grade encryption and strict access controls. We do not sell or monetize your document contents under any circumstances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Data We Collect
            </h2>
            <p>
              To provide interactive legal contract evaluations and Google Workspace integrations, we collect the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Profile Information:</strong> Name, profile photo, and email address retrieved during Google authentication or signup.</li>
              <li><strong>Uploaded Contracts & Files:</strong> PDF contracts, text files, and images you drop into the Workspace. These are processed to extract risk points.</li>
              <li><strong>Live Consultation Audio & Transcripts:</strong> Audio streams and transcripts generated during voice consultations to compile your final Decision Brief.</li>
              <li><strong>Calendar Sync Details:</strong> Titles, descriptions, and timestamps of reminders you schedule via Google Calendar.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. Google API Scopes & Access Disclosure
            </h2>
            <p>
              Our application uses Google OAuth Access Tokens to provide the following optional Workspace features:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Drive (`/auth/drive.file`):</strong> Used to upload your contract files to a dedicated folder in your Google Drive. We only access files created by our application.</li>
              <li><strong>Google Docs (`/auth/documents`):</strong> Used to automatically draft notices, amendment letters, and Decision Briefs directly to your Google Docs account.</li>
              <li><strong>Google Calendar (`/auth/calendar`):</strong> Used to schedule follow-up deadlines and contract review reminders.</li>
            </ul>
            <p className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-500 italic mt-3">
              Note: The access tokens are transient, stored only in your browser session state, and are transmitted securely via HTTPS. We do not store your permanent Google login credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. Data Retention & Deletion
            </h2>
            <p>
              We believe in data ownership. You retain complete control over your files and records:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You can view, download, or delete past consultation rooms and briefs directly from your history dashboard.</li>
              <li>When you delete a consultation session, all associated transcripts, timeline logs, and analysis files are permanently removed from our Firestore database.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              5. Contact & Support
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to request complete deletion of your account records, please contact us at <a href="mailto:support@legaladvisor.ai" className="text-blue-600 underline">support@legaladvisor.ai</a>.
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
