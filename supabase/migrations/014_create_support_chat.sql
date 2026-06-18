-- ============================================================
-- 014: Support chat (live user <-> admin messaging)
-- One conversation per user; admins reply from the dashboard.
-- Realtime-enabled so both sides see new messages instantly.
-- ============================================================

-- ---- Conversations: one per user ----
create table if not exists public.conversations (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null unique references public.profiles(id) on delete cascade,
    last_message    text,
    last_message_at timestamptz,
    user_unread     integer not null default 0,  -- messages the user hasn't read (sent by admin)
    admin_unread    integer not null default 0,  -- messages the admin hasn't read (sent by user)
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ---- Messages ----
create table if not exists public.support_messages (
    id              uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    sender_id       uuid not null references public.profiles(id) on delete cascade,
    sender_role     text not null check (sender_role in ('user', 'admin')),
    body            text not null check (char_length(body) between 1 and 4000),
    created_at      timestamptz not null default now()
);

create index if not exists idx_conversations_last_msg
    on public.conversations(last_message_at desc nulls last);
create index if not exists idx_support_messages_conv
    on public.support_messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.support_messages enable row level security;

-- Keep updated_at fresh (reuses helper from migration 001)
create trigger conversations_updated_at
    before update on public.conversations
    for each row execute function public.set_updated_at();

-- ============================================================
-- On every new message: update the conversation preview + bump
-- the unread counter for the *other* party.
-- ============================================================
create or replace function public.handle_new_support_message()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    update public.conversations set
        last_message    = left(new.body, 140),
        last_message_at = new.created_at,
        updated_at      = now(),
        admin_unread    = admin_unread + (case when new.sender_role = 'user'  then 1 else 0 end),
        user_unread     = user_unread  + (case when new.sender_role = 'admin' then 1 else 0 end)
    where id = new.conversation_id;
    return new;
end;
$$;

create trigger on_support_message_created
    after insert on public.support_messages
    for each row execute function public.handle_new_support_message();

-- ============================================================
-- RLS — conversations
-- ============================================================
create policy "Read own conversation or any as admin"
    on public.conversations for select to authenticated
    using (auth.uid() = user_id or public.is_admin());

create policy "Create own conversation"
    on public.conversations for insert to authenticated
    with check (auth.uid() = user_id);

-- Used to reset unread counters (mark as read)
create policy "Update own conversation or any as admin"
    on public.conversations for update to authenticated
    using (auth.uid() = user_id or public.is_admin())
    with check (auth.uid() = user_id or public.is_admin());

-- ============================================================
-- RLS — support_messages
-- ============================================================
create policy "Read messages in accessible conversations"
    on public.support_messages for select to authenticated
    using (
        public.is_admin()
        or exists (
            select 1 from public.conversations c
            where c.id = conversation_id and c.user_id = auth.uid()
        )
    );

-- Users may only post as 'user' into their own conversation;
-- admins may only post as 'admin'. sender_id must be the caller.
create policy "Send message into accessible conversation"
    on public.support_messages for insert to authenticated
    with check (
        sender_id = auth.uid()
        and (
            (sender_role = 'user' and exists (
                select 1 from public.conversations c
                where c.id = conversation_id and c.user_id = auth.uid()
            ))
            or (sender_role = 'admin' and public.is_admin())
        )
    );

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.support_messages;
