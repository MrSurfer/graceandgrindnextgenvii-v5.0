# GraceAndGrind AI Context
This repository contains a high-performance parenting education hub. It is designed to help parents master the art of intentional parenting through courses and community.

## 1. Domain Knowledge
- **Purpose:** Education platform for parents.
- **Tone:** Professional, intentional, encouraging, and premium.
- **Target Audience:** Parents looking for excellence in raising the next generation.
- **Core Entities:** Courses (Parenting topics), Lessons (Content), Enrollments (Access).

## 🤖 AI Assistant Instructions
**If you are an AI reading this, this is your map to the project.** 
Use this document to quickly rebuild context if memory drops or if you are a new AI taking over. It summarizes the architecture, database models, and critical logic flows.

**PROJECT STATUS:** The platform has successfully pivoted from Technical/JS to **Parenting Excellence**. Ensure all future copy, icons, and features align with intentional parenting.

---

## 2. Project Identity & Stack
- **What it is:** A comprehensive online Education Hub / Content Management System (CMS). It supports free and paid courses, user roles (Customer, Teacher, Admin), and a moderation queue for content.
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL hosted on Supabase.
- **ORM:** Prisma (`prisma/schema.prisma`).
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
- **Role-Based Access Control (RBAC):** Users have roles (`CUSTOMER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`). During login, NextAuth fetches the user from Prisma and attaches their `role` directly into the JWT token and the session object. **Do not query the database just to check a user's role on every page load; use the session.**
- **Super Admin Sync:** The whitelisted `SUPER_ADMIN_EMAILS` in `.env` are the ultimate source of truth. Upon every login, the user's role is automatically synchronized to `SUPER_ADMIN` if their email matches the whitelist, ensuring "God Mode" persists even after database resets.
- **Redirection Logic:** Login redirection is handled in `src/app/login/page.tsx`. Super Admins and Admins are sent to `/admin`, Teachers to `/dashboard/teacher`, and Customers to `/courses`.
- **Middleware:** Authenticated route protection is handled in `src/proxy.ts` (Next.js middleware).
- **User Status:** A `status` field (`ACTIVE` vs `BLOCKED`) is checked during sign-in. Blocked users are rejected.

### Content Moderation Flow (CRITICAL)
- Teachers **cannot** directly publish or edit live lessons.
- When a teacher makes an edit or creates a lesson, a `ContentRequest` record is created in the database.
- The `proposedData` (JSON) sits in the `ContentRequest`.
- Admins review requests via the Admin Dashboard. If approved, the JSON data is written to the actual `Lesson` model and status changes to `PUBLISHED`.
- **Admin Safety:** Courses with active enrollments are "Locked". Deletion requires typing the course title exactly, and the server blocks deletion if students are enrolled (to maintain audit/refund trails).

### Stripe & Payments Flow
- **Checkout:** `src/app/api/checkout/[courseId]/route.ts`. Free courses (`price === 0`) bypass Stripe and directly create an `Enrollment`. Paid courses create a Stripe Checkout Session.
- **Webhook:** `src/app/api/webhooks/stripe/route.ts`. Listens for `checkout.session.completed`. We use `upsert` on the `Enrollment` model here to ensure we handle duplicate webhook events safely (idempotency).

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
