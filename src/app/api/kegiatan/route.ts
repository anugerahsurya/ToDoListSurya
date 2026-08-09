import { NextRequest, NextResponse } from 'next/server';
import { callAppsScript } from '@/lib/appsScript';

export async function GET() {
  try {
    const data = await callAppsScript('getKegiatanList');
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await callAppsScript('addKegiatan', body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
