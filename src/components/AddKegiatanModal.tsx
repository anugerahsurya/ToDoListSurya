'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Kegiatan } from '@/lib/types';

const schema = z.object({
  nama: z.string().min(1, 'Nama kegiatan wajib diisi').max(100, 'Maksimal 100 karakter'),
  deskripsi: z.string().max(300, 'Maksimal 300 karakter').optional(),
  deadline: z.string().min(1, 'Deadline wajib diisi'),
});

type FormData = z.infer<typeof schema>;

interface AddKegiatanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Kegiatan, 'id' | 'createdAt'>) => Promise<void>;
}

export function AddKegiatanModal({ isOpen, onClose, onSubmit }: AddKegiatanModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        nama: data.nama,
        deskripsi: data.deskripsi || '',
        deadline: data.deadline,
        status: 'aktif',
      });
      reset();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)]">
                  Formulir Kegiatan
                </span>
                <h2 className="text-lg font-extrabold text-[var(--text-primary)] mt-1.5 leading-snug">
                  Tambah Kegiatan Baru
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[var(--border-color)]" />

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nama')}
                  type="text"
                  placeholder="Contoh: Penyusunan Laporan Aktualisasi Mingguan"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm outline-none transition-colors border bg-[var(--bg-surface)] text-[var(--text-primary)] ${
                    errors.nama
                      ? 'border-red-500'
                      : 'border-[var(--border-color)] focus:border-[var(--color-primary)]'
                  }`}
                />
                {errors.nama && (
                  <p className="text-[11px] font-bold text-red-500">{errors.nama.message}</p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Deskripsi <span className="text-[11px] font-normal text-[var(--text-muted)]">(opsional)</span>
                </label>
                <textarea
                  {...register('deskripsi')}
                  placeholder="Rincian deskripsi singkat tentang kegiatan ini..."
                  rows={3}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none resize-none transition-colors border bg-[var(--bg-surface)] text-[var(--text-primary)] ${
                    errors.deskripsi
                      ? 'border-red-500'
                      : 'border-[var(--border-color)] focus:border-[var(--color-primary)]'
                  }`}
                />
                {errors.deskripsi && (
                  <p className="text-[11px] font-bold text-red-500">{errors.deskripsi.message}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Tenggat Waktu (Deadline) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('deadline')}
                  type="date"
                  min={today}
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm outline-none transition-colors border bg-[var(--bg-surface)] text-[var(--text-primary)] ${
                    errors.deadline
                      ? 'border-red-500'
                      : 'border-[var(--border-color)] focus:border-[var(--color-primary)]'
                  }`}
                  style={{ colorScheme: 'light dark' }}
                />
                {errors.deadline && (
                  <p className="text-[11px] font-bold text-red-500">{errors.deadline.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 shadow-md shadow-[var(--shadow-glow)] transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <span>Simpan Kegiatan</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
