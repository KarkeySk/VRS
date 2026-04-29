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
    created_at  timestamptz not null default now()
);

alter table public.email_verification_tokens enable row level security;
