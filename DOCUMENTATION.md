# GraceAndGrindNextGenV2 Documentation

Welcome to the GraceAndGrindNextGenV2 project documentation. This document outlines the project's architecture, database schema, and detailed explanations of how the core system logic works.

## 1. Project Overview & Strategic Framework

# GraceAndGrind: Equipping the Habesha Diaspora

GraceAndGrind is a premium, high-performance education and resource platform dedicated to the **Habesha diaspora** (Ethiopian and Eritrean families). It provides parents with transformative courses, community discussions, and critical resources to thrive across generations while honoring their cultural heritage.

### 🌟 Vision
To be the most trusted and comprehensive learning and resource platform for the Habesha diaspora; a digital home where every Ethiopian and Eritrean family can access the tools, knowledge, and community they need to thrive.

### 🎯 Mission
Grace & Grind NextGen exists to equip Habesha parents with practical, faith-informed tools; empower the next generation with identity and life skills; and build a sustainable platform that serves as a lasting community institution.

### 💎 Core Values
- **Community First**: Decisions are driven by genuine community service.
- **Cultural Integrity**: Honoring Habesha culture, language, and faith.
- **Practical Wisdom**: Actionable knowledge grounded in faith-based values.
- **Generational Thinking**: Measuring success by long-term impact on families.
- **Quality Without Compromise**: Delivering only exceptional, high-end content.
- **Radical Accessibility**: Ensuring critical community resources are free.

### Tech Stack
- **Framework:** Next.js (App Router)
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Content Editor:** TipTap WYSIWYG
- **Cloud Storage:** Supabase Storage
- **Emails:** Resend

---

## 2. System Logic & Workflows

### Authentication System
The application uses NextAuth.js configured in `src/lib/auth.ts`.
- **Providers:** Google, GitHub, and Credentials (Email/Password).
- **Session Strategy:** JWT (JSON Web Tokens).
- **Role Management:** Users are assigned roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`, `OWNER`).
- **Authorization Hierarchy:** The platform enforces a 5-tier vertical hierarchy:
  - **Level 5: OWNER** — Master authority via `OWNER_EMAILS` whitelist. Access to CEO Command Hub.
  - **Level 4: ROOT** — Top-tier security and operations authority. Can manage Super Admins.
  - **Level 3: SUPER_ADMIN** — Database-level administrative access.
  - **Level 2: ADMIN** — Standard operational moderation.
  - **Level 1: TEACHER** — Educational content creators.
  - **Level 0: CUSTOMER/STUDENT** — Standard users.
- **Identity Verification (OTP):** To prevent bot registrations and ensure real user identity, the system requires a **6-digit One-Time Password (OTP)** for all new email/password registrations. Login is blocked until the `emailVerified` flag is set in the database. Social logins (Google/GitHub) bypass this as they are pre-verified.
- **OTP Password Reset:** Account recovery has been hardened to use 6-digit codes (15-minute expiration) instead of static links, providing a more secure and time-sensitive reset process.
- **Role-Based Redirection:** Upon successful login, users are redirected based on their role:
  - **OWNER:** Redirected to `/owner` (CEO Hub).
  - **ROOT / SUPER_ADMIN / ADMIN:** Redirected to `/admin`.
  - **TEACHER:** Redirected to `/dashboard/teacher`.
  - **CUSTOMER/STUDENT:** Redirected to `/courses`.
  This logic is implemented in `src/app/login/page.tsx` and protected by middleware in `src/proxy.ts`.

### Purchasing & Enrollment Logic
Course purchases and enrollments are handled securely via Stripe and custom Server Actions for high-performance feedback.
- **Enrollment Component (`src/components/EnrollButton.tsx`):** A client-side component that handles the conditional logic for free vs. paid programs.
  - **Free Programs:** Utilizes the `enrollInFreeCourse` Server Action. This provides instant UI feedback via toasts and `router.refresh()`, eliminating the need for manual page reloads.
  - **Paid Programs:** Redirects the user to the `src/app/api/checkout/[courseId]/route.ts` endpoint for Stripe processing.
- **Checkout Route (`src/app/api/checkout/[courseId]/route.ts`):** 
  - If a user is not authenticated, they are redirected to login with a callback URL.
  - If the user is already enrolled, they are redirected directly to the course page.
  - **Free Courses (API Fallback):** If accessed directly, the route creates an `Enrollment` record, revalidates relevant paths, and redirects back to the program with an `?enrolled=true` flag.
  - **Paid Courses:** Creates a Stripe Checkout Session with course metadata.
- **Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`):**
  - Listens for `checkout.session.completed`.
  - Performs an `upsert` on the `Enrollment` table for idempotency.
  - Revalidates Next.js cache paths and sends a "Mastery Confirmed" email via Resend.

### Admin & Teacher Operations Logic
System administration and content management utilize Next.js Server Actions.

