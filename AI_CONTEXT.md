# GraceAndGrind AI Context
This repository contains a high-performance parenting education hub. It is designed to help parents master the art of intentional parenting through courses and community.

## 1. Domain Knowledge
- **Purpose**: Education and resource platform for the **Habesha diaspora** (Ethiopian and Eritrean families).
- **Vision**: To be the most trusted digital home for Habesha families globally, enabling them to thrive across generations.
- **Mission**: To equip parents with faith-informed tools, empower the next generation with identity and life skills, and connect newcomers to critical resources.
- **Tone**: Professional, intentional, encouraging, and premium.
- **Target Audience**: Habesha parents and families navigating life in the West while honoring their cultural heritage.
- **Core Entities**: Courses (Parenting topics), Lessons/Sessions (Content), Enrollments (Access).

## 💎 Core Values
1. **Community First**: Decisions are driven by community service, not just profit.
2. **Cultural Integrity**: Honoring Ethiopian and Eritrean culture, language, and faith without forced assimilation.
3. **Practical Wisdom**: Combining faith-grounded values with actionable real-world knowledge.
4. **Generational Thinking**: Success is measured by long-term impact on families and children.
5. **Quality Without Compromise**: Prioritizing exceptional content quality over quantity.
6. **Radical Accessibility**: Critical community resources (immigration, newcomer guides) are always free.

## 📋 Verification & QA
- **[test_checklist.md](file:///c:/Users/ytyir/OneDrive/Desktop/Projects/GraceAndGrindNextGenV2/graceandgrindnextgenvii/test_checklist.md)**: The master roadmap for E2E testing across all roles. Always refer to this when verifying new features.

## 🤖 AI Assistant Instructions
**If you are an AI reading this, this is your map to the project.** 
Use this document to quickly rebuild context if memory drops or if you are a new AI taking over. It summarizes the architecture, database models, and critical logic flows.

**PROJECT STATUS:** The platform has successfully pivoted from Technical/JS to **Parenting Excellence**. Ensure all future copy, icons, and features align with intentional parenting.

**TECHNICAL STANDARD:** On Windows systems, always execute PowerShell commands using the `-ExecutionPolicy Bypass` flag to ensure consistent execution without permission blocks.

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
- **Redirection Logic:** Login redirection is handled in `src/app/login/page.tsx`. Owners go to `/owner`, Admins go to `/admin`, Teachers go to `/dashboard/teacher`, and Customers go to `/courses`.
- **Middleware:** Authenticated route protection is handled in `src/proxy.ts`.
- **User Status:** A `status` field (`ACTIVE` vs `BLOCKED`) is checked during sign-in. Blocked users are rejected.

### Content Moderation Flow (CRITICAL)
- Teachers **cannot** directly publish or edit live lessons.
- When a teacher- **Double-Lock Security**: Super Admin access requires email whitelist in `.env` OR `SUPER_ADMIN` role in DB for general access.
- **Inactivity Policy**: 4-hour inactivity limit for Teachers/Admins (currently 2 min for testing) with a 60s warning countdown.
- **Optimistic UI**: Admin and dashboard actions must provide instant visual feedback before DB confirmation.
- **QA Standards**: All changes must be validated against `test_checklist.md`.
- **Admin Safety:** Courses with active enrollments are "Locked". Deletion requires typing the course title exactly, and the server blocks deletion if students are enrolled (to maintain audit/refund trails).

### Enrollment & Payments Flow
- **Enrollment Button (`src/components/EnrollButton.tsx`):** Central logic for user enrollment. 
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
