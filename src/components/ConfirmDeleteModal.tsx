'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  description,
  itemName,
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900/60">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mb-1 leading-snug">
            {title}
          </h3>

          {itemName && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 truncate">
              &ldquo;{itemName}&rdquo;
            </p>
          )}

          <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 h-10 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className="flex-1 h-10 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Hapus'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
