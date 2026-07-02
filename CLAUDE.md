# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vinay AI OS is a personal AI Operating System — a Next.js 15 web app backed by Supabase and deployed to Vercel. It covers 7 life domains:

- **Planner** — tasks with priority, area, due date
- **Career** — job application pipeline (applied → offer/rejected)
- **Finance** — expense tracking + per-category budgets
- **Health** — daily habit tracker with 7-day streak grid
- **Learning** — resource tracker (courses, books, videos, articles, podcasts)
- **Coding** — project tracker with tech stack tags
- **Documents** — full-text knowledge base with AI Q&A

## Stack

- **Framework**: Next.js 15 App Router (TypeScript)
- **Auth + DB**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS v3 with custom `surface` / `accent` color system
- **Components**: shadcn/ui (Radix UI primitives)
- **AI**: Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Deploy**: Vercel (auto-deploy from `master`)

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at localhost:3000
npm run build        # production build (runs type-check + lint)
npm run lint         # ESLint
```

## Environment Variables

Required in `.env.local` (and Vercel project settings):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

## Architecture

**Thin page + feature view pattern:**
- `src/app/[route]/page.tsx` — async server component, fetches data, passes to view
- `src/features/[module]/components/[Module]View.tsx` — `'use client'` component, owns all interactivity
- `src/features/[module]/actions.ts` — `'use server'` functions (CRUD via Supabase)
- `src/features/[module]/types.ts` — TypeScript types for the module

**Optimistic UI:** All mutations use `useOptimistic` + `useTransition` — UI updates instantly before the server confirms.

**Supabase clients:**
- `src/lib/supabase/server.ts` — server components and server actions (cookies-based)
- `src/lib/supabase/client.ts` — client components (browser)
- `src/lib/supabase/middleware.ts` — session refresh + redirect logic
- `middleware.ts` (root) — runs on every request

**AI features** (`src/features/ai/`):
- `briefing.ts` — daily morning summary shown on Dashboard (called server-side)
- `smart-sort.ts` — AI reorders Planner tasks by priority/deadline
- `career-coach.ts` — pipeline analysis with actionable next steps
- `doc-qa.ts` — Q&A and summarisation for Documents

All AI calls go through `src/lib/anthropic.ts` → `aiText()` helper. They are wrapped in `.catch(() => '')` so a missing/invalid API key degrades gracefully without crashing pages.

**Loading / error states:**
- `src/app/[route]/loading.tsx` — skeleton shown by Next.js while server fetches data
- `src/app/[route]/error.tsx` — error boundary with "Try again" reset button

**Shared components** (`src/components/`): `Sidebar`, `Header`, `Card`, `UserInfo`, `Skeleton`.

## Database Tables

All tables have `user_id uuid references auth.users` and 4 RLS policies (select/insert/update/delete scoped to `auth.uid()`).

| Table | Key columns |
|---|---|
| `tasks` | text, done, priority, area, due_date |
| `applications` | company, role, status, salary_range, location, url, notes, applied_at |
| `expenses` | amount, category, description, date |
| `budgets` | category, amount, month (unique per user+category+month) |
| `habits` | name, emoji |
| `habit_logs` | habit_id, logged_date (unique per habit+date) |
| `resources` | title, type, url, category, status, progress, notes |
| `projects` | name, description, status, stack (text[]), github_url, live_url |
| `documents` | title, content, tags (text[]), updated_at |
