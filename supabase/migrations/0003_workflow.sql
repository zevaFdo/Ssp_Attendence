-- ============================================================
-- 0003_workflow.sql — notification triggers + storage
-- ============================================================

-- After insert: notify all active HR users
create or replace function public.tg_request_notify_hr()
returns trigger language plpgsql security definer set search_path = public as $$
declare hr record; emp_name text;
begin
  select full_name into emp_name from public.profiles where id = new.user_id;
  for hr in select id from public.profiles where role = 'hr_supervisor' and is_active loop
    insert into public.notifications (user_id, title, message, related_request_id)
    values (
      hr.id,
      'New ' || new.type || ' request',
      coalesce(emp_name,'Someone') || ' submitted a ' || new.type ||
        ' request for ' || to_char(new.date, 'YYYY-MM-DD'),
      new.id
    );
  end loop;
  return new;
end $$;

create trigger trg_request_notify_hr
  after insert on public.requests
  for each row execute function public.tg_request_notify_hr();

-- After hr_approval change: notify Section Head (or fallback) + employee
create or replace function public.tg_request_notify_section_head()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_section_head_id uuid;
  emp_name text;
  sh record;
begin
  if old.hr_approval is not distinct from new.hr_approval then
    return new;
  end if;

  select s.section_head_id, p.full_name
    into v_section_head_id, emp_name
    from public.profiles p
    left join public.sections s on s.id = p.section_id
    where p.id = new.user_id;

  if new.hr_approval = 'approved' then
    if v_section_head_id is not null then
      insert into public.notifications (user_id, title, message, related_request_id)
      values (v_section_head_id, 'Awaiting your approval',
              'HR approved ' || coalesce(emp_name,'an employee') ||
              '''s ' || new.type || ' request. Please review.', new.id);
    else
      -- fallback: notify all section_head users
      for sh in select id from public.profiles where role = 'section_head' and is_active loop
        insert into public.notifications (user_id, title, message, related_request_id)
        values (sh.id, 'Awaiting your approval',
                'HR approved a ' || new.type || ' request. Please review.', new.id);
      end loop;
    end if;

    insert into public.notifications (user_id, title, message, related_request_id)
    values (new.user_id, 'HR approved your request',
            'Your ' || new.type || ' request for ' ||
            to_char(new.date,'YYYY-MM-DD') || ' was approved by HR.', new.id);

  elsif new.hr_approval = 'rejected' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (new.user_id, 'Request rejected by HR',
            'Your ' || new.type || ' request for ' ||
            to_char(new.date,'YYYY-MM-DD') || ' was rejected by HR.', new.id);
  end if;

  return new;
end $$;

create trigger trg_request_notify_section_head
  after update of hr_approval on public.requests
  for each row execute function public.tg_request_notify_section_head();

-- After section_head_approval change: notify employee (PDF gen handled in server action)
create or replace function public.tg_request_finalize()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.section_head_approval is not distinct from new.section_head_approval then
    return new;
  end if;

  if new.section_head_approval = 'approved' and new.hr_approval = 'approved' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (new.user_id, 'Request fully approved',
            'Your ' || new.type || ' request for ' ||
            to_char(new.date,'YYYY-MM-DD') ||
            ' has been fully approved. The document is being prepared.', new.id);
  elsif new.section_head_approval = 'rejected' then
    insert into public.notifications (user_id, title, message, related_request_id)
    values (new.user_id, 'Request rejected by Section Head',
            'Your ' || new.type || ' request for ' ||
            to_char(new.date,'YYYY-MM-DD') ||
            ' was rejected by the Section Head.', new.id);
  end if;

  return new;
end $$;

create trigger trg_request_finalize
  after update of section_head_approval on public.requests
  for each row execute function public.tg_request_finalize();

-- ----- Storage bucket + policies ----------------------------
insert into storage.buckets (id, name, public)
values ('request-documents', 'request-documents', false)
on conflict (id) do nothing;

-- Object key convention: '{user_id}/{request_id}.pdf'
create policy "request_docs_select_owner_or_master"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-documents'
    and (
      public.has_master_view()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "request_docs_admin_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'request-documents' and public.is_admin())
  with check (bucket_id = 'request-documents' and public.is_admin());

-- Realtime publication (Supabase usually adds these automatically; explicit for clarity)
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.notifications;
