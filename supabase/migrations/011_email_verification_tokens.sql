-- ============================================================
-- 011: Email verification tokens
-- Stores hashed, single-use verification tokens for auth users.
-- ============================================================

create table if not exists public.email_verification_tokens (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users(id) on delete cascade,
    token_hash  text not null,
    expires_at  timestamptz not null,
    used        boolean not null default false,
    created_at  timestamptz not null default now(),

    constraint email_verification_tokens_expires_after_created
        check (expires_at > created_at)
);

alter table public.email_verification_tokens enable row level security;

create index if not exists idx_email_verification_tokens_user
    on public.email_verification_tokens(user_id);

create unique index if not exists idx_email_verification_tokens_token_hash
    on public.email_verification_tokens(token_hash);

create unique index if not exists idx_email_verification_tokens_one_unused_per_user
    on public.email_verification_tokens(user_id)
    where used = false;
