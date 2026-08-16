'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BuktiDukungUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    fileType: 'image' | 'pdf' | 'link',
    payload: { base64?: string; url?: string; filename?: string }
  ) => Promise<void>;
  tahapanName: string;
}

export function BuktiDukungUpload({
  isOpen,
  onClose,
  onSubmit,
  tahapanName,
}: BuktiDukungUploadProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'pdf' | 'link'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // States for different types
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPreviewImage(null);
    setPdfFile(null);
    setLinkUrl('');
    setError('');
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => setPreviewImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Harap pilih file dokumen PDF.');
      return;
    }
    setError('');
    setPdfFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (activeTab === 'image') {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setPreviewImage(event.target?.result as string);
            reader.readAsDataURL(file);
            e.preventDefault();
            return;
          }
        }
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsUploading(true);
    try {
      if (activeTab === 'image' && previewImage) {
        await onSubmit('image', { base64: previewImage });
      } else if (activeTab === 'pdf' && pdfFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile);
        });
        await onSubmit('pdf', { base64, filename: pdfFile.name });
      } else if (activeTab === 'link' && linkUrl) {
        if (!linkUrl.startsWith('http')) {
          throw new Error('URL harus valid (dimulai dengan http:// atau https://)');
        }
        await onSubmit('link', { url: linkUrl });
      } else {
        throw new Error('Harap lengkapi bukti dukung');
      }
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={handleClose} onPaste={handlePaste}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden border border-[var(--border-color)]"
          onClick={(e) => e.stopPropagation()}
        >
          {isUploading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-extrabold text-[var(--color-primary)] text-sm">Mengunggah Bukti ke Drive...</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)]">
              Unggah Bukti Dukung
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mb-1 leading-snug">
            {tahapanName}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            Pilih metode upload bukti dukung untuk tahapan ini:
          </p>

          {/* Switcher Tab */}
          <div className="flex gap-1.5 mb-5 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)]">
            {(['image', 'pdf', 'link'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  resetState();
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-white dark:bg-[var(--color-primary)] text-[var(--color-primary)] dark:text-white shadow-sm border border-[var(--border-color)] dark:border-transparent'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'image' && (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Foto / Gambar
                  </>
                )}
                {tab === 'pdf' && (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Dokumen PDF
                  </>
                )}
                {tab === 'link' && (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Link Tautan
                  </>
                )}
              </button>
            ))}
          </div>

          <div className="mb-6">
            {activeTab === 'image' && (
              <div
                className="border-2 border-dashed border-[var(--border-color)] hover:border-[var(--color-primary)] rounded-2xl p-6 text-center transition-colors cursor-pointer bg-[var(--bg-surface)]"
                onClick={() => !previewImage && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {previewImage ? (
                  <div className="relative">
                    <img src={previewImage} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-md" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                      }}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full shadow-md flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-[var(--color-accent-light)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[var(--border-color)]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p className="font-bold text-[var(--text-primary)] text-xs sm:text-sm mb-1">
                      Klik untuk pilih gambar
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Atau Paste (<kbd className="px-1.5 py-0.5 bg-[var(--border-color)] rounded text-[10px] font-mono">Ctrl+V</kbd>) tangkapan layar di sini
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pdf' && (
              <div
                className="border-2 border-dashed border-[var(--border-color)] hover:border-[var(--color-primary)] rounded-2xl p-6 text-center transition-colors cursor-pointer bg-[var(--bg-surface)]"
                onClick={() => !pdfFile && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-200">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{pdfFile.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                      }}
                      className="w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 rounded-lg"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-red-200 dark:border-red-900/60">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">Pilih Dokumen PDF</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Maksimal ukuran file 10MB</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'link' && (
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  URL Tautan (Google Drive, Docs, Figma, dll)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--text-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl font-bold text-xs sm:text-sm text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--border-color)] transition-colors border border-[var(--border-color)] cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!previewImage && !pdfFile && !linkUrl}
              className="flex-1 h-11 rounded-xl font-bold text-xs sm:text-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors shadow-md shadow-[var(--shadow-glow)] cursor-pointer flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Simpan Bukti
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
