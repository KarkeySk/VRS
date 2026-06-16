# Bhatbhati VRS — Vehicle Rental System

Monorepo containing two React + Vite frontends and a Supabase backend.

## Layout

```
.
├── user/             Customer-facing React app  (port 5173)
│   └── src/features/chatbot/   AI assistant (client) + its config
├── admin/            Internal admin React app   (port 5174)
├── supabase/         Supabase project: config.toml, migrations, seed, Edge Functions
├── packages/
│   └── shared/       Shared services + utils used by both apps
├── docs/             Project docs (status, user manual, chatbot, testing)
└── package.json      npm workspaces root
```

## Prerequisites

- **Node.js 20+** (developed against v24)
- **npm 10+** (ships with Node)
- A **Supabase project** (free tier is fine)

> ⚠️ Use `npm` only. Do not mix in `pnpm` or `yarn` — the lockfile and workspace config are npm-specific. Do not run `npm install` inside `user/` or `admin/`; only at the repo root.

## Setup

### 1. Install dependencies

From the repo root:

```bash
npm install
```

This installs everything for `user/`, `admin/`, and `packages/shared/` via npm workspaces. A single `node_modules/` is created at the root.

### 2. Configure environment variables

Create a `.env` file at the repo root (both apps read from there — see `envDir` in each `vite.config.js`):

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>

# eSewa payments (optional — defaults to sandbox/test credentials)
VITE_ESEWA_MERCHANT_CODE=EPAYTEST
VITE_ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
VITE_ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form

# Weather widget (optional)
VITE_WEATHER_LOCATION=Kathmandu
VITE_WEATHER_LAT=27.7172
VITE_WEATHER_LON=85.3240
```

> If eSewa vars are omitted, the app falls back to the public sandbox credentials. To go live, replace with real merchant credentials and the production URL `https://epay.esewa.com.np/api/epay/main/v2/form`.

### 3. Set up the database

See [`supabase/README.md`](supabase/README.md) for the full migration order. Quick version:

1. In your Supabase dashboard → **SQL Editor**, run each file in `supabase/migrations/` in numeric order (001 → 013).
2. Run each seed file in `supabase/seed/` in numeric order to populate vehicles, an admin user, and UI assets.
3. (Optional) Toggle **Confirm Email OFF** in Authentication → Providers → Email for local dev.

## Running the project

> **All `npm` commands below are run from the repo root** (`VRS/`), **not** from inside `user/`, `admin/`, `supabase/`, or `packages/`. The npm workspace setup expects this.

### First-time setup walkthrough

Open a terminal and run, **in order**:

```bash
# 1. Go to the project root
cd /path/to/VRS

# 2. Install all dependencies (one time, or whenever package.json changes)
npm install

# 3. Make sure the .env file exists at the repo root
ls .env        # if missing, create it using the template in "2. Configure environment variables" above

# 4. Start the dev servers
npm run dev
```

That last command starts **both** apps in parallel. You should see something like:

```
[user]  ➜  Local:   http://localhost:5173/
[admin] ➜  Local:   http://localhost:5174/
```

### Open the apps in your browser

| App | URL | Who uses it |
|---|---|---|
| **User app** (customer) | <http://localhost:5173> | Public site — browse vehicles, book, pay |
| **Admin app** (internal) | <http://localhost:5174> | Operations — fleet, bookings, dashboard |

### Run only one app

If you don't need both running at the same time:

```bash
# From the repo root:
npm run dev:user      # user app only — http://localhost:5173
npm run dev:admin     # admin app only — http://localhost:5174
```

### Stopping the dev server

In the terminal where it's running, press **Ctrl+C** (Windows/Linux) or **Cmd+C** (macOS).

### All available commands

Run all of these from the repo root (`VRS/`):

| Command | What it does |
|---|---|
| `npm install` | Install/update dependencies for the whole workspace |
| `npm run dev` | Start **both** apps (user :5173 + admin :5174) in parallel |
| `npm run dev:user` | Start only the user app on :5173 |
| `npm run dev:admin` | Start only the admin app on :5174 |
| `npm run build:user` | Production build of the user app → `user/dist/` |
| `npm run build:admin` | Production build of the admin app → `admin/dist/` |

### Working on the backend (database)

The backend lives in `supabase/` (migrations, seed, Edge Functions, and `config.toml`). You don't run a server locally — your code talks to the hosted Supabase project directly.

To apply schema changes, follow [`supabase/README.md`](supabase/README.md) to run the migrations in the Supabase dashboard.

Or with the Supabase CLI (if installed), from the repo root:

```bash
supabase db push
```

## Default admin login (development only)

After running the seed files in `supabase/seed/`:

- Email: `admin@gmail.com`
- Password: `admin123`

Log in at <http://localhost:5174> using these. To promote any other user to admin, run the SQL snippet in [`supabase/README.md`](supabase/README.md#make-a-user-admin).

## Migrating to a new machine

```bash
git clone <repo-url>
cd VRS
npm install
cp /path/to/your/.env .env   # or recreate using the template above
npm run dev
```

That's it — the npm workspace handles all transitive dependencies (including `crypto-js` used by the eSewa integration).

## Troubleshooting

**`Failed to resolve import "crypto-js"` (or any package) when starting Vite**
Someone ran `npm install` inside `user/` or `admin/` instead of at the root. Fix:

```bash
# from the repo root
rm -rf user/node_modules admin/node_modules user/package-lock.json admin/package-lock.json
rm -rf node_modules user/node_modules/.vite admin/node_modules/.vite
npm install
```

**Port already in use (`5173` or `5174`)**
Another Vite server is already running. Find and stop it:

```bash
# Linux/macOS
lsof -i :5173
kill <PID>
```

Or change the port in `user/vite.config.js` / `admin/vite.config.js` (`server.port`).

**`.env` changes not taking effect**
Vite reads `.env` at startup. Restart the dev server (Ctrl+C, then `npm run dev` again). Also make sure each variable is prefixed with `VITE_` — anything else won't be exposed to the browser.

**"Supabase is not configured" / blank pages with auth errors**
`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing or wrong in `.env`. Check the values in your Supabase dashboard → Project Settings → API.

**Payment redirects back with "Payment was cancelled or failed"**
You're hitting the eSewa sandbox. Use the sandbox test login: ID `9806800001`, password `Nepal@123`, MPIN `1122`, OTP `123456`. Real eSewa accounts won't work against the sandbox URL.

## Project status

See [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for implemented features, current architecture, and the production-readiness checklist. Other docs live in [`docs/`](docs/) — the [user manual](docs/USER_MANUAL.md), [chatbot setup](docs/chatbot/SETUP.md), and [testing notes](docs/TESTING_ISSUES.md).
