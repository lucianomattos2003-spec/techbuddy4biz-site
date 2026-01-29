# TechBuddy4Biz — Implementation Plan (Phase 1)

Summary
- Goal: Implement Phase 1 MVP (Magic-link auth, Social Post Scheduling UI, Media uploads to Cloudinary, DB-backed tasks that n8n will process).
- Strategy: Minimal serverless backend (Netlify Functions) + Supabase Auth/DB + Cloudinary for media + n8n for workflow execution. Frontend will reuse Tailwind styling; prefer HTMX for minimal JS or SvelteKit if SPA needed.

Architecture Overview
- Frontend: Static site hosted on Netlify. Portal routes under `/portal/`.
- Auth: Supabase Auth (email magic link). The frontend will call Supabase client for auth; serverless functions use `SUPABASE_SERVICE_KEY`.
- Backend: Netlify Functions (Node.js). Responsibilities: protect server-side actions, provide signed Cloudinary upload URLs if needed, proxy any Service-key-only DB operations.
- DB: Supabase Postgres. App writes `tasks` rows and `social_posts` as appropriate. n8n polls `tasks` table and executes workflows.
- Media: Cloudinary direct unsigned uploads for client-side; server can generate signed upload parameters when needed.
- CI/CD: Netlify auto-deploy from GitHub main branch for frontend; Netlify Functions deploy together.

Key Components & Files to Add
- `IMPLEMENTATION_PLAN.md` (this file)
- `netlify/functions/*` — serverless endpoints (auth helpers, posts, batches, media-sign)
- `portal/` — portal HTML pages and JS (or `src/` if SvelteKit chosen)
- `scripts/db-migrations/` — SQL migrations for new tables (`portal_users`, `auth_tokens`, sessions, assets)
- `README.md` — dev setup, env vars

API Design (minimal set)
- POST `/api/auth/magic-link` — request magic link (frontend mostly uses Supabase)
- GET `/api/auth/me` — server-side user info (verifies Supabase JWT)
- GET `/api/posts?status=&platform=&from=&to=` — list posts
- POST `/api/posts` — create single post (inserts into `tasks` as `generate_social_content` or directly into `social_posts` depending on input)
- POST `/api/batches` — create batch (inserts `generate_social_batch` task)
- POST `/api/media/sign` — generate signed Cloudinary upload params (optional)

Database Schema Changes (summary)
- Ensure existing `clients`, `tasks`, `social_posts`, `social_assets` tables exist (per `TBB_WEB_APP_REQUIREMENTS_FILLED.md`).
- Add `portal_users` and `auth_tokens` if custom auth used; prefer Supabase Auth to avoid custom token tables.
- Add `media_library` table to map Cloudinary assets to `client_id`.

media_library schema (example)
```
CREATE TABLE media_library (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(client_id),
  cloudinary_public_id TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT,
  mime_type TEXT,
  size_bytes INT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

n8n Integration
- Contract: web app inserts tasks into `tasks` table with `task_type` values `generate_social_content`, `generate_social_batch`, `publish_social_post`.
- Payload: JSON in `payload` column. Example for batch: `{platform, posts: [...]}`.
- n8n will poll every minute and update `tasks.status` and create/modify `social_posts` rows.

UI Pages & Wireframes (Phase 1)
- `/portal/login` — Magic-link request form (email input).
- `/portal/dashboard` — Welcome, upcoming posts (7 days), recent posts list, quick actions.
- `/portal/posts/new` — Single post creation: platform, caption, media upload, schedule.
- `/portal/batches/new` — Batch upload: CSV or form; preview rows; submit.
- `/portal/media` — Media library: upload, list, select.
- `/portal/posts/:id` — Post detail and actions (edit/reschedule/delete if allowed).

UX Notes
- Keep mobile-first design; use existing Tailwind utility classes and components.
- For quick responsiveness, use HTMX for form submissions to avoid full SPA complexity.

Security
- Use HTTPS (Netlify).
- Store secrets in Netlify environment variables; never commit secrets.
- For any server-side DB access, use `SUPABASE_SERVICE_KEY` limited to serverless env.
- Mask/delete any logged tokens; implement audit logging table.

Env Vars (add to Netlify)
- `DATABASE_URL` / `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_UPLOAD_PRESET`
- `N8N_WEBHOOK_BASE_URL` / `APP_URL`

Phase 1 Milestones (2-week sprints recommended)
- Sprint 1: Auth + Basic dashboard + posts list (1 week)
- Sprint 2: Create single post + media uploads + insert task into `tasks` (1 week)
- Sprint 3: Batch create flow + review + basic QA (1 week)

Acceptance Criteria (Phase 1)
- Users can login via magic link and see dashboard.
- Users can create a single scheduled post; a `tasks` entry is created and visible in DB.
- Users can upload media to Cloudinary and attach to posts.
- Batch creation creates a `generate_social_batch` task with correct payload.

Next Steps (what I'll implement next if you approve)
1. Add Netlify Functions scaffold and example `POST /api/posts` function.
2. Add `portal` HTML pages: login, dashboard, new post, media library.
3. Wire up Cloudinary unsigned upload demo and store asset records in `media_library`.
4. Test end-to-end: login → create post → DB task inserted → simulate n8n pickup.


---

If you want, I can now scaffold the Netlify Functions handlers and a minimal HTMX-based portal UI and run a local verification. Which part should I start with? (I recommend scaffolding backend endpoints first.)
