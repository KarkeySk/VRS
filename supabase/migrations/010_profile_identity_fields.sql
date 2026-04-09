-- ============================================================
-- 010: Reconfigure profile identity fields
-- Adds dedicated name/email fields to profiles and keeps them
-- synced from auth.users for reliable admin/user management.
-- ============================================================

alter table public.profiles
    add column if not exists email text,
    add column if not exists first_name text,
    add column if not exists last_name text;

create unique index if not exists profiles_email_unique_idx
    on public.profiles (lower(email))
    where email is not null;

-- Backfill identity fields from auth.users + existing profile names.
with resolved as (
    select
        p.id,
        au.email as auth_email,
        coalesce(
            nullif(p.full_name, ''),
            nullif(au.raw_user_meta_data ->> 'full_name', '')
        ) as resolved_full_name
    from public.profiles p
    join auth.users au on au.id = p.id
)
update public.profiles p
set
    email = coalesce(r.auth_email, p.email),
    full_name = coalesce(nullif(p.full_name, ''), r.resolved_full_name),
    first_name = coalesce(
        nullif(p.first_name, ''),
        nullif(split_part(r.resolved_full_name, ' ', 1), '')
    ),
    last_name = coalesce(
        nullif(p.last_name, ''),
        nullif(regexp_replace(r.resolved_full_name, '^\S+\s*', ''), '')
    )
from resolved r
where p.id = r.id;

-- Replace signup trigger handler to include identity fields.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
    v_full_name text;
begin
    v_full_name := nullif(new.raw_user_meta_data ->> 'full_name', '');

    insert into public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        terrain_preference
    )
    values (
        new.id,
        new.email,
        v_full_name,
        nullif(split_part(v_full_name, ' ', 1), ''),
        nullif(regexp_replace(v_full_name, '^\S+\s*', ''), ''),
        new.raw_user_meta_data ->> 'terrain_preference'
    )
    on conflict (id) do update
    set
        email = excluded.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
        first_name = coalesce(nullif(public.profiles.first_name, ''), excluded.first_name),
        last_name = coalesce(nullif(public.profiles.last_name, ''), excluded.last_name),
        terrain_preference = coalesce(public.profiles.terrain_preference, excluded.terrain_preference);

    return new;
end;
$$;

-- Sync profile email/name when auth.users record is updated.
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
    v_full_name text;
begin
    v_full_name := nullif(new.raw_user_meta_data ->> 'full_name', '');

    update public.profiles
    set
        email = new.email,
        full_name = coalesce(nullif(public.profiles.full_name, ''), v_full_name),
        first_name = coalesce(
            nullif(public.profiles.first_name, ''),
            nullif(split_part(v_full_name, ' ', 1), '')
        ),
        last_name = coalesce(
            nullif(public.profiles.last_name, ''),
            nullif(regexp_replace(v_full_name, '^\S+\s*', ''), '')
        )
    where id = new.id;

    return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
    after update of email, raw_user_meta_data on auth.users
    for each row
    execute function public.handle_auth_user_updated();
