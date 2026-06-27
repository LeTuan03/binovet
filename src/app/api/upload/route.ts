import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getSupabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase-server';

// Route handler chạy trên Node runtime (cần fs cho fallback local + Buffer).
export const runtime = 'nodejs';

// Thư mục lưu file khi chạy local dev (filesystem ghi được).
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

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

    // ── Production: Supabase Storage ────────────────────────────────
    // Netlify serverless có filesystem read-only → phải lưu lên object storage.
    const supabase = getSupabaseAdmin();
    if (supabase) {
      // App dùng nhiều "bucket" (uploads/images/general) → map thành thư mục
      // con bên trong 1 Supabase Storage bucket duy nhất.
      const objectPath = `${bucket}/${fileName}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, buffer, {
          contentType: file.type || 'application/octet-stream',
          cacheControl: '31536000',
          upsert: false,
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
      const url = data.publicUrl;

      return NextResponse.json({
        success: true,
        url,
        name: fileName,
        size: file.size,
        type: file.type,
      });
    }

    // Không có Supabase client → lưu file vào ổ đĩa local (public/uploads).
    // Chỉ những nền tảng serverless có filesystem read-only (Netlify/Vercel) mới
    // không ghi được → fail rõ ràng. Server self-hosted (PM2) ghi file bình thường.
    const isReadOnlyFs = !!process.env.NETLIFY || !!process.env.VERCEL;
    if (isReadOnlyFs) {
      console.error('Upload misconfig: nền tảng serverless có filesystem read-only, cần object storage.');
      return NextResponse.json(
        {
          message:
            'Storage chưa được cấu hình: nền tảng serverless có filesystem read-only, cần object storage.',
        },
        { status: 500 },
      );
    }

    // ── Local dev fallback: filesystem (public/uploads) ─────────────
    const isUploadsBucket = bucket === 'uploads' || !bucket;
    const bucketDir = isUploadsBucket ? UPLOAD_DIR : path.join(UPLOAD_DIR, bucket);

    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    const filePath = path.join(bucketDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativePath = isUploadsBucket ? fileName : `${bucket}/${fileName}`;
    const url = `/uploads/${relativePath}`;

    console.log(`File saved to ${filePath}, URL: ${url}`);

    return NextResponse.json({
      success: true,
      url,
      name: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
