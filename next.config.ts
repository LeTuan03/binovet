import type { NextConfig } from "next";
import path from "path";

// Cho phép next/image phục vụ ảnh từ Supabase Storage (production).
// Suy ra host từ env tường minh, hoặc từ DATABASE_URL/DIRECT_URL.
function resolveSupabaseHost(): string | undefined {
  const explicit =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (explicit) {
    try {
      return new URL(explicit).hostname;
    } catch {
      /* ignore */
    }
  }
  const db = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!db) return undefined;
  try {
    const u = new URL(db);
    const fromUser = u.username.split(".")[1];
    if (fromUser) return `${fromUser}.supabase.co`;
    const hostParts = u.hostname.split(".");
    if (hostParts[0] === "db" && hostParts[1]) {
      return `${hostParts[1]}.supabase.co`;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

const supabaseHost = resolveSupabaseHost();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 128, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/images/**" },
    ],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
