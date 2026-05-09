# GraceAndGrind Project Log

## [2026-05-09] - Phase 7: UI/UX Polish & Administrative Governance

### Added
- **Premium Course Catalog:** Implemented `CourseCatalog.tsx` with real-time keyword search, category grouping, and advanced filters (Price, Category).
- **HR & Operational Metrics:** Developed `HRMetricsPanel` and `getHRMetrics` server action for Level 4+ (ROOT/OWNER) oversight.
  - **Educator Performance:** Tracks courses produced and total student enrollments per teacher.
  - **Admin Activity Ranking:** Ranks administrative engagement based on `EventLog` volume.
- **Navbar Profile Tooltip:** Added a group-hover CSS tooltip revealing User Name, Email, and Hierarchical Role with conditional styling.

### Fixed
- **Auth Loop Prevention:** Sanitized `callbackUrl` in `/login` and `/register` to ignore redirects back to authentication pages, resolving the "stuck on login" issue.
- **Sign-Up Callback Preservation:** Refactored registration flow with `<Suspense>` to preserve `?trigger=` and `?callbackUrl=` parameters throughout the verify-email and login sequence.
- **Import Resolution:** Corrected `notifications.ts` pathing issues and synchronized PostgreSQL schema with Prisma `category` field.

### Status
- **Phase 7 Completed:** Platform UI and governance tools are now production-ready.
- **Phase 8 (In Progress):** Drafting the "Engine Swap" (Supabase Auth Migration + PBAC Transition).


This file tracks major milestones, successful implementations, and key architectural pivots.

## [2026-05-08] - Dynamic URL Resolution & Vercel Compatibility

### Added
- **Dynamic Base URL Utility**: Implemented `getBaseUrl()` in `src/lib/utils.ts` to automatically detect the application's origin across client and server environments.
- **Vercel Auto-Detection**: Integrated `VERCEL_URL` and `NEXT_PUBLIC_VERCEL_URL` into the environment configuration for zero-config production deployments.
- **Dynamic APP_URL Export**: Added a calculated `APP_URL` to `src/lib/env.ts` to replace hardcoded localhost defaults.

### Fixed
- **Vercel Logout Redirect**: Resolved an issue where logging out on Vercel redirected users to `localhost:3000`. Both `Navbar.tsx` and `InactivityHandler.tsx` now use dynamic callback URLs for `signOut`.
- **Environment Schema Hardening**: Updated `envSchema` in `src/lib/env.ts` to make `NEXT_PUBLIC_APP_URL` optional, preventing build failures on Vercel when the variable is missing.

## [2026-05-08] - Admin Governance & Hierarchy Enforcement

### Added
- **Immutable Audit Trail:** Deployed the `EventLog` Prisma model and `src/lib/audit.ts` to persistently track all administrative actions (Role Changes, Blocks, User Deletions, Account Forging).
- **ROOT Role Expansion:** Replaced the legacy "High Council" configuration with a formal `ROOT` database role (Level 4), officially standing between `SUPER_ADMIN` (Level 3) and `OWNER` (Level 5).
- **Global Admin Search:** Implemented unified, real-time search functionality across the Users, Courses, Customers, and Content Approvals tabs inside the Admin Command Center.
- **OTP Console Fallback:** Added Regex-powered parsing to `src/lib/mail.ts` so that in local development without `RESEND_API_KEY`, the 6-digit OTP code prints massively and distinctly to the console.

### Fixed
- **Forge Account Bypass:** Resolved an issue where forged accounts couldn't log in due to missing email verification; the Forge action now explicitly bypasses this check.
- **Hierarchy Security Lock:** Updated `getAuthorityLevel` and server action verifications so an admin cannot assign a role equal to or higher than their own authority level.
- **Owner Dashboard Access:** Restored `OWNER` role access to the Teacher/Content Creator Dashboard without middleware blocking.

## [2026-05-08] - Technical Standardization

### Added
- **Command Line Policy**: Established the use of `-ExecutionPolicy Bypass` for all PowerShell operations to prevent permission errors in development environments.
- **Documentation Sync**: Updated `README.md`, `AI_CONTEXT.md`, and `test_checklist.md` with latest platform standards and role hierarchies.

## [2026-05-06] - Parenting Excellence Pivot & Checkout Verification

