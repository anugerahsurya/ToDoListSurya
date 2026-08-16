'use client';

import { generateICS } from '@/lib/calendar';
import type { ProgresItem } from '@/lib/types';
import { motion } from 'framer-motion';

interface CalendarExportProps {
  items: ProgresItem[];
}

export function CalendarExport({ items }: CalendarExportProps) {
  const handleExport = () => {
    if (items.length === 0) return;

    const events = items.map((item) => ({
      title: `Deadline: ${item.tahapanKegiatan}`,
      startDate: item.deadlineStart,
      endDate: item.deadlineEnd,
      description: `Output: ${item.outputHasil}\\n\\nKegiatan: ${item.kegiatan}\\nStatus: ${item.statusSubmit}`,
    }));

    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jadwal_Rancangan_Aktualisasi.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[var(--shadow-glow)] transition-all cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      <span>Ekspor Jadwal (.ics)</span>
    </motion.button>
  );
}
