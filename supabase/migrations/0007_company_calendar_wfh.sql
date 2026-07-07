-- 0007: Company calendar (custom holidays) + default WFH weekday on profiles

-- ----- company_holidays -------------------------------------
create table public.company_holidays (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) >= 1),
  holiday_date date not null,
  note         text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (holiday_date, name)
);

create index idx_company_holidays_date
  on public.company_holidays (holiday_date);

create trigger trg_company_holidays_updated_at
  before update on public.company_holidays
  for each row execute function public.tg_set_updated_at();

alter table public.company_holidays enable row level security;

create policy "company_holidays_select_authenticated"
  on public.company_holidays for select to authenticated using (true);

create policy "company_holidays_hr_admin_insert"
  on public.company_holidays for insert to authenticated
  with check (public.current_user_role() in ('admin', 'hr_supervisor'));

create policy "company_holidays_hr_admin_update"
  on public.company_holidays for update to authenticated
  using (public.current_user_role() in ('admin', 'hr_supervisor'))
  with check (public.current_user_role() in ('admin', 'hr_supervisor'));

create policy "company_holidays_hr_admin_delete"
  on public.company_holidays for delete to authenticated
  using (public.current_user_role() in ('admin', 'hr_supervisor'));

-- ----- profiles.default_wfh_weekday -------------------------
alter table public.profiles
  add column if not exists default_wfh_weekday smallint
  check (
    default_wfh_weekday is null
    or (default_wfh_weekday >= 0 and default_wfh_weekday <= 4)
  );

comment on column public.profiles.default_wfh_weekday is
  '0=Mon … 4=Fri (weekdays only, Asia/Tokyo). HR/admin assigned only.';

-- ----- tg_profiles_lock_fields: WFH weekday guard -------------
create or replace function public.tg_profiles_lock_fields()
returns trigger language plpgsql security definer set search_path = public as $$
declare caller public.user_role;
begin
  if auth.uid() is null then return new; end if;

  caller := public.current_user_role();
  if caller = 'admin' then return new; end if;

  if new.default_wfh_weekday is distinct from old.default_wfh_weekday then
    if caller <> 'hr_supervisor' then
      new.default_wfh_weekday := old.default_wfh_weekday;
    end if;
  end if;

  if caller in ('hr_supervisor','section_head') then
    if new.role is distinct from old.role and new.role <> 'employee' then
      new.role := old.role;
    end if;
    if old.role = 'admin' then new.role := old.role; end if;
    return new;
  end if;

  if new.role       is distinct from old.role       then new.role       := old.role;       end if;
  if new.section_id is distinct from old.section_id then new.section_id := old.section_id; end if;
  if new.team_id    is distinct from old.team_id    then new.team_id    := old.team_id;    end if;
  if new.is_active  is distinct from old.is_active  then new.is_active  := old.is_active;  end if;
  return new;
end $$;
