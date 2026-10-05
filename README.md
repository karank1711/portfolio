# Portfolio

A three-part portfolio: a public site, a separate admin panel, and an API backed by Supabase. Content is edited in the admin panel, stored in Postgres and Supabase Storage, and read by the public site. Nothing in the public interface is hardcoded biography, project, or resume content.

## Project overview

| App | Folder | Local URL | Role |
| --- | --- | --- | --- |
| Public site | `frontend/` | http://localhost:5173 | Portfolio |
| Admin panel | `admin/` | http://localhost:5174 | Content management |
| API | `backend/` | http://localhost:5000 | Auth, data, uploads |

The public site never talks to Supabase directly. The service-role key stays on the API.

## Tech stack

- Frontend and admin: React, Vite, React Router, Tailwind CSS, Framer Motion, Lucide
- Admin charts: Recharts, for the message history on the dashboard
- Ordering: dnd-kit, writing a numeric `display_order` through the API
- API: Node.js, Express, Zod, JWT, Helmet, CORS, rate limiting
- Data: Supabase Postgres
- Files: Supabase Storage buckets `profile`, `projects`, `achievements`, `resume`

## Folder structure

```text
frontend/src
  components/     section UI (hero, about, skills, projects, contact, …)
  pages/          home, project detail, 404
  layouts/        public shell, meta tags
  services/       API client
  context/        theme and portfolio data
admin/src
  pages/          dashboard and each content editor
  components/     sidebar, forms, dialogs, sortable lists
  services/       authenticated API client
backend/src
  routes/ controllers/ services/ validators/ middleware/
  scripts/seed.js
backend/supabase/schema.sql
```

## Environment setup

Requires Node.js 20 or newer.

```bash
npm run install:all
```

Or install each app yourself:

```bash
npm install --prefix backend
npm install --prefix frontend
npm install --prefix admin
```

Copy the example env files and fill in real values. Do not commit `.env` files.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item admin/.env.example admin/.env
```

Generate a long random `JWT_SECRET`. Set `CORS_ORIGIN` to the public site origin and `ADMIN_ORIGIN` to the admin origin.

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_RECEIVER_EMAIL` stay in `backend/.env`. The public site never receives the API key.

## Supabase setup

1. Create a Supabase project.
2. In Project Settings → API, copy the project URL, anon key, and service role key into `backend/.env`.
3. Open the SQL editor and run `backend/supabase/schema.sql`.
4. Confirm these public storage buckets exist: `profile`, `projects`, `achievements`, `resume`.

The schema enables row level security on every table and does not add policies for the anon key. The API uses the service role, which bypasses RLS. The anon key is not used by either frontend.

Storage objects are publicly readable so the portfolio can show images and the resume. Writes happen only through the API, which checks file type and size.

| Bucket | Allowed files | Max size |
| --- | --- | --- |
| `profile` | JPEG, PNG, WebP, AVIF | 5 MB |
| `projects` | JPEG, PNG, WebP, AVIF | 5 MB |
| `achievements` | Images or PDF | 8 MB |
| `resume` | PDF | 10 MB |

## Database schema

| Table | Purpose |
| --- | --- |
| `admin_users` | Admin accounts, password hash only |
| `profile` | Name, titles, intro, photo, contact |
| `about` | Summary, interests, highlights |
| `skills` | Name, category, order, enabled flag |
| `experiences` | Roles, dates, technologies, logo |
| `education` | Institution, degree, years, logo |
| `projects` | Case studies, links, cover, publish state |
| `project_images` | Extra screenshots, ordered |
| `achievements` | Certificates and awards |
| `social_links` | Public social profiles |
| `resume` | Current resume file |
| `contact_messages` | Contact form inbox |

Records that can be reordered store `display_order`. Projects also have `is_featured`, `is_published`, and `status`.

## Backend setup

```bash
npm install --prefix backend
npm run dev --prefix backend
```

The API listens on port 5000. `GET /api/health` reports whether required environment variables are present. It does not print secret values.

Seed demo content after the schema has been applied:

```bash
npm run seed --prefix backend
```

Admin sign-in is read from `admin/.env` (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Those names are not prefixed with `VITE_`, so they stay on the server. The API creates or updates that account when it starts.

Run the seed again with `--force` only if you intend to replace existing portfolio rows:

```bash
npm run seed --prefix backend -- --force
```

## Frontend setup

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

`frontend/.env` needs `VITE_API_URL` (for example `http://localhost:5000/api`) and `VITE_SITE_URL` for Open Graph URLs.

## Admin setup

```bash
npm install --prefix admin
npm run dev --prefix admin
```

`admin/.env` needs the same API URL and `VITE_SITE_URL` so preview and “View site” open the public app. The admin app is served separately and sends `noindex`.

## Running locally

Three terminals:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
npm run dev --prefix admin
```

Or, from the repository root after `npm install`:

```bash
npm run dev
```

Then open http://localhost:5173 for the site and http://localhost:5174 for admin.

Adding a project in the admin panel writes through `POST /api/projects`, stores images in Supabase Storage, and the public site loads it from `GET /api/portfolio` on the next visit or when the tab regains focus. The same path is used for profile, about, skills, experience, education, achievements, resume, and social links.

## API

Successful responses:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{ "success": false, "message": "Project not found" }
```

Public reads: `/api/portfolio`, `/api/profile`, `/api/about`, `/api/skills`, `/api/experience`, `/api/education`, `/api/projects`, `/api/projects/slug/:slug`, `/api/achievements`, `/api/social-links`, `/api/resume`.

Public write: `POST /api/contact` (rate limited).

Admin writes require `Authorization: Bearer <token>` from `POST /api/auth/login`. Draft projects can be opened with a short-lived preview token from `POST /api/projects/:id/preview-token`.

## Production deployment

- Build the public site with `npm run build --prefix frontend` and the admin app with `npm run build --prefix admin`. Host them as two static sites.
- Run the API with `NODE_ENV=production` and `npm start --prefix backend` behind HTTPS.
- Set `CORS_ORIGIN` and `ADMIN_ORIGIN` to the deployed origins. The API trusts the proxy only when `NODE_ENV` is production.
- Set `VITE_API_URL` and `VITE_SITE_URL` at build time for each frontend.
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` on the server only.
- Replace the demo admin password and demo portfolio copy before sharing the site.

## Scripts

| Command | Where |
| --- | --- |
| `npm install` | each app, or `npm run install:all` from the root |
| `npm run dev` | each app, or the root to run all three |
| `npm run build` | frontend and admin |
| `npm start` | backend |
| `npm run seed` | backend |
