alter table public.news_posts
  add column if not exists is_featured boolean not null default false;

create unique index if not exists news_posts_is_featured_unique_idx
  on public.news_posts (is_featured)
  where is_featured = true;

create or replace function public.normalize_news_post_featured_state()
returns trigger
language plpgsql
as $$
begin
  if new.status <> 'published' then
    new.is_featured = false;
  end if;

  return new;
end;
$$;

drop trigger if exists news_posts_normalize_featured_state on public.news_posts;

create trigger news_posts_normalize_featured_state
before insert or update on public.news_posts
for each row
execute function public.normalize_news_post_featured_state();

create or replace function public.set_featured_news_post(
  target_post_id uuid,
  actor_user_id uuid default null
)
returns table (featured_post_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status public.news_post_status;
begin
  select status
  into target_status
  from public.news_posts
  where id = target_post_id
  for update;

  if not found then
    raise exception 'Post not found.';
  end if;

  if target_status <> 'published' then
    raise exception 'Only published posts can be featured.';
  end if;

  update public.news_posts
  set is_featured = false,
      updated_by = coalesce(actor_user_id, updated_by)
  where is_featured = true
    and id <> target_post_id;

  update public.news_posts
  set is_featured = true,
      updated_by = coalesce(actor_user_id, updated_by)
  where id = target_post_id;

  return query
  select target_post_id;
end;
$$;
