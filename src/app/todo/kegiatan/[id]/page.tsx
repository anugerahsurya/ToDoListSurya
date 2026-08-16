'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/Navigation/TopNavbar';
import { SubtaskItem } from '@/components/SubtaskItem';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { api } from '@/lib/api';
import type { Kegiatan, Subtask } from '@/lib/types';
import { getDeadlineStatus, getDeadlineBadgeClass, getDeadlineLabel, formatTitleCase } from '@/lib/types';

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
      setKegiatan((prev) => (prev ? { ...prev, status: 'selesai' } : prev));
      setShowConfirmModal(false);
    } finally {
      setIsMarkingDone(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
        <TopNavbar activeTab="todo" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-48 rounded-xl shimmer mb-4" />
          <div className="h-4 w-64 rounded-xl shimmer mb-8" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl shimmer mb-3" />
          ))}
        </main>
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
        <TopNavbar activeTab="todo" />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-[var(--text-muted)] font-bold mb-4">Kegiatan tidak ditemukan</p>
          <button
            onClick={() => router.push('/todo')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Kembali ke Daftar Kegiatan
          </button>
        </main>
      </div>
    );
  }

  const dlStatus = getDeadlineStatus(kegiatan.deadline, kegiatan.status === 'selesai');
  const dlBadge = getDeadlineBadgeClass(dlStatus);
  const dlLabel = getDeadlineLabel(kegiatan.deadline, kegiatan.status === 'selesai');

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Top Navbar */}
      <TopNavbar activeTab="todo" />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Warning Notification */}
        <AnimatePresence>
          {completeWarning && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{completeWarning}</span>
              </div>
              <button
                onClick={() => setCompleteWarning(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/todo')}
          className="inline-flex items-center gap-2 mb-6 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Kembali ke Daftar Kegiatan</span>
        </motion.button>

        {/* Kegiatan Header Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${dlBadge}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {dlLabel}
                </span>

                {kegiatan.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Kegiatan Selesai
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] leading-snug mb-2">
                {formatTitleCase(kegiatan.nama)}
              </h1>

              {kegiatan.deskripsi && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {kegiatan.deskripsi}
                </p>
              )}
            </div>

            {/* Selesaikan Button */}
            {kegiatan.status !== 'selesai' && (
              <motion.button
                whileTap={isAllDone ? { scale: 0.95 } : undefined}
                onClick={handleOpenCompleteConfirm}
                disabled={isMarkingDone}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md ${
                  isAllDone
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 cursor-pointer'
                    : 'bg-[var(--border-color)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Tandai Selesai Kegiatan</span>
              </motion.button>
            )}
          </div>

          {/* Progress Box */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-[var(--text-secondary)]">Progres Sub-Tugas</span>
              <span className="text-[var(--color-primary)] font-extrabold">
                {selesai} / {total} Tugas Selesai ({Math.round(percent)}%)
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-[var(--border-color)]">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  background:
                    percent === 100
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, var(--color-gradient-to), var(--color-gradient-from))',
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Subtask Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
                Daftar Sub-Tugas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)]">
                {total}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm shadow-[var(--shadow-glow)] transition-all cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Tambah Tugas</span>
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

          {/* Empty Subtasks */}
          {subtasks.length === 0 && !isAddingSubtask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6"
            >
              <p className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] mb-3">
                Belum ada sub-tugas pada kegiatan ini.
              </p>
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-accent-light)] border border-[var(--border-color)] hover:shadow-xs cursor-pointer"
              >
                + Tambah Sub-Tugas Pertama
              </button>
            </motion.div>
          )}

          {/* Add Subtask Inline Form */}
          <AnimatePresence>
            {isAddingSubtask && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-2"
              >
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--color-primary)] shadow-md shadow-[var(--shadow-glow)]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newSubtaskName}
                    onChange={(e) => setNewSubtaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                      if (e.key === 'Escape') {
                        setIsAddingSubtask(false);
                        setNewSubtaskName('');
                      }
                    }}
                    placeholder="Tuliskan nama sub-tugas baru..."
                    className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={isSavingSubtask || !newSubtaskName.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingSubtask ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSubtask(false);
                      setNewSubtaskName('');
                    }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-surface)] cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Selesaikan Kegiatan Confirmation Modal */}
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
              className="w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-color)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h3 className="text-lg font-extrabold mb-1.5 text-[var(--text-primary)]">
                Selesaikan Kegiatan Ini?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                Seluruh <b>{total} sub-tugas</b> telah selesai beserta bukti foto. Kegiatan &ldquo;{kegiatan.nama}&rdquo; akan ditandai selesai.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFinish}
                  disabled={isMarkingDone}
                  className="flex-1 h-11 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {isMarkingDone ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Ya, Selesaikan'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Subtask Modal */}
      <ConfirmDeleteModal
        isOpen={!!subtaskToDelete}
        title="Hapus Sub-Tugas?"
        description="Apakah Anda yakin ingin menghapus sub-tugas ini? Bukti foto yang sudah diunggah juga tidak akan ditautkan lagi."
        itemName={subtaskToDelete?.nama}
        isLoading={isDeletingSubtask}
        onClose={() => !isDeletingSubtask && setSubtaskToDelete(null)}
        onConfirm={handleConfirmDeleteSubtask}
      />
    </div>
  );
}
