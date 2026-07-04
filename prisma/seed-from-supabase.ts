/**
 * Sao chép (seed) toàn bộ dữ liệu từ Supabase online → PostgreSQL local.
 *
 * Cách chạy:
 *   pnpm db:seed:from-supabase
 *   # hoặc: npx tsx prisma/seed-from-supabase.ts
 *
 * Nguồn (Supabase):  SEED_SOURCE_URL  ›  DIRECT_URL  ›  DATABASE_URL
 * Đích  (local):     SEED_TARGET_URL  ›  LOCAL_DATABASE_URL  ›  mặc định 127.0.0.1:5432/binovet
 *
 * LƯU Ý:
 *  - Bảng ở DB đích PHẢI tồn tại sẵn. Nếu chưa, chạy trước:
 *        DATABASE_URL="<url-local>" npx prisma db push
 *  - Script sẽ XÓA sạch dữ liệu các bảng ở DB đích rồi ghi lại từ nguồn.
 *  - Giữ nguyên id (BigInt) + createdAt; updatedAt sẽ là thời điểm copy (do @updatedAt).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ── Nạp .env thủ công (không phụ thuộc gói `dotenv` — pnpm không hoist nó) ────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (!m) continue; // bỏ qua dòng trống / comment (#)
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] ??= val;
    }
  } catch {
    // không có .env cũng không sao — dùng biến môi trường sẵn có
  }
}
loadEnv();

const SOURCE_URL = process.env.DIRECT_URL || '';
const TARGET_URL = process.env.SEED_TARGET_URL;

// Ẩn mật khẩu khi in log.
const mask = (url: string) => url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');

// ── Danh sách bảng theo thứ tự phụ thuộc (cha trước, con sau) ────────────────
// model = tên delegate của Prisma Client; table = tên bảng thật (để reset sequence).
const TABLES: { model: string; table: string }[] = [
  { model: 'category', table: 'categories' },
  { model: 'product', table: 'products' },
  { model: 'article', table: 'articles' },
  { model: 'job', table: 'jobs' },
  { model: 'banner', table: 'banners' },
  { model: 'navMenu', table: 'nav_menus' },
  { model: 'mediaImage', table: 'media_images' },
  { model: 'mediaVideo', table: 'media_videos' },
  { model: 'setting', table: 'settings' },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Đưa sequence auto-increment về đúng MAX(id) để insert sau này không đụng id. */
async function resetSequence(pool: Pool, table: string) {
  const q = `SELECT pg_get_serial_sequence('"${table}"', 'id') AS seq`;
  const { rows } = await pool.query(q);
  const seq = rows[0]?.seq as string | null;
  if (!seq) return; // bảng dùng id cố định (vd: settings) — không có sequence
  await pool.query(
    `SELECT setval('${seq}', COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM "${table}"`,
  );
}

async function main() {
  if (!SOURCE_URL) throw new Error('Thiếu URL nguồn (SEED_SOURCE_URL / DIRECT_URL / DATABASE_URL).');
  if (/supabase\.com/i.test(TARGET_URL)) {
    throw new Error('DB đích đang trỏ tới Supabase — dừng lại để tránh ghi đè online. Đặt SEED_TARGET_URL/LOCAL_DATABASE_URL trỏ về local.');
  }
  if (SOURCE_URL === TARGET_URL) throw new Error('Nguồn và đích trùng nhau — dừng lại.');

  console.log('┌─ Seed từ Supabase → local');
  console.log('│  Nguồn:', mask(SOURCE_URL));
  console.log('│  Đích :', mask(TARGET_URL));
  console.log('└─────────────────────────────\n');

  const sourcePool = new Pool({ connectionString: SOURCE_URL });
  const targetPool = new Pool({ connectionString: TARGET_URL });
  const source = new PrismaClient({ adapter: new PrismaPg(sourcePool) });
  const target = new PrismaClient({ adapter: new PrismaPg(targetPool) });

  try {
    // 1) Đọc toàn bộ dữ liệu từ nguồn.
    const data: Record<string, any[]> = {};
    for (const { model } of TABLES) {
      const rows = await (source as any)[model].findMany();
      data[model] = rows;
      console.log(`  [read]  ${model.padEnd(11)} ${rows.length} bản ghi`);
    }

    // 2) Xóa dữ liệu đích theo thứ tự ngược (con trước, cha sau).
    for (const { model } of [...TABLES].reverse()) {
      await (target as any)[model].deleteMany({});
    }

    // 3) Ghi lại theo thứ tự thuận (cha trước, con sau), giữ nguyên id.
    console.log('');
    for (const { model, table } of TABLES) {
      const rows = data[model];
      let written = 0;
      for (const batch of chunk(rows, 500)) {
        if (!batch.length) continue;
        const res = await (target as any)[model].createMany({ data: batch, skipDuplicates: true });
        written += res.count;
      }
      await resetSequence(targetPool, table);
      console.log(`  [write] ${model.padEnd(11)} ${written} bản ghi`);
    }

    console.log('\n✔ Hoàn tất seed từ Supabase vào DB local.');
  } finally {
    await source.$disconnect();
    await target.$disconnect();
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch((e) => {
  console.error('\n[x] Lỗi khi seed:', e);
  process.exit(1);
});
