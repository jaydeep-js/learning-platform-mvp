-- Primer — schema: enums, tables, triggers, indexes.
-- Catalog hierarchy: categories → subcategories → topics → units → lessons.
-- Learner data: profiles, lesson_progress (per-lesson rows), bookmarks, recent_views.

create schema if not exists private;

create type public.topic_level as enum ('beginner', 'intermediate', 'advanced');
create type public.topic_status as enum ('draft', 'review', 'published');

-- ---------------------------------------------------------------------------
-- shared trigger helpers
-- ---------------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Slugs are generated once on INSERT (never regenerated on rename — learner
-- URLs, bookmarks, and deep links must stay stable) with -2/-3… on collision.
create or replace function private.slugify(src text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(src, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function private.set_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  base := private.slugify(coalesce(new.name, new.title));
  if base = '' then
    base := 'untitled';
  end if;
  candidate := base;
  loop
    if tg_table_name = 'categories' then
      exit when not exists (select 1 from public.categories where slug = candidate);
    elsif tg_table_name = 'subcategories' then
      exit when not exists (select 1 from public.subcategories where slug = candidate);
    else
      exit when not exists (select 1 from public.topics where slug = candidate);
    end if;
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (one row per auth user, created by trigger)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'learner' check (role in ('learner', 'admin')),
  pref_weekly_recap boolean not null default true,
  pref_streak_reminder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- catalog
-- ---------------------------------------------------------------------------

create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  icon text not null default 'folder',
  tint text not null default '#F3F1E8',
  tint_ink text not null default '#4C5561',
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_slug before insert on public.categories
  for each row execute function private.set_slug();
create trigger categories_updated_at before update on public.categories
  for each row execute function private.set_updated_at();

create table public.subcategories (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subcategories_category_id_idx on public.subcategories (category_id);
create trigger subcategories_slug before insert on public.subcategories
  for each row execute function private.set_slug();
create trigger subcategories_updated_at before update on public.subcategories
  for each row execute function private.set_updated_at();

create table public.topics (
  id bigint generated always as identity primary key,
  -- Deleting a subcategory unlinks its topics (hidden from learners until
  -- reassigned) — matches the admin delete-confirmation copy.
  subcategory_id bigint references public.subcategories (id) on delete set null,
  slug text not null unique,
  title text not null,
  description text not null default '',
  level public.topic_level not null default 'beginner',
  status public.topic_status not null default 'draft',
  sort_order int not null default 0,
  -- Single-table generated column: can never go stale. Sub/category names are
  -- matched via joins inside search_topics(), not denormalized here.
  search_tsv tsvector generated always as (
    to_tsvector('english', title || ' ' || description)
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index topics_subcategory_id_idx on public.topics (subcategory_id);
create index topics_status_idx on public.topics (status);
create index topics_search_tsv_idx on public.topics using gin (search_tsv);
create trigger topics_slug before insert on public.topics
  for each row execute function private.set_slug();
create trigger topics_updated_at before update on public.topics
  for each row execute function private.set_updated_at();

create table public.units (
  id bigint generated always as identity primary key,
  topic_id bigint not null references public.topics (id) on delete cascade,
  title text not null,
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, sort_order),
  -- composite-FK target so lessons can never point at a unit of another topic
  unique (id, topic_id)
);

create index units_topic_id_idx on public.units (topic_id);
create trigger units_updated_at before update on public.units
  for each row execute function private.set_updated_at();

create table public.lessons (
  id bigint generated always as identity primary key,
  topic_id bigint not null,
  unit_id bigint not null,
  title text not null,
  body_md text not null default '',
  minutes int not null check (minutes > 0),
  -- Global 1..N position within the topic — this is the lesson URL's :n.
  sort_order int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (unit_id, topic_id) references public.units (id, topic_id) on delete cascade,
  unique (topic_id, sort_order) deferrable initially deferred,
  -- composite-FK target so progress rows can never disagree on the topic
  unique (id, topic_id)
);

create index lessons_topic_id_idx on public.lessons (topic_id);
create index lessons_unit_id_idx on public.lessons (unit_id);
create trigger lessons_updated_at before update on public.lessons
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- learner data
-- ---------------------------------------------------------------------------

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id bigint not null,
  topic_id bigint not null,
  completed_at timestamptz not null default now(),
  -- Snapshot of the lesson's minutes at completion, by design: powers the
  -- "hours this month" stat and is intentionally not recomputed on edits.
  minutes int not null,
  primary key (user_id, lesson_id),
  foreign key (lesson_id, topic_id) references public.lessons (id, topic_id) on delete cascade
);

create index lesson_progress_user_topic_idx on public.lesson_progress (user_id, topic_id);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);
create index lesson_progress_topic_id_idx on public.lesson_progress (topic_id);

create table public.bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id bigint not null references public.topics (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index bookmarks_topic_id_idx on public.bookmarks (topic_id);

create table public.recent_views (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id bigint not null references public.topics (id) on delete cascade,
  -- Nullable: a deleted lesson degrades the entry to a topic-level row.
  lesson_id bigint references public.lessons (id) on delete set null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index recent_views_user_viewed_idx on public.recent_views (user_id, viewed_at desc);
create index recent_views_topic_id_idx on public.recent_views (topic_id);
create index recent_views_lesson_id_idx on public.recent_views (lesson_id);
