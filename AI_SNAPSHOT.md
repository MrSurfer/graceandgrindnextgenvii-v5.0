# GraceAndGrind AI Memory Snapshot
> Auto-generated: 2026-05-10 10:19 UTC
> **Read this at the START of every new conversation to restore full context.**

---

## Quick Start for AI

1. This is a **Next.js 16 + Supabase + Prisma + Tailwind** education platform for the Habesha diaspora.
2. Authentication is handled by **Supabase Auth** (NOT NextAuth — legacy references to NextAuth in old docs are stale).
3. Role hierarchy: `OWNER (5) > ROOT (4) > SUPER_ADMIN (3) > ADMIN (2) > TEACHER (1) > CUSTOMER (0)`.
4. All prices stored in **USD**. Use `formatPrice(usdAmount)` from `useCurrency()` hook for display.
5. Never use `import { CurrencyCode }` — always `import type { CurrencyCode }` (Turbopack strict mode).
6. Admin mutations go in `src/app/admin/actions.ts`. Always gate with role/password checks.
7. Run `npm run build` after significant changes to catch TypeScript errors before commit.
8. Run `npm run snapshot` before ending any session to preserve AI memory.

---

## Full AI Context (AI_CONTEXT.md)

# GraceAndGrind AI Context
This repository contains a high-performance parenting education hub. It is designed to help parents master the art of intentional parenting through courses and community.

## 1. Domain Knowledge
- **Purpose**: Education and resource platform for the **Habesha diaspora** (Ethiopian and Eritrean families).
- **Vision**: To be the most trusted digital home for Habesha families globally, enabling them to thrive across generations.
- **Mission**: To equip parents with faith-informed tools, empower the next generation with identity and life skills, and connect newcomers to critical resources.
- **Tone**: Professional, intentional, encouraging, and premium.
- **Target Audience**: Habesha parents and families navigating life in the West while honoring their cultural heritage.
- **Core Entities**: Courses (Parenting topics), Lessons/Sessions (Content), Enrollments (Access).

## Core Values
1. **Community First**: Decisions are driven by community service, not just profit.
2. **Cultural Integrity**: Honoring Ethiopian and Eritrean culture, language, and faith without forced assimilation.
3. **Practical Wisdom**: Combining faith-grounded values with actionable real-world knowledge.
4. **Generational Thinking**: Success is measured by long-term impact on families and children.
5. **Quality Without Compromise**: Prioritizing exceptional content quality over quantity.
6. **Radical Accessibility**: Critical community resources (immigration, newcomer guides) are always free.

