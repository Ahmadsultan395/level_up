# The Barber Co. — Full Platform

**Status: All 20 build steps complete.** Public website, booking + payment engine,
customer dashboard, and the full admin panel are all implemented and wired
to real data — see the build plan below for what each step covered.

Premium barbershop booking platform: public website, customer dashboard, and
admin panel. Built with Next.js (App Router) + TypeScript + MongoDB.

## Tech Stack
- **Framework:** Next.js 14 (App Router), TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth.js
- **Media:** Cloudinary
- **Payments:** Manual confirmation (Bank Transfer / EasyPaisa / JazzCash / Cash) — no payment gateway
- **Email:** Nodemailer
- **Styling:** Tailwind CSS, driven entirely by CSS variables in
  `src/styles/globals.css` (Premium Dark + Gold theme — see that file for
  the full token system. No hardcoded colors anywhere in the codebase.)

## Data Models
All Mongoose schemas live in `src/models/` (barrel-exported from
`src/models/index.ts`). Every model that's ever shown on the public site
has a `status: 'active' | 'inactive'` field; every model that can be
submitted by a non-admin user additionally has
`moderationStatus: 'pending' | 'approved' | 'rejected'` — matching the
cross-cutting checklist in the specification.

| Model | Purpose |
|---|---|
| `User` | Customers + Admins + Superadmins (role-based) |
| `Category` | Shared categories for services / blog / gallery |
| `Service` | Individual services |
| `Package` | Bundles of services |
| `Barber` | Barber profiles, working hours, vacations, breaks |
| `Appointment` | Bookings, status flow Pending→...→No Show |
| `Review` | Customer reviews (with photos, moderated) |
| `Testimonial` | Curated/submitted testimonials |
| `Blog` | Blog posts with SEO fields |
| `GalleryImage` | Gallery photos (admin or customer submitted) |
| `BeforeAfter` | Before/after photo pairs |
| `NewsletterSubscriber` | Email subscribers |
| `ContactMessage` | Contact form submissions + reply thread |
| `Payment` | Transaction records — created only on success |
| `Invoice` | Generated from a successful payment |
| `Expense` | Business expenses for reports |
| `Coupon` | Discount codes |
| `Notification` | Email/SMS/in-app notifications |
| `ActivityLog` | Admin audit trail |
| `Banner` | Hero/homepage/promo banners |
| `Faq` | FAQ entries |
| `EmailTemplate` | Editable transactional email templates |
| `SiteSettings` | Singleton: CMS content, SEO defaults, contact info, currency/tax |

## Reusable DataTable System
Every list/table in the app — admin, customer dashboard, or public listing
— is built from the same pieces, so pagination/search/filter/sort/bulk
actions/Active-Inactive/Approve-Reject behave identically everywhere
(spec section 17):

- `src/lib/list-query.ts` → `buildListResponse()` — server-side helper every
  list API route calls to get consistent pagination/search/filter/sort.
- `src/hooks/useDataTable.ts` — client hook that keeps page/pageSize/
  search/filters/sort/selection in the URL (shareable, back-button-safe).
- `src/hooks/useListData.ts` — fetches from a `buildListResponse`-powered
  endpoint using the state from `useDataTable`.
- `src/components/shared/DataTable.tsx` — the table itself: sorting,
  row selection, bulk-action bar, loading/empty/error states, pagination.
- `src/components/shared/{SearchInput,Filters,Pagination}.tsx` — toolbar pieces.
- `src/components/shared/StatusToggle.tsx` — the Active/Inactive switch used
  on every publicly-visible entity.
- `src/components/shared/ApproveRejectActions.tsx` — Approve/Reject buttons
  (with a reject-reason modal) used on every user-submitted entity.

