/**
 * CI 用プレースホルダー env かどうか（実 DB 接続対象ではない）
 */
function isCiPlaceholderEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return (
    url.includes("ci-placeholder") ||
    anon.startsWith("ci-placeholder-") ||
    service.startsWith("ci-placeholder-")
  );
}

/**
 * 統合テスト用の Supabase 環境変数を検証する。
 * 未設定の場合は統合テストをスキップする（ローカルで DB なし開発を妨げない）。
 */
export function hasSupabaseTestEnv(): boolean {
  if (isCiPlaceholderEnv()) {
    return false;
  }
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function getSupabaseTestKey(): string {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Supabase test key is not configured");
  }
  return key;
}
