-- Primer — Row Level Security.
-- Public (anon + authenticated) reads the published catalog; members write
-- only their own learner rows; admins (profiles.role = 'admin') manage the
-- catalog. RLS is the enforcement layer — route guards are UX only.

-- ---------------------------------------------------------------------------
-- admin helper
-- ---------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Policies execute AS the querying role, so anon/authenticated MUST be able
-- to execute the helper — without these grants every catalog read that
-- evaluates an "or is_admin()" arm errors with "permission denied".
-- The private schema is not exposed through PostgREST, so there is no
-- direct API surface.
revoke execute on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.topics enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.recent_views enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create policy "profiles are readable by their owner and admins"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Role escalation is blocked at the privilege layer, independently of RLS:
-- kill Supabase's default broad grant, then allow only the safe columns.
-- A PATCH that includes "role" fails the whole statement with 42501.
-- Role changes are therefore service-role-only (scripts/create-admin.ts).
revoke update on table public.profiles from anon, authenticated;
grant update (full_name, pref_weekly_recap, pref_streak_reminder)
  on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- catalog: public read, admin write
-- ---------------------------------------------------------------------------

create policy "categories are readable by everyone"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "admins manage categories"
  on public.categories for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "subcategories are readable by everyone"
  on public.subcategories for select
  to anon, authenticated
  using (true);

create policy "admins manage subcategories"
  on public.subcategories for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "published topics are readable by everyone, all by admins"
  on public.topics for select
  to anon, authenticated
  using (status = 'published' or (select private.is_admin()));

create policy "admins manage topics"
  on public.topics for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "admins update topics"
  on public.topics for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins delete topics"
  on public.topics for delete
  to authenticated
  using ((select private.is_admin()));

create policy "units of published topics are readable, all by admins"
  on public.units for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.topics t
      where t.id = topic_id and t.status = 'published'
    )
    or (select private.is_admin())
  );

create policy "admins manage units"
  on public.units for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "admins update units"
  on public.units for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins delete units"
  on public.units for delete
  to authenticated
  using ((select private.is_admin()));

-- Lesson bodies are intentionally public: guests can read every lesson of a
-- published topic (progress tracking is the member feature, not access).
create policy "lessons of published topics are readable, all by admins"
  on public.lessons for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.topics t
      where t.id = topic_id and t.status = 'published'
    )
    or (select private.is_admin())
  );

create policy "admins manage lessons"
  on public.lessons for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "admins update lessons"
  on public.lessons for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins delete lessons"
  on public.lessons for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- learner rows: own-row only
-- ---------------------------------------------------------------------------

create policy "users manage their own progress"
  on public.lesson_progress for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users manage their own bookmarks"
  on public.bookmarks for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "users manage their own recent views"
  on public.recent_views for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
