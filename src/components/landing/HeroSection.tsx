'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center mb-8 relative z-10 pt-2 sm:pt-4">
      {/* Top Eyebrow Chip */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)] text-[11px] font-bold uppercase tracking-wider mb-5 shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
        Sistem Manajemen & Aktualisasi
      </motion.div>

      {/* Avatar / Monogram with Custom Emblem */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white ring-4 ring-white dark:ring-slate-900"
        style={{
          background: `linear-gradient(135deg, var(--color-gradient-from), var(--color-gradient-to))`,
          boxShadow: `0 8px 24px var(--shadow-glow)`,
        }}
      >
        <span className="text-2xl sm:text-3xl font-black tracking-tight">AS</span>
      </motion.div>

      {/* Name & Role */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-1 tracking-tight">
          Anugerah Surya Atmaja
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-[var(--color-primary)] mb-4">
          CPNS Golongan III Angkatan 17
        </p>
      </motion.div>

      {/* Project Title Card */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs hover:shadow-md transition-shadow text-left sm:text-center relative overflow-hidden">
          <p className="text-[10.5px] text-[var(--text-muted)] font-extrabold mb-1 uppercase tracking-wider flex items-center justify-start sm:justify-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Judul Proyek Aktualisasi
          </p>
          <p className="text-xs sm:text-[13px] font-bold text-[var(--text-primary)] leading-relaxed">
            Pembangunan Dashboard Sosio-Ekonomi (Rangkiang) Berbasis Web
          </p>
        </div>
      </motion.div>
    </div>
  );
}
