'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { AppDock } from '@/components/Navigation/AppDock';
import { SubtaskItem } from '@/components/SubtaskItem';
import { api } from '@/lib/api';
import type { Kegiatan, Subtask } from '@/lib/types';
import { getDeadlineStatus, getDeadlineBadgeClass, getDeadlineLabel } from '@/lib/types';

export default function KegiatanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [isSavingSubtask, setIsSavingSubtask] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [k, s] = await Promise.all([
          api.kegiatan.get(id),
          api.subtask.list(id),
        ]);
        setKegiatan(k);
        setSubtasks(s);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (isAddingSubtask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingSubtask]);

  const handleToggleSubtask = async (subtaskId: string, selesai: boolean) => {
    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, selesai } : s))
    );
    await api.subtask.update(subtaskId, { selesai });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
    await api.subtask.delete(subtaskId);
  };

  const handleBuktiUploaded = (subtaskId: string, url: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, buktiFotoUrl: url } : s))
    );
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim() || !kegiatan) return;
    setIsSavingSubtask(true);
    try {
      const newSub = await api.subtask.create({
        kegiatanId: kegiatan.id,
        nama: newSubtaskName.trim(),
        selesai: false,
      });
      setSubtasks((prev) => [...prev, newSub]);
      setNewSubtaskName('');
      setIsAddingSubtask(false);
    } finally {
      setIsSavingSubtask(false);
    }
  };

  const handleMarkAllDone = async () => {
    if (!kegiatan) return;
    setIsMarkingDone(true);
    try {
      await api.kegiatan.update(id, { status: 'selesai' });
      setKegiatan((prev) => prev ? { ...prev, status: 'selesai' } : prev);
    } finally {
      setIsMarkingDone(false);
    }
  };

  const total = subtasks.length;
  const selesai = subtasks.filter((s) => s.selesai).length;
  const percent = total > 0 ? (selesai / total) * 100 : 0;

  const dockItems = [
    {
      id: 'back',
      label: 'Kembali',
      onClick: () => router.back(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
        </svg>
      ),
    },
    {
      id: 'add-subtask',
      label: 'Tambah Tugas',
      onClick: () => setIsAddingSubtask(true),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      ),
    },
    {
      id: 'done',
      label: 'Selesaikan',
      onClick: handleMarkAllDone,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="h-8 w-48 rounded-xl shimmer mb-4" />
        <div className="h-4 w-64 rounded-xl shimmer mb-8" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-xl shimmer mb-3" />
        ))}
        <AppDock items={dockItems} />
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <p style={{ color: 'var(--text-muted)' }}>Kegiatan tidak ditemukan</p>
        <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 rounded-xl text-sm text-white"
          style={{ background: '#636B2F' }}>Kembali</button>
        <AppDock items={dockItems} />
      </div>
    );
  }

  const dlStatus = getDeadlineStatus(kegiatan.deadline, kegiatan.status === 'selesai');
  const dlBadge = getDeadlineBadgeClass(dlStatus);
  const dlLabel = getDeadlineLabel(kegiatan.deadline, kegiatan.status === 'selesai');

  return (
    <>
      <div className="page-container">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-5 text-sm font-600 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </motion.button>

        {/* Kegiatan header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold leading-snug mb-2 text-balance"
                style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                {kegiatan.nama}
              </h1>

              {kegiatan.deskripsi && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  {kegiatan.deskripsi}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-600 px-2.5 py-1 rounded-full ${dlBadge}`}
                  style={{ fontWeight: 600 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {dlLabel}
                </span>

                {kegiatan.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1 text-xs font-600 px-2.5 py-1 rounded-full badge-done"
                    style={{ fontWeight: 600 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Selesai
                  </span>
                )}
              </div>
            </div>

            {/* Mark as done */}
            {kegiatan.status !== 'selesai' && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleMarkAllDone}
                disabled={isMarkingDone}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-700 text-white flex items-center gap-1.5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
                  opacity: isMarkingDone ? 0.7 : 1,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Selesai
              </motion.button>
            )}
          </div>

          {/* Progress */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-600" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                Progress Sub-Tugas
              </span>
              <span className="text-sm font-bold" style={{ color: '#636B2F', fontWeight: 700 }}>
                {selesai}/{total}
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  background: percent === 100
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #D4DE95, #636B2F)',
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {percent === 100 ? '🎉 Semua tugas selesai!' :
               percent > 0 ? `${Math.round(percent)}% selesai` :
               'Belum ada tugas yang selesai'}
            </p>
          </div>
        </motion.div>

        {/* Subtask List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
              SUB-TUGAS
            </h2>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
              style={{
                background: 'rgba(99,107,47,0.1)',
                color: '#636B2F',
                fontWeight: 600,
                border: '1px solid rgba(99,107,47,0.2)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah
            </motion.button>
          </div>

          <AnimatePresence mode="popLayout">
            {subtasks.map((subtask, index) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                index={index}
                onToggle={handleToggleSubtask}
                onDelete={handleDeleteSubtask}
                onBuktiUploaded={handleBuktiUploaded}
              />
            ))}
          </AnimatePresence>

          {/* Empty subtasks */}
          {subtasks.length === 0 && !isAddingSubtask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Belum ada sub-tugas. Tambahkan sekarang!
              </p>
            </motion.div>
          )}

          {/* Add subtask input */}
          <AnimatePresence>
            {isAddingSubtask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-5 h-5 rounded-md border-2 flex-shrink-0" style={{ borderColor: 'var(--border-color)' }} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                      if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskName(''); }
                    }}
                    placeholder="Nama sub-tugas..."
                    className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-focus)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddSubtask}
                    disabled={isSavingSubtask || !newSubtaskName.trim()}
                    className="h-10 px-4 rounded-xl text-sm font-700 text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{ background: '#636B2F', fontWeight: 700 }}
                  >
                    {isSavingSubtask ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                      />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    Simpan
                  </motion.button>
                  <button
                    onClick={() => { setIsAddingSubtask(false); setNewSubtaskName(''); }}
                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <p className="text-xs mt-1.5 ml-7" style={{ color: 'var(--text-muted)' }}>
                  Tekan <kbd className="px-1 rounded text-[10px] font-mono"
                    style={{ background: 'var(--border-color)' }}>Enter</kbd> untuk simpan,{' '}
                  <kbd className="px-1 rounded text-[10px] font-mono"
                    style={{ background: 'var(--border-color)' }}>Esc</kbd> untuk batal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dock */}
      <AppDock items={dockItems} />
    </>
  );
}
