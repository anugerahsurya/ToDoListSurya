// ============================================================
// APPS SCRIPT CONFIG — simpan URL setelah deploy
// ============================================================

export const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbztzOr5WoVI_gjZzwUZ0EMVRV2lo4NOYu6EpNrNhzvuVmfDoyqAruh_iFgEI4SZzxdc/exec';

export async function callAppsScript(
  action: string,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  if (!APPS_SCRIPT_URL) {
    throw new Error('APPS_SCRIPT_URL belum diisi di .env.local');
  }

  // GET requests
  if (['getKegiatanList', 'getKegiatanById', 'getSubtaskList'].includes(action)) {
    const qs = new URLSearchParams({ action, ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )});
    const res = await fetch(`${APPS_SCRIPT_URL}?${qs}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Apps Script error: ${res.status}`);
    return res.json();
  }

  // POST requests
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Apps Script error: ${res.status}`);
  return res.json();
}
