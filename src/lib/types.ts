// ============================================================
// TYPES — Aplikasi Manajemen Kegiatan
// ============================================================

export interface Kegiatan {
  id: string;
  nama: string;
  deskripsi?: string;
  deadline: string; // ISO date string "YYYY-MM-DD"
  createdAt: string;
  status: 'aktif' | 'selesai' | 'dibatalkan';
  totalSubtask?: number;
  selesaiSubtask?: number;
}

export interface Subtask {
  id: string;
  kegiatanId: string;
  nama: string;
  selesai: boolean;
  buktiFotoUrl?: string;
  updatedAt?: string;
  urutan?: number;
}

export type DeadlineStatus = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'done';

export function getDeadlineStatus(deadline: string, isSelesai: boolean): DeadlineStatus {
  if (isSelesai) return 'done';
  const now = new Date();
  const dl = new Date(deadline);
  const diffDays = Math.ceil((dl.getTime() - now.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return 'upcoming';
}

export function getDeadlineBadgeClass(status: DeadlineStatus): string {
  const map: Record<DeadlineStatus, string> = {
    overdue:  'badge-overdue',
    today:    'badge-today',
    tomorrow: 'badge-tomorrow',
    upcoming: 'badge-upcoming',
    done:     'badge-done',
  };
  return map[status];
}

export function getDeadlineLabel(deadline: string, isSelesai: boolean): string {
  const status = getDeadlineStatus(deadline, isSelesai);
  if (status === 'done')     return 'Selesai';
  if (status === 'overdue')  return 'Terlambat!';
  if (status === 'today')    return 'Hari ini';
  if (status === 'tomorrow') return 'Besok';
  const dl = new Date(deadline);
  return dl.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
