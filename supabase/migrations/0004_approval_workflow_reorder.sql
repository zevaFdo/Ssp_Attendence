-- ============================================================
-- 0004_approval_workflow_reorder.sql
-- Section Head (stage 1) → HR (stage 2); rejection_reason required
-- ============================================================

-- ----- rejection_reason + constraint ------------------------
alter table public.requests
  add column if not exists rejection_reason text;

alter table public.requests
  drop constraint if exists requests_rejection_reason_check;

alter table public.requests
  add constraint requests_rejection_reason_check
  check (
    (hr_approval <> 'rejected' and section_head_approval <> 'rejected')
    or (
      rejection_reason is not null
      and length(trim(rejection_reason)) >= 5
    )
  );

-- ----- indexes: stage-2 HR queue ----------------------------
drop index if exists public.idx_requests_hr_pending;

create index if not exists idx_requests_hr_stage2_pending
  on public.requests (hr_approval)
  where section_head_approval = 'approved' and hr_approval = 'pending';

-- ----- in-flight data migration (baseline HR-first) ---------
-- OLD: hr=approved, sh=pending → reset HR; SH restarts stage 1
update public.requests
set hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null
where hr_approval = 'approved'
  and section_head_approval = 'pending';

-- OLD: hr=rejected at stage 1 → map to section_head rejected
update public.requests
set section_head_approval = 'rejected',
    section_head_approved_by = hr_approved_by,
    section_head_approved_at = hr_approved_at,
    hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null,
    rejection_reason = coalesce(rejection_reason, left(reason, 1000))
where hr_approval = 'rejected'
  and section_head_approval = 'pending';

-- OLD: hr=approved + sh=rejected → keep SH reject; reset HR columns
update public.requests
set hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null,
    rejection_reason = coalesce(rejection_reason, left(reason, 1000))
where hr_approval = 'approved'
  and section_head_approval = 'rejected';

-- Re-notify section heads for requests reset to SH-pending
do $migrate_notify$
declare
  r record;
  sh record;
  emp_name text;
begin
  for r in
    select id, user_id, type, date
    from public.requests
    where section_head_approval = 'pending'
      and hr_approval = 'pending'
  loop
    select full_name into emp_name from public.profiles where id = r.user_id;
    for sh in
      select id from public.profiles
      where role = 'section_head' and is_active
    loop
      if not exists (
        select 1 from public.notifications n
        where n.related_request_id = r.id
          and n.user_id = sh.id
          and n.title = 'Awaiting your approval'
      ) then
        insert into public.notifications (user_id, title, message, related_request_id)
        values (
          sh.id,
          'Awaiting your approval',
          coalesce(emp_name, 'Someone') || ' submitted a ' || r.type ||
            ' request for ' || to_char(r.date, 'YYYY-MM-DD') || '. Please review.',
          r.id
        );
      end if;
    end loop;
  end loop;
end $migrate_notify$;

-- ----- drop old notification triggers -----------------------
drop trigger if exists trg_request_notify_hr on public.requests;
drop trigger if exists trg_request_notify_section_head on public.requests;
drop trigger if exists trg_request_finalize on public.requests;

drop function if exists public.tg_request_notify_hr();
drop function if exists public.tg_request_notify_section_head();
drop function if exists public.tg_request_finalize();

-- ----- new: INSERT → notify all section heads -------------
create or replace function public.tg_request_notify_section_heads_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  sh record;
  emp_name text;
begin
  select full_name into emp_name from public.profiles where id = new.user_id;
  for sh in
    select id from public.profiles
    where role = 'section_head' and is_active
  loop
    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      sh.id,
      'Awaiting your approval',
      coalesce(emp_name, 'Someone') || ' submitted a ' || new.type ||
        ' request for ' || to_char(new.date, 'YYYY-MM-DD') || '. Please review.',
      new.id
    );
  end loop;
  return new;
end $$;

create trigger trg_request_notify_section_heads_on_insert
  after insert on public.requests
  for each row execute function public.tg_request_notify_section_heads_on_insert();

-- ----- new: section_head_approval change --------------------
create or replace function public.tg_request_notify_on_sh_decision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  hr record;
  emp_name text;
