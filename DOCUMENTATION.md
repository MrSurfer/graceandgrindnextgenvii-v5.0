# GraceAndGrindNextGenV2 Documentation

Welcome to the GraceAndGrindNextGenV2 project documentation. This document outlines the project's architecture, database schema, and detailed explanations of how the core system logic works.

## 1. Project Overview & Architecture

# GraceAndGrind: Raising the Next Generation

GraceAndGrind is a premium, high-performance education platform dedicated to **intentional parenting excellence**. It provides parents with transformative courses, community discussions, and resources to raise children with purpose, grace, and grind.

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
- **Role Management:** Users are assigned roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`). When logging in via OAuth or Credentials, the role is fetched from the Prisma database and injected into the JWT token and session object. This ensures role-based access control (RBAC) across the platform without requiring a database query on every request.
- **Super Admin "Double-Lock" Security:** For high-risk operations (Emergency Program Deletion, Instant Account Forging), the system requires a "Double-Lock" verification. This means the user must have the `SUPER_ADMIN` role in the database **AND** their email must be present in the hardcoded `SUPER_ADMIN_EMAILS` whitelist in the `.env` file. This prevents unauthorized escalation even if the database is compromised.
- **Account Status:** The system enforces account status checks (`ACTIVE` vs `BLOCKED`). Blocked users are prevented from authenticating.
- **Role-Based Redirection:** Upon successful login, users are redirected based on their role:
  - **ADMIN:** Redirected to `/admin`.
  - **TEACHER:** Redirected to `/dashboard/teacher`.
  - **CUSTOMER/STUDENT:** Redirected to `/courses`.
  This logic is implemented in `src/app/login/page.tsx` and protected by middleware in `src/proxy.ts`.

### Purchasing & Enrollment Logic
Course purchases and enrollments are handled securely via Stripe and custom API routes.
- **Checkout Route (`src/app/api/checkout/[courseId]/route.ts`):** 
  - If a user is not authenticated, they are redirected to login with a callback URL.
  - If the user is already enrolled, they are redirected directly to the course page.
  - **Free Courses:** If the course price is `0`, the system bypasses Stripe, creates an `Enrollment` record in the database directly, and redirects the user to the course.
  - **Paid Courses:** Creates a Stripe Checkout Session with the course details and metadata (e.g., `courseId`, `userId`). The user is redirected to the secure Stripe payment page.
- **Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`):**
  - Listens for the `checkout.session.completed` event from Stripe.
  - Verifies the signature securely using the `STRIPE_WEBHOOK_SECRET`.
  - Extracts the `userId` and `courseId` from the session metadata.
  - Performs an `upsert` on the `Enrollment` table to grant the user access, ensuring idempotency (if the webhook fires multiple times, it won't crash).
  - Revalidates Next.js cache paths so the UI immediately reflects the newly purchased course.

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

- **User:** Stores authentication details, roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`), and account status. Expanded to include professional identity fields: `bio`, `website`, and social handles (`twitter`, `instagram`, `linkedin`).
- **Course:** Represents a learning module. Contains pricing, publishing status, and relations to the teacher and enrolled students.
- **Lesson:** Individual learning units within a Course. Includes content, video URLs, ordering, and free-preview flags.
- **Enrollment:** The join table granting a User access to a Course. Includes the `stripePaymentId` for tracking.
- **TeacherApplication:** Tracks requests from users to become teachers, including status (`PENDING`, `APPROVED`, `REJECTED`).
- **ContentRequest:** A moderation queue for course modifications, allowing admins to vet teacher changes before they go live.
- **LessonProgress:** Tracks which lessons a user has completed.
- **Comment:** Allows users to discuss specific lessons.

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
