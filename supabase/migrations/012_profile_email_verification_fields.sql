-- ============================================================
-- 012: Profile email verification fields
-- Adds custom email verification state to user profiles.
-- ============================================================

alter table public.profiles
    add column if not exists is_verified boolean not null default false,
    add column if not exists verification_token text,
    add column if not exists token_expiry timestamptz;

create index if not exists idx_profiles_verification_token
    on public.profiles(verification_token)
    where verification_token is not null;

create or replace function public.prevent_client_verification_field_updates()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.role() = 'service_role' then
        return new;
    end if;

    if new.is_verified is distinct from old.is_verified
        or new.verification_token is distinct from old.verification_token
        or new.token_expiry is distinct from old.token_expiry then
        raise exception 'email verification fields can only be changed by backend services';
    end if;

    return new;
end;
$$;

drop trigger if exists prevent_client_verification_field_updates on public.profiles;
create trigger prevent_client_verification_field_updates
    before update on public.profiles
    for each row
    execute function public.prevent_client_verification_field_updates();
