# Krishna Mittal — Portfolio

Next.js 14 (App Router) portfolio site with a Supabase-backed contact form
and per-project like counter, built to deploy on Vercel.

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. In your Supabase project, open the **SQL Editor** and run the contents
   of `supabase/schema.sql`. This creates:
   - `messages` — stores contact form submissions (public can insert, not read)
   - `project_likes` — one row per project, with a safe `increment_like()`
     function so visitors can only ever add +1, never overwrite the count
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in the two values from **Project Settings → API** in Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the public `anon` key — safe to expose
     in the browser, since RLS policies restrict what it can do)

## 3. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 4. Deploy to Vercel

**Option A — CLI**
```bash
npm i -g vercel
vercel
```
Follow the prompts, then when asked, add the two `NEXT_PUBLIC_SUPABASE_*`
env vars (or add them afterward in the Vercel dashboard under
**Settings → Environment Variables**, then redeploy).

**Option B — Git + Vercel dashboard**
1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo.
3. Add the same two env vars under **Environment Variables** before the
   first deploy.
4. Deploy — Vercel auto-detects Next.js, no config needed.

Either way, redeploy any time you add/change an env var.

## Editing content

All resume content (name, experience, projects, skills, certifications)
lives in one place: `lib/data.ts`. Edit that file and the whole site
updates — no need to touch components for text changes.

## Project structure

```
app/            Next.js App Router pages, layout, global styles
components/     Nav, Hero, Experience, Projects, Skills, Certifications, Contact, Footer
lib/data.ts     All resume content
lib/supabaseClient.ts   Supabase browser client
supabase/schema.sql     Run once in Supabase's SQL editor
```
