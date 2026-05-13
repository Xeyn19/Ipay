create or replace function public.reassign_and_delete_news_post_category(
  target_category_id uuid,
  replacement_category_id uuid
)
returns table (reassigned_post_count bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows bigint;
begin
  if target_category_id is null then
    raise exception 'target_category_id is required';
  end if;

  if replacement_category_id is null then
    raise exception 'replacement_category_id is required';
  end if;

  if target_category_id = replacement_category_id then
    raise exception 'replacement_category_id must be different from target_category_id';
  end if;

  if not exists (
    select 1
    from public.news_post_categories
    where id = target_category_id
  ) then
    raise exception 'Target category not found';
  end if;

  if not exists (
    select 1
    from public.news_post_categories
    where id = replacement_category_id
  ) then
    raise exception 'Replacement category not found';
  end if;

  update public.news_posts
  set category_id = replacement_category_id
  where category_id = target_category_id;

  get diagnostics affected_rows = row_count;

  delete from public.news_post_categories
  where id = target_category_id;

  return query
  select affected_rows as reassigned_post_count;
end;
$$;
