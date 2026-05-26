-- ============================================================
-- 0001_init_schema.sql — base types, tables, indexes, triggers
-- ============================================================
create extension if not exists "pgcrypto";

-- ----- ENUMS ------------------------------------------------
create type public.user_role as enum (
  'admin', 'hr_supervisor', 'section_head', 'team_leader', 'employee'
);

create type public.attendance_status as enum (
  'present', 'late', 'absent', 'wfh', 'on_leave'
);

create type public.request_type     as enum ('leave', 'late');
create type public.approval_status  as enum ('pending', 'approved', 'rejected');

-- ----- SECTIONS / TEAMS -------------------------------------
create table public.sections (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  description     text,
  section_head_id uuid,                       -- FK added after profiles
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.teams (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  section_id     uuid not null references public.sections(id) on delete cascade,
  team_leader_id uuid,                        -- FK added after profiles
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(section_id, name)
);

-- ----- PROFILES (1:1 auth.users) ----------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  role        public.user_role not null default 'employee',
  section_id  uuid references public.sections(id) on delete set null,
  team_id     uuid references public.teams(id)    on delete set null,
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.sections
  add constraint sections_section_head_fk
  foreign key (section_head_id) references public.profiles(id) on delete set null;

alter table public.teams
  add constraint teams_team_leader_fk
  foreign key (team_leader_id) references public.profiles(id) on delete set null;

-- ----- ATTENDANCE -------------------------------------------
create table public.attendance (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  date         date not null default current_date,
  clock_in     timestamptz,
  clock_out    timestamptz,
  status       public.attendance_status not null default 'present',
  notes        text,
  recorded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, date)
);

-- ----- REQUESTS ---------------------------------------------
create table public.requests (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  type                     public.request_type not null,
  date                     date not null,
  reason                   text not null check (length(trim(reason)) > 0),
  hr_approval              public.approval_status not null default 'pending',
  hr_approved_by           uuid references public.profiles(id),
  hr_approved_at           timestamptz,
  section_head_approval    public.approval_status not null default 'pending',
  section_head_approved_by uuid references public.profiles(id),
  section_head_approved_at timestamptz,
  document_path            text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ----- NOTIFICATIONS ----------------------------------------
create table public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  title               text not null,
  message             text not null,
  is_read             boolean not null default false,
  related_request_id  uuid references public.requests(id) on delete cascade,
  created_at          timestamptz not null default now()
);

-- ----- INDEXES ----------------------------------------------
create index idx_attendance_user_date    on public.attendance(user_id, date desc);
create index idx_attendance_date         on public.attendance(date desc);
create index idx_requests_user           on public.requests(user_id, created_at desc);
create index idx_requests_hr_pending     on public.requests(hr_approval)            where hr_approval = 'pending';
create index idx_requests_sh_pending     on public.requests(section_head_approval)  where section_head_approval = 'pending';
create index idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index idx_profiles_role           on public.profiles(role);
create index idx_profiles_section        on public.profiles(section_id);
create index idx_profiles_team           on public.profiles(team_id);

-- ----- updated_at trigger -----------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger trg_profiles_updated_at   before update on public.profiles   for each row execute function public.tg_set_updated_at();
create trigger trg_sections_updated_at   before update on public.sections   for each row execute function public.tg_set_updated_at();
create trigger trg_teams_updated_at      before update on public.teams      for each row execute function public.tg_set_updated_at();
create trigger trg_attendance_updated_at before update on public.attendance for each row execute function public.tg_set_updated_at();
create trigger trg_requests_updated_at   before update on public.requests   for each row execute function public.tg_set_updated_at();

-- ----- Auto-create profile on auth.users insert -------------
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role := 'employee';
  v_meta_role text := new.raw_user_meta_data->>'role';
begin
  if v_meta_role in ('admin','hr_supervisor','section_head','team_leader','employee') then
    v_role := v_meta_role::public.user_role;
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
