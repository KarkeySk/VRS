-- ============================================================
-- 004: Row Level Security policies
-- Ensures users can only access their own data,
-- admins get full access
-- ============================================================

-- ---- Helper: check if current user is admin ----
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
          and role = 'admin'
    );
$$;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Anyone authenticated can read any profile (needed for booking joins)
create policy "Profiles are viewable by authenticated users"
    on public.profiles for select
    to authenticated
    using (true);

-- Users can only update their own profile
create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Admins can update any profile (e.g. assign roles)
create policy "Admins can update any profile"
    on public.profiles for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================
-- VEHICLES policies
-- ============================================================

-- Everyone (including anon) can read available vehicles
create policy "Vehicles are viewable by everyone"
    on public.vehicles for select
    using (true);

-- Only admins can insert vehicles
create policy "Admins can insert vehicles"
    on public.vehicles for insert
    to authenticated
    with check (public.is_admin());

-- Only admins can update vehicles
create policy "Admins can update vehicles"
    on public.vehicles for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Only admins can delete vehicles
create policy "Admins can delete vehicles"
    on public.vehicles for delete
    to authenticated
    using (public.is_admin());

-- ============================================================
-- BOOKINGS policies
-- ============================================================

-- Users can read their own bookings
create policy "Users can view own bookings"
    on public.bookings for select
    to authenticated
    using (auth.uid() = user_id);

-- Admins can read all bookings
create policy "Admins can view all bookings"
    on public.bookings for select
    to authenticated
    using (public.is_admin());

-- Authenticated users can create bookings (for themselves)
create policy "Users can create own bookings"
    on public.bookings for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Users can update (cancel) their own bookings
create policy "Users can update own bookings"
    on public.bookings for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Admins can update any booking
create policy "Admins can update any booking"
    on public.bookings for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
