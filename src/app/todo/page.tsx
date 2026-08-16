'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopNavbar } from '@/components/Navigation/TopNavbar';
import { KegiatanCard } from '@/components/KegiatanCard';
import { AddKegiatanModal } from '@/components/AddKegiatanModal';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { ReminderBanner } from '@/components/ReminderBanner';
import { api } from '@/lib/api';
import type { Kegiatan } from '@/lib/types';

type FilterTab = 'semua' | 'aktif' | 'selesai';

export default function HomePage() {
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');

  const fetchKegiatan = async () => {
    try {
      setError(null);
      const data = await api.kegiatan.list();
      setKegiatanList(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleAddKegiatan = async (data: Omit<Kegiatan, 'id' | 'createdAt'>) => {
    const newKegiatan = await api.kegiatan.create(data);
    setKegiatanList((prev) => [newKegiatan, ...prev]);
  };

  const [itemToDelete, setItemToDelete] = useState<Kegiatan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteModal = (id: string) => {
    const item = kegiatanList.find((k) => k.id === id);
    if (item) setItemToDelete(item);
  };

  const handleConfirmDeleteKegiatan = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.kegiatan.delete(itemToDelete.id);
      setKegiatanList((prev) => prev.filter((k) => k.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      alert('Gagal menghapus: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return kegiatanList
      .filter((k) => {
        if (activeTab === 'aktif') return k.status === 'aktif';
        if (activeTab === 'selesai') return k.status === 'selesai';
        return true;
      })
      .filter((k) =>
        searchQuery
          ? k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (k.deskripsi && k.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
          : true
      );
  }, [kegiatanList, activeTab, searchQuery]);

  const activeCount = kegiatanList.filter((k) => k.status === 'aktif').length;
  const selesaiCount = kegiatanList.filter((k) => k.status === 'selesai').length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Top Navbar */}
      <TopNavbar activeTab="todo" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Centered Hero Header (Screenshot Style) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
        >
          <p className="text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-[var(--color-primary)] mb-2">
            JADWAL & MANAJEMEN TUGAS
          </p>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
            To Do List Kegiatan Surya
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Pantau jadwal kegiatan kantor harian, breakdown sub-tugas, tenggat waktu deadline, dan verifikasi bukti foto secara terstruktur.
          </p>
        </motion.div>

        {/* Reminder Banner */}
        <ReminderBanner kegiatanList={kegiatanList} />

        {/* Action Toolbar Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="text-xs sm:text-sm font-extrabold text-[var(--text-secondary)]">
            Daftar Kegiatan ({filtered.length} item)
          </div>

          {/* Primary Action: Tambah Kegiatan */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[var(--shadow-glow)] transition-all cursor-pointer"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Kegiatan Baru</span>
          </motion.button>
        </div>

        {/* Search & Filter Counter Bar (Matching Reference Screenshot Design) */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-3 sm:p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kegiatan atau deskripsi..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Counter Pills (Right side like reference image) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'semua', label: 'Semua', count: kegiatanList.length },
                { key: 'aktif', label: 'Aktif', count: activeCount },
                { key: 'selesai', label: 'Selesai', count: selesaiCount },
              ].map((pill) => {
                const isActive = activeTab === pill.key;
                return (
                  <button
                    key={pill.key}
                    onClick={() => setActiveTab(pill.key as FilterTab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md shadow-[var(--shadow-glow)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-3xl shimmer" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/40 p-6"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-red-100 text-red-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm font-bold text-red-600 mb-1">Gagal memuat data kegiatan</p>
            <p className="text-xs mb-4 text-[var(--text-muted)]">{error}</p>
            <button
              onClick={fetchKegiatan}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] cursor-pointer"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-8"
          >
            <div className="w-18 h-18 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-1">
              {searchQuery || activeTab !== 'semua'
                ? 'Tidak ada kegiatan yang sesuai filter'
                : 'Belum ada kegiatan'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              {searchQuery || activeTab !== 'semua'
                ? 'Coba ubah kata kunci pencarian atau reset filter untuk melihat kegiatan lain.'
                : 'Mulai kelola tugas dan progres pekerjaan kantor Anda dengan menambahkan kegiatan baru.'}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[var(--shadow-glow)] transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Kegiatan Pertama
            </motion.button>
          </motion.div>
        )}

        {/* Kegiatan Grid (Anti-AI Slop Bespoke Grid) */}
        {!isLoading && !error && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((kegiatan, index) => (
                <KegiatanCard
                  key={kegiatan.id}
                  kegiatan={kegiatan}
                  index={index}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Add Modal */}
      <AddKegiatanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKegiatan}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title="Hapus Kegiatan?"
        description="Apakah Anda yakin ingin menghapus kegiatan ini? Seluruh sub-tugas dan bukti terkait akan dihapus secara permanen."
        itemName={itemToDelete?.nama}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleConfirmDeleteKegiatan}
      />
    </div>
  );
}