### Added
- **Parenting Theme Pivot:** Full UI/UX terminology shift from "Coding/Courses" to "Parenting Programs & Mastery."
  - Updated Landing Page, Course Catalog, Program Details, and Session Viewing components.
  - Refined Teacher Dashboard and Course Creation forms to reflect parenting excellence.
- **Mastery System:** Renamed "Lessons" to "Sessions" and "Mark as Complete" to "Mark as Mastered" across the platform.
- **Auth Stability:** Added `AUTH_TRUST_HOST=true` to `.env` to fix local development sign-out/fetch errors.

### Verified
- **Free Enrollment Flow:** Confirmed direct enrollment for free programs bypasses Stripe and updates DB correctly.
- **Paid Checkout Flow:** Verified that paid programs correctly redirect to Stripe Checkout with proper metadata.
- **Webhook Integration:** Pivoted Stripe Webhook confirmation emails to parenting-themed content ("Mastery Confirmed").
- **Admin Security:** Course deletion protection (locking and text confirmation) is fully operational.

## [2026-05-06] - Premium UX Refinement & Unified Destructive Actions

### Added
- **Themed Loading System:** Refactored `LoadingOverlay` to support polymorphic themes.
  - **Blue (Admin Protocol):** Used for administrative actions like role changes, applications, and purges.
  - **Amber (Mastery Flow):** Used for teacher-side operations, session editing, and program configuration.
- **Unified Deletion Modal:** Replaced all browser-native `confirm()` and `prompt()` calls with a custom, high-premium "Purge Modal."
  - Supports both **User Purges** and **Program Deletions**.
  - **Hardened Deletion:** Enforces title-typing confirmation for programs with active enrollments to prevent data loss.
- **Enhanced Teacher UX:** Integrated full-screen themed loading states for "Session Publishing" and "Program Configuration" to ensure smooth async transitions.

### Fixed
- **JSX Syntax:** Resolved unclosed fragments in `CourseSettingsForm.tsx` and `LessonEditorForm.tsx`.
- **State Management:** Fixed `ReferenceError` for `lastUpdated` and `selectedRequest` in the Admin Dashboard after component refactoring.

## [2026-05-06] Milestone: The Parenting Pivot & Admin Hardening

### 🚀 Major Accomplishments
- **Platform Pivot:** Successfully transitioned the entire codebase from a Technical/JavaScript hub to a **Parenting Excellence Platform**.
    - Updated Homepage, About Page, and Metadata with parenting-focused copy.
    - Replaced technical "Zap" icons with "Heart" and "Sparkles" across the UI (Navbar, Login, Register, Home).
- **Admin Dashboard Hardening:**
    - Implemented a "Lock" system for courses with active enrollments.
    - Restricted course deletion: Admin must type the exact course title to confirm, and the server blocks deletion if enrollments exist (to preserve financial records).
- **Authentication & UX:**
    - Implemented role-based redirects: Admins -> `/admin`, Teachers -> `/dashboard/teacher`, Students -> `/courses`.
    - Integrated functional transactional emails via **Resend** for password resets.
    - Fixed high-traffic API routes with a database-backed **Rate Limiting** system.
- **UI/UX Polishing:**
    - Resolved email overflow issues on the Profile page.
    - Expanded Profile stats to show both teaching and enrollment data for staff.
    - Implemented a premium `LoadingOverlay` with progress simulation.

### 🛠️ Technical Fixes
- **Database:** Added `image` field to `User` model; switched local dev connection to Direct Port (`5432`) to resolve Supabase pooler connectivity issues.
- **Next.js:** Fixed `middleware.ts` naming conflict by renaming to `proxy.ts`.
- **Icons:** Standardized `lucide-react` usage across pivoted components.

### 📅 Next Steps
- Implement Playwright E2E testing for the checkout flow.
- Monitor SEO indexing for the new parenting-themed sitemap.
- Implement professional login logic (Google/Social Auth integration).

---

## 🔒 Milestone: Super Admin Hardening & Professional Identity
**Date: May 6, 2026**

