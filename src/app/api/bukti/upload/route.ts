import { NextRequest, NextResponse } from 'next/server';
import { callAppsScript } from '@/lib/appsScript';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtaskId, base64, filename } = body;

    if (!base64 || !filename) {
      return NextResponse.json(
        { message: 'base64 dan filename diperlukan' },
        { status: 400 }
      );
    }

    const data = await callAppsScript('uploadBukti', { subtaskId, base64, filename });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
