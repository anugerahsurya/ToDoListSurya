import { useState } from 'react';

interface ProgresFiltersProps {
  kegiatanOptions: { id: number, label: string }[];
  mingguOptions: string[];
  activeKegiatan: number | null; // null means Semua
  activeMinggu: string | null;
  activeStatus: 'semua' | 'belum' | 'sudah';
  onKegiatanChange: (id: number | null) => void;
  onMingguChange: (minggu: string | null) => void;
  onStatusChange: (status: 'semua' | 'belum' | 'sudah') => void;
}

export function ProgresFilters({
  kegiatanOptions,
  mingguOptions,
  activeKegiatan,
  activeMinggu,
  activeStatus,
  onKegiatanChange,
  onMingguChange,
  onStatusChange
}: ProgresFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
      
      {/* Kegiatan Dropdown */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Filter Kegiatan
        </label>
        <select
          value={activeKegiatan === null ? '' : activeKegiatan}
          onChange={(e) => onKegiatanChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full h-11 px-4 rounded-xl border border-[var(--border-color)] bg-transparent text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-colors shadow-sm appearance-none cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%237B8FB5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
        >
          <option value="">Semua Kegiatan</option>
          {kegiatanOptions.map((k) => (
            <option key={k.id} value={k.id}>{k.id}. {k.label}</option>
          ))}
        </select>
      </div>

      {/* Minggu Dropdown */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Filter Minggu
        </label>
        <select
          value={activeMinggu || ''}
          onChange={(e) => onMingguChange(e.target.value || null)}
          className="w-full h-11 px-4 rounded-xl border border-[var(--border-color)] bg-transparent text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-colors shadow-sm appearance-none cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%237B8FB5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
        >
          <option value="">Semua Minggu</option>
          {mingguOptions.map((m) => (
            <option key={m} value={m}>Minggu {m.replace('-', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex-shrink-0">
        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Status Submit
        </label>
        <div className="flex bg-[var(--bg-surface)] border border-[var(--border-color)] p-1 rounded-xl shadow-sm h-11 items-center">
          {(['semua', 'belum', 'sudah'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-4 h-full rounded-lg text-[13px] font-bold capitalize transition-all ${
                activeStatus === status 
                  ? 'bg-white dark:bg-[#1B2A4A] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
