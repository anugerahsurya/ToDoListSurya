'use client';

import { useMemo } from 'react';
import type { ProgresItem } from '@/lib/types';
import { formatTitleCase } from '@/lib/types';

interface GanttTimelineProps {
  items: ProgresItem[];
}

interface WeekInfo {
  id: string;
  label: string;
  sublabel: string;
  range: string;
  startDate: Date;
  endDate: Date;
}

const WEEKS_DATA: WeekInfo[] = [
  {
    id: 'III-Agustus',
    label: 'Mg III Agu',
    sublabel: '17–22 Agu',
    range: '17 – 22 Agustus 2026',
    startDate: new Date(2026, 7, 17, 0, 0, 0),
    endDate: new Date(2026, 7, 23, 23, 59, 59),
  },
  {
    id: 'IV-Agustus',
    label: 'Mg IV Agu',
    sublabel: '24–29 Agu',
    range: '24 – 29 Agustus 2026',
    startDate: new Date(2026, 7, 24, 0, 0, 0),
    endDate: new Date(2026, 7, 30, 23, 59, 59),
  },
  {
    id: 'I-September',
    label: 'Mg I Sep',
    sublabel: '31 Agu–5 Sep',
    range: '31 Agustus – 5 September 2026',
    startDate: new Date(2026, 7, 31, 0, 0, 0),
    endDate: new Date(2026, 8, 6, 23, 59, 59),
  },
  {
    id: 'II-September',
    label: 'Mg II Sep',
    sublabel: '7–12 Sep',
    range: '7 – 12 September 2026',
    startDate: new Date(2026, 8, 7, 0, 0, 0),
    endDate: new Date(2026, 8, 13, 23, 59, 59),
  },
  {
    id: 'III-September',
    label: 'Mg III Sep',
    sublabel: '14–19 Sep',
    range: '14 – 19 September 2026',
    startDate: new Date(2026, 8, 14, 0, 0, 0),
    endDate: new Date(2026, 8, 20, 23, 59, 59),
  },
  {
    id: 'IV-September',
    label: 'Mg IV Sep',
    sublabel: '21–26 Sep',
    range: '21 – 26 September 2026',
    startDate: new Date(2026, 8, 21, 0, 0, 0),
    endDate: new Date(2026, 8, 27, 23, 59, 59),
  },
];

