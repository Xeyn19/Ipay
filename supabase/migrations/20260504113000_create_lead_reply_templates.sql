create table if not exists public.lead_reply_templates (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  subject text not null,
  message_text text not null,
  source_template_key text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint lead_reply_templates_label_length_check
    check (char_length(btrim(label)) between 1 and 80),
  constraint lead_reply_templates_subject_length_check
    check (char_length(btrim(subject)) between 1 and 200),
  constraint lead_reply_templates_message_length_check
    check (char_length(btrim(message_text)) between 1 and 10000)
);

create index if not exists lead_reply_templates_user_id_created_at_idx
  on public.lead_reply_templates (user_id, created_at desc);

alter table public.lead_reply_templates enable row level security;

create policy "Users can view their own lead reply templates"
  on public.lead_reply_templates
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own lead reply templates"
  on public.lead_reply_templates
  for insert
  with check (auth.uid() = user_id);
