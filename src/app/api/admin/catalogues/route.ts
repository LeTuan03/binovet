import { NextResponse } from 'next/server';
import { catalogueService } from '@/services';

export async function GET() {
  try {
    const data = await catalogueService.getAll();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch catalogues:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await catalogueService.create(body);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create catalogue:', error);
    return NextResponse.json({ error: 'Failed to create catalogue', details: error.message }, { status: 500 });
  }
}
