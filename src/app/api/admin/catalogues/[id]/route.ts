import { NextResponse } from 'next/server';
import { catalogueService } from '@/services';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await catalogueService.getById(id);
    if (!item) {
      return NextResponse.json({ error: 'Catalogue not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to fetch catalogue:', error);
    return NextResponse.json({ error: 'Failed to fetch catalogue' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await catalogueService.update(id, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update catalogue:', error);
    return NextResponse.json({ error: 'Failed to update catalogue', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await catalogueService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete catalogue:', error);
    return NextResponse.json({ error: 'Failed to delete catalogue', details: error.message }, { status: 500 });
  }
}
