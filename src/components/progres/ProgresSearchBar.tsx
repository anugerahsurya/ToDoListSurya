import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProgresSearchBarProps {
  onSearch: (query: string) => void;
}

export function ProgresSearchBar({ onSearch }: ProgresSearchBarProps) {
  const [value, setValue] = useState('');

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-md mx-auto sm:mx-0">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari tahapan atau kegiatan..."
        className="w-full h-11 pl-10 pr-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-primary)] placeholder:font-medium placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm focus:shadow-md"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
