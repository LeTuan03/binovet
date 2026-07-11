/**
 * Nạp file .sql (do scripts/export-db.ts tạo) vào Postgres — KHÔNG cần psql.
 *
 * Cách chạy:
 *   pnpm db:import                         # mặc định backup/binovet-latest.sql
 *   pnpm db:import backup/binovet-XXXX.sql # chỉ định file
 *   # hoặc: npx tsx scripts/import-db.ts <file.sql>
 *
 * Đích: DATABASE_URL (trong .env). PHẢI tạo schema trước bằng `npx prisma db push`.
 * An toàn: từ chối chạy nếu đích trỏ tới Supabase (tránh ghi đè online).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] ??= val;
    }
  } catch {
    /* bỏ qua */
  }
}
loadEnv();

const TARGET_URL = process.env.DATABASE_URL || '';
const file = process.argv[2] || 'backup/binovet-latest.sql';
const mask = (url: string) => url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');

async function main() {
  if (!TARGET_URL) throw new Error('Thiếu DATABASE_URL trong .env (DB đích).');
  if (/supabase\.com/i.test(TARGET_URL)) {
    throw new Error('DATABASE_URL đang trỏ tới Supabase — dừng lại để tránh ghi đè online.');
  }

  const sql = readFileSync(resolve(process.cwd(), file), 'utf8');
  const needSsl = /supabase\.com|\.pooler\./i.test(TARGET_URL);
  const pool = new Pool({
    connectionString: TARGET_URL,
    ssl: needSsl ? { rejectUnauthorized: false } : undefined,
  });

  console.log('┌─ Import file .sql → Postgres');
  console.log('│  File:', file);
  console.log('│  Đích:', mask(TARGET_URL));
  console.log('└──────────────────────────────\n');

  try {
    // File đã tự bọc BEGIN/COMMIT nên toàn bộ chạy atomically trong 1 lệnh.
    await pool.query(sql);
    console.log('✔ Import hoàn tất.');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\n[x] Lỗi khi import:', e);
  process.exit(1);
});
