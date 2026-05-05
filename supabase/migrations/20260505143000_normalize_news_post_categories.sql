create table if not exists public.news_post_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists news_post_categories_name_lower_idx
  on public.news_post_categories (lower(name));

create or replace function public.set_news_post_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists news_post_categories_set_updated_at on public.news_post_categories;

create trigger news_post_categories_set_updated_at
before update on public.news_post_categories
for each row
execute function public.set_news_post_categories_updated_at();

alter table public.news_post_categories enable row level security;

drop policy if exists "Public can view news post categories" on public.news_post_categories;
create policy "Public can view news post categories"
  on public.news_post_categories
  for select
  to anon
  using (true);

drop policy if exists "Authenticated users can view news post categories" on public.news_post_categories;
create policy "Authenticated users can view news post categories"
  on public.news_post_categories
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can create news post categories" on public.news_post_categories;
create policy "Authenticated users can create news post categories"
  on public.news_post_categories
  for insert
  to authenticated
  with check (true);

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'news_posts'
      and column_name = 'category_id'
  ) then
    alter table public.news_posts
      add column category_id uuid references public.news_post_categories(id);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'news_posts'
      and column_name = 'category'
  ) then
    alter table public.news_posts
      drop column category;
  end if;
end $$;

alter table public.news_posts
  alter column category_id set not null;

create index if not exists news_posts_category_id_idx
  on public.news_posts (category_id);
