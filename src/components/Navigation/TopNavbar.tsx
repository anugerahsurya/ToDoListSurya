'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useThemePreset, ThemePreset } from '@/context/ThemePresetContext';

interface TopNavbarProps {
  activeTab?: 'todo' | 'progres' | 'home';
}

const PRESETS: { id: ThemePreset; name: string; bg: string }[] = [
  { id: 'royal-blue', name: 'Royal Blue', bg: '#2563EB' },
  { id: 'emerald', name: 'Emerald', bg: '#059669' },
  { id: 'burgundy', name: 'Burgundy', bg: '#9F1239' },
  { id: 'original', name: 'Netral (Original)', bg: '#334155' },
];

export function TopNavbar({ activeTab }: TopNavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { preset, setPreset } = useThemePreset();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTodoActive = activeTab === 'todo' || pathname.startsWith('/todo') || pathname.startsWith('/kegiatan');
  const isProgresActive = activeTab === 'progres' || pathname.startsWith('/progres');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--nav-bg)] backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3">
        {/* Left: Brand / Logo with Custom Task Check Icon */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, var(--color-gradient-from, #1D4ED8), var(--color-primary, #2563EB), var(--color-secondary, #3B82F6))`,
              boxShadow: `0 4px 12px var(--shadow-glow, rgba(37,99,235,0.25))`,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="3" />
              <path d="M8 2v3" />
              <path d="M16 2v3" />
              <path d="m8.5 12.5 2.5 2.5 5-5" />
            </svg>
          </div>
          <div>
            <span
              className="font-extrabold text-[13.5px] tracking-tight text-[var(--text-primary)] transition-colors block leading-tight group-hover:text-[var(--color-primary)]"
            >
              To Do List Surya
            </span>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-none mt-0.5">
              Personal Workspace
            </p>
          </div>
        </Link>

        {/* Right: Navigation actions & Theme Toggle & Preset Color Circles */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Nav Pills */}
          <div className="hidden sm:flex items-center bg-[var(--bg-surface)] p-0.5 rounded-lg border border-[var(--border-color)]">
            <Link
              href="/todo"
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold transition-all flex items-center gap-1.5 ${
                isTodoActive
                  ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              To Do List
            </Link>

            <Link
              href="/progres"
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-bold transition-all flex items-center gap-1.5 ${
                isProgresActive
                  ? 'bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Progres Aktualisasi
            </Link>
          </div>

          {/* Color Preset Selector (Color Circles Only) */}
          {mounted && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)]">
              {PRESETS.map((p) => {
                const isActive = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    title={`Tema ${p.name}`}
                    aria-label={`Tema ${p.name}`}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-offset-1 ring-[var(--text-primary)] scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ background: p.bg }}
                  >
                    {isActive && (
                      <span className="w-1 h-1 rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dark / Light Mode Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-primary)]/50 transition-colors shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