**Usage pattern for any admin list page:**
```tsx
'use client';
const table = useDataTable();
const { data, pagination, isLoading, error, refetch } = useListData<IBarber>({
  endpoint: '/api/admin/barbers',
  page: table.page, pageSize: table.pageSize, search: table.search,
  sortBy: table.sortBy, sortOrder: table.sortOrder, filters: table.filters,
});

<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  error={error}
  onRetry={refetch}
  page={pagination.page}
  totalPages={pagination.totalPages}
  totalItems={pagination.totalItems}
  pageSize={pagination.pageSize}
  onPageChange={table.setPage}
  onPageSizeChange={table.setPageSize}
  sortBy={table.sortBy}
  sortOrder={table.sortOrder}
  onSort={table.setSort}
  selectable
  selectedIds={table.selectedIds}
  onToggleSelect={table.toggleSelected}
  onToggleSelectAll={table.toggleSelectAll}
  toolbar={<SearchInput value={table.search} onChange={table.setSearch} />}
/>
```
And the matching API route:
```ts
// src/app/api/admin/barbers/route.ts
export async function GET(req: Request) {
  await requireAdmin();
  await connectDB();
  const query = parseListQuery(new URL(req.url).searchParams);
  const result = await buildListResponse(Barber, query, {
    filterFields: ['status'],
    searchFields: ['name', 'bio'],
    defaultSortBy: 'createdAt',
  });
  return NextResponse.json(result);
}
```
This exact pattern is reused for every module in Steps 5–20 — nothing
bespoke per module.

## Payment & Invoice Flow (Manual — no payment gateway)
This project uses **manual payment confirmation** instead of a card gateway:
Bank Transfer, EasyPaisa, JazzCash, or Cash on arrival.

1. Booking (`/dashboard/book`) creates the `Appointment` as `pending` — **no financial record is created yet** (spec finance rule).
2. `/dashboard/book/payment/[id]` shows the shop's bank/EasyPaisa/JazzCash details (set by the admin in **Admin → Website Content → Payment Methods**). The customer either:
   - sends the money from their own banking/EasyPaisa/JazzCash app, then enters a transaction reference and/or uploads a payment screenshot, **or**
   - chooses "Pay in Person (Cash)" and settles at the shop.
3. This creates a `Payment` with `status: pending` via `/api/payments/manual` and emails the admin inbox to review it.
4. The admin reviews the submission (including the screenshot, if any) in **Admin → Payments** and clicks **Confirm** once they've verified the money actually arrived (or received the cash in person).
5. `confirmManualPayment()` (`src/lib/manual-payment.ts`) then — and only then — marks the `Payment` as `paid`, generates a sequential `Invoice` (`INV-YYYY-00001`), and flips the `Appointment` to `confirmed`, exactly matching the spec's finance rule that financial records are created only after a payment succeeds.
6. Invoices are downloadable as PDF via `/api/invoices/[id]/download` (owner or admin only).

Refunds work the same way: **Admin → Payments → Refund** records the refund in the finance data; the admin still has to physically return the cash or send the money back themselves, since there's no gateway to do it automatically.

## Getting Started
```bash
npm install
cp .env.example .env.local   # then fill in your real values
npm run dev
```
Open http://localhost:3000

