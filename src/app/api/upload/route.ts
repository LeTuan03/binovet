import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const expectedToken = process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN || 'binovet-dev-token';

    if (token !== expectedToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'general';

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a sanitized file name (strip diacritics & non URL-safe chars)
    const timestamp = Date.now();
    const dotIdx = file.name.lastIndexOf('.');
    const rawBase = dotIdx > 0 ? file.name.slice(0, dotIdx) : file.name;
    const rawExt = dotIdx > 0 ? file.name.slice(dotIdx + 1) : '';
    const safeBase = rawBase
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replaceAll(/[^a-zA-Z0-9._-]/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
      .toLowerCase() || 'file';
    const safeExt = rawExt.replaceAll(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const originalName = safeExt ? `${safeBase}.${safeExt}` : safeBase;
    const fileName = `${timestamp}-${originalName}`;
    
    // For local development, we save to public/uploads
    // We can also support subdirectories based on "bucket"
    const isUploadsBucket = bucket === 'uploads' || !bucket;
    const bucketDir = isUploadsBucket ? UPLOAD_DIR : path.join(UPLOAD_DIR, bucket);
    
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    const filePath = path.join(bucketDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the URL that can be accessed via Next.js static serving
    const relativePath = isUploadsBucket ? fileName : `${bucket}/${fileName}`;
    const url = `/uploads/${relativePath}`;

    console.log(`File saved to ${filePath}, URL: ${url}`);

    return NextResponse.json({ 
      success: true, 
      url,
      name: fileName,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
