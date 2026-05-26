-- ============================================================
-- 0002_rls_policies.sql — helpers + Row Level Security
-- ============================================================

-- ----- SECURITY DEFINER helpers (avoid RLS recursion) -------
create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_section_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select section_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_team_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.has_master_view()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in
    ('admin','hr_supervisor','section_head','team_leader'), false);
$$;

create or replace function public.can_register_employees()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role() in
    ('admin','hr_supervisor','section_head'), false);
$$;

-- ----- Enable RLS -------------------------------------------
alter table public.profiles      enable row level security;
alter table public.sections      enable row level security;
alter table public.teams         enable row level security;
alter table public.attendance    enable row level security;
alter table public.requests      enable row level security;
alter table public.notifications enable row level security;

-- ----- profiles ---------------------------------------------
-- Daily Status Board needs every authenticated user to read profiles.
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated using (true);

create policy "profiles_self_insert"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_registrars_insert"
  on public.profiles for insert to authenticated
  with check (public.can_register_employees());

create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "profiles_registrars_update"
  on public.profiles for update to authenticated
  using (public.can_register_employees())
  with check (public.can_register_employees());

create policy "profiles_admin_delete"
  on public.profiles for delete to authenticated using (public.is_admin());

-- Field-level lock: who can change which sensitive columns
create or replace function public.tg_profiles_lock_fields()
returns trigger language plpgsql security definer set search_path = public as $$
declare caller public.user_role;
begin
  -- Bypass when there is no authenticated user (SQL editor, service-role
  -- queries, server-side maintenance). RLS still gates table access.
  if auth.uid() is null then return new; end if;

  caller := public.current_user_role();
  if caller = 'admin' then return new; end if;

  if caller in ('hr_supervisor','section_head') then
    -- registrars may set section/team and toggle is_active for non-admin users,
    -- but cannot promote anyone (role can only be set to 'employee')
    if new.role is distinct from old.role and new.role <> 'employee' then
      new.role := old.role;
    end if;
    if old.role = 'admin' then new.role := old.role; end if;
    return new;
  end if;

  -- everyone else: cannot change role/section/team/is_active
  if new.role       is distinct from old.role       then new.role       := old.role;       end if;
  if new.section_id is distinct from old.section_id then new.section_id := old.section_id; end if;
  if new.team_id    is distinct from old.team_id    then new.team_id    := old.team_id;    end if;
  if new.is_active  is distinct from old.is_active  then new.is_active  := old.is_active;  end if;
  return new;
end $$;

create trigger trg_profiles_lock_fields
  before update on public.profiles
  for each row execute function public.tg_profiles_lock_fields();

-- ----- sections / teams -------------------------------------
create policy "sections_select_all" on public.sections for select to authenticated using (true);
create policy "sections_admin_all"  on public.sections for all    to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "teams_select_all" on public.teams for select to authenticated using (true);
create policy "teams_admin_all"  on public.teams for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ----- attendance -------------------------------------------
create policy "attendance_select_self_or_master"
  on public.attendance for select to authenticated
  using (user_id = auth.uid() or public.has_master_view());

create policy "attendance_insert_self"
  on public.attendance for insert to authenticated
  with check (user_id = auth.uid());

create policy "attendance_insert_team_leader"
  on public.attendance for insert to authenticated
  with check (
    public.current_user_role() = 'team_leader'
    and exists (
      select 1 from public.profiles p
      where p.id = attendance.user_id
        and p.team_id = public.current_user_team_id()
    )
  );

create policy "attendance_update_self"
  on public.attendance for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "attendance_update_team_leader"
  on public.attendance for update to authenticated
  using (
    public.current_user_role() = 'team_leader'
    and exists (
      select 1 from public.profiles p
      where p.id = attendance.user_id
        and p.team_id = public.current_user_team_id()
    )
  )
  with check (
    public.current_user_role() = 'team_leader'
    and exists (
      select 1 from public.profiles p
      where p.id = attendance.user_id
        and p.team_id = public.current_user_team_id()
    )
  );

create policy "attendance_admin_delete"
  on public.attendance for delete to authenticated using (public.is_admin());

-- ----- requests ---------------------------------------------
create policy "requests_select_self_or_master"
  on public.requests for select to authenticated
  using (user_id = auth.uid() or public.has_master_view());

create policy "requests_insert_self"
  on public.requests for insert to authenticated
  with check (user_id = auth.uid());

create policy "requests_update_hr"
  on public.requests for update to authenticated
  using (public.current_user_role() in ('hr_supervisor','admin'))
  with check (public.current_user_role() in ('hr_supervisor','admin'));

create policy "requests_update_section_head"
  on public.requests for update to authenticated
  using (public.current_user_role() in ('section_head','admin'))
  with check (public.current_user_role() in ('section_head','admin'));

-- Column-level guard: HR may only flip hr_*; Section Head may only flip section_head_*
create or replace function public.tg_requests_column_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare caller public.user_role;
begin
  -- Bypass when there is no authenticated user (service-role finalize PDF,
  -- SQL editor maintenance). RLS still gates row access.
  if auth.uid() is null then return new; end if;

  caller := public.current_user_role();
  if caller = 'admin' then return new; end if;

  if caller = 'hr_supervisor' then
    -- prevent HR from touching section_head_* or document_path
    new.section_head_approval     := old.section_head_approval;
    new.section_head_approved_by  := old.section_head_approved_by;
    new.section_head_approved_at  := old.section_head_approved_at;
    new.document_path             := old.document_path;
    -- if hr_approval moved, stamp metadata
    if new.hr_approval is distinct from old.hr_approval then
      new.hr_approved_by := auth.uid();
      new.hr_approved_at := now();
    end if;
    return new;
  end if;

  if caller = 'section_head' then
    new.hr_approval     := old.hr_approval;
    new.hr_approved_by  := old.hr_approved_by;
    new.hr_approved_at  := old.hr_approved_at;
    if new.section_head_approval is distinct from old.section_head_approval then
      new.section_head_approved_by := auth.uid();
      new.section_head_approved_at := now();
    end if;
    return new;
  end if;

  -- employees and team leaders cannot update requests
  raise exception 'Not allowed to update requests';
end $$;

create trigger trg_requests_column_guard
  before update on public.requests
  for each row execute function public.tg_requests_column_guard();

-- ----- notifications ----------------------------------------
create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- inserts only via SECURITY DEFINER triggers / service-role server actions
