'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Kegiatan } from '@/lib/types';
import { getDeadlineStatus, getDeadlineLabel } from '@/lib/types';
import { useState } from 'react';

interface ReminderBannerProps {
  kegiatanList: Kegiatan[];
}

export function ReminderBanner({ kegiatanList }: ReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Filter: hanya yang aktif dan overdue/today/tomorrow
  const urgent = kegiatanList.filter((k) => {
    if (k.status === 'selesai') return false;
    const st = getDeadlineStatus(k.deadline, k.status === 'selesai');
    return st === 'overdue' || st === 'today' || st === 'tomorrow';
  });

  if (dismissed || urgent.length === 0) return null;

  const overdues  = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'overdue');
  const todays    = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'today');
  const tomorrows = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'tomorrow');

  return (
    <AnimatePresence>
      <motion.div
        className="reminder-banner mb-6 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: overdues.length > 0
            ? 'linear-gradient(135deg, #fef2f2, #fff7ed)'
            : 'linear-gradient(135deg, #fefce8, #f0fdf4)',
          border: overdues.length > 0
            ? '1px solid #fca5a5'
            : '1px solid #d1fae5',
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Bell icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: overdues.length > 0 ? '#fee2e2' : '#fef3c7',
                  color: overdues.length > 0 ? '#dc2626' : '#d97706',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </motion.div>

              <div>
                <p className="text-sm font-bold mb-1"
                  style={{ color: overdues.length > 0 ? '#991b1b' : '#92400e' }}>
                  {overdues.length > 0 ? '⚠️ Ada kegiatan yang terlambat!' : '⏰ Pengingat Deadline'}
                </p>

                <ul className="space-y-0.5">
                  {overdues.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-red-700">
                      <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                      <span className="font-medium">{k.nama}</span>
                      <span className="text-red-400">— terlambat</span>
                    </li>
                  ))}
                  {todays.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-amber-700">
                      <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="font-medium">{k.nama}</span>
                      <span className="text-amber-500">— hari ini</span>
                    </li>
                  ))}
                  {tomorrows.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-green-700">
                      <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="font-medium">{k.nama}</span>
                      <span className="text-green-600">— besok</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10"
              style={{ color: '#6b7280' }}
              aria-label="Tutup pengingat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
