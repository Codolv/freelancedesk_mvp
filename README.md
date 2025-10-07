# FreelanceDesk (MVP)

A minimal client portal for freelancers: projects, invoices, files, updates, and authentication (Supabase). Built with Next.js App Router + Tailwind.

## Quickstart

1) Install
```bash
npm install
```

2) Environment
- Copy `.env.example` to `.env.local` and fill values
- Required keys:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `APP_URL` (e.g. http://localhost:3000)
  - `RESEND_API_KEY` (optional now)
  - `STRIPE_SECRET_KEY` (optional now)
  - `STRIPE_WEBHOOK_SECRET` (optional now)

3) Supabase setup
- Create a Supabase project and get the URL and anon key
- Auth → Providers:
  - Enable Email (for email+password)
  - Enable Google (OAuth) and set redirect: `${APP_URL}/auth/callback`
- Storage → Create a bucket named `files` and allow authenticated read/write (for MVP)

4) Run
```bash
npm run dev
```
Visit `http://localhost:3000/signin`.

## Auth
- Email + Password: handled client-side with `supabase.auth.signInWithPassword`
- Google OAuth: `supabase.auth.signInWithOAuth` → redirects to `/auth/callback`
- Server components use `await getServerSupabase()` from `lib/supabase/server.ts`

## App Structure
- `app/(auth)/signin` – Sign-in page (email+password and Google)
- `app/auth/callback` – OAuth/Magic-link callback (used for Google; not needed for password)
- `app/(dashboard)/layout.tsx` – Protected layout (redirects to `/signin` if not authenticated)
- `app/(dashboard)/*` – Sections: `dashboard`, `projects`, `invoices`, `files`, `updates`, `settings`
- `lib/supabase/*` – Supabase server/client utilities
- `env.ts` – Typed environment access

## Invoices (stub)
- `app/(dashboard)/invoices` lists mock invoices
- `app/(dashboard)/invoices/[id]` shows a placeholder with a “Pay with Stripe” button

## Files (stub)
- `app/(dashboard)/files` uploads to and lists from Supabase Storage bucket `files`

## Updates (stub)
- `app/api/updates` returns mock updates
- `app/(dashboard)/updates` fetches and displays them

## Deploy
- Vercel recommended. Set all env vars in the Vercel project settings.
- Configure OAuth provider redirect to your production URL `/auth/callback`.

## Notes
- This MVP intentionally keeps data models minimal. Replace stubs with real database tables, RLS policies, and server actions as you evolve the app.
