create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'news_post_status'
  ) then
    create type public.news_post_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  excerpt text not null,
  body jsonb not null,
  status public.news_post_status not null default 'draft',
  publish_date date not null,
  featured_image_path text,
  view_count integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists news_posts_status_idx
  on public.news_posts (status);

create index if not exists news_posts_publish_date_idx
  on public.news_posts (publish_date desc, created_at desc);

create or replace function public.set_news_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists news_posts_set_updated_at on public.news_posts;

create trigger news_posts_set_updated_at
before update on public.news_posts
for each row
execute function public.set_news_posts_updated_at();

alter table public.news_posts enable row level security;

drop policy if exists "Public can view published news posts" on public.news_posts;
create policy "Public can view published news posts"
  on public.news_posts
  for select
  to anon
  using (status = 'published');

drop policy if exists "Authenticated users can view news posts" on public.news_posts;
create policy "Authenticated users can view news posts"
  on public.news_posts
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can create news posts" on public.news_posts;
create policy "Authenticated users can create news posts"
  on public.news_posts
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update news posts" on public.news_posts;
create policy "Authenticated users can update news posts"
  on public.news_posts
  for update
  to authenticated
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('news-media', 'news-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view newsroom images" on storage.objects;
create policy "Public can view newsroom images"
  on storage.objects
  for select
  using (bucket_id = 'news-media');

drop policy if exists "Authenticated users can upload newsroom images" on storage.objects;
create policy "Authenticated users can upload newsroom images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'news-media');

drop policy if exists "Authenticated users can update newsroom images" on storage.objects;
create policy "Authenticated users can update newsroom images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'news-media')
  with check (bucket_id = 'news-media');

drop policy if exists "Authenticated users can delete newsroom images" on storage.objects;
create policy "Authenticated users can delete newsroom images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'news-media');