- **Admin Controls (`src/app/admin/actions.ts`):**
  - Admins can change user roles, update user status (e.g., blocking users), delete users, and manually assign courses.
  - The logic includes safeguards, such as preventing an admin from deleting or demoting the last remaining admin account in the system, or blocking themselves.
  - **Course Deletion Lock:** Courses with active enrollments are visually "Locked". Standard Admins are blocked from deleting such courses to preserve financial records.
  - **Super Admin Overrides:** Verified Super Admins can bypass the Enrollment Lock using an "Emergency Override" in the deletion modal.
  - **Account Forging:** Super Admins have access to a "Forge" panel to instantly provision any account type, bypassing standard registration and email verification for administrative efficiency.
- **Teacher Applications (`src/app/profile/actions.ts`):**
  - Customers can apply to become teachers. The application creates a `TeacherApplication` record.
  - Admins review these applications. If approved, the user's role is automatically upgraded to `TEACHER`.
  - If rejected, a 7-day cooldown period is enforced before the user can reapply.
  - When an admin approves an `EDIT` or `NEW_LESSON` request, the proposed data (stored as JSON) is parsed and applied to the actual `Lesson` model. The lesson receives a "Published" status and an `approvedUntil` timestamp, effectively governing content moderation.

### Asset & Image Management
Managed file storage is integrated using Supabase Storage.
- **Upload Utility (`src/lib/storage.ts`):** Provides a secure, server-side wrapper for uploading files to Supabase buckets.
- **Image Upload Component (`src/components/ImageUpload.tsx`):** A reusable React component that handles file selection, drag-and-drop, and previewing. It calls a server action to perform the secure upload and returns the public URL.
- **Usage:** Used in `CourseSettingsForm` for course thumbnails and `ProfileClient` for user avatars.

### Transactional Email System
The platform uses **Resend** for sending automated emails to users.
- **Mail Utility (`src/lib/mail.ts`):** A centralized helper for sending HTML emails.
- **Automation:**
  - **Enrollment:** Sent via the Stripe webhook upon successful purchase.
  - **Teacher Approval:** Sent when an admin approves/rejects a teacher application.

### Error Tracking & Monitoring
- **Structured Logging (`src/app/actions/logger.ts`):** A server-side logging utility that formats errors and info as structured JSON for better searchability in production environments (like Vercel).
- **Global Error Boundary:** The `src/app/error.tsx` file automatically captures client-side crashes and reports them to the server-side logger.

---

## 3. Database Schema

The database utilizes Prisma and includes the following key models:

- **User:** Stores authentication details, roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`, `OWNER`), account status, and `emailVerified` timestamp. 
- **VerificationCode:** Stores 6-digit OTP codes for email verification with 15-minute expiration.
- **Course:** Represents a learning module. Contains pricing, publishing status, and relations to the teacher and enrolled students.
- **Lesson:** Individual learning units within a Course. Includes content, video URLs, ordering, and free-preview flags.
- **Enrollment:** The join table granting a User access to a Course. Includes the `stripePaymentId` for tracking.
- **TeacherApplication:** Tracks requests from users to become teachers, including status (`PENDING`, `APPROVED`, `REJECTED`).
- **ContentRequest:** A moderation queue for course modifications, allowing admins to vet teacher changes before they go live.
- **LessonProgress:** Tracks which lessons a user has completed.
- **Comment:** Allows users to discuss specific lessons.
- **PasswordResetToken:** Manages 6-digit OTP codes for account recovery.
- **EventLog:** Immutable audit trail for tracking administrative actions (Role Changes, Blocks, User Deletions, Account Forging).

---

## 4. Directory Structure

- `src/app/api/`: API routes, including webhooks and Stripe checkout endpoints.
- `src/app/admin/`: Admin dashboard pages and Server Actions for platform moderation.
- `src/app/courses/`: Public-facing course catalogs and detailed lesson viewers.
- `src/app/dashboard/teacher/`: The Teacher Workspace for course/lesson creation using TipTap.
- `src/app/profile/`: User profile management and teacher applications.
- `src/components/`: Reusable React components (e.g., `TipTapEditor`, `AnimatedSection`).
- `src/lib/`: Core utilities such as `auth.ts` (NextAuth config), `prisma.ts` (Database client), and `stripe.ts` (Stripe client).

---

## 5. Local Development Setup

### Environment Variables
You will need a `.env` file at the root with the following keys:
- `DATABASE_URL` & `DIRECT_URL`: Supabase connection strings.
- `AUTH_SECRET`: A secret string for NextAuth encryption.
- `STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe API keys.
- `STRIPE_WEBHOOK_SECRET`: Secret for validating Stripe webhooks locally and in production.
- `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Supabase credentials for file storage.
- `RESEND_API_KEY`: API key for Resend email notifications.
- `NODE_OPTIONS="--dns-result-order=ipv4first"`: Recommended for local dev on Windows to resolve IPv6 connection issues.
- *OAuth credentials (Google/GitHub) if utilized.*

### Running the Project
1. Install dependencies: `npm install`
2. Run database migrations: `npx prisma db push` or `npx prisma migrate dev`
3. Generate Prisma client: `npx prisma generate`
4. Start dev server: `npm run dev`
