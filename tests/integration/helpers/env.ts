/**
 * 統合テスト用の Supabase 環境変数を検証する。
 * 未設定の場合は統合テストをスキップする（ローカルで DB なし開発を妨げない）。
 */
export function hasSupabaseTestEnv(): boolean {
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
