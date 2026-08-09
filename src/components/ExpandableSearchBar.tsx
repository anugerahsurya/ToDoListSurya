'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandableSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  expandedWidth?: string;
}

export function ExpandableSearchBar({
  placeholder = 'Cari kegiatan...',
  onSearch,
  expandedWidth = '260px',
}: ExpandableSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setValue('');
      onSearch('');
    }
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setValue('');
    onSearch('');
  };

  return (
    <motion.div
      className="relative flex items-center"
      animate={{ width: isExpanded ? expandedWidth : '44px' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ overflow: 'hidden' }}
    >
      <div
        className="
          flex items-center h-11 rounded-full
          border transition-colors duration-200 w-full
        "
        style={{
          background: isExpanded ? 'var(--bg-card)' : 'var(--bg-surface)',
          borderColor: isExpanded ? 'var(--border-focus)' : 'var(--border-color)',
          boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
        }}
      >
        {/* Search icon button */}
        <button
          onClick={() => !isExpanded && setIsExpanded(true)}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Buka pencarian"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        {/* Input */}
        <AnimatePresence>
          {isExpanded && (
            <motion.input
              ref={inputRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="
                flex-1 bg-transparent text-sm outline-none pr-2
                placeholder:text-[var(--text-muted)]
              "
              style={{ color: 'var(--text-primary)' }}
            />
          )}
        </AnimatePresence>

        {/* Close button */}
        <AnimatePresence>
          {isExpanded && value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-1 rounded-full transition-colors hover:bg-[var(--border-color)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Hapus pencarian"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Collapse button */}
        <AnimatePresence>
          {isExpanded && !value && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-1 rounded-full hover:bg-[var(--border-color)]"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Tutup pencarian"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
