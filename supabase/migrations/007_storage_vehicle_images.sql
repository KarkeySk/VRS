-- ============================================================
-- 007: Storage bucket for vehicle images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

create policy "Vehicle images are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'vehicle-images');

create policy "Admins can upload vehicle images"
    on storage.objects for insert to authenticated
    with check (
        bucket_id = 'vehicle-images'
        and public.is_admin()
    );

create policy "Admins can update vehicle images"
    on storage.objects for update to authenticated
    using (
        bucket_id = 'vehicle-images'
        and public.is_admin()
    );

create policy "Admins can delete vehicle images"
    on storage.objects for delete to authenticated
    using (
        bucket_id = 'vehicle-images'
        and public.is_admin()
    );
