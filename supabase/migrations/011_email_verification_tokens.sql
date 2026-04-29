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

create extension if not exists pgcrypto with schema extensions;

create or replace function public.create_verification_token(p_user_id uuid)
returns table (
    token text,
    expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_token text;
    v_expires_at timestamptz;
begin
    if p_user_id is null then
        raise exception 'user_id is required';
    end if;

    v_token := translate(
        encode(extensions.gen_random_bytes(32), 'base64'),
        '+/=',
        '-_'
    );
    v_expires_at := now() + interval '30 minutes';

    update public.email_verification_tokens
    set used = true
    where user_id = p_user_id
      and used = false;

    insert into public.email_verification_tokens (
        user_id,
        token_hash,
        expires_at
    )
    values (
        p_user_id,
        encode(extensions.digest(v_token, 'sha256'), 'hex'),
        v_expires_at
    );

    token := v_token;
    expires_at := v_expires_at;
    return next;
end;
$$;

revoke all on function public.create_verification_token(uuid) from public;
grant execute on function public.create_verification_token(uuid) to service_role;
