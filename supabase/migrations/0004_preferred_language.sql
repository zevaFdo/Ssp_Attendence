-- ============================================================
-- 0004_preferred_language.sql — bilingual (ja/en) UI preference
-- ============================================================

alter table public.profiles
  add column if not exists preferred_language text not null default 'ja'
  check (preferred_language in ('ja', 'en'));

comment on column public.profiles.preferred_language is
  'UI locale used for server-rendered pages, generated PDFs and Teams notifications. Cookie NEXT_LOCALE is synced from this on sign-in.';
