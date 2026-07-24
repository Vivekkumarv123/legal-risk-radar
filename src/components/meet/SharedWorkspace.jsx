import React, { useState } from 'react';
import { authenticatedFetch } from '@/utils/auth.utils';

/**
 * SharedWorkspace: Central document drop area and screen share manager.
 * @param {string} consultationId - The active session consultation ID
 * @param {string} accessToken - User OAuth access token
 * @param {Function} onDocumentIngested - Callback when file is parsed and stored
 */
export default function SharedWorkspace({ consultationId, accessToken, onDocumentIngested }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file) => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadStatus('Aura is Analyzing...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('consultationId', consultationId);
      formData.append('accessToken', accessToken);

      const res = await authenticatedFetch('/api/consultation/upload-document', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Upload process encountered an error');
      }

      const data = await res.json();
      setUploadStatus(`✓ ${file.name} Ingested successfully.`);

      // Trigger callback to parents
      if (onDocumentIngested) {
        onDocumentIngested(data.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">

      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Shared Workspace
        </h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          Evidence Hub
        </span>
      </div>

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-300 relative
          ${dragActive
            ? 'border-blue-500 bg-blue-950/15'
            : 'border-slate-800 bg-slate-950/20 hover:border-slate-700/80 hover:bg-slate-950/30'
          }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Spinning load visual */}
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-200">{uploadStatus}</span>
              <span className="text-[10px] text-slate-500">Checking document type & layout...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shadow-sm text-slate-500 group-hover:text-slate-400">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex flex-col gap-1 max-w-[240px]">
              <h4 className="text-xs font-bold text-slate-300">Share a Legal Document</h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Drag and drop PDF contracts or image scans. Searchable PDFs are read natively.
              </p>
            </div>

            {/* Upload Button */}
            <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-4 rounded-lg border border-slate-700 shadow-md cursor-pointer transition-all">
              Choose Contract File
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Temporary upload status banner */}
        {!isUploading && uploadStatus && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-center text-xs font-medium text-slate-300 animate-pulse">
            {uploadStatus}
          </div>
        )}
      </div>

    </div>
  );
}
