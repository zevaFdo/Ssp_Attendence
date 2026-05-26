-- ============================================================
-- seed.sql — sample sections and teams for development
-- Run AFTER migrations and AFTER you have created at least one
-- auth user (e.g. via the Supabase dashboard).
-- ============================================================

-- Sample sections
insert into public.sections (name, description) values
  ('Engineering', 'Software engineering and product development'),
  ('Human Resources', 'People operations and talent'),
  ('Finance', 'Accounting, payroll, and budgeting')
on conflict (name) do nothing;

-- Sample teams (per section)
do $$
declare eng_id uuid; hr_id uuid; fin_id uuid;
begin
  select id into eng_id from public.sections where name = 'Engineering';
  select id into hr_id  from public.sections where name = 'Human Resources';
  select id into fin_id from public.sections where name = 'Finance';

  insert into public.teams (name, section_id) values
    ('Backend',  eng_id),
    ('Frontend', eng_id),
    ('Mobile',   eng_id),
    ('Recruiting', hr_id),
    ('Accounting', fin_id)
  on conflict do nothing;
end $$;

-- After creating an admin user via Supabase Auth dashboard, promote them:
--   update public.profiles set role = 'admin' where email = 'your-admin@example.com';
