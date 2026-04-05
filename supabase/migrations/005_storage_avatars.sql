-- ============================================================
-- 005: Storage bucket for user avatars
-- ============================================================

-- Create a public bucket for avatar images
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (public bucket)
create policy "Avatar images are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'avatars');

-- Users can upload their own avatar
create policy "Users can upload own avatar"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = 'avatars'
        and auth.uid()::text = (storage.foldername(name))[2]
    );

-- Users can update (overwrite) their own avatar
create policy "Users can update own avatar"
    on storage.objects for update
    to authenticated
    using (
        bucket_id = 'avatars'
        and auth.uid()::text = (storage.foldername(name))[2]
    );
