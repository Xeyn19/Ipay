create table if not exists public.news_post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.news_posts(id) on delete cascade,
  ip_hash text not null,
  viewed_at timestamptz not null default timezone('utc', now())
);

create index if not exists news_post_views_post_id_ip_hash_viewed_at_idx
  on public.news_post_views (post_id, ip_hash, viewed_at);

alter table public.news_post_views enable row level security;

create or replace function public.increment_view_count(post_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.news_posts
  set view_count = view_count + 1
  where id = $1;
end;
$$;

create or replace function public.record_news_post_view(p_post_id uuid, p_ip_hash text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_lock_key bigint;
begin
  v_lock_key := pg_catalog.hashtextextended(p_post_id::text || ':' || p_ip_hash, 0);
  perform pg_catalog.pg_advisory_xact_lock(v_lock_key);

  if exists (
    select 1
    from public.news_post_views
    where post_id = p_post_id
      and ip_hash = p_ip_hash
      and viewed_at >= (pg_catalog.now() - interval '24 hours')
  ) then
    return false;
  end if;

  insert into public.news_post_views (post_id, ip_hash)
  values (p_post_id, p_ip_hash);

  perform public.increment_view_count(p_post_id);

  return true;
end;
$$;

revoke all on function public.increment_view_count(uuid) from public, anon, authenticated;
revoke all on function public.record_news_post_view(uuid, text) from public, anon, authenticated;

grant execute on function public.increment_view_count(uuid) to service_role;
grant execute on function public.record_news_post_view(uuid, text) to service_role;
