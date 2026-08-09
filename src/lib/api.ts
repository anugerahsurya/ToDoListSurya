// ============================================================
// API CLIENT — Proxy ke Next.js API Routes
// ============================================================

import type { Kegiatan, Subtask } from './types';

const BASE = '/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Kegiatan ────────────────────────────────────────────────
export const api = {
  kegiatan: {
    list: (): Promise<Kegiatan[]> =>
      request('/kegiatan'),

    get: (id: string): Promise<Kegiatan> =>
      request(`/kegiatan/${id}`),

    create: (data: Omit<Kegiatan, 'id' | 'createdAt'>): Promise<Kegiatan> =>
      request('/kegiatan', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Kegiatan>): Promise<Kegiatan> =>
      request(`/kegiatan/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<{ success: boolean }> =>
      request(`/kegiatan/${id}`, { method: 'DELETE' }),
  },

  subtask: {
    list: (kegiatanId: string): Promise<Subtask[]> =>
      request(`/subtask?kegiatanId=${kegiatanId}`),

    create: (data: Omit<Subtask, 'id' | 'updatedAt'>): Promise<Subtask> =>
      request('/subtask', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Subtask>): Promise<Subtask> =>
      request(`/subtask/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<{ success: boolean }> =>
      request(`/subtask/${id}`, { method: 'DELETE' }),
  },

  bukti: {
    upload: (subtaskId: string, base64: string, filename: string): Promise<{ url: string }> =>
      request('/bukti/upload', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, base64, filename }),
      }),
  },
};
