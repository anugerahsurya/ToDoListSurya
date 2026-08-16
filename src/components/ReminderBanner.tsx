'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Kegiatan } from '@/lib/types';
import { getDeadlineStatus } from '@/lib/types';
import { useState } from 'react';

interface ReminderBannerProps {
  kegiatanList: Kegiatan[];
}

export function ReminderBanner({ kegiatanList }: ReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Filter: hanya yang aktif dan overdue/today/tomorrow
  const urgent = kegiatanList.filter((k) => {
    if (k.status === 'selesai') return false;
    const st = getDeadlineStatus(k.deadline, false);
    return st === 'overdue' || st === 'today' || st === 'tomorrow';
  });

  if (dismissed || urgent.length === 0) return null;

  const overdues  = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'overdue');
  const todays    = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'today');
  const tomorrows = urgent.filter((k) => getDeadlineStatus(k.deadline, false) === 'tomorrow');

  return (
    <AnimatePresence>
      <motion.div
        key="reminder-banner"
        className="mb-6 rounded-2xl overflow-hidden shadow-sm"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background:
            overdues.length > 0
              ? 'linear-gradient(135deg, rgba(254,242,242,0.9), rgba(255,247,237,0.9))'
              : 'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(240,253,244,0.95))',
          border:
            overdues.length > 0
              ? '1px solid #fca5a5'
              : '1px solid #bfdbfe',
        }}
      >
        <div className="p-4 sm:p-4.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Alert / Bell Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  overdues.length > 0
                    ? 'bg-rose-100 text-rose-600 border border-rose-200'
                    : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}
              >
                {overdues.length > 0 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                )}
              </div>

              <div>
                <p
                  className="text-xs sm:text-sm font-extrabold mb-1"
                  style={{ color: overdues.length > 0 ? '#991b1b' : '#1e40af' }}
                >
                  {overdues.length > 0 ? 'Perhatian: Ada kegiatan yang melewati tenggat waktu!' : 'Pengingat Deadline Kegiatan'}
                </p>

                <ul className="space-y-1">
                  {overdues.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-rose-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                      <span>{k.nama}</span>
                      <span className="text-rose-500 font-bold">— Melewati batas waktu</span>
                    </li>
                  ))}
                  {todays.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-amber-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span>{k.nama}</span>
                      <span className="text-amber-600 font-bold">— Hari ini</span>
                    </li>
                  ))}
                  {tomorrows.map((k) => (
                    <li key={k.id} className="text-xs flex items-center gap-1.5 text-blue-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{k.nama}</span>
                      <span className="text-blue-600 font-bold">— Besok</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10 text-slate-500 cursor-pointer"
              aria-label="Tutup pengingat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
