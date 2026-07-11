/**
 * Export toàn bộ dữ liệu từ Supabase (DIRECT_URL) ra 1 file .sql duy nhất
 * để import vào Postgres khi triển khai VPS.
 *
 * Cách chạy:
 *   pnpm db:export
 *   # hoặc: npx tsx scripts/export-db.ts
 *
 * Nguồn:   DIRECT_URL (trong .env) — DB Supabase online.
 * Kết quả: backup/binovet-<timestamp>.sql   (+ backup/binovet-latest.sql)
 *
 * Cách import trên VPS (schema do Prisma tạo — repo chưa có migrations):
 *   1) Tạo schema:  DATABASE_URL="<url-local-vps>" npx prisma db push
 *   2) Nạp dữ liệu: psql "<url-local-vps>" -f backup/binovet-latest.sql
 *      # hoặc không cần psql:  pnpm db:import backup/binovet-latest.sql
 *
 * Ghi chú kỹ thuật:
 *  - Mỗi cột được đọc dưới dạng ::text nên giữ NGUYÊN giá trị gốc
 *    (không lệch timezone, không mất độ chính xác BigInt, giữ đúng JSON/array).
 *  - File có TRUNCATE ... RESTART IDENTITY nên chạy lại nhiều lần vẫn an toàn
 *    (idempotent) và tự reset sequence auto-increment về đúng MAX(id).
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

// ── Nạp .env thủ công (pnpm không hoist gói `dotenv`) ───────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (!m) continue; // bỏ dòng trống / comment (#)
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[m[1]] ??= val;
    }
  } catch {
    /* không có .env cũng không sao */
  }
}
loadEnv();

const SOURCE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const mask = (url: string) => url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');

// Thứ tự bảng: cha trước, con sau (dù không có FK, để dump gọn gàng dễ đọc).
const TABLES = [
  'categories',
  'products',
  'articles',
  'jobs',
  'banners',
  'nav_menus',
  'media_images',
  'media_videos',
  'settings',
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Biến 1 giá trị text (hoặc null) thành literal SQL an toàn. */
function lit(v: string | null): string {
  if (v === null || v === undefined) return 'NULL';
  return `'${v.replace(/'/g, "''")}'`;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

async function main() {
  if (!SOURCE_URL) {
    throw new Error('Thiếu DIRECT_URL trong .env (URL của DB Supabase nguồn).');
  }
  const needSsl = /supabase\.com|\.pooler\./i.test(SOURCE_URL);
  const pool = new Pool({
    connectionString: SOURCE_URL,
    ssl: needSsl ? { rejectUnauthorized: false } : undefined,
  });

  console.log('┌─ Export dữ liệu Supabase → file .sql');
  console.log('│  Nguồn:', mask(SOURCE_URL));
  console.log('└──────────────────────────────────────\n');

  const parts: string[] = [];
  const setvals: string[] = [];
  const counts: Record<string, number> = {};
  const dumped: string[] = [];

  try {
    for (const table of TABLES) {
      // Lấy danh sách cột theo đúng thứ tự khai báo.
      const { rows: colRows } = await pool.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [table],
      );
      if (colRows.length === 0) {
        console.log(`  [skip]  ${table.padEnd(13)} (không tồn tại ở nguồn)`);
        continue;
      }
      const cols = colRows.map((r) => r.column_name);
      const colList = cols.map((c) => `"${c}"`).join(', ');

      // Đọc dữ liệu: ép mọi cột về ::text để giữ nguyên giá trị gốc.
      const selectList = cols.map((c) => `"${c}"::text AS "${c}"`).join(', ');
      const { rows } = await pool.query<Record<string, string | null>>(
        `SELECT ${selectList} FROM "${table}"`,
      );
      counts[table] = rows.length;
      dumped.push(table);
      console.log(`  [read]  ${table.padEnd(13)} ${rows.length} bản ghi`);

      if (rows.length > 0) {
        parts.push(`\n-- ${table} (${rows.length} rows)`);
        for (const batch of chunk(rows, 100)) {
          const values = batch
            .map((row) => `  (${cols.map((c) => lit(row[c])).join(', ')})`)
            .join(',\n');
          parts.push(`INSERT INTO "${table}" (${colList}) VALUES\n${values};`);
        }
      }

      // Reset sequence auto-increment (bỏ qua bảng dùng id cố định như settings).
      const { rows: seqRows } = await pool.query<{ seq: string | null }>(
        `SELECT pg_get_serial_sequence('"${table}"', 'id') AS seq`,
      );
      if (seqRows[0]?.seq && cols.includes('id')) {
        setvals.push(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), ` +
            `(SELECT COALESCE(MAX("id"), 1) FROM "${table}"), true);`,
        );
      }
    }

    // ── Ghép file .sql ────────────────────────────────────────────────────
    const truncateList = dumped.map((t) => `"${t}"`).join(', ');
    const header = [
      '-- ===================================================================',
      '-- Binovet — data dump (data-only)',
      `-- Nguồn : ${mask(SOURCE_URL)}`,
      `-- Tạo lúc: ${new Date().toISOString()}`,
      '--',
      '-- Import: đã có schema (npx prisma db push) rồi chạy:',
      '--   psql "<DATABASE_URL>" -f <file>.sql',
      '-- ===================================================================',
      "SET client_encoding = 'UTF8';",
      'SET standard_conforming_strings = on;',
      '',
      'BEGIN;',
      '',
      truncateList
        ? `TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE;`
        : '',
    ].join('\n');

    const body = parts.join('\n');
    const footer = [
      '',
      '-- Reset sequences auto-increment về đúng MAX(id)',
      ...setvals,
      '',
      'COMMIT;',
      '',
    ].join('\n');

    const sql = `${header}\n${body}\n${footer}`;

    mkdirSync(resolve(process.cwd(), 'backup'), { recursive: true });
    const stamped = resolve(process.cwd(), 'backup', `binovet-${timestamp()}.sql`);
    const latest = resolve(process.cwd(), 'backup', 'binovet-latest.sql');
    writeFileSync(stamped, sql, 'utf8');
    writeFileSync(latest, sql, 'utf8');

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`\n✔ Đã export ${total} bản ghi (${dumped.length} bảng).`);
    console.log(`  → ${stamped}`);
    console.log(`  → ${latest}`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\n[x] Lỗi khi export:', e);
  process.exit(1);
});