export function GanttTimeline({ items }: GanttTimelineProps) {
  // Dynamically detect current week or calculate based on local time
  const currentWeekIdx = useMemo(() => {
    const now = new Date();
    const found = WEEKS_DATA.findIndex((w) => now >= w.startDate && now <= w.endDate);
    if (found !== -1) return found;
    if (now < WEEKS_DATA[0].startDate) return 0; // Default to first week if before
    return 0; // Default to week 1 (current period)
  }, []);

  const currentWeekObj = WEEKS_DATA[currentWeekIdx] || WEEKS_DATA[0];

  // Activities list matching actual items
  const activities = useMemo(() => {
    // Extract unique activities from items or fallback
    const groups: { [key: number]: { name: string; start: string; end: string } } = {
      1: { name: 'Identifikasi Kebutuhan Pengembangan Dashboard Web', start: 'III-Agustus', end: 'IV-Agustus' },
      2: { name: 'Pengumpulan Dan Pengolahan Data Awal', start: 'III-Agustus', end: 'IV-Agustus' },
      3: { name: 'Pembangunan Dan Visualisasi Dashboard Sosio-Ekonomi', start: 'IV-Agustus', end: 'I-September' },
      4: { name: 'Penyusunan Petunjuk Teknis Dan Sosialisasi Sistem', start: 'I-September', end: 'II-September' },
      5: { name: 'Penyusunan Dan Penyempurnaan Laporan Aktualisasi', start: 'II-September', end: 'IV-September' },
      6: { name: 'Penyusunan Media Dan Pelaksanaan Seminar Hasil', start: 'III-September', end: 'IV-September' },
    };

    items.forEach((item) => {
      if (item.noKegiatan && !groups[item.noKegiatan]) {
        groups[item.noKegiatan] = {
          name: item.kegiatan,
          start: 'III-Agustus',
          end: 'IV-September',
        };
      } else if (item.noKegiatan && groups[item.noKegiatan] && item.kegiatan) {
        groups[item.noKegiatan].name = item.kegiatan;
      }
    });

    return Object.entries(groups)
      .map(([no, val]) => ({
        no: Number(no),
        name: val.name,
        start: val.start,
        end: val.end,
      }))
      .sort((a, b) => a.no - b.no);
  }, [items]);

  const todayFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return '16 Agustus 2026';
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Current Period Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--color-gradient-from), var(--color-primary))`,
              boxShadow: `0 4px 12px var(--shadow-glow)`,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-primary)]">
                Periode Waktu Saat Ini
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Aktif
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] mt-0.5">
              {todayFormatted} · <span className="text-[var(--color-primary)]">{currentWeekObj.range} ({currentWeekObj.label})</span>
            </p>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1.5 rounded-xl border border-[var(--border-color)]">
          Total 6 Kegiatan Utama · 24 Tahapan
        </div>
      </div>

      {/* Gantt Matrix Table */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[860px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
          {/* Header (Weeks) */}
          <div className="grid grid-cols-[300px_repeat(6,1fr)] bg-[var(--color-accent-light)]/40 dark:bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
            <div className="p-3.5 font-extrabold text-[var(--text-primary)] text-xs uppercase tracking-wider border-r border-[var(--border-color)] flex items-center">
              Kegiatan Utama Aktualisasi
            </div>

            {WEEKS_DATA.map((w, i) => {
              const isCurrent = i === currentWeekIdx;
              return (
                <div
                  key={w.id}
                  className={`p-3 text-center border-r border-[var(--border-color)] last:border-r-0 relative transition-colors ${
                    isCurrent
                      ? 'bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20'
                      : ''
                  }`}
                >
                  {isCurrent && (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-[var(--color-primary)] text-white mb-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Saat Ini
                    </div>
                  )}
                  <p className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider leading-tight">
                    {w.label}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold mt-0.5">
                    {w.sublabel}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--border-color)]">
            {activities.map((act) => {
              const startIndex = WEEKS_DATA.findIndex((w) => w.id === act.start);
              const endIndex = WEEKS_DATA.findIndex((w) => w.id === act.end);

              const relatedItems = items.filter((i) => i.noKegiatan === act.no);
              const total = relatedItems.length;
              const submitted = relatedItems.filter((i) => i.statusSubmit === 'Sudah Submit').length;
              const percent = total > 0 ? (submitted / total) * 100 : 0;
              const isDone = total > 0 && submitted === total;

              return (
                <div
                  key={act.no}
                  className="grid grid-cols-[300px_repeat(6,1fr)] hover:bg-[var(--color-accent-light)]/20 dark:hover:bg-[var(--bg-surface)]/50 transition-colors"
                >
                  {/* Activity Name & Progress Bar */}
                  <div className="p-3.5 border-r border-[var(--border-color)] flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center bg-[var(--color-primary)] text-white text-[10.5px] font-black shadow-xs flex-shrink-0">
                        {act.no}
                      </span>
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate" title={act.name}>
                        {formatTitleCase(act.name)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[var(--border-color)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDone ? 'bg-emerald-500' : 'bg-[var(--color-primary)]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-[var(--text-muted)]">
                        {Math.round(percent)}%
                      </span>
                    </div>
                  </div>

                  {/* Timeline Grid Cells */}
                  {WEEKS_DATA.map((w, i) => {
                    const isActive = i >= startIndex && i <= endIndex;
                    const isStart = i === startIndex;
                    const isEnd = i === endIndex;
                    const isCurrent = i === currentWeekIdx;

                    return (
                      <div
                        key={w.id}
                        className={`relative p-2 flex items-center border-r border-[var(--border-color)] last:border-r-0 ${
                          isCurrent
                            ? 'bg-[var(--color-primary)]/5 dark:bg-[var(--color-primary)]/10'
                            : ''
                        }`}
                      >
                        {isActive && (
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 h-5.5 ${
                              isDone
                                ? 'bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-400 text-emerald-800 dark:text-emerald-300'
                                : 'bg-[var(--color-accent-light)] border border-[var(--color-primary)]/40 text-[var(--color-primary)]'
                            } ${isStart ? 'rounded-l-lg left-2' : 'left-0'} ${
                              isEnd ? 'rounded-r-lg right-2' : 'right-0'
                            } z-10 flex items-center justify-center text-[10px] font-extrabold shadow-xs`}
                          >
                            {isStart && <span className="px-2 truncate">Jadwal</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
