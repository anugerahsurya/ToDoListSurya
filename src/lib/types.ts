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

export interface ProgresItem {
  id: string;
  noKegiatan: number;
  kegiatan: string;
  noTahapan: string;
  tahapanKegiatan: string;
  outputHasil: string;
  mingguAwal: string;
  mingguAkhir: string;
  deadlineText: string;
  deadlineStart: string;
  deadlineEnd: string;
  bentukBukti: string;
  statusSubmit: 'Belum Submit' | 'Sudah Submit';
  buktiUrl?: string;
  buktiType?: 'image' | 'pdf' | 'link';
  createdAt: string;
  updatedAt: string;
}

export type StatusSubmitFilter = 'semua' | 'belum' | 'sudah';
export type MingguFilter = string;

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

export function formatTitleCase(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatNoTahapan(val: any, index: number, noKeg?: number): string {
  if (noKeg) {
    return `${noKeg}.${index + 1}`;
  }
  return String(index + 1);
}

export function formatCompactDate(dateStr?: string): string {
  if (!dateStr) return '-';
  // If it contains ISO time or timestamp, convert to date only
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  // Shorten month names so they fit neatly on one line
  return dateStr
    .replace(/Januari/gi, 'Jan')
    .replace(/Februari/gi, 'Feb')
    .replace(/Maret/gi, 'Mar')
    .replace(/April/gi, 'Apr')
    .replace(/Mei/gi, 'Mei')
    .replace(/Juni/gi, 'Jun')
    .replace(/Juli/gi, 'Jul')
    .replace(/Agustus/gi, 'Agu')
    .replace(/September/gi, 'Sep')
    .replace(/Oktober/gi, 'Okt')
    .replace(/November/gi, 'Nov')
    .replace(/Desember/gi, 'Des');
}