### 🚀 Key Features
- **Super Admin- **Double-Lock Security**: Super Admin access requires email whitelist in `.env` OR `SUPER_ADMIN` role in DB for general access. High-privilege features (Forge) still require whitelisting.
- **Inactivity Policy**: 4-hour inactivity limit for Teachers/Admins (currently 2 min for testing) with a 60s countdown. Students are exempt.
- **Auto-Provisioning**: The "Forge" system bypasses normal registration for rapid account creation by Super Admins.
- **Optimistic Performance**: Admin actions use Optimistic UI for instant feedback without full page reloads.
- **Hardened Deletion**: Standard Admins are blocked from deleting programs with enrollments; only verified Super Admins can use the "Emergency Override."
- **Professional User Identity:**
    - Expanded the `User` model with `bio`, `website`, and social handles (`twitter`, `instagram`, `linkedin`).
    - Redesigned the Profile page with a premium, portfolio-style interface and professional details editor.
    - Updated `updateProfile` server action to persist the new rich identity data.
- **Moderation System**: Robust, status-based workflow (DRAFT -> PENDING -> PUBLISHED). Admin approval is required for initial publication and all subsequent edits to live content.
- **Grace Periods**: Approved content enters a 24-hour "grace window" where teachers can make direct fixes without further approval.
- **Admin Safety**: High-authority operations (purges) require both a confirmation string and the administrator's password.
- **Authorization Hierarchy**: Whitelist-based Super Admin status is the ultimate authority, immutable via UI and checked against raw environment variables.
- **UI:** Added `Zap` and social connectivity icons to the Admin and Profile dashboards.
- **Global Access**: Super Admins now bypass all paywalls, enrollment checks, and teacher ownership restrictions.
- **Auto-Redirection**: Super Admins are now correctly routed to the `/admin` dashboard upon login.
- **Admin/Teacher Dashboard Synergy**: Super Admins can access both management layers from the Navbar.
- **"Welcome Aboard" Experience**: Replaced standard registration redirects with a premium, animated success flow.
    - Implemented immersive full-screen "Success" overlay.
    - Added a "Preparing Mastery Hub" progress bar to enhance the onboarding feel.

### Fixed
- **Middleware Gaps**: Updated `proxy.ts` to recognize `SUPER_ADMIN` as a valid administrative route.
- **Profile Logic**: Excluded Super Admins from the standard teacher application flow (pre-approved status).
- **Action Permissions**: Hardened 10+ server actions (edit/delete/publish) to recognize Super Admin authority.

## Session 2026-05-06: Moderation Lifecycle & Admin Security Hardening

### Achievements
- **Harden Moderation Workflow**: Implemented status and approvedUntil (grace period) for both Lessons and Courses.
- **Admin Content Review**: reviewContentRequest now automatically applies proposed changes (title, content, price, etc.) and grants teachers a 24h direct-edit window upon approval.
- **Admin Deletion Safety**: 
    - Purging Users or Courses now requires the administrators password for verification.
    - Added Lock icons on courses with active enrollments to warn against deletion.
- **Dashboard Optimization**: Integrated reusable Pagination across all Admin tables (Users, Courses, Applications, Content Requests, Customers).
- **Auth & UX Polish**: 
    - Finalized Forgot Password flow (tokenized links via Resend).
    - Fixed mobile Navbar account icon visibility.
    - Standardized Google/GitHub social login prominence.

### Technical Notes
- Updated Prisma schema with Course.status and Course.approvedUntil.
- Unified ContentRequest infrastructure for all pedagogical assets.

## [2026-05-07] - High-Performance Enrollment & Documentation Overhaul

### Added
- **Instant Free Enrollment:**
  - Implemented `EnrollButton` (Client Component) and `enrollInFreeCourse` (Server Action).
  - Replaced legacy API-redirect flow for free programs with an instant async flow.
  - Added `router.refresh()` and toast notifications for immediate UI feedback.
- **Operation Manual:**
  - Created `Operation Manual.md` to house detailed platform governance and usage instructions.
  - Finalized sections for **Students**, **Teachers**, **Admins**, and **Super Admins**.

### Updated
- **Documentation Overhaul:**
  - Synchronized `DOCUMENTATION.md`, `AI_CONTEXT.md`, and `README.md` with the new enrollment logic and Next.js 16 stack details.
- **Log Management:**
  - Standardized project history tracking for upcoming Teacher and Admin manual sections.

