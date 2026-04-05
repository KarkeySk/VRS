-- ============================================================
-- 001: Profiles table
-- Auto-creates a profile row whenever a new user signs up
-- ============================================================

create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    full_name   text,
    avatar_url  text,
    phone       text,
    terrain_preference text,
    role        text not null default 'user' check (role in ('user', 'admin')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Enable RLS (policies added in a later migration)
alter table public.profiles enable row level security;

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.profiles (id, full_name, terrain_preference)
    values (
        new.id,
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'terrain_preference'
    );
    return new;
end;
$$;

-- Fire after every insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Auto-update the updated_at column
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();
