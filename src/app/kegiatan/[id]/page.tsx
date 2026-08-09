'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { AppDock } from '@/components/Navigation/AppDock';
import { SubtaskItem } from '@/components/SubtaskItem';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
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

  const [subtaskToDelete, setSubtaskToDelete] = useState<Subtask | null>(null);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

  const handleOpenDeleteSubtask = (subtaskId: string) => {
    const item = subtasks.find((s) => s.id === subtaskId);
    if (item) setSubtaskToDelete(item);
  };

  const handleConfirmDeleteSubtask = async () => {
    if (!subtaskToDelete) return;
    setIsDeletingSubtask(true);
    try {
      await api.subtask.delete(subtaskToDelete.id);
      setSubtasks((prev) => prev.filter((s) => s.id !== subtaskToDelete.id));
      setSubtaskToDelete(null);
    } catch (err) {
      alert('Gagal menghapus tugas: ' + (err as Error).message);
    } finally {
      setIsDeletingSubtask(false);
    }
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completeWarning, setCompleteWarning] = useState<string | null>(null);

  const total = subtasks.length;
  const selesai = subtasks.filter((s) => s.selesai).length;
  const percent = total > 0 ? (selesai / total) * 100 : 0;
  const isAllDone = total > 0 && selesai === total && kegiatan?.status !== 'selesai';

  const handleOpenCompleteConfirm = () => {
    if (total === 0) {
      setCompleteWarning('Tambahkan dan selesaikan minimal 1 sub-tugas beserta bukti foto terlebih dahulu!');
      setTimeout(() => setCompleteWarning(null), 4000);
      return;
    }
    if (selesai < total) {
      setCompleteWarning(`Masih ada ${total - selesai} sub-tugas yang belum selesai dengan bukti foto!`);
      setTimeout(() => setCompleteWarning(null), 4000);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmFinish = async () => {
    if (!kegiatan || !isAllDone) return;
    setIsMarkingDone(true);
    try {
      await api.kegiatan.update(id, { status: 'selesai' });
      setKegiatan((prev) => prev ? { ...prev, status: 'selesai' } : prev);
      setShowConfirmModal(false);
    } finally {
      setIsMarkingDone(false);
    }
  };

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
    ...(kegiatan?.status !== 'selesai' ? [
      {
        id: 'done',
        label: isAllDone ? 'Selesaikan Kegiatan' : 'Belum Selesai Semua',
        onClick: handleOpenCompleteConfirm,
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ),
      }
    ] : []),
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
        <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 rounded-xl text-sm text-white cursor-pointer"
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
        {/* Warning notification */}
        <AnimatePresence>
          {completeWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{completeWarning}</span>
              </div>
              <button
                onClick={() => setCompleteWarning(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-5 text-sm font-semibold hover:opacity-75 transition-opacity cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
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
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${dlBadge}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {dlLabel}
                </span>

                {kegiatan.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full badge-done">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Kegiatan Selesai
                  </span>
                )}
              </div>
            </div>

            {/* Mark as done button */}
            {kegiatan.status !== 'selesai' && (
              <div className="relative group">
                <motion.button
                  whileTap={isAllDone ? { scale: 0.92 } : undefined}
                  onClick={handleOpenCompleteConfirm}
                  disabled={isMarkingDone}
                  className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isAllDone
                      ? 'bg-[#16a34a] hover:bg-[#15803d] text-white cursor-pointer'
                      : 'bg-[var(--border-color)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Selesaikan
                </motion.button>
              </div>
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
                onDelete={handleOpenDeleteSubtask}
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
                    className="h-10 px-4 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    style={{ background: '#636B2F' }}
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
                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)] transition-colors cursor-pointer"
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

      {/* Complete Project Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && kegiatan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Selesaikan Kegiatan Ini?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Seluruh <b>{total} sub-tugas</b> telah diverifikasi selesai beserta bukti foto. Kegiatan &ldquo;{kegiatan.nama}&rdquo; akan ditandai sebagai selesai.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirmFinish}
                  disabled={isMarkingDone}
                  className="flex-1 h-11 rounded-xl text-sm font-bold bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {isMarkingDone ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Ya, Selesaikan'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Subtask Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!subtaskToDelete}
        title="Hapus Sub-Tugas?"
        description="Apakah Anda yakin ingin menghapus sub-tugas ini? Bukti foto yang sudah diupload juga tidak akan ditautkan lagi."
        itemName={subtaskToDelete?.nama}
        isLoading={isDeletingSubtask}
        onClose={() => !isDeletingSubtask && setSubtaskToDelete(null)}
        onConfirm={handleConfirmDeleteSubtask}
      />
    </>
  );
}
