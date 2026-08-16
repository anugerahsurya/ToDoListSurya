'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface AppCardProps {
  title: string;
  tag: string;
  description: string;
  icon: ReactNode;
  href: string;
  delay?: number;
  highlight?: boolean;
}

export function AppCard({
  title,
  tag,
  description,
  icon,
  href,
  delay = 0,
  highlight = false,
}: AppCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 24 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(href)}
      className={`group relative overflow-hidden cursor-pointer rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
        highlight
          ? 'text-white border-[var(--color-primary)] shadow-xl shadow-[var(--shadow-glow)] hover:shadow-2xl'
          : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/50'
      }`}
      style={
        highlight
          ? {
              background: `linear-gradient(135deg, var(--color-gradient-from), var(--color-primary), var(--color-gradient-to))`,
            }
          : undefined
      }
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div
          className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
            highlight
              ? 'bg-white/20 text-white backdrop-blur-md ring-2 ring-white/30'
              : 'bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)]'
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            highlight
              ? 'bg-white/15 text-white border-white/20'
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-color)]'
          }`}
        >
          {tag}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`text-xl font-extrabold mb-2 tracking-tight ${
          highlight ? 'text-white' : 'text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors'
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-xs sm:text-sm leading-relaxed mb-6 ${
          highlight ? 'text-white/90' : 'text-[var(--text-secondary)]'
        }`}
      >
        {description}
      </p>

      {/* Bottom CTA Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]/50 mt-auto">
        <span
          className={`text-xs font-bold ${
            highlight ? 'text-white/90' : 'text-[var(--color-primary)] font-extrabold'
          }`}
        >
          Buka Modul
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1.5 ${
            highlight
              ? 'bg-white/20 text-white'
              : 'bg-[var(--color-accent-light)] text-[var(--color-primary)]'
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
