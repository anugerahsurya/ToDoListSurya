'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Kegiatan } from '@/lib/types';
import { getDeadlineStatus, getDeadlineBadgeClass, getDeadlineLabel } from '@/lib/types';
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

  const color = percent === 100 ? '#22c55e' : percent >= 50 ? '#636B2F' : '#BAC095';

  return (
    <svg width={size} height={size} className="progress-ring flex-shrink-0">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--border-color)" strokeWidth="3"
      />
      {/* Progress */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Percent text */}
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="9" fontWeight="700" fill={color}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      onClick={() => router.push(`/kegiatan/${kegiatan.id}`)}
      className="glass-card rounded-2xl p-4 cursor-pointer relative overflow-hidden group"
    >
      {/* Status ribbon */}
      {isSelesai && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-3 right-[-14px] w-16 text-center text-[9px] font-bold text-white py-0.5 rotate-45"
            style={{ background: '#22c55e' }}>
            SELESAI
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Progress ring */}
        <ProgressRing percent={percent} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-700 text-sm leading-snug mb-1 text-balance"
            style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {kegiatan.nama}
          </h3>

          {kegiatan.deskripsi && (
            <p className="text-xs mb-2 line-clamp-2"
              style={{ color: 'var(--text-muted)' }}>
              {kegiatan.deskripsi}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Deadline badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-600 px-2 py-0.5 rounded-full ${badgeClass}`}
              style={{ fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {deadlineLabel}
            </span>

            {/* Subtask count */}
            {total > 0 && (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {selesai}/{total} tugas
              </span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--border-color)]/60 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Opsi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-10 rounded-2xl overflow-hidden shadow-xl min-w-[140px]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <button
                  onClick={() => { setShowMenu(false); router.push(`/kegiatan/${kegiatan.id}`); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Lihat Detail
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(kegiatan.id); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Hapus
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
          style={{
            background: percent === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #BAC095, #636B2F)',
          }}
        />
      </div>
    </motion.div>
  );
}
