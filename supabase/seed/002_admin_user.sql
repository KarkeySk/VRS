-- ============================================================
-- 002: Development admin user seed
-- Creates admin@gmail.com / admin123 if missing
-- ============================================================

do $$
declare
    v_user_id uuid;
    v_email text := 'admin@gmail.com';
    v_password text := 'admin123';
begin
    select id
    into v_user_id
    from auth.users
    where email = v_email
    limit 1;

    if v_user_id is null then
        v_user_id := gen_random_uuid();

        insert into auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        values (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        insert into auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        )
        values (
            gen_random_uuid(),
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_email),
            'email',
            v_user_id::text,
            now(),
            now(),
            now()
        );
    end if;

    insert into public.profiles (id, full_name, role)
    values (v_user_id, 'Admin User', 'admin')
    on conflict (id) do update set role = 'admin';
end $$;
