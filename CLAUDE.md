# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # tsc -b && vite build (TypeScript compile then bundle)
npm run preview    # Preview production build locally
```

No test or lint commands are configured.

## Architecture

**Switch Worker** is a mobile-first PWA for job discovery targeting blue-collar workers in India ("घर के पास Job" — Ghar ke Paas Job). Max width is 430px (`--max-w`); design is portrait-only.

### Data layer (`src/data/`)

All app state lives in **localStorage** via accessor functions in `store.ts` — no Redux/Zustand. Key functions: `getWorker()` / `saveWorker()`, `getJobs()`, `getApplications()`, `getCommunities()`, etc. `seed.ts` populates mock data on first load. `haversine()` and `walkTime()` handle distance/time estimates. Supabase (`src/lib/supabase.ts`) is wired for SMS OTP auth but data sync is not active — the app is effectively client-only.

### Routing (`src/App.tsx`)

React Router v6. `RequireOnboard` HOC gates all main routes by checking `isOnboarded()` (localStorage). Flow: `/` splash → `/login` or `/signup` → protected routes (home, jobs, applications, community, profile).

### i18n (`src/i18n/`)

`LangProvider` wraps the app. `useT()` returns a `t(key, vars?)` function; `useLang()` exposes `{ lang, setLang }`. Two languages: `'hi'` (Hindi, default) and `'en'`. Translations use dot-notation keys (`'nav.home'`, `'common.apply'`). Language preference persists in the worker profile. Always use the `t()` hook for user-visible strings — never hardcode UI text.

### Styling

No CSS-in-JS library. Styles are **inline React style objects** referencing **CSS custom properties** defined in `src/index.css`. Design tokens: green palette (`--g50`–`--g950`), spacing scale (`--sp-1`–`--sp-16`), `--nav-h: 64px`, `--top-pad` / `--bot-pad` for safe-area insets. Theme color is `#1B6B3A`.

### Key types (`src/types.ts`)

`Worker`, `Job`, `Application` (multi-stage: Applied → Screening → Interviewed → Offer → Joined/Rejected), `Community`, `Post` (types: job_available, tip, success_story, employer_review, voice), `Captain`.

## Environment

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for auth; the app degrades gracefully without them. Access via `(import.meta as any).env.VITE_*`.

Deployed on Vercel with SPA rewrite (all routes → `/index.html` via `vercel.json`).
