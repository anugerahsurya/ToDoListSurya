'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNavbar } from '@/components/Navigation/TopNavbar';
import { ProgresTable } from '@/components/progres/ProgresTable';
import { BuktiDukungUpload } from '@/components/progres/BuktiDukungUpload';
import { GanttTimeline } from '@/components/progres/GanttTimeline';
import { CalendarExport } from '@/components/progres/CalendarExport';
import { api } from '@/lib/api';
import type { ProgresItem } from '@/lib/types';

type ViewMode = 'tabel' | 'gantt';

export default function ProgresPage() {
  const [items, setItems] = useState<ProgresItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab (Tabel vs Gantt)
  const [viewMode, setViewMode] = useState<ViewMode>('tabel');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKegiatan, setActiveKegiatan] = useState<number | null>(null);
  const [activeMinggu, setActiveMinggu] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<'semua' | 'belum' | 'sudah'>('semua');

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTahapanId, setSelectedTahapanId] = useState<string | null>(null);
  const [selectedTahapanName, setSelectedTahapanName] = useState('');

  const fetchData = async () => {
    try {
      setError(null);
      const data = await api.progres.list();
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (
    fileType: 'image' | 'pdf' | 'link',
    payload: { base64?: string; url?: string; filename?: string }
  ) => {
    if (!selectedTahapanId) return;

    await api.progresBukti.upload(
      selectedTahapanId,
      payload.base64,
      payload.filename || `bukti_${selectedTahapanId}`,
      fileType,
      payload.url
    );

    fetchData();
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.tahapanKegiatan.toLowerCase().includes(query) &&
          !item.kegiatan.toLowerCase().includes(query) &&
          !item.outputHasil.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Filters
      if (activeKegiatan !== null && item.noKegiatan !== activeKegiatan) return false;
      if (
        activeMinggu !== null &&
        item.mingguAwal !== activeMinggu &&
        item.mingguAkhir !== activeMinggu
      ) {
        return false;
      }

      if (activeStatus === 'belum' && item.statusSubmit === 'Sudah Submit') return false;
      if (activeStatus === 'sudah' && item.statusSubmit === 'Belum Submit') return false;

      return true;
    });
  }, [items, searchQuery, activeKegiatan, activeMinggu, activeStatus]);

  // Generate options from data
  const kegiatanOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.noKegiatan)));
    return unique.sort().map((no) => ({
      id: no,
      label: items.find((i) => i.noKegiatan === no)?.kegiatan || `Kegiatan ${no}`,
    }));
  }, [items]);

  const mingguOptions = useMemo(() => {
    const unique = new Set<string>();
    items.forEach((i) => {
      if (i.mingguAwal) unique.add(i.mingguAwal);
      if (i.mingguAkhir) unique.add(i.mingguAkhir);
    });
    return Array.from(unique).sort((a, b) => {
      if (a.includes('Agustus') && b.includes('September')) return -1;
      if (a.includes('September') && b.includes('Agustus')) return 1;
      return a.localeCompare(b);
    });
  }, [items]);

  const stats = {
    totalTahapan: items.length,
    sudahSubmit: items.filter((i) => i.statusSubmit === 'Sudah Submit').length,
    belumSubmit: items.filter((i) => i.statusSubmit === 'Belum Submit').length,
  };

  const openUploadModal = (id: string, name: string) => {
    setSelectedTahapanId(id);
    setSelectedTahapanName(name);
    setUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Top Navbar */}
      <TopNavbar activeTab="progres" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Centered Hero Header (Refined Reference Style) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          {/* Eyebrow */}
          <p className="text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-[var(--color-primary)] mb-2">
            JADWAL & TAHAPAN AKTUALISASI
          </p>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
            Progres Rancangan Aktualisasi
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            Pantau ketersediaan output, timeline pengerjaan, dan riwayat bukti dukung 24 tahapan aktualisasi secara terstruktur.
          </p>

          {/* Rangkiang External Link Pill (Placed here on Progres page) */}
          <div className="inline-flex items-center justify-center">
            <a
              href="https://rangkiang.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-accent-light)] dark:bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--color-primary)] text-xs font-bold hover:shadow-sm transition-all shadow-xs group"
            >
              <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <span>Website Rangkiang: rangkiang.vercel.app</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Action Toolbar & Tab Switcher (Matching Screenshot) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
            <button
              onClick={() => setViewMode('tabel')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'tabel'
                  ? 'bg-white dark:bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm border border-[var(--border-color)] dark:border-[var(--color-primary)]/40'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Tabel Jadwal Tahapan
            </button>

            <button
              onClick={() => setViewMode('gantt')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'gantt'
                  ? 'bg-white dark:bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm border border-[var(--border-color)] dark:border-[var(--color-primary)]/40'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Tampilan Gantt Timeline
            </button>
          </div>

          {/* Right Action: Export ICS Calendar */}
          <div className="flex-shrink-0">
            <CalendarExport items={items} />
          </div>
        </div>

        {/* Search & Filter Bar (Matching Reference Screenshot Design) */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-3 sm:p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul tahapan kegiatan, output hasil, atau nomor..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Counter Pills (Right side like reference image) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'semua', label: 'Semua', count: stats.totalTahapan },
                { key: 'sudah', label: 'Sudah Submit', count: stats.sudahSubmit },
                { key: 'belum', label: 'Belum Submit', count: stats.belumSubmit },
              ].map((pill) => {
                const isActive = activeStatus === pill.key;
                return (
                  <button
                    key={pill.key}
                    onClick={() => setActiveStatus(pill.key as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-[var(--shadow-glow)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Dropdown Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-[var(--border-color)]">
            <div>
              <label className="block text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Filter Berdasarkan Kegiatan Utama
              </label>
              <select
                value={activeKegiatan === null ? '' : activeKegiatan}
                onChange={(e) => setActiveKegiatan(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="">Semua Kegiatan Utama (1 - 6)</option>
                {kegiatanOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kegiatan {k.id}: {k.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                Filter Berdasarkan Jadwal Minggu
              </label>
              <select
                value={activeMinggu || ''}
                onChange={(e) => setActiveMinggu(e.target.value || null)}
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
              >
                <option value="">Semua Jadwal Minggu</option>
                {mingguOptions.map((m) => (
                  <option key={m} value={m}>
                    Minggu {m.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Section: Loading, Error, or Views */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 p-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-red-600 font-bold mb-3">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div>
            {viewMode === 'tabel' ? (
              <ProgresTable items={filteredItems} onUploadClick={openUploadModal} />
            ) : (
              <GanttTimeline items={items} />
            )}
          </div>
        )}
      </main>

      {/* Modal Upload Bukti */}
      <BuktiDukungUpload
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
        tahapanName={selectedTahapanName}
      />
    </div>
  );
}
