'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Subtask } from '@/lib/types';
import { BuktiUpload } from '@/components/BuktiUpload';

interface SubtaskItemProps {
  subtask: Subtask;
  index: number;
  onToggle: (id: string, selesai: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  onBuktiUploaded: (id: string, url: string) => void;
}

export function SubtaskItem({
  subtask,
  index,
  onToggle,
  onDelete,
  onBuktiUploaded,
}: SubtaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const [showUncheckModal, setShowUncheckModal] = useState(false);

  const handleCheckboxClick = async () => {
    if (!subtask.selesai) {
      // Wajib upload bukti terlebih dahulu jika belum selesai
      setShowUploadModal(true);
    } else {
      // Buka modal konfirmasi batalkan selesai
      setShowUncheckModal(true);
    }
  };

  const handleConfirmUncheck = async () => {
    setIsLoading(true);
    try {
      await onToggle(subtask.id, false);
      setShowUncheckModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuktiSuccess = async (url: string) => {
    setIsLoading(true);
    try {
      onBuktiUploaded(subtask.id, url);
      await onToggle(subtask.id, true);
      setShowUploadModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
        className="group"
      >
        <div
          className="flex items-start gap-3 p-3 rounded-2xl transition-all border border-transparent hover:border-[var(--border-color)]"
          style={{
            background: subtask.selesai ? 'var(--bg-surface)' : 'var(--bg-card)',
          }}
        >
          {/* Checkbox */}
          <motion.button
            onClick={handleCheckboxClick}
            disabled={isLoading}
            whileTap={{ scale: 0.85 }}
            className="flex-shrink-0 mt-0.5 cursor-pointer"
            aria-label={subtask.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="w-5 h-5 rounded-md border-2 border-primary-500 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                </motion.div>
              ) : subtask.selesai ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
                  style={{ background: '#636B2F' }}
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                    width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="1.5 6 4.5 9 10.5 3" />
                  </motion.svg>
                </motion.div>
              ) : (
                <motion.div
                  key="unchecked"
                  className="w-5 h-5 rounded-md border-2 hover:border-[#636B2F] transition-colors"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
                />
              )}
            </AnimatePresence>
          </motion.button>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p
              onClick={handleCheckboxClick}
              className="text-sm leading-snug transition-all cursor-pointer select-none"
              style={{
                color: subtask.selesai ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: subtask.selesai ? 'line-through' : 'none',
                fontWeight: subtask.selesai ? 400 : 600,
              }}
            >
              {subtask.nama}
            </p>

            {/* Bukti foto info / thumbnail */}
            {subtask.buktiFotoUrl ? (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowImageModal(true)}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                style={{
                  background: 'rgba(99, 107, 47, 0.12)',
                  color: '#636B2F',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Lihat Bukti Foto
              </motion.button>
            ) : (
              <p className="text-[11px] mt-1 text-[var(--text-muted)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                Klik untuk upload bukti & selesaikan tugas
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Ganti / Upload bukti */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowUploadModal(true)}
              data-tooltip={subtask.buktiFotoUrl ? 'Ganti Bukti' : 'Upload Bukti'}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--border-color)]/60 cursor-pointer"
              style={{ color: subtask.buktiFotoUrl ? '#636B2F' : 'var(--text-muted)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </motion.button>

            {/* Delete */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => onDelete(subtask.id)}
              data-tooltip="Hapus Tugas"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mandatory Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#636B2F]/15 text-[#636B2F] dark:text-[#BAC095]">
                    Bukti Penyelesaian Wajib
                  </span>
                  <h3 className="text-base font-bold mt-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
                    Upload Bukti: {subtask.nama}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Ambil foto langsung, upload file, atau tekan <kbd className="px-1.5 py-0.5 rounded bg-[var(--border-color)] text-[10px] font-mono">Ctrl+V</kbd> untuk screenshot.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)]/60 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <BuktiUpload
                subtaskId={subtask.id}
                currentUrl={subtask.buktiFotoUrl}
                onUploaded={handleBuktiSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal Viewer */}
      <AnimatePresence>
        {showImageModal && subtask.buktiFotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-2xl w-full rounded-3xl overflow-hidden bg-black/40 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={subtask.buktiFotoUrl}
                alt={`Bukti: ${subtask.nama}`}
                className="w-full max-h-[75vh] object-contain"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              <div
                className="p-4 text-sm text-white font-medium flex items-center justify-between"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
              >
                <span>{subtask.nama}</span>
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                  ✓ Bukti Terverifikasi
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uncheck Status Confirmation Modal */}
      <AnimatePresence>
        {showUncheckModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => !isLoading && setShowUncheckModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>

              <h4 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Batalkan Status Selesai?
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
                Tugas &ldquo;{subtask.nama}&rdquo; akan diubah kembali menjadi belum selesai.
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowUncheckModal(false)}
                  className="flex-1 h-10 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmUncheck}
                  className="flex-1 h-10 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Ya, Batalkan'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
