-- Fix: set_slug() referenced new.title directly, which errors (42703) on
-- categories/subcategories rows — plpgsql can't reference fields the record
-- doesn't have. Access the source column generically through to_jsonb(new).

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
  base := private.slugify(coalesce(to_jsonb(new) ->> 'name', to_jsonb(new) ->> 'title'));
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
