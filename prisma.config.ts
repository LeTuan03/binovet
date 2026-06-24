import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    // CLI (migrate / db push) cần session mode → ưu tiên DIRECT_URL (session pooler 5432).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
