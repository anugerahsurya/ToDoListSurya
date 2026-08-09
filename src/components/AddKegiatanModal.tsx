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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
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

  // Min date = today
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
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  Tambah Kegiatan Baru
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Isi detail kegiatan yang akan dikerjakan
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--border-color)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Tutup"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border-color)' }} />

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-sm font-600" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('nama')}
                  type="text"
                  placeholder="Contoh: Pengerjaan Laporan Aktualisasi"
                  className={`w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors border ${
                    errors.nama ? 'border-red-500' : 'border-[var(--border-color)] focus:border-[#636B2F]'
                  }`}
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                />
                {errors.nama && (
                  <p className="text-xs text-red-500">{errors.nama.message}</p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Deskripsi <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(opsional)</span>
                </label>
                <textarea
                  {...register('deskripsi')}
                  placeholder="Deskripsi singkat tentang kegiatan ini..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-colors border ${
                    errors.deskripsi ? 'border-red-500' : 'border-[var(--border-color)] focus:border-[#636B2F]'
                  }`}
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                />
                {errors.deskripsi && (
                  <p className="text-xs text-red-500">{errors.deskripsi.message}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('deadline')}
                    type="date"
                    min={today}
                    className={`w-full h-11 px-4 rounded-xl text-sm outline-none transition-colors border ${
                      errors.deadline ? 'border-red-500' : 'border-[var(--border-color)] focus:border-[#636B2F]'
                    }`}
                    style={{
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      colorScheme: 'light dark',
                    }}
                  />
                </div>
                {errors.deadline && (
                  <p className="text-xs text-red-500">{errors.deadline.message}</p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.97 }}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isLoading
                    ? 'var(--color-secondary)'
                    : 'linear-gradient(135deg, #636B2F, #4a5222)',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: isLoading ? 'none' : '0 4px 12px rgba(99,107,47,0.4)',
                }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Tambah Kegiatan
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
