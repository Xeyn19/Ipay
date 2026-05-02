create table if not exists public.lead_replies (
  id bigint generated always as identity primary key,
  lead_id bigint not null references public.leads(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  message_text text not null,
  template_key text,
  sender_user_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('sent', 'failed')),
  smtp_message_id text,
  error_message text,
  attachment_metadata jsonb not null default '[]'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lead_replies_lead_id_idx
  on public.lead_replies (lead_id);

create index if not exists lead_replies_created_at_idx
  on public.lead_replies (created_at desc);
