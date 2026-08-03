-- Primer — derived stats views and RPCs.
-- Both stats views hard-filter status = 'published' so public numbers are
-- role-independent (admins see the same counts learners do in browse UI;
-- admin tables use their own unfiltered aggregate queries).

create or replace view public.topic_stats
with (security_invoker = on) as
select
  l.topic_id,
  count(*)::int as lesson_count,
  sum(l.minutes)::int as total_minutes
from public.lessons l
join public.topics t on t.id = l.topic_id
where t.status = 'published'
group by l.topic_id;

create or replace view public.category_stats
with (security_invoker = on) as
select
  c.id as category_id,
  count(distinct s.id)::int as subcategory_count,
  count(distinct t.id)::int as topic_count,
  coalesce(sum(l.minutes), 0)::int as total_minutes
from public.categories c
left join public.subcategories s on s.category_id = c.id
left join public.topics t on t.subcategory_id = s.id and t.status = 'published'
left join public.lessons l on l.topic_id = t.id
group by c.id;

-- ---------------------------------------------------------------------------
-- search_topics: FTS with substring + joined-name fallbacks.
-- Visible = published AND assigned to a subcategory.
-- ---------------------------------------------------------------------------

create or replace function public.search_topics(q text)
returns table (
  slug text,
  title text,
  description text,
  level public.topic_level,
  topic_sort_order int,
  sub_slug text,
  sub_name text,
  cat_slug text,
  cat_name text,
  lesson_count int,
  total_minutes int
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    t.slug,
    t.title,
    t.description,
    t.level,
    t.sort_order,
    s.slug,
    s.name,
    c.slug,
    c.name,
    coalesce(ts.lesson_count, 0),
    coalesce(ts.total_minutes, 0)
  from public.topics t
  join public.subcategories s on s.id = t.subcategory_id
  join public.categories c on c.id = s.category_id
  left join public.topic_stats ts on ts.topic_id = t.id
  where t.status = 'published'
    and (
      q is null or btrim(q) = ''
      or t.search_tsv @@ websearch_to_tsquery('english', q)
      or t.title ilike '%' || btrim(q) || '%'
      or s.name ilike '%' || btrim(q) || '%'
      or c.name ilike '%' || btrim(q) || '%'
    )
  order by
    ts_rank(t.search_tsv, websearch_to_tsquery('english', coalesce(nullif(btrim(q), ''), ''))) desc,
    c.id, s.sort_order, t.sort_order;
$$;

revoke execute on function public.search_topics(text) from public;
grant execute on function public.search_topics(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- dashboard_stats: the four member stat cards in one call.
-- tz_offset_minutes = the caller's local offset from UTC (e.g. IST = 330) so
-- streak day boundaries follow the learner's clock, not UTC.
-- ---------------------------------------------------------------------------

create or replace function public.dashboard_stats(tz_offset_minutes int default 0)
returns table (
  day_streak int,
  lessons_done int,
  minutes_this_month int,
  bookmark_count int
)
language sql
stable
security invoker
set search_path = ''
as $$
  with local_now as (
    select now() + make_interval(mins => tz_offset_minutes) as ts
  ),
  days as (
    select distinct (lp.completed_at + make_interval(mins => tz_offset_minutes))::date as d
    from public.lesson_progress lp
    where lp.user_id = (select auth.uid())
  ),
  anchor as (
    -- Streak counts back from today if the user learned today, else from
    -- yesterday (an unbroken streak survives until a full day is missed).
    select case
      when exists (select 1 from days, local_now where d = local_now.ts::date) then (select ts::date from local_now)
      when exists (select 1 from days, local_now where d = local_now.ts::date - 1) then (select ts::date from local_now) - 1
      else null
    end as a
  ),
  streak as (
    select count(*)::int as n
    from (
      select d, row_number() over (order by d desc) as rn
      from days, anchor
      where anchor.a is not null and d <= anchor.a
    ) x, anchor
    where x.d = anchor.a - (x.rn - 1)::int
  )
  select
    coalesce((select n from streak), 0),
    (select count(*)::int from public.lesson_progress lp
      where lp.user_id = (select auth.uid())),
    coalesce((select sum(lp.minutes)::int from public.lesson_progress lp, local_now
      where lp.user_id = (select auth.uid())
        and date_trunc('month', lp.completed_at + make_interval(mins => tz_offset_minutes))
          = date_trunc('month', local_now.ts)), 0),
    (select count(*)::int from public.bookmarks b
      where b.user_id = (select auth.uid()));
$$;

revoke execute on function public.dashboard_stats(int) from public, anon;
grant execute on function public.dashboard_stats(int) to authenticated;
