'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { AppCard } from '@/components/landing/AppCard';
import { TopNavbar } from '@/components/Navigation/TopNavbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col relative overflow-hidden">
      {/* Top Navbar */}
      <TopNavbar activeTab="home" />

      {/* Abstract Background Orbs */}
      <div className="absolute top-12 left-[-8%] w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-8%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        <HeroSection />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl relative z-10">
          <AppCard
            title="To Do List Harian"
            tag="Manajemen Tugas"
            description="Kelola kegiatan harian kantor, breakdown sub-tugas, target deadline, serta upload foto bukti pengerjaan."
            href="/todo"
            delay={0.3}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            }
          />
          
          <AppCard
            title="Progres Aktualisasi"
            tag="24 Tahapan Jadwal"
            description="Pantau progres 24 tahapan rancangan aktualisasi, verifikasi output kegiatan, jadwal Gantt, dan upload bukti dukung."
            href="/progres"
            delay={0.4}
            highlight={true}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            }
          />
        </div>
      </main>
      
      {/* Clean Footer */}
      <footer className="w-full border-t border-[var(--border-color)] py-5 text-center text-xs text-[var(--text-muted)] font-semibold tracking-wider">
        © 2026 Anugerah Surya Atmaja
      </footer>
    </div>
  );
}
