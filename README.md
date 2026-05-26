# Attendance Web

A mobile-first Employee Attendance & Workflow Management System built with **Next.js 15 (App Router)**, **Supabase** (PostgreSQL + Auth + Storage + Realtime), **Tailwind CSS**, and **pdfkit**.

## Features

- **Daily Status Board** — live grid of every employee's status today (Present, WFH, Late, On Leave, Absent), with realtime updates.
- **Clock In / Clock Out** — one-tap mobile-first widget with WFH option and automatic late detection.
- **Leave & Late Requests** — submit a request, fire a Microsoft Teams Adaptive Card to your channel, and route through HR → Section Head approvals.
- **PDF Generation** — when both approvals land, the system auto-generates a clean approval PDF and stores it in Supabase Storage.
- **Notifications** — in-app realtime notifications with mark-as-read.
- **Role-aware history** — employees see only their own records; admins/HR/Section Heads/Team Leaders see everyone, with date filters and name search.
- **Admin** — invite users, assign roles, manage sections and teams.
- **Team Leader** — view today's status of team members and override attendance.
- **PWA** — installable, mobile bottom nav, manifest, theme color.

## Tech stack

- Next.js 15 (App Router, TypeScript, Server Actions)
- Supabase (Postgres + Auth + Realtime + Storage)
- Tailwind CSS + Radix UI primitives + lucide-react
- `pdfkit` for PDF generation
- `@ducanh2912/next-pwa` for PWA support
- `react-hook-form` + `zod` for validation

## Roles

| Role            | Permissions                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `admin`         | Full access. Invite users, assign any role, manage sections/teams, view everything.          |
| `hr_supervisor` | Register employees, **first-level** approver for all requests, view all attendance.          |
| `section_head`  | Register employees, **second-level** approver for their section's requests, view all.        |
| `team_leader`   | Override attendance for their own team, view all attendance, view team status.               |
| `employee`      | Mobile clock in/out, submit requests, see only their own records and notifications.          |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Visit [supabase.com](https://supabase.com) and create a new project.
2. Open the SQL Editor and run, in order:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_workflow.sql`
3. Optionally run `supabase/seed.sql` for sample sections and teams.
4. Create your first user via **Authentication → Users → Add user**, then in the SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-admin@example.com';
   ```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase>
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
APP_URL=http://localhost:3000
```

> The `SUPABASE_SERVICE_ROLE_KEY` is **server-only** and used by:
> - `src/lib/supabase/admin.ts` (employee invites)
> - `src/lib/pdf/upload.ts` (uploading approval PDFs)
> - `src/actions/approvals.ts` (finalizing requests)
>
> The `TEAMS_WEBHOOK_URL` is optional. If unset, Teams notifications are skipped silently (logged only).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Generating database types (optional)

The repo ships a hand-maintained `src/types/database.types.ts` mirroring the SQL. If you change the schema, regenerate via the Supabase CLI:

```bash
supabase gen types typescript --project-id <id> --schema public > src/types/database.types.ts
```

## Approval & notification flow

1. Employee submits a leave/late request.
2. DB trigger inserts notifications for **all HR users**.
3. Server action posts an Adaptive Card to **MS Teams**.
4. HR clicks Approve → DB trigger notifies the **Section Head of the employee's section** (with a fallback to all section heads if the section has none assigned). HR rejection notifies the employee and halts.
5. Section Head clicks Approve → server action generates a **PDF**, uploads it to the `request-documents` bucket, and stamps `document_path` on the request. The employee gets a "fully approved" notification.
6. Anyone with access can download the PDF via `/api/requests/{id}/pdf` (a 60-second signed URL is issued on each request).

## RLS overview

- **profiles**: every authenticated user can read (needed for the Status Board); only admins/registrars can change `role`/`section_id`/`team_id`/`is_active` (enforced in `tg_profiles_lock_fields`); only admin can promote roles.
- **attendance**: employees see only their own; master roles see all; team leaders can insert/update only for members of their own team.
- **requests**: employees see/insert their own; HR can update only `hr_*` columns; Section Head can update only `section_head_*` columns (enforced in `tg_requests_column_guard`).
- **notifications**: only the recipient can read or mark-as-read.
- **storage `request-documents`**: only owner (by folder name = `user_id`) or master roles can read; admin only writes.

## Production notes

- Replace `public/icons/icon.svg` and `icon-maskable.svg` with rasterized PNG icons (192px and 512px) for best PWA install support across iOS Safari and older browsers, then update `src/app/manifest.ts`.
- Set up a Supabase scheduled job (or a cron in your hosting platform) to mark previous-day attendance for users who didn't clock in.
- Configure the MS Teams webhook for your channel — see [Microsoft docs](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook).
