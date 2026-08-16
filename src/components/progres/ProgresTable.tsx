'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProgresItem } from '@/lib/types';
import { formatTitleCase, formatNoTahapan, formatCompactDate } from '@/lib/types';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

interface ProgresTableProps {
  items: ProgresItem[];
  onUploadClick: (tahapanId: string, tahapanName: string) => void;
}

export function ProgresTable({ items, onUploadClick }: ProgresTableProps) {
  // Group items by noKegiatan
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.noKegiatan]) {
      acc[item.noKegiatan] = {
        title: item.kegiatan,
        tahapan: [],
      };
    }
    acc[item.noKegiatan].tahapan.push(item);
    return acc;
  }, {} as Record<number, { title: string; tahapan: ProgresItem[] }>);

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let foundFirstUnfinished = false;
    const initialExpanded = Object.keys(grouped).reduce((acc, key) => {
      const groupNum = Number(key);
      const hasUnfinished = grouped[groupNum].tahapan.some((t) => t.statusSubmit === 'Belum Submit');
      if (hasUnfinished && !foundFirstUnfinished) {
        foundFirstUnfinished = true;
        acc[groupNum] = true;
      } else {
        acc[groupNum] = false;
      }
      return acc;
    }, {} as Record<number, boolean>);

    if (!foundFirstUnfinished && Object.keys(grouped).length > 0) {
      initialExpanded[Number(Object.keys(grouped)[0])] = true;
    }

    setExpandedGroups(initialExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const toggleGroup = (noKegiatan: number) => {
    setExpandedGroups((prev) => ({ ...prev, [noKegiatan]: !prev[noKegiatan] }));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900/60">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <h4 className="text-base font-extrabold text-[var(--text-primary)] mb-1">Tidak ada data ditemukan</h4>
        <p className="text-xs text-[var(--text-muted)]">Coba sesuaikan kata kunci pencarian atau filter status.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([noKeg, group]) => {
        const isExpanded = expandedGroups[Number(noKeg)];
        const total = group.tahapan.length;
        const finished = group.tahapan.filter((t) => t.statusSubmit === 'Sudah Submit').length;
        const isComplete = total > 0 && finished === total;

        return (
          <div
            key={noKeg}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm hover:border-[var(--color-primary)]/40 transition-colors"
          >
            {/* Header Accordion Kegiatan */}
            <button
              onClick={() => toggleGroup(Number(noKeg))}
              className="w-full flex items-center justify-between p-4 sm:p-5 bg-[var(--bg-surface)] hover:bg-[var(--color-accent-light)]/40 dark:hover:bg-[var(--bg-surface)] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[var(--shadow-glow)] flex-shrink-0">
                  {noKeg}
                </div>
                  <div className="min-w-0">
                  <h3 className="font-extrabold text-[var(--text-primary)] text-sm sm:text-[15px] leading-snug truncate">
                    Kegiatan {noKeg}: {formatTitleCase(group.title)}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                    {total} Tahapan Kegiatan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Progress Pill */}
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-[var(--color-accent-light)] text-[var(--color-primary)] dark:bg-[var(--bg-surface)] border border-[var(--border-color)]'
                  }`}
                >
                  {isComplete ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  )}
                  {finished}/{total} Selesai
                </span>

                {/* Chevron */}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.div>
              </div>
            </button>

            {/* List Tahapan Table */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-xs sm:text-sm text-left">
                      <thead className="text-[11px] font-extrabold text-[var(--text-secondary)] bg-[var(--color-accent-light)]/40 dark:bg-[var(--bg-surface)] uppercase tracking-wider border-y border-[var(--border-color)]">
                        <tr>
                          <th className="px-3.5 py-3 w-12 text-center whitespace-nowrap">NO</th>
                          <th className="px-3.5 py-3 min-w-[200px]">TAHAPAN KEGIATAN</th>
                          <th className="px-3.5 py-3 min-w-[160px]">OUTPUT HASIL</th>
                          <th className="px-3.5 py-3 min-w-[150px] whitespace-nowrap">DEADLINE / JADWAL</th>
                          <th className="px-3.5 py-3 min-w-[130px] text-center whitespace-nowrap">STATUS PROSES</th>
                          <th className="px-3.5 py-3 w-28 text-right whitespace-nowrap">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {group.tahapan.map((tahapan, idx) => {
                          const isSubmitted = tahapan.statusSubmit === 'Sudah Submit';
                          const calUrl = generateGoogleCalendarUrl(
                            `Deadline: ${tahapan.tahapanKegiatan}`,
                            tahapan.deadlineStart,
                            tahapan.deadlineEnd,
                            `Output: ${tahapan.outputHasil}\n\nKegiatan: ${tahapan.kegiatan}`
                          );

                          return (
                            <tr
                              key={tahapan.id}
                              className="hover:bg-[var(--color-accent-light)]/20 dark:hover:bg-[var(--bg-surface)]/50 transition-colors group"
                            >
                              {/* No */}
                              <td className="px-3.5 py-3 text-center font-bold text-[var(--text-secondary)] text-xs whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)]">
                                  {formatNoTahapan(tahapan.noTahapan, idx, Number(noKeg))}
                                </span>
                              </td>

                              {/* Tahapan Kegiatan */}
                              <td className="px-3.5 py-3 font-bold text-[var(--text-primary)] leading-relaxed">
                                {tahapan.tahapanKegiatan}
                              </td>

                              {/* Output */}
                              <td className="px-3.5 py-3 text-[var(--text-secondary)] leading-relaxed text-xs">
                                {tahapan.outputHasil}
                              </td>

                              {/* Deadline */}
                              <td className="px-3.5 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] flex-shrink-0">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                  </svg>
                                  <span>{formatCompactDate(tahapan.deadlineText)}</span>
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-3.5 py-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap ${
                                    isSubmitted
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  }`}
                                >
                                  {isSubmitted ? (
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  ) : (
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="flex-shrink-0">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  )}
                                  <span>{isSubmitted ? 'Sudah Submit' : 'Belum Submit'}</span>
                                </span>
                              </td>

                              {/* Aksi */}
                              <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Lihat Bukti jika sudah submit */}
                                  {isSubmitted && tahapan.buktiUrl ? (
                                    <a
                                      href={tahapan.buktiUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[var(--border-color)] hover:shadow-xs transition-colors"
                                      title="Lihat Bukti Dukung"
                                    >
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    </a>
                                  ) : null}

                                  {/* Upload / Ganti Bukti */}
                                  <button
                                    onClick={() => onUploadClick(tahapan.id, tahapan.tahapanKegiatan)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm shadow-[var(--shadow-glow)] transition-colors cursor-pointer"
                                    title={isSubmitted ? 'Upload Ulang Bukti' : 'Upload Bukti Dukung'}
                                  >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <polyline points="17 8 12 3 7 8" />
                                      <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                  </button>

                                  {/* Google Calendar */}
                                  <a
                                    href={calUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-surface)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
                                    title="Tambah ke Google Calendar"
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                      <line x1="16" y1="2" x2="16" y2="6" />
                                      <line x1="8" y1="2" x2="8" y2="6" />
                                      <line x1="3" y1="10" x2="21" y2="10" />
                                      <line x1="12" y1="14" x2="12" y2="18" />
                                      <line x1="10" y1="16" x2="14" y2="16" />
                                    </svg>
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
