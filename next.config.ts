import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Service Worker がバイナリレスポンス (PDF など) や API ルートを
    // ナビゲーションフォールバックで横取りしないよう除外する。
    // これがないと本番環境で /api/**/pdf のダウンロードが失敗する。
    navigateFallbackDenylist: [/^\/api\//],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdfkit"],
  // Make sure the Noto Sans JP font files (used by src/lib/pdf/generator.ts)
  // are copied into the serverless function bundles for every route that may
  // trigger PDF generation. Without this, the .otf files are excluded from
  // the deploy output and the generator silently falls back to Helvetica,
  // producing garbled Japanese characters.
  outputFileTracingIncludes: {
    "/api/requests/*/pdf": ["./src/lib/pdf/fonts/**/*"],
    "/approvals": ["./src/lib/pdf/fonts/**/*"],
    "/approvals/**": ["./src/lib/pdf/fonts/**/*"],
    "/requests/**": ["./src/lib/pdf/fonts/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default withNextIntl(withPWA(nextConfig));
