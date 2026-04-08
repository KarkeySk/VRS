# Supabase Database Setup

## How to apply migrations

Go to your Supabase dashboard **SQL Editor** and run each file **in order**:

1. `migrations/001_create_profiles.sql` — Profiles table + auto-create trigger on signup
2. `migrations/002_create_vehicles.sql` — Vehicles table
3. `migrations/003_create_bookings.sql` — Bookings table
4. `migrations/004_rls_policies.sql` — Row Level Security for all tables
5. `migrations/005_storage_avatars.sql` — Avatar upload storage bucket
6. `migrations/006_create_inquiries.sql` — Inquiries, booking applications, and document storage policies
7. `migrations/007_storage_vehicle_images.sql` — Vehicle image storage bucket and admin policies

## Seed data

After migrations, run the seed file to populate the fleet:

- `seed/001_vehicles.sql` — 9 vehicles (SUVs, jeeps, bike)
- `seed/002_admin_user.sql` — development admin login:
  - email: `admin@gmail.com`
  - password: `admin123`

## Make a user admin

```sql
update public.profiles
set role = 'admin'
where id = '<user-uuid-from-auth.users>';
```

## Auth settings

In Supabase dashboard > Authentication > Providers > Email:
- Toggle **Confirm Email** OFF for development
- Keep it ON for production (configure SMTP first)