## Verification & QA
- **[test_checklist.md](file:///c:/Users/ytyir/OneDrive/Desktop/Projects/GraceAndGrindNextGenV2/graceandgrindnextgenvii/test_checklist.md)**: The master roadmap for E2E testing across all roles. Always refer to this when verifying new features.

## AI Assistant Instructions
**If you are an AI reading this, this is your map to the project.** 
Use this document to quickly rebuild context if memory drops or if you are a new AI taking over. It summarizes the architecture, database models, and critical logic flows.

**PROJECT STATUS:** The platform has successfully pivoted from Technical/JS to **Parenting Excellence**. Ensure all future copy, icons, and features align with intentional parenting.

**TECHNICAL STANDARD:** On Windows systems, always execute PowerShell commands using the `-ExecutionPolicy Bypass` flag to ensure consistent execution without permission blocks.

---

## 2. Project Identity & Stack
- **What it is:** A comprehensive online Education Hub / Content Management System (CMS). It supports free and paid courses, user roles (Customer, Teacher, Admin), and a moderation queue for content.
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL hosted on Supabase (Project: `wcflvnkjrkrxvilsadgl`).
- **ORM:** Prisma (`prisma/schema.prisma`).
- **Supabase Auth Sync:** `on_auth_user_created` trigger auto-syncs `auth.users` → `public.User`.
- **Row Level Security:** RLS enabled on all 12 public tables with granular policies. Prisma bypasses RLS (postgres role); policies guard REST API access.
- **Styling:** Tailwind CSS.
- **Authentication:** NextAuth.js (`src/lib/auth.ts`).
- **Payments:** Stripe (Checkout Sessions & Webhooks).
- **Editor:** TipTap (WYSIWYG editor for course content).

---

## 2. Core Architecture Patterns

### Routing & UI
- We use Next.js App Router (`src/app`).
- **Admin Dashboard:** `src/app/admin` (Server Actions used for mutations like changing roles).
- **Teacher Workspace:** `src/app/dashboard/teacher/` (Uses TipTap for content creation).
- **Course Viewing:** `src/app/courses/` (Public catalogs and gated lesson viewers).

### Authentication & Authorization
- **Location:** `src/lib/auth.ts`
- **Logic:** NextAuth is configured with Google, GitHub, and Credentials.
- **Role-Based Access Control (RBAC):** Users have roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`, `OWNER`). During login, NextAuth fetches the user from Prisma and attaches their `role` directly into the JWT token and the session object. **Do not query the database just to check a user's role on every page load; use the session.**
- **Authorization Hierarchy:** 
  - **Level 5: OWNER** (CEO) — Master authority via `OWNER_EMAILS` whitelist.
  - **Level 4: ROOT** — Top-tier security and operations authority.
  - **Level 3: SUPER_ADMIN** — General administrative access.
  - **Level 2: ADMIN** — Standard moderators.
  - **Level 1: TEACHER**.
  - **Level 0: CUSTOMER**.
- **Inactivity Timer**: Automatic logout after 4 hours of idle time (2 minutes during testing) for Level 2+ roles.
- **Identity Verification (OTP)**: All new email/password registrations are locked behind a **6-digit OTP verification** flow. Users must verify their email at `/verify-email` before login is permitted.
- **Redirection Logic:** Login redirection is handled in `src/app/login/page.tsx` and `src/app/register/page.tsx`. 
  - **Auth Page Sanitization:** Explicit `callbackUrl` values are checked; if they point to `/login`, `/register`, or `/verify-email`, they are ignored to prevent infinite loops.
  - **Role-Based Defaults:** Owners go to `/owner`, Admins (Level 2-4) go to `/admin`, Teachers go to `/dashboard/teacher`, and Customers go to `/courses`.
- **middleware:** Authenticated route protection is handled in `src/proxy.ts`.
- **Base URL Resolution:** The application uses a dynamic base URL system via `src/lib/utils.ts` (`getBaseUrl()`). This automatically detects if the app is running on Vercel or locally to ensure correct redirects for authentication and absolute URL generation.
- **Course Catalog:** The main `/courses` page utilizes a client-side `CourseCatalog.tsx` for real-time keyword search (grouped by category) and dropdown filters for Price and Category.
- **HR & Performance Metrics:** Admin Level 4+ (ROOT/OWNER) can access the "HR Metrics" tab in `AdminClient`, which aggregates teacher performance and administrative engagement from `EventLog` data.
- **User Status:** A `status` field (`ACTIVE` vs `BLOCKED`) is checked during sign-in. Blocked users are rejected.

### Content Moderation Flow (CRITICAL)
- Teachers **cannot** directly publish or edit live lessons.
- When a teacher- **Double-Lock Security**: Super Admin access requires email whitelist in `.env` OR `SUPER_ADMIN` role in DB for general access.
- **Inactivity Policy**: 4-hour inactivity limit for Teachers/Admins (currently 2 min for testing) with a 60s warning countdown.
- **Optimistic UI**: Admin and dashboard actions must provide instant visual feedback before DB confirmation. `localUsers` and `localContentRequests` state arrays are used for this in `AdminClient.tsx`.
- **QA Standards**: All changes must be validated against `test_checklist.md`.
- **Admin Safety:** Courses with active enrollments are "Locked". Deletion requires typing the course title exactly, and the server blocks deletion if students are enrolled. Account Forging requires explicit re-verification of the administrator's password.

### Currency & Localization System (Phase H)
- **Exchange Rates (`src/lib/currency.ts`):** Fetches USD-base rates from `exchangerate-api.com` via Next.js `fetch` with `{ next: { revalidate: 86400 } }` (24h cache). Falls back to hardcoded rates on failure.
- **CurrencyContext (`src/lib/CurrencyContext.tsx`):** React context wrapping the app. Provides `useCurrency()` hook exposing `currency`, `setCurrency`, `rates`, and `formatPrice(usdAmount: number)`. User preference is persisted in `localStorage` under key `preferred_currency`. Supported codes: `USD | EUR | GBP | CAD`.
- **Navbar Toggler (`src/components/Navbar.tsx`):** Globe-icon dropdown for currency switching. Imports `CURRENCY_LIST` (value) and `CurrencyCode` (type) from `CurrencyContext`. **Note:** Must use `import type { CurrencyCode }` due to Turbopack strict-mode module resolution.
- **Price Formatting:** Use `formatPrice(priceInUSD)` everywhere instead of `$${price.toFixed(2)}`. Returns `"Free"` for 0 values.

### Audit Trail (Phase H)
- **Audit Logs tab (`AdminClient.tsx`):** Has a Timeline/By-User toggle controlled by `auditViewMode` state.
  - **Timeline:** Flat table newest-first, up to 100 entries.
  - **By User:** Groups logs per actor, sorted by most actions. Collapsible cards with role-coloured badges. Role→colour: OWNER=amber, ROOT=red, SUPER_ADMIN=purple, ADMIN=blue, TEACHER=green.
- **`expandedAuditUser`** state tracks which actor card is open (accordion pattern).

### Skeleton Loaders (Phase H)
- Next.js `loading.tsx` files now render **content-shaped pulse skeletons** — not full-page overlays.
- The Navbar stays visible and interactive during data fetching (YouTube-style UX).
- Files: `/app/loading.tsx`, `/app/admin/loading.tsx`, `/app/courses/loading.tsx`, `/app/courses/[slug]/[lessonSlug]/loading.tsx`, `/app/dashboard/teacher/loading.tsx`, `/app/profile/loading.tsx`.
- Pattern: No imports needed — use Tailwind `bg-gray-800/XX rounded-XX animate-pulse` divs that mirror the real layout dimensions.

### Enrollment & Payments Flow
- **Enrollment Button (`src/components/EnrollButton.tsx`):** Central logic for user enrollment. 
  - Detects if the current user is the course creator (`isCourseTeacher`) and redirects them to their course settings instead of enrollment.
  - For **Free Programs**, it calls the `enrollInFreeCourse` Server Action directly. This ensures the user sees an immediate transition to the "Enrolled" state without a full page reload.
  - For **Paid Programs**, it handles the hand-off to the Stripe Checkout API.
- **Checkout API (`src/app/api/checkout/[courseId]/route.ts`):** 
  - Handles the creation of Stripe sessions for paid courses. 
  - For free courses (if hit directly), it performs the enrollment and redirects with cache revalidation.
- **Webhook (`src/app/api/webhooks/stripe/route.ts`):** Listens for `checkout.session.completed`. We use `upsert` on the `Enrollment` model for idempotency and send themed emails via Resend.

---

## 3. Database Schema Map (Prisma)
*Always refer to `prisma/schema.prisma` for exact types, but here is the mental model:*

- **`User`**: Has `role`, `status`. Relates to Enrollments, LessonProgress, Comments, and Courses (if Teacher).
- **`Course`**: Parent container for content. Has `price`, `published` flag.
- **`Lesson`**: Child of Course. Contains `content`, `videoUrl`, `isFreePreview`.
- **`Enrollment`**: Join table between User and Course. Represents ownership/access. Includes `stripePaymentId`.
- **`TeacherApplication`**: Customers request to become teachers here. Admins approve/reject.
- **`ContentRequest`**: The moderation queue. Contains `type` (`NEW_LESSON`, `EDIT`, `DELETE`) and `proposedData`.
- **`LessonProgress`**: Tracks which lessons a user has finished.
- **`Comment`**: User discussions tied to a `Lesson`.
- **`EventLog`**: Immutable audit trail for administrative actions (e.g., ROLE_CHANGE, USER_DELETE, STATUS_CHANGE).

---

## 4. Common Tasks for AI
- **If adding a new Admin feature:** Put the UI in `src/app/admin/` and logic in `src/app/admin/actions.ts`. Ensure you check `session.user.role === "ADMIN"`.
- **If working on Checkout/Payments:** Make sure you pass `courseId` and `userId` via metadata in the Stripe session so the webhook can identify what was purchased.
- **If modifying the database:** Update `schema.prisma`, then run `npx prisma db push` (or `migrate dev`), then `npx prisma generate`. Update types as needed.

## 5. Known Gotchas
- When demoting or deleting an Admin, the logic in `admin/actions.ts` explicitly prevents removing the **last remaining admin**. Keep this safeguard intact.
- The TipTap editor saves content as raw HTML strings into the `Lesson.content` field.
- **Images:** All images should be uploaded via `src/components/ImageUpload.tsx`. Do not expect users to provide external URLs.
- **Emails:** Use `src/lib/mail.ts` for any automated communication.
- **Logging:** Use `src/app/actions/logger.ts` for production-level error tracking. Detailed project history is maintained in `LOG.md`.
- **Database Connection:** For local development, use port `5432` (Direct connection) in `.env` if the Supabase transaction pooler (`6543`) is unstable.
- **Supabase Publishable Key:** The project uses the new `sb_publishable_*` key format (stored as `NEXT_PUBLIC_SUPABASE_ANON_KEY`). This replaces the legacy JWT-based anon key.
- **RLS & Prisma:** Prisma connects as the `postgres` owner role and bypasses RLS entirely. RLS policies are defense-in-depth for direct Supabase REST API / PostgREST access. Anon users can only read published courses and free preview lessons.
- **Auth Trigger:** The `handle_new_user()` function (SECURITY DEFINER) in `supabase_trigger.sql` auto-creates a `public.User` row when a new `auth.users` entry is inserted. Do not remove or modify without understanding the auth sync chain.


---

## Latest Session Log (Most Recent LOG.md Entry)

## [2026-05-10] - Phase H: Admin Security Hardening, Currency System, Audit Trail & Skeleton UX

### Added
- **Dynamic Currency System (`src/lib/currency.ts` + `CurrencyContext.tsx`)**: Fetches live exchange rates from `exchangerate-api.com` with a 24-hour Next.js `revalidate` cache. Falls back to hardcoded rates (USD/EUR/GBP/CAD) on API failure. Exposes `useCurrency()` hook with `formatPrice(usdAmount)` and persists user preference in `localStorage`.
- **Currency Toggler (Navbar)**: Globe-icon dropdown in `Navbar.tsx` lets any user switch between USD, EUR, GBP, CAD. All price displays across Admin Revenue tab, Teacher Dashboard, and Teacher Analytics charts update instantly.
- **Recharts Revenue Analytics (Admin)**: Added two horizontal bar charts to the Revenue tab — "Top Courses by Revenue" (green) and "Enrollment Distribution" (blue). Both respect the active currency via `formatPrice`.
- **Enhanced Audit Trail (Admin)**: Audit Logs tab now has a **Timeline / By User toggle**. "By User" view shows collapsible actor cards with role-coloured badges (OWNER=amber, ROOT=red, SUPER_ADMIN=purple, ADMIN=blue, TEACHER=green) and an action-count chip sorted by most active.
- **Optimistic Content Approval UI**: Approving or rejecting a `ContentRequest` now removes the row immediately via `localContentRequests` state. Row is restored on server error with a toast notification.
- **Content Approvals Grouped by Teacher**: The Content Approvals table now groups requests under teacher section headers with an amber left-border, making multi-course reviews more scannable. Search also matches on teacher name.
- **Skeleton Loaders (6 routes)**: Replaced the jarring full-page `LoadingOverlay` during Next.js navigation with content-shaped skeleton screens. Nav bar stays visible and interactive. Skeletons added for: `/` (root), `/admin`, `/courses`, `/courses/[slug]/[lessonSlug]`, `/dashboard/teacher`, `/profile`.
- **Admin `/admin/loading.tsx`**: NEW — stats + tab bar + user table skeleton.
- **Courses `/courses/loading.tsx`**: NEW — hero + 6-card grid skeleton.
- **Teacher `/dashboard/teacher/loading.tsx`**: NEW — stats + course card skeleton.
- **Profile `/profile/loading.tsx`**: NEW — avatar + stats + enrolled course list skeleton.

### Fixed
- **Password Visibility & Caps Lock**: Admin Action Modal (`AdminClient.tsx`) now has Eye/EyeOff toggle and a live "⚠ Caps Lock is On" warning badge to prevent failed password confirmations.
- **ROOT Role Display Bug**: Fixed `targetLevel` parsing so ROOT users are correctly ranked above SUPER_ADMIN and cannot be managed without explicit granted permissions.
- **"View Work" Deep Links**: Content Approval rows now correctly link to `/courses/{slug}/{lessonSlug}` (live preview) instead of the internal editor URL.
- **`CurrencyCode` Type Export (Turbopack)**: Fixed Turbopack strict-mode error by splitting into `import type { CurrencyCode }` and `export type { CurrencyCode }` across `CurrencyContext.tsx` and `Navbar.tsx`.
- **Recharts Tooltip Type**: Fixed TypeScript error in `AdminClient.tsx` and `AnalyticsTab.tsx` by using `(value: any)` instead of `(value: number)` in formatter callbacks.
- **Total Revenue Format**: Admin Revenue tab "Total Revenue" stat now uses `formatPrice()` instead of hardcoded `$` symbol.

### Changed
- `src/app/admin/page.tsx`: Content requests query now includes `teacher` data (`name`, `email`) inside the `course` select, enabling grouped-by-teacher rendering.
- `src/app/loading.tsx`: Replaced `LoadingOverlay` with a proper stats + table skeleton.
- `src/app/courses/[slug]/[lessonSlug]/loading.tsx`: Replaced `LoadingOverlay` with a video + sidebar lesson-list skeleton.

### Build
- `npm run build` → **Exit code 0** · 17 routes compiled · TypeScript clean.



### Added
- **Admin Tabs Categorization**: Refactored the overflowing Admin Panel tabs into a responsive `<select>` dropdown. Categorized tools into logical groups (User Management, Course & Content, System & Analytics).
- **Teacher Enrollment Constraint**: Prevented teachers from "enrolling" in their own courses. The `EnrollButton` now dynamically detects ownership and redirects teachers directly to `/dashboard/teacher/courses/[id]/edit` under the label "Course Settings".

### Fixed
- **Forge Account Security**: Hardened the `FORGE_ACCOUNT` bypass flow. It now strictly requires an explicit administrator password verification (`bcrypt.compare`) through a secure modal before execution, preventing unauthorized rapid account creation if a session is left unattended.

---

## Database Models (prisma/schema.prisma)

User, TeacherApplication, Course, Lesson, ContentRequest, Comment, LessonProgress, Enrollment, RateLimit, EventLog, Notification, Certificate

---

## Route Map (src/app)

  /
  /about
  /admin
  /certificates/[id]
  /courses
  /courses/[slug]
  /courses/[slug]/[lessonSlug]
  /dashboard/teacher
  /dashboard/teacher/courses/[id]/edit
  /dashboard/teacher/courses/[id]/lessons/[lessonId]/edit
  /dashboard/teacher/courses/new
  /forgot-password
  /login
  /owner
  /owner/logs
  /profile
  /register
  /reset-password
  /verify-email

---

## Key Files with Line Counts

  src/app/admin/AdminClient.tsx (1892 lines)
  src/app/admin/actions.ts (631 lines)
  src/app/admin/page.tsx (126 lines)
  src/lib/CurrencyContext.tsx (56 lines)
  src/lib/currency.ts (33 lines)
  src/lib/permissions.ts (205 lines)
  src/components/Navbar.tsx (212 lines)
  src/components/Providers.tsx (21 lines)
  src/app/layout.tsx (69 lines)
  src/app/dashboard/teacher/TeacherClient.tsx (393 lines)
  src/app/dashboard/teacher/AnalyticsTab.tsx (124 lines)
  prisma/schema.prisma (180 lines)
  scripts/snapshot_ai_memory.mjs (226 lines)

---

## Recent Git History (last 8 commits)

23e38ca Praise God: the PBAC transition is going well
56376e6 Praise God: last feature update before Engine Change!
97b061d Praise God: First prototype for showcasing
291c165 Praise God: First prototype for showcasing
13304ac V2 Development v2.9
952843b Praise God Finished version 2 of the project on branch 2
6f81363 Fix: Guaranteed dynamic redirects for Stripe using URL origin
28eec2f Fix: Hardened logout redirect to stay on current site

---

## Uncommitted Changes

M AI_CONTEXT.md

---

## Pending Work / Next Steps

Suggested next areas (in priority order):
- Real-time notifications (Supabase Realtime channels on ContentRequest / Notification tables)
- Admin email digest when approval queue builds up (Resend)
- i18n expansion: Amharic / Tigrinya via the existing I18nContext
- Audit log CSV export (download button for OWNER/ROOT)
- Teacher revenue share dashboard (platform % vs teacher %)
- Bonus UI Polish: micro-animations, parallax scrolling, subtle sound effects
