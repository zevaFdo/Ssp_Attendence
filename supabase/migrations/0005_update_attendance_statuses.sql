-- ============================================================
-- 0005_update_attendance_statuses.sql — multi-status presence
--
-- Adds four new presence labels to the existing attendance_status
-- enum so employees can self-broadcast what they are doing
-- throughout the day (groupware-style switcher).
--
-- New labels:
--   'meeting'        — in a meeting
--   'break'          — interval / rest time
--   'out_of_office'  — out for external work
--   'clocked_out'    — finished work / left for the day
--
-- Existing labels ('present','late','absent','wfh','on_leave')
-- are left untouched. No data backfill is required: this is a
-- pure, non-destructive enum extension.
--
-- Note: `ALTER TYPE ... ADD VALUE` must run in its own statement
-- (Postgres forbids using a newly-added enum value inside the
-- same transaction that adds it). Supabase migrations execute
-- each top-level statement separately, so the labels below are
-- immediately available to the application code that follows.
-- ============================================================

alter type public.attendance_status add value if not exists 'meeting';
alter type public.attendance_status add value if not exists 'break';
alter type public.attendance_status add value if not exists 'out_of_office';
alter type public.attendance_status add value if not exists 'clocked_out';

comment on type public.attendance_status is
  'present | late | absent | wfh | on_leave | meeting | break | out_of_office | clocked_out';
