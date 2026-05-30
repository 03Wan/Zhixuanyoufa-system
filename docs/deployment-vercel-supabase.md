# Vercel + Cloudflare + Supabase Deployment

This project deploys as two Vercel projects:

- Frontend: `frontend+` -> `https://www.paperhelper.fun`
- Backend: `backend` -> `https://api.paperhelper.fun`

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
api.paperhelper.fun
```

After deployment, verify:

```bash
curl https://api.paperhelper.fun/api/auth/login
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
VITE_API_BASE_URL=https://api.paperhelper.fun/api
VITE_USE_MOCK=false
```

Production domain:

```text
www.paperhelper.fun
```

## Cloudflare DNS

The zone is already delegated to Cloudflare.

Expected records:

```text
www  CNAME  cname.vercel-dns.com
api  CNAME  cname.vercel-dns.com
@    A      216.198.79.1
```

Use the exact Vercel-provided DNS target if Vercel shows a different verification record.

Recommended SSL/TLS mode: `Full` or `Full (strict)`.

## Final Verification

1. Visit `https://www.paperhelper.fun`.
2. Refresh `/login`, `/dashboard`, and `/reports`; Vercel should serve the SPA fallback.
3. Log in or register; browser network calls should target `https://api.paperhelper.fun/api`.
4. Create a task, run detection, generate a report.
5. Confirm rows appear in Supabase tables.
