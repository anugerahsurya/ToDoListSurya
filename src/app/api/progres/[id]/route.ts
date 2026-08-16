import { NextResponse } from 'next/server';
import { APPS_SCRIPT_URL } from '@/lib/appsScript';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const url = APPS_SCRIPT_URL;
    
    const res = await fetch(url, {
      method: 'POST', // Apps script only accepts POST for updates
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'updateProgresItem', 
        id: params.id,
        ...body 
      }),
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const url = APPS_SCRIPT_URL;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteProgresItem', id: params.id }),
    });
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
