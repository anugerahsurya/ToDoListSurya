import { NextResponse } from 'next/server';
import { APPS_SCRIPT_URL } from '@/lib/appsScript';

export const maxDuration = 60; // Max execution time (for larger files)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Body should contain { progresId, base64, filename, buktiType, url }
    const url = APPS_SCRIPT_URL;
    const payload = {
      action: 'uploadBuktiProgres',
      ...body
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
