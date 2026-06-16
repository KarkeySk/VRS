# Supabase Database Setup

## How to apply migrations

Go to your Supabase dashboard **SQL Editor** and run each file **in order**:

1. `migrations/001_create_profiles.sql` - Profiles table + auto-create trigger on signup
2. `migrations/002_create_vehicles.sql` - Vehicles table
3. `migrations/003_create_bookings.sql` - Bookings table
4. `migrations/004_rls_policies.sql` - Row Level Security for all tables
5. `migrations/005_storage_avatars.sql` - Avatar upload storage bucket
6. `migrations/006_create_inquiries.sql` - Inquiries, booking applications, and document storage policies
7. `migrations/007_storage_vehicle_images.sql` - Vehicle image storage bucket and admin policies
8. `migrations/008_create_ui_assets.sql` - UI image asset table
9. `migrations/009_fix_missing_profiles.sql` - Backfill missing profiles
10. `migrations/010_profile_identity_fields.sql` - Add profile identity fields
11. `migrations/011_add_payment_and_notifications.sql` - Payment and notification data
12. `migrations/012_add_vehicle_notes.sql` - Vehicle notes field
13. `migrations/013_booking_email_notifications.sql` - Booking email notification tracking

## Seed data

After migrations, run the seed file to populate the fleet:

- `seed/001_vehicles.sql` - 9 vehicles (SUVs, jeeps, bike)
- `seed/002_admin_user.sql` - development admin login:
  - email: `admin@gmail.com`
  - password: `admin123`
- `seed/003_admin_ui_assets.sql` - admin dashboard/operations image URLs

## Make a user admin

```sql
update public.profiles
set role = 'admin'
where id = '<user-uuid-from-auth.users>';
```

## Auth settings

In Supabase dashboard > Authentication > Providers > Email:
- Keep **Confirm Email** ON when email verification is required.

In Supabase dashboard > Authentication > URL Configuration:
- Set **Site URL** to your deployed user app origin, for example:
  `https://your-deployed-user-app.com`
- Add these **Redirect URLs**:
  - `http://localhost:5173/auth/verify`
  - `https://your-deployed-user-app.com/auth/verify`

In the frontend environment, set the deployed user app URL so verification
emails do not point to localhost:

```env
VITE_USER_APP_URL=https://your-deployed-user-app.com
```

If your verification page ever uses a different path, set the full callback URL:

```env
VITE_AUTH_REDIRECT_URL=https://your-deployed-user-app.com/auth/verify
```

## Booking confirmation email function

The admin app sends booking confirmation emails through the Supabase Edge
Function at `supabase/functions/send-booking-approval-email` (repo root,
alongside the other Edge Functions and `config.toml`). This is application
email, not Supabase Auth email.

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

You can also use Resend instead of SMTP:

```bash
npx supabase secrets set RESEND_API_KEY=<resend-api-key>
```

For production hosting, set the frontend environment variables to the same
Supabase project:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

If those production env vars point to a different Supabase project, deploy the
function and secrets to that project too.