begin
  if old.section_head_approval is not distinct from new.section_head_approval then
    return new;
  end if;

  select full_name into emp_name from public.profiles where id = new.user_id;

  if new.section_head_approval = 'approved' then
    for hr in
      select id from public.profiles
      where role = 'hr_supervisor' and is_active
    loop
      insert into public.notifications (user_id, title, message, related_request_id)
      values (
        hr.id,
        'Awaiting your approval',
        'Section Head approved ' || coalesce(emp_name, 'an employee') ||
          '''s ' || new.type || ' request. Please review.',
        new.id
      );
    end loop;

    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      new.user_id,
      'Section Head approved your request',
      'Your ' || new.type || ' request for ' ||
        to_char(new.date, 'YYYY-MM-DD') || ' was approved by the Section Head.',
      new.id
    );

  elsif new.section_head_approval = 'rejected' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      new.user_id,
      'Request rejected by Section Head',
      'Your ' || new.type || ' request for ' ||
        to_char(new.date, 'YYYY-MM-DD') || ' was rejected. Reason: ' ||
        coalesce(new.rejection_reason, '(none)'),
      new.id
    );
  end if;

  return new;
end $$;

create trigger trg_request_notify_on_sh_decision
  after update of section_head_approval on public.requests
  for each row execute function public.tg_request_notify_on_sh_decision();

-- ----- new: hr_approval change ------------------------------
create or replace function public.tg_request_notify_on_hr_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.hr_approval is not distinct from new.hr_approval then
    return new;
  end if;

  if new.hr_approval = 'approved'
     and new.section_head_approval = 'approved' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      new.user_id,
      'Request fully approved',
      'Your ' || new.type || ' request for ' ||
        to_char(new.date, 'YYYY-MM-DD') ||
        ' has been fully approved. The document is being prepared.',
      new.id
    );

  elsif new.hr_approval = 'rejected' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      new.user_id,
      'Request rejected by HR',
      'Your ' || new.type || ' request for ' ||
        to_char(new.date, 'YYYY-MM-DD') || ' was rejected. Reason: ' ||
        coalesce(new.rejection_reason, '(none)'),
      new.id
    );
  end if;

  return new;
end $$;

create trigger trg_request_notify_on_hr_decision
  after update of hr_approval on public.requests
  for each row execute function public.tg_request_notify_on_hr_decision();

-- ----- column guard: stage order + rejection_reason ---------
create or replace function public.tg_requests_column_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare caller public.user_role;
begin
  if auth.uid() is null then return new; end if;

  caller := public.current_user_role();
  if caller = 'admin' then return new; end if;

  if caller = 'hr_supervisor' then
    new.section_head_approval     := old.section_head_approval;
    new.section_head_approved_by  := old.section_head_approved_by;
    new.section_head_approved_at  := old.section_head_approved_at;
    new.document_path             := old.document_path;

    if old.section_head_approval <> 'approved' or old.hr_approval <> 'pending' then
      raise exception 'HR cannot act until Section Head has approved';
    end if;

    if new.hr_approval is distinct from old.hr_approval then
      if new.hr_approval = 'rejected' then
        if new.rejection_reason is null or length(trim(new.rejection_reason)) < 5 then
          raise exception 'rejection_reason required (min 5 characters)';
        end if;
      else
        new.rejection_reason := old.rejection_reason;
      end if;
      new.hr_approved_by := auth.uid();
      new.hr_approved_at := now();
    else
      new.rejection_reason := old.rejection_reason;
    end if;
    return new;
  end if;

  if caller = 'section_head' then
    new.hr_approval     := old.hr_approval;
    new.hr_approved_by  := old.hr_approved_by;
    new.hr_approved_at  := old.hr_approved_at;
    new.document_path   := old.document_path;

    if old.section_head_approval <> 'pending' then
      raise exception 'Section Head stage already decided';
    end if;

    if new.section_head_approval is distinct from old.section_head_approval then
      if new.section_head_approval = 'rejected' then
        if new.rejection_reason is null or length(trim(new.rejection_reason)) < 5 then
          raise exception 'rejection_reason required (min 5 characters)';
        end if;
      elsif new.section_head_approval = 'approved' then
        new.rejection_reason := old.rejection_reason;
      end if;
      new.section_head_approved_by := auth.uid();
      new.section_head_approved_at := now();
    else
      new.rejection_reason := old.rejection_reason;
    end if;
    return new;
  end if;

  raise exception 'Not allowed to update requests';
end $$;
