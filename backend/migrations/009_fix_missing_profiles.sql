-- ============================================================
-- 009: Ensure profile rows can be self-healed for authenticated users
-- Fixes FK errors when legacy users exist in auth.users but not profiles
-- ============================================================

-- Allow authenticated users to insert their own profile row if missing
do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'profiles'
          and policyname = 'Users can insert own profile'
    ) then
        create policy "Users can insert own profile"
            on public.profiles for insert
            to authenticated
            with check (auth.uid() = id);
    end if;
end $$;

-- Backfill missing profile rows for existing auth users
insert into public.profiles (id, full_name, terrain_preference)
select
    au.id,
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'terrain_preference'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;
