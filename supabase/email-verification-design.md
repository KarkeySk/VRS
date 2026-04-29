# Email Verification System Design

Initial design only. This covers the verification token storage model, minimal
token creation RPC, and backend-side token hashing examples. It does not send
emails, add frontend screens, or implement API routes.

## Migration SQL

Use `supabase/migrations/011_email_verification_tokens.sql`.

The migration creates `public.email_verification_tokens` with:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `token_hash text not null`
- `expires_at timestamptz not null`
- `used boolean not null default false`
- `created_at timestamptz not null default now()`

The table has RLS enabled and no direct client policies. Token rows should be
created or consumed by trusted backend code or security-definer RPCs only.

## Indexes And Constraints

- `idx_email_verification_tokens_user` supports user token lookups.
- `idx_email_verification_tokens_token_hash` is unique and supports verification
  lookups by SHA-256 hash.
- `idx_email_verification_tokens_one_unused_per_user` allows one unused token
  per user.
- `email_verification_tokens_expires_after_created` ensures expiration is after
  creation.

Expiration is enforced in verification queries with `expires_at > now()`.

## Minimal RPC

`public.create_verification_token(p_user_id uuid)`:

- Generates a cryptographically secure 32-byte random token with `pgcrypto`.
- Hashes the token with SHA-256.
- Stores only the token hash.
- Expires the token after 30 minutes.
- Marks older unused tokens for the user as used before inserting the new token.
- Returns the raw token once to the trusted caller.
- Grants execution only to `service_role`.

## Verification Query Pattern

The backend should hash the token submitted by the user and atomically mark the
matching row as used:

```sql
update public.email_verification_tokens
set used = true
where token_hash = :token_hash
  and used = false
  and expires_at > now()
returning id, user_id;
```

If no row is returned, the token is invalid, expired, or already used.

## Node/TS Token Generation Example

Use this only if token generation happens in application code instead of the
database RPC. Store `tokenHash`, never `rawToken`.

```ts
import { createHash, randomBytes } from "node:crypto";

export function createEmailVerificationToken() {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return { rawToken, tokenHash, expiresAt };
}

export function hashEmailVerificationToken(tokenFromUser: string) {
  return createHash("sha256").update(tokenFromUser).digest("hex");
}
```

Backend insert example:

```ts
const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

await supabase.from("email_verification_tokens").insert({
  user_id: userId,
  token_hash: tokenHash,
  expires_at: expiresAt,
});

// Send rawToken later through the chosen email provider. Do not persist it.
```
