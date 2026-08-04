# Vercel + Cloudflare DNS + Supabase Deployment

This project deploys as two Vercel projects:

- Frontend: `frontend+` -> `https://www.myboverse.com`
- Backend: `backend` -> `https://api.myboverse.com`

## Supabase

1. Create a new Supabase project.
2. Copy the pooled connection string to `DATABASE_URL`.
3. Copy the direct connection string to `DIRECT_URL`.
4. In `backend`, run:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

Required backend environment variables:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
JWT_SECRET="replace_with_a_strong_secret"
JWT_EXPIRES_IN="1d"
```

## Backend Vercel Project

Project root: `backend`

Build command:

```bash
npm run vercel-build
```

Production domain:

```text
api.myboverse.com
```

After deployment, verify:

```bash
curl https://api.myboverse.com/api/auth/login
```

The login endpoint should return a method/validation error instead of a DNS, TLS, or CORS error when called with GET.

## Frontend Vercel Project

Project root: `frontend+`

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Production environment variables:

```env
VITE_API_BASE_URL=https://api.myboverse.com/api
VITE_USE_MOCK=false
```

Production domain:

```text
www.myboverse.com
```

## Cloudflare DNS

The domain is registered at Spaceship and delegates authoritative DNS to Cloudflare.

Expected records:

```text
@    A      216.198.79.1
@    A      64.29.17.1
www  CNAME  2345281f0f0668cc.vercel-dns-017.com
api  CNAME  41d8569592051bf5.vercel-dns-017.com
```

Use the exact Vercel-provided DNS target if Vercel shows a different verification record.

Keep all four records in DNS-only mode until Vercel reports a valid configuration and issues certificates. Configure `myboverse.com` in Vercel as a permanent redirect to `www.myboverse.com`.

## Final Verification

1. Visit `https://www.myboverse.com` and confirm `https://myboverse.com` redirects to it.
2. Refresh `/login`, `/dashboard`, and `/reports`; Vercel should serve the SPA fallback.
3. Log in or register; browser network calls should target `https://api.myboverse.com/api`.
4. Create a task, run detection, generate a report.
5. Confirm rows appear in Supabase tables.
