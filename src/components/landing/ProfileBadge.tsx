import { motion } from 'framer-motion';

export function ProfileBadge() {
  return (
    <motion.a
      href="https://rangkiang.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer bg-white dark:bg-[#101a33] border border-[var(--border-color)]"
    >
      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>
      <span className="text-xs font-bold text-[var(--color-primary)] tracking-wide">
        rangkiang.vercel.app
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </motion.a>
  );
}
