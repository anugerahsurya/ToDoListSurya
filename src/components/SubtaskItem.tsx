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
  const [showBukti, setShowBukti] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggle(subtask.id, !subtask.selesai);
    setIsLoading(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
      className="group"
    >
      <div
        className="flex items-start gap-3 p-3 rounded-xl transition-colors"
        style={{
          background: subtask.selesai ? 'var(--bg-surface)' : 'transparent',
        }}
      >
        {/* Checkbox */}
        <motion.button
          onClick={handleToggle}
          disabled={isLoading}
          whileTap={{ scale: 0.85 }}
          className="flex-shrink-0 mt-0.5"
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
                className="w-5 h-5 rounded-md flex items-center justify-center"
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
                className="w-5 h-5 rounded-md border-2 hover:border-primary-500 transition-colors"
                style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-snug transition-all"
            style={{
              color: subtask.selesai ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: subtask.selesai ? 'line-through' : 'none',
              fontWeight: subtask.selesai ? 400 : 500,
            }}
          >
            {subtask.nama}
          </p>

          {/* Bukti foto thumbnail */}
          {subtask.buktiFotoUrl && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowImageModal(true)}
              className="mt-1.5 flex items-center gap-1.5 text-xs hover:underline"
              style={{ color: '#636B2F' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Lihat Bukti
            </motion.button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Upload bukti */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowBukti(!showBukti)}
            data-tooltip="Tambah Bukti"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--border-color)]"
            style={{ color: subtask.buktiFotoUrl ? '#636B2F' : 'var(--text-muted)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </motion.button>

          {/* Delete */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onDelete(subtask.id)}
            data-tooltip="Hapus"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Bukti upload panel */}
      <AnimatePresence>
        {showBukti && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden px-3 pb-3"
          >
            <BuktiUpload
              subtaskId={subtask.id}
              currentUrl={subtask.buktiFotoUrl}
              onUploaded={(url) => {
                onBuktiUploaded(subtask.id, url);
                setShowBukti(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && subtask.buktiFotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={subtask.buktiFotoUrl}
                alt={`Bukti: ${subtask.nama}`}
                className="w-full object-contain max-h-[70vh]"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-sm text-white font-medium"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                {subtask.nama}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
