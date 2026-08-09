'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDock } from '@/components/Navigation/AppDock';
import { KegiatanCard } from '@/components/KegiatanCard';
import { AddKegiatanModal } from '@/components/AddKegiatanModal';
import { ReminderBanner } from '@/components/ReminderBanner';
import { ExpandableSearchBar } from '@/components/ExpandableSearchBar';
import { api } from '@/lib/api';
import type { Kegiatan } from '@/lib/types';

const DOCK_ITEMS = [
  {
    id: 'home',
    label: 'Beranda',
    href: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

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

  const handleDeleteKegiatan = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini? Semua sub-task juga akan dihapus.')) return;
    try {
      await api.kegiatan.delete(id);
      setKegiatanList((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert('Gagal menghapus: ' + (err as Error).message);
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
        searchQuery ? k.nama.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  }, [kegiatanList, activeTab, searchQuery]);

  const now = new Date();
  const greeting =
    now.getHours() < 11 ? 'Selamat Pagi' :
    now.getHours() < 15 ? 'Selamat Siang' :
    now.getHours() < 18 ? 'Selamat Sore'  : 'Selamat Malam';

  const activeCount   = kegiatanList.filter((k) => k.status === 'aktif').length;
  const selesaiCount  = kegiatanList.filter((k) => k.status === 'selesai').length;

  const addDockItem = {
    id: 'add',
    label: 'Tambah Kegiatan',
    onClick: () => setIsModalOpen(true),
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  };

  return (
    <>
      <div className="page-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-500 mb-1" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                {greeting} 👋
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {activeCount > 0
                  ? `${activeCount} kegiatan aktif${selesaiCount > 0 ? `, ${selesaiCount} selesai` : ''}`
                  : 'Belum ada kegiatan. Tambahkan yang pertama!'
                }
              </p>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 mt-1">
              <ExpandableSearchBar onSearch={setSearchQuery} />
            </div>
          </div>
        </motion.div>

        {/* Reminder Banner */}
        <ReminderBanner kegiatanList={kegiatanList} />

        {/* Stats Cards */}
        {kegiatanList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { label: 'Total', value: kegiatanList.length, color: '#636B2F', bg: 'rgba(99,107,47,0.1)' },
              { label: 'Aktif', value: activeCount, color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
              { label: 'Selesai', value: selesaiCount, color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl p-3 text-center"
                style={{ background: stat.bg, border: `1px solid ${stat.color}30` }}
              >
                <p className="text-2xl font-black" style={{ color: stat.color, fontWeight: 900 }}>
                  {stat.value}
                </p>
                <p className="text-xs font-600 mt-0.5" style={{ color: stat.color, fontWeight: 600 }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-5"
        >
          {([
            ['semua', 'Semua'],
            ['aktif', 'Aktif'],
            ['selesai', 'Selesai'],
          ] as [FilterTab, string][]).map(([key, label]) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key)}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl text-sm font-600 transition-all"
              style={{
                fontWeight: 600,
                background: activeTab === key ? '#636B2F' : 'var(--bg-surface)',
                color: activeTab === key ? 'white' : 'var(--text-secondary)',
                border: `1.5px solid ${activeTab === key ? '#636B2F' : 'var(--border-color)'}`,
              }}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-4 h-28 shimmer" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#fee2e2' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-sm font-600 text-red-600 mb-1" style={{ fontWeight: 600 }}>Gagal memuat data</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{error}</p>
            <button
              onClick={fetchKegiatan}
              className="px-4 py-2 rounded-xl text-sm font-600 text-white"
              style={{ background: '#636B2F', fontWeight: 600 }}
            >
              Coba Lagi
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #D4DE95, #BAC095)' }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3D4127" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </motion.div>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {searchQuery ? 'Tidak ada hasil' : 'Belum ada kegiatan'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {searchQuery
                ? `Tidak ada kegiatan yang cocok dengan "${searchQuery}"`
                : 'Mulai dengan menambahkan kegiatan pertama Anda'
              }
            </p>
            {!searchQuery && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-white flex items-center gap-2 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, #636B2F, #4a5222)',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(99,107,47,0.4)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Kegiatan
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Kegiatan Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((kegiatan, index) => (
                <KegiatanCard
                  key={kegiatan.id}
                  kegiatan={kegiatan}
                  index={index}
                  onDelete={handleDeleteKegiatan}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed right-5 bottom-24 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #636B2F, #4a5222)',
          boxShadow: '0 6px 24px rgba(99,107,47,0.45)',
        }}
        aria-label="Tambah kegiatan"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </motion.button>

      {/* Dock */}
      <AppDock items={[...DOCK_ITEMS, addDockItem]} />

      {/* Modal */}
      <AddKegiatanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddKegiatan}
      />
    </>
  );
}
