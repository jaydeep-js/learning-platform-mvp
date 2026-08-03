# Primer — learning platform

Content-based learning platform: React 19 + TypeScript + Vite, backed by Supabase (Postgres + Auth). The visual design is the approved `New-Design/` prototype, ported 1:1.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Until the Supabase backend is connected (milestone M2), the app renders from mock data in `src/data/mock.ts`.

## Supabase setup (one-time)

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Disable email confirmation** (MVP decision): Dashboard → Authentication → Sign In / Up → Email → turn off "Confirm email". Without this, register → dashboard breaks because sign-up returns no session.
3. **Copy credentials** into `.env` (start from `.env.example`): project URL, anon key, service-role key, and the database URL.
4. **Apply migrations** (schema → RLS → views/functions):
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
5. **Seed the full catalog** (8 categories / 31 subcategories / 120 topics / 1,251 lessons):
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```
   The seed is fail-closed: it refuses to run if any learner data exists. Regenerate it after catalog changes with `npm run seed:generate`.
6. **Create the admin user** (role changes are impossible through the API by design):
   ```bash
   npx tsx scripts/create-admin.ts admin@yourdomain.com a-strong-password
   ```

## Verifying the backend

```bash
npm run test:rls
```

Runs the RLS suite against the live project: anonymous catalog reads, published-only visibility, own-row scoping for progress/bookmarks, role-escalation blocked, slug generation, cascade behavior, and post-seed sequence sanity. Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` first. The suite self-skips if the env vars are missing.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | Typecheck only |
| `npm run test` | Unit tests (format, catalog determinism, progress derivation) |
| `npm run test:rls` | RLS verification suite (needs live project) |
| `npm run test:e2e` | Playwright e2e: guest browsing, member loop, admin CRUD, axe accessibility — needs the live project + admin creds in `.env`; starts the dev server itself |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from the catalog |
| `npx tsx scripts/create-admin.ts <email> <pw>` | Create/promote the admin user |

## Accessibility

The e2e suite gates seven key routes on axe-core: zero serious/critical violations. Three design tokens were darkened slightly from the prototype to meet WCAG AA contrast (`--muted` #878E9B→#666D7C, `--amber` #9A6A00→#8F6300, `--red` #C2453A→#B43E33) — a deliberate, minimal deviation from the otherwise 1:1 visual port. Focus rings and `prefers-reduced-motion` come from the ported design system.

## Project layout

```
supabase/migrations/   schema · RLS · views/functions (single source of schema truth)
supabase/seed.sql      generated full-catalog seed (committed)
scripts/               seed generator · admin bootstrap · lesson articles (markdown)
src/
  styles/styles.css    design system, ported verbatim from New-Design/
  components/          icons · ui primitives · layouts
  features/            auth · catalog · learning · admin (pages + components)
  data/                mock catalog (M0–M1) → TanStack Query hooks (M2+)
  lib/                 supabase client · types · formatting · routes
New-Design/            the approved static design prototype (visual source of truth)
```

## Key backend decisions

- **Per-lesson progress rows** (`lesson_progress`); topic percent is always derived, never stored. `minutes` is snapshotted at completion by design.
- **3-value topic status** (draft / review / published). The editor's publish switch maps ON→published, OFF→draft (preserving `review` if currently set).
- **Deletes** match the admin confirmation copy: category → cascades subcategories (transitively unlinking topics); subcategory → unlinks topics (hidden until reassigned); topic → cascades units, lessons, progress.
- **RLS is the enforcement layer**; route guards are UX only. Admin = `profiles.role`, checked via `private.is_admin()` (security definer, executable by anon/authenticated because policies run as the querying role). Role escalation is blocked with column-level grants.
- All schema changes go through `supabase/migrations` + `db push` — never the dashboard editor.