### Fixed
- **UI Lag:** Eliminated the "manual reload" requirement for free course access by utilizing Server Actions and cache revalidation.
- **Strategic Foundation:**
  - Integrated the official **Vision**, **Mission**, and **Core Values** into all major documentation (`README`, `AI_CONTEXT`, `DOCUMENTATION`, `Operation Manual`).
  - Formalized the platform's focus on the **Habesha diaspora** (Ethiopian and Eritrean families).
- **About Page Revamp:**
  - Redesigned the `/about` page to feature the new **Strategic Foundation** (Vision, Mission, Core Values).
  - Enhanced the UI with premium radial gradients, custom icons, and a layout optimized for the Habesha diaspora mission.
- **Value Proposition Update:**
  - Added the "Bridging the Knowledge Gap" section to the About page.
  - **Community Resource Hub Integration:**
  - Added the "Free Community Resource Hub" to the About page.
  - Implemented a 6-category grid covering Newcomer Essentials, Immigration, Education, Financial Literacy, Health, and Employment.
- **Inspiration Section Integration:**
  - Added the "Our Inspiration" section to the About page.
- **Final About Page Polish:**
  - Added the "Our Sacred Commitment" section, focusing on the generational impact and community-first business model.
  - Redesigned the Galatians 6:2 footer with a high-impact "Not a platform. A people." treatment.
- **Quality Assurance:**
  - Created master E2E test checklist for Student, Teacher, Admin, and Super Admin roles.

### 2026-05-07 | Authentication & Dashboard Optimization
- **Super User Logic**: Fixed access check to allow `SUPER_ADMIN` role from DB to enter admin panel even without email whitelist.
- **Inactivity Security**: Implemented `InactivityHandler` with 2-minute timeout and 60-second countdown for Leadership roles.
- **Auto-Login**: Updated registration flow to automatically sign users in after 5 seconds.
- **Dashboard Speed**: Added Optimistic UI to `AdminClient` and removed 1-minute full-page refresh interval.
- **OAuth**: Integrated Google and GitHub Client IDs into `.env` and `auth.ts`.

## [2026-05-07] - CEO Governance & Identity Verification (Milestone)

### 🚀 Strategic Management (OWNER Tier)
- **Level 5 Authority**: Implemented the **OWNER** role as the platform's ultimate authority. 
  - Owners have vertical control over High Council members and Super Admins.
  - Role synchronization via `OWNER_EMAILS` whitelist in `.env`.
- **CEO Command Hub**: Created a high-fidelity dashboard at `/owner` for macro business management.
  - **Custom SVG Analytics**: Real-time community growth charts (last 30 days).
  - **Business Metrics**: Aggregated gross revenue and strategic performance scorecards.
  - **Mission Alignment**: "Generational Impact" status tracking for CEO-level oversight.

### 🛡️ Identity & Security Hardening
- **6-Digit OTP Verification**: Transitioned from UUID-based links to clean, 6-digit **One-Time Passwords**.
  - **Email Verification**: New registrations now require OTP verification before login is permitted.
  - **Password Reset**: Switched to OTP codes for secure, time-sensitive (15-minute) account recovery.
- **Login Guard**: Implemented a strict check in `auth.ts` to block unverified users from accessing the platform.
- **OAuth Auto-Verification**: Google and GitHub sign-ins are automatically marked as `emailVerified` (bypassing OTP).
- **Verification Hub**: Developed a dedicated `/verify-email` screen with premium UX, auto-focus inputs, and resend logic.

### 🛠️ Technical Fixes & UI
- **Hierarchy Refinement**: Updated `getAuthorityLevel` and server actions to enforce the 5-tier power structure.
- **Admin Hub Branding**: Refined the `/admin` dashboard as the **Operations Hub** (HR/CFO focused) for the High Council.
- **Navbar Integration**: Dynamic links for "CEO Hub" and "Admin Hub" based on hierarchical permissions.
- **Profile Branding**: Added premium role badges (Purple for High Council, Amber for Super Admin, Red for Admin).
- **Password Reset Fix**: Manually resolved a master account access issue via system-level password hashing.

### 📅 Status & Next Steps
- **Completed**: Tiered governance, business analytics, and identity verification.
- **Pending**: Full production deployment to Vercel and final SMTP configuration.
- **Next**: Finalize the "Resource Hub" CMS and Amharic translation layer.
