# Deployment Guide

The `user` and `admin` apps deploy as **two independent sites on two different
domains** from this single monorepo. They share build-time code
(`packages/shared`) but produce **separate, self-contained** static bundles —
nothing is shared between them at runtime, so different domains never conflict.

> Key fact: `packages/shared` is bundled *into* each app at build time. The
> shared package only needs to resolve during `npm install` + `vite build`,
> which is why builds run from the **repo root** (where npm workspaces live).
> The published `dist/` folders have zero dependency on the monorepo.

---

## Environment variables

Both apps read `VITE_*` variables. Locally these come from the root `.env`
file; on a host they come from the platform's build environment (set them in
the dashboard — there is no `.env` file in the repo). See `.env.example` for
the full list. At minimum each site needs:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

Add the eSewa / weather / chatbot vars from `.env.example` as needed.

---

## Vercel (two projects, same repo)

Create **two** Vercel projects pointing at this repo:

| Setting | User site | Admin site |
|---|---|---|
| Root Directory | `user` | `admin` |
| Framework Preset | Vite | Vite |
| Build Command | `npm run build` (default) | `npm run build` (default) |
| Output Directory | `dist` (default) | `dist` (default) |
| Install Command | `npm install` (default) | `npm install` (default) |

When the Root Directory is a workspace member, Vercel installs from the
monorepo root automatically, so `packages/shared` resolves. SPA routing is
handled by `user/vercel.json` and `admin/vercel.json` (rewrites all paths to
`index.html`). Assign each project its own domain in **Settings → Domains**.

---

## Netlify (two sites, same repo)

Create **two** Netlify sites pointing at this repo:

| Setting | User site | Admin site |
|---|---|---|
| Base directory | *(leave empty — repo root)* | *(leave empty — repo root)* |
| Build command | `npm run build:user` | `npm run build:admin` |
| Publish directory | `user/dist` | `admin/dist` |

Building from the repo root lets npm workspaces resolve `packages/shared`. SPA
routing is handled by `user/public/_redirects` and `admin/public/_redirects`
(copied into `dist/` at build). Assign each site its own domain in
**Domain management**.

---

## Any other static host (S3/CloudFront, Nginx, etc.)

From the repo root:

```bash
npm install
npm run build:user     # -> user/dist
npm run build:admin    # -> admin/dist
```

Upload `user/dist` to one origin and `admin/dist` to the other. Configure each
origin to serve `index.html` for unknown routes (SPA fallback / try_files).

---

## Backend (`supabase/`) — deployed separately

The database and Edge Functions are **not** part of the frontend deploys. They
live on your Supabase project:

- **Schema/seed**: apply `supabase/migrations/*.sql` then `supabase/seed/*.sql`
  (see [`../supabase/README.md`](../supabase/README.md)), or `supabase db push`.
- **Edge Functions**: `supabase functions deploy chatbot` and
  `supabase functions deploy send-booking-approval-email`, plus their secrets
  (see [`../supabase/README.md`](../supabase/README.md)).

Point both frontend sites' `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` at
this same Supabase project.
