-- ============================================================
-- 006: Inquiries & booking applications
-- Stores user inquiries, document uploads, and questionnaire
-- ============================================================

-- Inquiries: user shows interest in a vehicle
create table if not exists public.inquiries (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    vehicle_id      uuid not null references public.vehicles(id) on delete cascade,
    message         text,
    drive_type      text not null default 'self-drive' check (drive_type in ('self-drive', 'with-driver')),
    selected_addons jsonb default '[]'::jsonb,
    status          text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

alter table public.inquiries enable row level security;
create index idx_inquiries_user on public.inquiries(user_id);
create index idx_inquiries_vehicle on public.inquiries(vehicle_id);

create trigger inquiries_updated_at
    before update on public.inquiries
    for each row execute function public.set_updated_at();

-- Booking applications: formal application with documents
create table if not exists public.booking_applications (
    id              uuid primary key default gen_random_uuid(),
    inquiry_id      uuid not null references public.inquiries(id) on delete cascade,
    user_id         uuid not null references public.profiles(id) on delete cascade,
    vehicle_id      uuid not null references public.vehicles(id) on delete cascade,

    -- dates
    start_date      date not null,
    end_date        date not null,

    -- driver details
    drive_type      text not null check (drive_type in ('self-drive', 'with-driver')),
    license_number  text,
    license_doc_url text,
    id_doc_url      text,

    -- questionnaire answers stored as JSON
    questionnaire   jsonb not null default '{}'::jsonb,

    -- pricing
    total_price     numeric(10,2) not null default 0,
    selected_addons jsonb default '[]'::jsonb,

    -- status
    status          text not null default 'submitted'
                        check (status in ('submitted', 'under-review', 'approved', 'rejected', 'confirmed', 'cancelled')),
    admin_notes     text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    constraint valid_app_dates check (end_date >= start_date)
);

alter table public.booking_applications enable row level security;
create index idx_applications_user on public.booking_applications(user_id);
create index idx_applications_status on public.booking_applications(status);

create trigger applications_updated_at
    before update on public.booking_applications
    for each row execute function public.set_updated_at();

-- ============================================================
-- RLS policies for new tables
-- ============================================================

-- Inquiries
create policy "Users can view own inquiries"
    on public.inquiries for select to authenticated
    using (auth.uid() = user_id);

create policy "Admins can view all inquiries"
    on public.inquiries for select to authenticated
    using (public.is_admin());

create policy "Users can create inquiries"
    on public.inquiries for insert to authenticated
    with check (auth.uid() = user_id);

create policy "Admins can update inquiries"
    on public.inquiries for update to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- Booking applications
create policy "Users can view own applications"
    on public.booking_applications for select to authenticated
    using (auth.uid() = user_id);

create policy "Admins can view all applications"
    on public.booking_applications for select to authenticated
    using (public.is_admin());

create policy "Users can create applications"
    on public.booking_applications for insert to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update own applications"
    on public.booking_applications for update to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Admins can update any application"
    on public.booking_applications for update to authenticated
    using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage bucket for booking documents
-- ============================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload own documents"
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can view own documents"
    on storage.objects for select to authenticated
    using (
        bucket_id = 'documents'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Admins can view all documents"
    on storage.objects for select to authenticated
    using (bucket_id = 'documents' and public.is_admin());
