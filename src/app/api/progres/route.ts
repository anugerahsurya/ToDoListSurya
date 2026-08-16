import { NextResponse } from 'next/server';
import { APPS_SCRIPT_URL } from '@/lib/appsScript';

export async function GET() {
  try {
    const url = APPS_SCRIPT_URL;
    const res = await fetch(`${url}?action=getProgresList`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = APPS_SCRIPT_URL;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addProgresItem', ...body }),
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
