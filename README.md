# Organizer

Plane-style daily kanban. Recurring tasks reset per weekday, one-off scheduled
tasks show only on their date. Navigation via calendar-style day picker.

## Stack

- **Next.js 16** (App Router, TypeScript) — Server Components for reads,
  Server Actions for writes
- **Supabase** (Postgres + Auth via `@supabase/ssr`)
- **Tailwind CSS 4**
- **dnd-kit** — kanban drag and drop
- **TanStack Query** — client-side cache and optimistic mutations
- **date-fns**, **react-day-picker** — dates and date picker
- **zod** — form validation

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in with real Supabase credentials
npm run dev
```

Required variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Without real values the app shouldn't run — never use a placeholder.

## Schema

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  priority text not null check (priority in ('baixa','media','alta','urgente')) default 'media',
  type text not null check (type in ('recurring','scheduled')),
  recurrence_days int[],   -- 0=sun ... 6=sat, recurring only
  due_date date,           -- scheduled only
  tag text,
  archived boolean default false,
  created_at timestamptz default now()
);

create table task_statuses (
  task_id uuid references tasks(id) on delete cascade,
  user_id uuid references auth.users not null,
  status_date date not null,
  status text not null check (status in ('todo','doing','done')) default 'todo',
  updated_at timestamptz default now(),
  primary key (task_id, status_date)
);
```

RLS enabled on both tables, policy always `user_id = auth.uid()`.

Status lives in `(task_id, status_date)`, not on the task itself — that's
what makes a recurring task "reset" every new day.

Migrations live in `supabase/migrations/`.

## Structure

```
app/
  actions.ts          Server Actions (create/update/delete task, status)
  auth/confirm/        auth confirmation callback
  login/                login page + actions
  page.tsx              day's kanban
components/
  kanban-board.tsx      board with todo/doing/done columns
  task-card.tsx         draggable task card
  task-detail-drawer.tsx  detail/edit/delete drawer
  task-form.tsx         task creation form
  DateNav.tsx            day navigation + date picker
  confirm-dialog.tsx     generic confirmation modal
lib/
  queries.ts             read queries (get_day_view etc)
  supabase/              Supabase clients (browser/server)
supabase/migrations/      schema and SQL migrations
```

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve build
npm run lint    # eslint
```
