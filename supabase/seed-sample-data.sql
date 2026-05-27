-- ============================================================
-- seed-sample-data.sql — comprehensive demo dataset
--
-- Run order:
--   1) 0001_init_schema.sql
--   2) 0002_rls_policies.sql
--   3) 0003_workflow.sql
--   4) this file
--
-- Creates:
--   - 3 sections, 6 teams (with heads & leaders wired up)
--   - 25 auth users (all password 'Password123!') across every role
--   - 30 days of attendance per non-admin user (varied statuses)
--   - 25 leave / late requests covering every approval state
--   - Notifications are produced automatically by triggers
--
-- Idempotency: this script DELETES existing demo rows before re-seeding.
-- It only touches rows whose emails end in '@demo.com', so real users
-- are left alone. Safe to re-run.
-- ============================================================

-- ---- Wipe previous demo data (in dependency order) ---------
do $$
declare v_uids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_uids
  from auth.users where email like '%@demo.com';

  if array_length(v_uids, 1) is not null then
    delete from public.notifications where user_id = any(v_uids);
    delete from public.requests      where user_id = any(v_uids);
    delete from public.attendance    where user_id = any(v_uids);
    -- profiles cascade via auth.users delete
    delete from auth.identities where user_id = any(v_uids);
    delete from auth.users      where id      = any(v_uids);
  end if;
end $$;

-- ---- Reset demo sections / teams ---------------------------
delete from public.teams
 where section_id in (select id from public.sections
                       where name in ('Engineering','Human Resources','Finance'));
delete from public.sections
 where name in ('Engineering','Human Resources','Finance');

-- ---- Sections ----------------------------------------------
insert into public.sections (name, description) values
  ('Engineering',     'Software engineering and product development'),
  ('Human Resources', 'People operations and talent'),
  ('Finance',         'Accounting, payroll, and budgeting');

-- ---- Teams -------------------------------------------------
do $$
declare eng_id uuid; hr_id uuid; fin_id uuid;
begin
  select id into eng_id from public.sections where name = 'Engineering';
  select id into hr_id  from public.sections where name = 'Human Resources';
  select id into fin_id from public.sections where name = 'Finance';

  insert into public.teams (name, section_id) values
    ('Backend',    eng_id),
    ('Frontend',   eng_id),
    ('Mobile',     eng_id),
    ('Recruiting', hr_id),
    ('Accounting', fin_id),
    ('Treasury',   fin_id);
end $$;

