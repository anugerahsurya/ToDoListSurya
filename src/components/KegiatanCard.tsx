'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Kegiatan } from '@/lib/types';
import { getDeadlineStatus, getDeadlineBadgeClass, getDeadlineLabel, formatTitleCase } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface KegiatanCardProps {
  kegiatan: Kegiatan;
  index: number;
  onDelete: (id: string) => void;
}

function ProgressRing({ percent, size = 44 }: { percent: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (percent / 100) * circumference;

  const color = percent === 100 ? '#10b981' : 'var(--color-primary, #2563eb)';

  return (
    <svg width={size} height={size} className="progress-ring flex-shrink-0">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border-color)"
        strokeWidth="3.5"
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Percent text */}
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9.5"
        fontWeight="800"
        fill={color}
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export function KegiatanCard({ kegiatan, index, onDelete }: KegiatanCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const total = kegiatan.totalSubtask || 0;
  const selesai = kegiatan.selesaiSubtask || 0;
  const percent = total > 0 ? (selesai / total) * 100 : 0;
  const isSelesai = kegiatan.status === 'selesai';
  const deadlineStatus = getDeadlineStatus(kegiatan.deadline, isSelesai);
  const badgeClass = getDeadlineBadgeClass(deadlineStatus);
  const deadlineLabel = getDeadlineLabel(kegiatan.deadline, isSelesai);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/todo/kegiatan/${kegiatan.id}`)}
      className="group relative overflow-hidden bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 border border-[var(--border-color)] hover:border-[var(--color-primary)]/50 shadow-sm hover:shadow-xl hover:shadow-[var(--shadow-glow)] transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row: Deadline Badge + Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Deadline status badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${badgeClass}`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {deadlineLabel}
            </span>

            {isSelesai && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Selesai
              </span>
            )}
          </div>

          {/* Action Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              aria-label="Opsi Kegiatan"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-9 z-20 rounded-2xl overflow-hidden shadow-xl min-w-[150px] bg-[var(--bg-card)] border border-[var(--border-color)]"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/todo/kegiatan/${kegiatan.id}`);
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-bold text-left hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-primary)] cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Lihat Sub-Tugas
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(kegiatan.id);
                    }}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-bold text-left hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-red-600 dark:text-red-400 cursor-pointer border-t border-[var(--border-color)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Hapus Kegiatan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title & Description */}
        <div className="flex items-start gap-3.5 mb-4">
          <ProgressRing percent={percent} />
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base leading-snug mb-1 text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
              {formatTitleCase(kegiatan.nama)}
            </h3>
            {kegiatan.deskripsi && (
              <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {kegiatan.deskripsi}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Progress Bar + Subtask Counter */}
      <div className="pt-3 border-t border-[var(--border-color)] mt-2">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 11 3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {total > 0 ? `${selesai} dari ${total} sub-tugas` : 'Belum ada sub-tugas'}
          </span>
          <span className="text-[11px] font-extrabold text-[var(--color-primary)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Detail
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </div>

        {/* Linear Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.04 }}
            style={{
              background:
                percent === 100
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, var(--color-gradient-to), var(--color-gradient-from))',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