## Auth System
- **Customers** self-register at `/register` (role is always `customer`).
- **Admins** are not self-serve. Create the first superadmin with:
  ```bash
  npm run seed:admin
  ```
  This reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` from `.env.local`
  (or falls back to `admin@barberco.com` / `ChangeMe123`). Log in at
  `/login` and change the password immediately — additional admins are then
  created from the Admin Panel's Roles & Permissions module (Step 19).
- Routes are protected by `middleware.ts`:
  - `/dashboard/*` requires any logged-in user.
  - `/admin/*` requires role `admin` or `superadmin`.
- Server-side helpers `requireUser()` / `requireAdmin()` in `src/lib/session.ts`
  guard API routes the same way — use these at the top of every protected
  route handler.

## Project Structure
```
src/
  app/
    (public)/     → Website: Home, Services, Gallery, Blog, etc.
    (customer)/   → Customer dashboard (auth required)
    (admin)/      → Admin panel (auth + role required)
    api/          → REST API routes, one folder per resource
  components/
    ui/           → Reusable primitives (Button, Input, Badge, Card...)
    shared/        → Cross-cutting components (States, DataTable, Pagination...)
    admin/        → Admin-only components
    customer/     → Customer-dashboard-only components
    layout/       → Header, Footer, Sidebar, Navigation
  lib/            → db connection, cloudinary, auth, utils
  models/         → Mongoose schemas
  types/          → Shared TypeScript types
  validations/    → Zod schemas for server + client validation
  config/         → Site-wide config (nav items, site settings)
  hooks/          → Custom React hooks
```

## Theme System
Every color, font, radius, spacing, and shadow used anywhere in the app is
defined once in `src/styles/globals.css` and mapped into
`tailwind.config.ts`. To restyle the entire app, edit only that CSS file —
never add a literal color value in a component.

## Build Plan (do not skip steps)
1. **Project Setup & Architecture** ✅
2. **Auth system (customer + admin, NextAuth, roles)** ✅
3. **Database models (all entities from the spec)** ✅
4. **Reusable DataTable (pagination + search + filter + sort + bulk actions + Active/Inactive + Approve/Reject)** ✅
5. **Public website — Home, About, Services, Service Details** ✅
6. **Public website — Packages, Gallery, Before/After, Barbers, Barber Profile, Pricing** ✅
7. **Public website — Reviews, Testimonials, Blog, Blog Details, FAQ** ✅
8. **Public website — Contact, Careers, Legal pages, Search, Sitemap, 404** ✅
9. **Booking flow (slots, availability, booking rules)** ✅
10. **Payment & invoice system** ✅
11. **Customer Dashboard (all sub-pages)** ✅
12. **Admin panel — Dashboard overview + Barber management** ✅ *(this step)*
13. **Admin panel — Services / Packages / Categories** ✅ *(this step)*
14. **Admin panel — Appointments** ✅ *(this step)*
15. **Admin panel — Reviews / Testimonials / Gallery / Before-After (approve/reject)** ✅ *(this step)*
16. **Admin panel — Blogs / CMS / FAQs / Banners** ✅ *(this step)*
17. **Admin panel — Newsletter / Contact Messages / Email Templates** ✅ *(this step)*
18. **Admin panel — Payments / Invoices / Expenses / Coupons / Reports** ✅ *(this step)*
19. **Admin panel — Roles & Permissions / Settings / SEO / Theme / Activity Logs / Backups** ✅ *(this step — Admin Panel is now 100% complete)*
20. **Notifications system + Global Search + final QA pass** ✅ *(this step — PROJECT COMPLETE)*

Each step is completed fully — including pagination, search, filters, and
active/inactive or approve/reject where applicable — before moving to the
next.

## Before Going to Production

This codebase is feature-complete against the specification. Before a real
launch:

1. **Environment variables** — fill in every value in `.env.local` (copy from
   `.env.example`): MongoDB URI, NextAuth secret, Cloudinary, SMTP, site URL.
2. **Seed the first admin** — `npm run seed:admin`, then log in and change
   the password immediately.
3. **Set up payment methods** — go to **Admin → Website Content → Payment
   Methods** and fill in your real bank account, EasyPaisa, and/or JazzCash
   details. These are shown to every customer at checkout.
4. **Populate content** — categories → services/packages → barbers (with
   working hours) → banners/FAQs/CMS text via `/admin/cms`, in that order,
   since later ones reference earlier ones.
5. **Test the full loop once**: book as a customer → submit a manual payment
   (or choose "Pay in Person") → confirm it as admin in `/admin/payments` →
   check the appointment flips to `confirmed` in `/admin/appointments` →
   mark it completed → leave a review as the customer → approve it as admin
   → check it appears on the public `/reviews` page.
6. **DNS/email deliverability** — configure SPF/DKIM for the domain in
   `SMTP_FROM` so booking/notification emails don't land in spam.

## Architecture Notes for Future Extension

- Every list in the app (32+ tables across customer/admin) uses the same
  `DataTable` + `useDataTable` + `useListData` + `buildListResponse` stack
  from Step 4 — adding a new module means writing a model, an API route with
  `buildListResponse`, and a table component; pagination/search/filter/sort
  come for free.
- `StatusToggle` and `ApproveRejectActions` are drop-in for any model with a
  `status`/`moderationStatus` field.
- `logActivity()` is available for any admin mutation that should appear in
  the audit trail — currently wired into the highest-value actions
  (role changes, barber/coupon lifecycle, review moderation) as a pattern
  to extend.