-- ---- Helper: create an auth user + ensure profile ----------
-- Returns the new user id. The profiles row is created by the
-- handle_new_auth_user() trigger (which reads role + full_name
-- out of raw_user_meta_data).
create or replace function pg_temp.mk_user(
  p_email     text,
  p_full_name text,
  p_role      public.user_role,
  p_password  text default 'Password123!'
) returns uuid as $$
declare v_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id,
    'authenticated', 'authenticated', p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', p_full_name, 'role', p_role::text),
    '{"provider":"email","providers":["email"]}'::jsonb,
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    v_id::text, v_id,
    jsonb_build_object('sub', v_id::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  -- Belt and suspenders: ensure the trigger-created profile has the
  -- correct name + role even if the project's trigger version differs.
  update public.profiles
     set full_name = p_full_name,
         role      = p_role
   where id = v_id;

  return v_id;
end $$ language plpgsql;

-- ============================================================
-- Create users + wire them to sections / teams
-- ============================================================
do $$
declare
  eng_id uuid; hr_id uuid; fin_id uuid;
  t_backend uuid; t_frontend uuid; t_mobile uuid;
  t_recruit uuid; t_account uuid; t_treasury uuid;

  u_admin uuid;
  u_hr1 uuid; u_hr2 uuid;
  u_eng_head uuid; u_hr_head uuid; u_fin_head uuid;
  u_bk_lead uuid; u_fe_lead uuid; u_mb_lead uuid;
  u_rec_lead uuid; u_acc_lead uuid; u_tre_lead uuid;

  u_emp_bk1 uuid; u_emp_bk2 uuid; u_emp_bk3 uuid;
  u_emp_fe1 uuid; u_emp_fe2 uuid;
  u_emp_mb1 uuid; u_emp_mb2 uuid;
  u_emp_rec1 uuid; u_emp_rec2 uuid;
  u_emp_acc1 uuid; u_emp_acc2 uuid;
  u_emp_tre1 uuid; u_emp_tre2 uuid;
begin
  select id into eng_id from public.sections where name = 'Engineering';
  select id into hr_id  from public.sections where name = 'Human Resources';
  select id into fin_id from public.sections where name = 'Finance';

  select id into t_backend   from public.teams where name = 'Backend'    and section_id = eng_id;
  select id into t_frontend  from public.teams where name = 'Frontend'   and section_id = eng_id;
  select id into t_mobile    from public.teams where name = 'Mobile'     and section_id = eng_id;
  select id into t_recruit   from public.teams where name = 'Recruiting' and section_id = hr_id;
  select id into t_account   from public.teams where name = 'Accounting' and section_id = fin_id;
  select id into t_treasury  from public.teams where name = 'Treasury'   and section_id = fin_id;

  -- Admin (no section/team needed)
  u_admin    := pg_temp.mk_user('admin@demo.com',       'Alice Admin',       'admin');

  -- HR supervisors (live in the HR section)
  u_hr1      := pg_temp.mk_user('hr1@demo.com',         'Hannah Hayes',      'hr_supervisor');
  u_hr2      := pg_temp.mk_user('hr2@demo.com',         'Helen Hughes',      'hr_supervisor');

  -- Section heads
  u_eng_head := pg_temp.mk_user('eng.head@demo.com',    'Edward Engman',     'section_head');
  u_hr_head  := pg_temp.mk_user('hr.head@demo.com',     'Hanna Hartman',     'section_head');
  u_fin_head := pg_temp.mk_user('fin.head@demo.com',    'Felix Finchley',    'section_head');

  -- Team leaders
  u_bk_lead  := pg_temp.mk_user('bk.lead@demo.com',     'Brian Backend',     'team_leader');
  u_fe_lead  := pg_temp.mk_user('fe.lead@demo.com',     'Fiona Frontend',    'team_leader');
  u_mb_lead  := pg_temp.mk_user('mb.lead@demo.com',     'Mark Mobile',       'team_leader');
  u_rec_lead := pg_temp.mk_user('rec.lead@demo.com',    'Rita Recruiter',    'team_leader');
  u_acc_lead := pg_temp.mk_user('acc.lead@demo.com',    'Alan Accountant',   'team_leader');
  u_tre_lead := pg_temp.mk_user('tre.lead@demo.com',    'Tina Treasury',     'team_leader');

  -- Employees
  u_emp_bk1  := pg_temp.mk_user('emp.bk1@demo.com',     'Ben Becker',        'employee');
  u_emp_bk2  := pg_temp.mk_user('emp.bk2@demo.com',     'Bella Burton',      'employee');
  u_emp_bk3  := pg_temp.mk_user('emp.bk3@demo.com',     'Boris Bates',       'employee');
  u_emp_fe1  := pg_temp.mk_user('emp.fe1@demo.com',     'Fred Foster',       'employee');
  u_emp_fe2  := pg_temp.mk_user('emp.fe2@demo.com',     'Farah Faulkner',    'employee');
  u_emp_mb1  := pg_temp.mk_user('emp.mb1@demo.com',     'Mike Morgan',       'employee');
  u_emp_mb2  := pg_temp.mk_user('emp.mb2@demo.com',     'Maya Moore',        'employee');
  u_emp_rec1 := pg_temp.mk_user('emp.rec1@demo.com',    'Ravi Ramirez',      'employee');
  u_emp_rec2 := pg_temp.mk_user('emp.rec2@demo.com',    'Renee Russell',     'employee');
  u_emp_acc1 := pg_temp.mk_user('emp.acc1@demo.com',    'Aaron Akhtar',      'employee');
  u_emp_acc2 := pg_temp.mk_user('emp.acc2@demo.com',    'Anita Adler',       'employee');
  u_emp_tre1 := pg_temp.mk_user('emp.tre1@demo.com',    'Tom Tanner',        'employee');
  u_emp_tre2 := pg_temp.mk_user('emp.tre2@demo.com',    'Tara Thompson',     'employee');

  -- ----- Assign section_id + team_id to every non-admin -----
  -- Engineering / Backend
  update public.profiles set section_id = eng_id, team_id = t_backend
   where id in (u_bk_lead, u_emp_bk1, u_emp_bk2, u_emp_bk3);
  -- Engineering / Frontend
  update public.profiles set section_id = eng_id, team_id = t_frontend
   where id in (u_fe_lead, u_emp_fe1, u_emp_fe2);
  -- Engineering / Mobile
  update public.profiles set section_id = eng_id, team_id = t_mobile
   where id in (u_mb_lead, u_emp_mb1, u_emp_mb2);
  -- Engineering / Section head (no specific team)
  update public.profiles set section_id = eng_id
   where id = u_eng_head;
  -- HR / Recruiting
  update public.profiles set section_id = hr_id, team_id = t_recruit
   where id in (u_rec_lead, u_emp_rec1, u_emp_rec2);
  -- HR section: HR supervisors + HR section head
  update public.profiles set section_id = hr_id
   where id in (u_hr1, u_hr2, u_hr_head);
  -- Finance / Accounting
  update public.profiles set section_id = fin_id, team_id = t_account
   where id in (u_acc_lead, u_emp_acc1, u_emp_acc2);
  -- Finance / Treasury
  update public.profiles set section_id = fin_id, team_id = t_treasury
   where id in (u_tre_lead, u_emp_tre1, u_emp_tre2);
  -- Finance / Section head
  update public.profiles set section_id = fin_id
   where id = u_fin_head;

  -- ----- Wire up section heads + team leaders ---------------
  update public.sections set section_head_id = u_eng_head where id = eng_id;
  update public.sections set section_head_id = u_hr_head  where id = hr_id;
  update public.sections set section_head_id = u_fin_head where id = fin_id;

  update public.teams set team_leader_id = u_bk_lead  where id = t_backend;
  update public.teams set team_leader_id = u_fe_lead  where id = t_frontend;
  update public.teams set team_leader_id = u_mb_lead  where id = t_mobile;
  update public.teams set team_leader_id = u_rec_lead where id = t_recruit;
  update public.teams set team_leader_id = u_acc_lead where id = t_account;
  update public.teams set team_leader_id = u_tre_lead where id = t_treasury;
end $$;

-- ============================================================
-- Attendance — last 30 days for every non-admin demo user.
--
-- Pattern (deterministic so test runs are reproducible):
--   * Weekends (Sat/Sun) -> no row
--   * Most days  -> 'present'  (08:30 - 17:30)
--   * Every 7th  -> 'late'     (09:30 - 18:00)
--   * Every 11th -> 'wfh'      (09:00 - 18:00)
--   * Every 13th -> 'on_leave' (no clock times)
--   * Every 17th -> 'absent'   (no clock times)
-- ============================================================
insert into public.attendance (user_id, date, clock_in, clock_out, status, notes, recorded_by)
select
  p.id,
  d::date,
  case s
    when 'present'  then (d + time '08:30')::timestamptz
    when 'late'     then (d + time '09:30')::timestamptz
    when 'wfh'      then (d + time '09:00')::timestamptz
    else null
  end as clock_in,
  case s
    when 'present'  then (d + time '17:30')::timestamptz
    when 'late'     then (d + time '18:00')::timestamptz
    when 'wfh'      then (d + time '18:00')::timestamptz
    else null
  end as clock_out,
  s::public.attendance_status,
  case s
    when 'wfh'      then 'Working from home'
    when 'on_leave' then 'On approved leave'
    when 'absent'   then 'No-show'
    else null
  end as notes,
  p.id as recorded_by
from public.profiles p
join auth.users u on u.id = p.id
cross join lateral generate_series(current_date - 29, current_date, '1 day'::interval) as d
cross join lateral (
  select case
    when extract(isodow from d) in (6,7)                  then null  -- weekend
    when (extract(doy from d)::int + abs(hashtext(p.id::text)) % 5) % 17 = 0 then 'absent'
    when (extract(doy from d)::int + abs(hashtext(p.id::text)) % 5) % 13 = 0 then 'on_leave'
    when (extract(doy from d)::int + abs(hashtext(p.id::text)) % 5) % 11 = 0 then 'wfh'
    when (extract(doy from d)::int + abs(hashtext(p.id::text)) % 5) % 7  = 0 then 'late'
    else 'present'
  end as s
) v
where u.email like '%@demo.com'
  and p.role <> 'admin'
  and v.s is not null
on conflict (user_id, date) do nothing;

-- ============================================================
-- Requests — 25 covering every approval state
--
-- We insert with hr_/section_head_ columns pre-set so the seed
-- skips the workflow triggers' notification spam from "approving"
-- already-approved rows. Notifications for these rows are added
-- explicitly below where helpful.
-- ============================================================
do $$
declare
  u_admin    uuid;
  u_hr1      uuid; u_hr2      uuid;
  u_eng_head uuid; u_hr_head  uuid; u_fin_head uuid;

  u_emp_bk1  uuid; u_emp_bk2  uuid; u_emp_bk3  uuid;
  u_emp_fe1  uuid; u_emp_fe2  uuid;
  u_emp_mb1  uuid; u_emp_mb2  uuid;
  u_emp_rec1 uuid; u_emp_rec2 uuid;
  u_emp_acc1 uuid; u_emp_acc2 uuid;
  u_emp_tre1 uuid; u_emp_tre2 uuid;
begin
  select id into u_admin    from public.profiles where full_name = 'Alice Admin';
  select id into u_hr1      from public.profiles where full_name = 'Hannah Hayes';
  select id into u_hr2      from public.profiles where full_name = 'Helen Hughes';
  select id into u_eng_head from public.profiles where full_name = 'Edward Engman';
  select id into u_hr_head  from public.profiles where full_name = 'Hanna Hartman';
  select id into u_fin_head from public.profiles where full_name = 'Felix Finchley';

  select id into u_emp_bk1  from public.profiles where full_name = 'Ben Becker';
  select id into u_emp_bk2  from public.profiles where full_name = 'Bella Burton';
  select id into u_emp_bk3  from public.profiles where full_name = 'Boris Bates';
  select id into u_emp_fe1  from public.profiles where full_name = 'Fred Foster';
  select id into u_emp_fe2  from public.profiles where full_name = 'Farah Faulkner';
  select id into u_emp_mb1  from public.profiles where full_name = 'Mike Morgan';
  select id into u_emp_mb2  from public.profiles where full_name = 'Maya Moore';
  select id into u_emp_rec1 from public.profiles where full_name = 'Ravi Ramirez';
  select id into u_emp_rec2 from public.profiles where full_name = 'Renee Russell';
  select id into u_emp_acc1 from public.profiles where full_name = 'Aaron Akhtar';
  select id into u_emp_acc2 from public.profiles where full_name = 'Anita Adler';
  select id into u_emp_tre1 from public.profiles where full_name = 'Tom Tanner';
  select id into u_emp_tre2 from public.profiles where full_name = 'Tara Thompson';

  -- ===== 6 PENDING-HR (newly submitted, untouched) ==========
  insert into public.requests (user_id, type, date, reason) values
    (u_emp_bk1,  'leave', current_date + 3,  'Family medical appointment'),
    (u_emp_fe1,  'late',  current_date,      'Traffic from highway closure'),
    (u_emp_mb1,  'leave', current_date + 5,  'Personal errand - bank visit'),
    (u_emp_acc1, 'leave', current_date + 7,  'Wedding ceremony of cousin'),
    (u_emp_rec1, 'late',  current_date - 1,  'Child school drop-off delayed'),
    (u_emp_tre1, 'leave', current_date + 10, 'Annual leave - weekend trip');

  -- ===== 5 HR-APPROVED, SECTION-HEAD-PENDING ================
  insert into public.requests (
    user_id, type, date, reason,
    hr_approval, hr_approved_by, hr_approved_at
  ) values
    (u_emp_bk2,  'leave', current_date + 2, 'Specialist follow-up appointment',
       'approved', u_hr1, now() - interval '2 hours'),
    (u_emp_fe2,  'leave', current_date + 6, 'Father''s 60th birthday',
       'approved', u_hr1, now() - interval '1 day'),
    (u_emp_mb2,  'late',  current_date - 2, 'Severe weather delays',
       'approved', u_hr2, now() - interval '6 hours'),
    (u_emp_acc2, 'leave', current_date + 4, 'House move',
       'approved', u_hr2, now() - interval '3 hours'),
    (u_emp_rec2, 'leave', current_date + 8, 'Vacation - already booked',
       'approved', u_hr1, now() - interval '12 hours');

  -- ===== 5 FULLY APPROVED ===================================
  insert into public.requests (
    user_id, type, date, reason,
    hr_approval, hr_approved_by, hr_approved_at,
    section_head_approval, section_head_approved_by, section_head_approved_at,
    document_path
  ) values
    (u_emp_bk3,  'leave', current_date - 5, 'Sick - flu',
       'approved', u_hr1, now() - interval '6 days',
       'approved', u_eng_head, now() - interval '5 days',
       u_emp_bk3::text || '/sample-approved-1.pdf'),
    (u_emp_fe1,  'leave', current_date - 10, 'Dental surgery',
       'approved', u_hr2, now() - interval '11 days',
       'approved', u_eng_head, now() - interval '10 days',
       u_emp_fe1::text || '/sample-approved-2.pdf'),
    (u_emp_mb1,  'late',  current_date - 7, 'Late train into city',
       'approved', u_hr1, now() - interval '7 days',
       'approved', u_eng_head, now() - interval '6 days',
       null),
    (u_emp_acc1, 'leave', current_date - 14, 'Sister''s graduation',
       'approved', u_hr2, now() - interval '15 days',
       'approved', u_fin_head, now() - interval '14 days',
       u_emp_acc1::text || '/sample-approved-3.pdf'),
    (u_emp_tre2, 'late',  current_date - 3, 'Doctor''s morning appointment',
       'approved', u_hr1, now() - interval '3 days',
       'approved', u_fin_head, now() - interval '2 days',
       null);

  -- ===== 3 HR-REJECTED ======================================
  insert into public.requests (
    user_id, type, date, reason,
    hr_approval, hr_approved_by, hr_approved_at
  ) values
    (u_emp_bk1,  'leave', current_date - 8, 'Long weekend - no specific reason',
       'rejected', u_hr1, now() - interval '8 days'),
    (u_emp_fe2,  'late',  current_date - 12, 'Overslept',
       'rejected', u_hr2, now() - interval '12 days'),
    (u_emp_rec1, 'leave', current_date - 6, 'Already at quota this month',
       'rejected', u_hr1, now() - interval '6 days');

  -- ===== 3 SECTION-HEAD-REJECTED (HR approved, SH rejected) =
  insert into public.requests (
    user_id, type, date, reason,
    hr_approval, hr_approved_by, hr_approved_at,
    section_head_approval, section_head_approved_by, section_head_approved_at
  ) values
    (u_emp_mb2,  'leave', current_date - 4, 'Side project demo day',
       'approved', u_hr1, now() - interval '4 days',
       'rejected', u_eng_head, now() - interval '3 days'),
    (u_emp_acc2, 'leave', current_date - 9, 'Family beach trip - conflicts with month-end close',
       'approved', u_hr2, now() - interval '10 days',
       'rejected', u_fin_head, now() - interval '9 days'),
    (u_emp_tre1, 'late',  current_date - 11, 'Personal errand morning',
       'approved', u_hr1, now() - interval '11 days',
       'rejected', u_fin_head, now() - interval '10 days');

  -- ===== 3 OLD HISTORICAL (fully approved, > 2 weeks ago) ===
  insert into public.requests (
    user_id, type, date, reason,
    hr_approval, hr_approved_by, hr_approved_at,
    section_head_approval, section_head_approved_by, section_head_approved_at,
    document_path, created_at
  ) values
    (u_emp_bk2,  'leave', current_date - 21, 'Annual leave - week off',
       'approved', u_hr1, now() - interval '22 days',
       'approved', u_eng_head, now() - interval '21 days',
       u_emp_bk2::text || '/sample-approved-old-1.pdf', now() - interval '23 days'),
    (u_emp_mb1,  'leave', current_date - 25, 'Family wedding abroad',
       'approved', u_hr2, now() - interval '26 days',
       'approved', u_eng_head, now() - interval '25 days',
       u_emp_mb1::text || '/sample-approved-old-2.pdf', now() - interval '27 days'),
    (u_emp_rec2, 'late',  current_date - 18, 'Pre-arranged morning meeting offsite',
       'approved', u_hr1, now() - interval '19 days',
       'approved', u_hr_head, now() - interval '18 days',
       null, now() - interval '20 days');
end $$;

-- ============================================================
-- Notifications cleanup
--
-- The triggers fired during the request inserts have already created
-- "new request" notifications for HR users. To keep the demo Inbox
-- realistic, we also seed a few "fully approved" reminder notifications
-- for the employees whose requests are already fully approved (those
-- triggers only fire on UPDATE, not INSERT-with-approved).
-- ============================================================
insert into public.notifications (user_id, title, message, related_request_id, created_at)
select r.user_id,
       'Request fully approved',
       'Your ' || r.type || ' request for ' || to_char(r.date,'YYYY-MM-DD') ||
       ' has been fully approved.',
       r.id,
       coalesce(r.section_head_approved_at, now())
  from public.requests r
  join auth.users u on u.id = r.user_id
 where u.email like '%@demo.com'
   and r.hr_approval = 'approved'
   and r.section_head_approval = 'approved'
   and not exists (
     select 1 from public.notifications n
      where n.related_request_id = r.id
        and n.title = 'Request fully approved'
   );

-- Section-head-rejected notifications (also only created via UPDATE)
insert into public.notifications (user_id, title, message, related_request_id, created_at)
select r.user_id,
       'Request rejected by Section Head',
       'Your ' || r.type || ' request for ' || to_char(r.date,'YYYY-MM-DD') ||
       ' was rejected by the Section Head.',
       r.id,
       coalesce(r.section_head_approved_at, now())
  from public.requests r
  join auth.users u on u.id = r.user_id
 where u.email like '%@demo.com'
   and r.section_head_approval = 'rejected';

-- HR-rejected notifications
insert into public.notifications (user_id, title, message, related_request_id, created_at)
select r.user_id,
       'Request rejected by HR',
       'Your ' || r.type || ' request for ' || to_char(r.date,'YYYY-MM-DD') ||
       ' was rejected by HR.',
       r.id,
       coalesce(r.hr_approved_at, now())
  from public.requests r
  join auth.users u on u.id = r.user_id
 where u.email like '%@demo.com'
   and r.hr_approval = 'rejected';

-- ============================================================
-- Done. Print a quick summary so you know it worked.
-- ============================================================
do $$
declare
  v_users       int;
  v_sections    int;
  v_teams       int;
  v_attendance  int;
  v_requests    int;
  v_notifs      int;
begin
  select count(*) into v_users      from auth.users      where email like '%@demo.com';
  select count(*) into v_sections   from public.sections;
  select count(*) into v_teams      from public.teams;
  select count(*) into v_attendance from public.attendance a
                                    join auth.users u on u.id = a.user_id
                                    where u.email like '%@demo.com';
  select count(*) into v_requests   from public.requests r
                                    join auth.users u on u.id = r.user_id
                                    where u.email like '%@demo.com';
  select count(*) into v_notifs     from public.notifications n
                                    join auth.users u on u.id = n.user_id
                                    where u.email like '%@demo.com';

  raise notice '------------------------------------------------------------';
  raise notice 'Demo data seeded successfully';
  raise notice '   users:        %', v_users;
  raise notice '   sections:     %', v_sections;
  raise notice '   teams:        %', v_teams;
  raise notice '   attendance:   %', v_attendance;
  raise notice '   requests:     %', v_requests;
  raise notice '   notifications:%', v_notifs;
  raise notice '------------------------------------------------------------';
  raise notice 'Login with any *@demo.com email / password Password123!';
  raise notice '   admin@demo.com         (admin)';
  raise notice '   hr1@demo.com           (hr_supervisor)';
  raise notice '   eng.head@demo.com      (section_head, Engineering)';
  raise notice '   bk.lead@demo.com       (team_leader, Backend)';
  raise notice '   emp.bk1@demo.com       (employee, Backend)';
  raise notice '------------------------------------------------------------';
end $$;
