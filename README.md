# Digital Agency CMS

Full-stack Next.js 14 (App Router) + MongoDB digital agency website with a built-in admin dashboard (mini CMS). Every content section — Hero, Services, Projects, Jobs, Team, About, Why Choose Us, Process — is editable from the dashboard, and every description field uses a rich text editor (TipTap).

**اردو نوٹ:** نیچے setup steps دیے گئے ہیں۔ بس `.env.local` بنائیں، MongoDB چلائیں، اور `npm install && npm run dev` کریں۔

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Formik + Yup, TipTap rich text editor
- **Backend:** Next.js Route Handlers (API routes), MongoDB + Mongoose
- **Auth:** JWT stored in an httpOnly cookie, role-ready (`superadmin` / `admin` / `editor`)
- **Uploads:** Local filesystem (`/public/uploads`) via `/api/upload` — swap for S3/Cloudinary later if needed

## Features

- Public site: Home, Services, Projects (+ filter/search/pagination), Project detail, Jobs (+ filter/search), Job detail, Job apply (CV upload), Team, About, Contact
- Admin dashboard: Hero, Services, Projects, Jobs, Team, Applications (CV download), Contact Messages, Settings (logo, contact info, socials, footer, About content, Why Choose Us, Process)
- Rich text editor (TipTap) on every description-type field, both public rendering and admin editing
- Reusable CRUD API factory (`lib/crudFactory.ts`) — list/create/read/update/delete logic is written once and reused for Services, Projects, Jobs, Team, Testimonials
- Reusable `DataTable`, `Modal`, `useCrud` hook — admin CRUD pages don't duplicate fetch/table logic
- SEO metadata per page, loading skeletons, toast notifications, empty states, responsive design, protected `/dashboard` routes via middleware

---

## 1. Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# then edit .env.local:
#   MONGODB_URI      -> mongodb://127.0.0.1:27017/digital-agency (local) or your Atlas URI
#   JWT_SECRET        -> any long random string
#   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD -> your first admin login

# 3. Make sure MongoDB is running locally
#    macOS (brew):   brew services start mongodb-community
#    Windows:        run "MongoDB" from Services, or `mongod`
#    Docker:         docker run -d -p 27017:27017 --name mongo mongo

# 4. Seed the first admin user + default settings
npm run seed

# 5. Start the dev server
npm run dev
```

Visit:
- **Website:** http://localhost:3000
- **Admin login:** http://localhost:3000/login (use the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env.local`)

## 2. Environment Variables

See `.env.example` for the full list. Key ones:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign admin login tokens — change this in production |
| `COOKIE_NAME` | Name of the auth cookie (default `agency_admin_token`) |
| `NEXT_PUBLIC_SITE_NAME` | Shown in navbar, footer, and page titles |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials created by `npm run seed` |

## 3. Folder Structure

```
app/
  (auth)/login/          Admin login page
  dashboard/              Protected admin pages (hero, services, projects, jobs, team, applications, messages, settings)
  services/ projects/ jobs/ team/ about/ contact/   Public pages
  api/                    Route handlers (auth, services, projects, jobs, team, applications, contact, hero, settings, upload)
components/
  common/                 Navbar, Footer, RichTextEditor, RichHtml, Modal, Loader, EmptyState, Providers
  sections/               Hero, Services, Portfolio, WhyChooseUs, Process, Testimonials, Team, CTA, ContactForm, JobApplyForm
  admin/                  AdminSidebar, AdminPageHeader, DataTable, ImageUploadField
  ui/                     Button (shadcn-style)
models/                   Mongoose schemas: User, HeroSection, Service, Project, Job, Application, Contact, Team, Testimonial, Settings
lib/                      mongodb.ts, auth.ts, crudFactory.ts, requireAuth.ts, apiResponse.ts, getSettings.ts, getHomeData.ts
validation/                Yup schemas per resource
hooks/                     useCrud, useAuth
utils/                     constants.ts, helpers.ts
scripts/seed.ts            First-run admin + default settings seeder
```

## 4. How content editing works

- Every model with a description (Hero, Service, Project, Job, Team bio, About story/mission/vision, Testimonials) stores **HTML** produced by the shared `RichTextEditor` (TipTap) component.
- On the public site, that HTML is rendered safely through the `RichHtml` component.
- Images (Hero banner, service icons, project images, job posters, team photos, logo) upload through `/api/upload` and are stored under `public/uploads`.

## 5. Deployment

### Option A — Vercel (recommended for Next.js)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the environment variables from `.env.example` in the Vercel project settings (use a MongoDB **Atlas** URI — Vercel's filesystem can't host a local Mongo instance).
4. **Important:** Vercel's filesystem is read-only/ephemeral, so `/api/upload` (which writes to `public/uploads`) will not persist files between deployments. For production, swap the upload route to a cloud storage provider (S3, Cloudinary, UploadThing, etc.) — the route is isolated in `app/api/upload/route.ts` so this is a small change.
5. Deploy. After the first deploy, run `npm run seed` once against your Atlas database (locally, pointing `MONGODB_URI` at Atlas) to create the admin user.

### Option B — VPS / Node server

```bash
npm install
npm run build
npm run start   # runs on port 3000 by default
```

Run behind Nginx/Caddy as a reverse proxy, set environment variables on the server, and use a process manager like `pm2`:

```bash
pm2 start npm --name "digital-agency" -- start
```

MongoDB can run on the same VPS or as a managed Atlas cluster — either works, just update `MONGODB_URI`.

## 6. Adding a second admin/editor

Currently the seed script creates one `superadmin`. To add more, either:
- Insert directly into the `users` collection with a bcrypt-hashed password, or
- Build a small "Manage Admins" page later using the same CRUD pattern as Team/Services (the `role` field is already schema-ready for `superadmin` / `admin` / `editor`).
# SKY_WAY
# level_up
