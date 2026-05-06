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
8. `migrations/008_create_ui_assets.sql` — UI image asset table (replaces hardcoded image URLs)
9. `migrations/009_fix_missing_profiles.sql` — Backfill missing profiles + allow users to self-create own profile row
10. `migrations/010_profile_identity_fields.sql` — Add profile `email`, `first_name`, `last_name` and sync from auth users

## Seed data

After migrations, run the seed file to populate the fleet:

- `seed/001_vehicles.sql` — 9 vehicles (SUVs, jeeps, bike)
- `seed/002_admin_user.sql` — development admin login:
  - email: `admin@gmail.com`
  - password: `admin123`
- `seed/003_admin_ui_assets.sql` — admin dashboard/operations image URLs
  - also seeds user popular route images:
    - `user_route_upper_mustang`
    - `user_route_annapurna_base`
    - `user_route_khumbu`

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

## Booking confirmation email function

The admin app sends booking confirmation emails through the Supabase Edge
Function at `functions/send-booking-approval-email`. This is application email,
not Supabase Auth email.

Deploy it for each Supabase project used by the app:

```bash
npx supabase link --project-ref <project-ref>
npx supabase secrets set SMTP_HOST=smtp.gmail.com
npx supabase secrets set SMTP_PORT=587
npx supabase secrets set SMTP_USER=<gmail-address>
npx supabase secrets set SMTP_PASSWORD=<google-app-password>
npx supabase secrets set BOOKING_EMAIL_FROM="Bhatbhate <gmail-address>"
npx supabase functions deploy send-booking-approval-email
```

For production hosting, also set the frontend environment variables to the same
Supabase project:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

If those production env vars point to a different Supabase project, deploy the
function and secrets to that project too.
