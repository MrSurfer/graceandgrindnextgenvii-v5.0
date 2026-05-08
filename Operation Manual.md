# Grace & Grind: Operation Manual

This manual provides detailed instructions on how to operate and navigate the Grace & Grind platform for various user roles.

## 0. Strategic Foundation

### 🌟 Vision
To be the most trusted and comprehensive learning and resource platform for the Habesha diaspora; a digital home where every Ethiopian and Eritrean family, regardless of where they live in the world, can access the tools, knowledge, and community they need to thrive across generations.

### 🎯 Mission
Grace & Grind NextGen exists to equip Habesha parents with practical, faith-informed parenting tools; empower the next generation with life skills and a strong sense of identity; connect newcomers to the resources they need to navigate life in the West; and build a sustainable platform that serves as a lasting community institution.

### 💎 Our Core Values
1. **Community First**: We build for people before we build for profit. Every decision starts with asking: does this genuinely serve our community?
2. **Cultural Integrity**: We honor Ethiopian and Eritrean culture, language, and faith. We meet our community where they are.
3. **Practical Wisdom**: We combine faith-grounded values with real-world, actionable knowledge. Inspiration without tools is incomplete.
4. **Generational Thinking**: We measure success in the impact on families, children, and communities over years and decades.
5. **Quality Without Compromise**: We prioritize exceptional quality over quantity. Our community deserves the best.
6. **Radical Accessibility**: Critical community resources (newcomer guides, immigration help) will always be free. Knowledge should not have a paywall.

---

## 1. Student / Customer Operation Manual

Welcome to the student experience. This section outlines how to navigate the platform, manage your learning journey, and achieve parenting mastery.

### 1.1 Onboarding & Authentication
- **Registration**: New users can sign up via the `/register` page. Experience the "Welcome Aboard" premium animated success flow which prepares your personal Mastery Hub.
- **Login**: Access your account using Email/Password, Google, or GitHub.
- **Password Recovery**: If you forget your password, use the "Forgot Password" link on the login page to receive a secure reset token via email (Resend integration).

### 1.2 Browsing & Discovery
- **Programs Catalog**: Navigate to `/courses` to see all available parenting programs.
- **Program Details**: Click on any program card to view its curriculum, instructor details, and pricing.
- **Free Previews**: Some sessions within premium programs are marked as "Free Preview," allowing you to sample the content before enrolling.

### 1.3 Enrollment Flow
- **Free Programs**: 
  - Click the **"Enroll Free"** button.
  - The system will process your enrollment instantly using a high-performance Server Action.
  - You will receive immediate feedback via a success toast and the page will refresh automatically to unlock all sessions.
- **Premium Programs**:
  - Click the **"Enroll for $[Price]"** button.
  - You will be securely redirected to the Stripe Checkout page.
  - Complete the payment using your preferred method.
  - Upon success, you will be redirected back with your "Mastery Confirmed" status.

### 1.4 Learning & Mastery
- **Accessing Sessions**: Once enrolled, click on any session in the curriculum list to enter the viewer.
- **Watching Content**: Video sessions and rich-text content are available for every lesson.
- **Marking as Mastered**: After completing a session, click the **"Mark as Mastered"** button. This updates your progress bar and tracks your growth journey.
- **Session Discussions**: Scroll down on any session page to participate in the community discussion. You can add comments, ask questions, and interact with other parents (Rate limited to 5 comments per minute for security).

### 1.5 Profile & Identity Management
- **Mastery Portfolio**: Visit your `/profile` page to see your enrolled programs, overall progress, and stats.
- **Professional Identity**: Use the "Edit Profile" section to update your bio, website, and social media handles (Twitter, Instagram, LinkedIn).
- **Avatar**: Upload a custom profile picture using the integrated Supabase Storage uploader.

### 1.6 Becoming a Teacher
- If you wish to share your wisdom, you can apply to become a teacher from your profile page. 
- Fill out the application and wait for Admin approval.
- Once approved, your dashboard will expand to include the "Teacher Workspace."

## 2. Teacher Operation Manual

The Teacher Workspace is designed for instructors to create and manage their parenting programs with precision.

### 2.1 The Teacher Dashboard
- **Double-Lock Security**: Super Admin features like account "Forging" require the email whitelist in `.env` in addition to the DB role.
- **Emergency Overrides**: Can delete programs with active enrollments (requires exact title confirmation).
- **Session Security**: Subject to the same 4-hour inactivity logout as Admins (2 minutes during testing).
- **Location**: Access via `/dashboard/teacher`.
- **Key Metrics**: Track your total programs, active enrollments, and revenue.
- **Management Tabs**:
  - **My Programs**: List of all programs you own.
  - **Enrolled Parents**: List of students currently active in your programs.
  - **Requests**: Status of your moderation submissions (Pending, Approved, Rejected).

### 2.2 Program Creation & Editing
- **Creating a Program**: Click "New Program" to start. Programs begin in **DRAFT** status.
- **Configuration**: Use the **Program Settings** tab to update:
  - Title & Description.
  - Pricing (Set to `0` for free access).
  - Thumbnail image (Upload via Supabase integration).
- **Session Editor**:
  - Add or reorder sessions using the drag-and-drop interface.
  - **TipTap Integration**: Use the advanced WYSIWYG editor for rich-text content.
  - **Video Mastery**: Attach video URLs for each session.

### 2.3 Content Moderation Workflow
- **Submission**: When you create or edit a session, it enters a **PENDING** state.
- **Admin Review**: Admins will vet the content for quality and alignment with parenting excellence.
- **Approval Window**: Once approved, content becomes **PUBLISHED**. You are granted a **24-hour Grace Period** to make direct fixes to that content without requiring further approval. After the window closes, subsequent edits will require a new review.

---

## 3. Admin Operation Manual

Admins are the guardians of platform quality and security.

### 3.1 Platform Oversight
- **Location**: Access via `/admin`.
- **Navigation**: Use the sidebar to switch between Users, Programs, Applications, Content Requests, and Event Logs.
- **Global Search**: Instantly find users, courses, and customers across all tabs using the unified search bar.

### 3.2 User Management & Moderation
- **Role Control**: Admins can upgrade Customers to Teachers or Admins.
- **Account Blocking**: Instantly block users to revoke platform access.
- **Account Purging**: Delete user accounts (Requires administrator password verification).
- **Teacher Applications**: Review submitted applications. Approving an application automatically upgrades the user's role and notifies them via email.

### 3.3 Content Moderation Queue
- **Reviewing Requests**: Process the `ContentRequest` queue. 
- **Approval Logic**: Clicking "Approve" automatically parses the proposed JSON data and applies it to the live Program/Session.
- **Rejection**: Provide feedback to the teacher when rejecting content.

### 3.4 Program Security (The "Lock" System)
- **Enrollment Lock**: Programs with active enrollments are visually marked with a **Lock** icon.
- **Deletion Safeguard**: Standard Admins are **prevented** from deleting programs with active enrollments to preserve financial and progress records.
- **Deletion Confirmation**: For programs without enrollments, the Admin must type the program's exact title to confirm deletion.

### 3.5 Immutable Audit Trail (Event Logs)
- Every major administrative action (Role Changes, Blocks, User Deletions, Account Forging) is automatically logged.
- **ROOT** and **OWNER** accounts can access the `/owner/logs` dashboard to verify the exact time, actor, and outcome of all critical platform changes.

---

## 4. Super Admin / ROOT Operation Manual

### 4.1 "Double-Lock" Security
- **Access Control**: Entry to the Admin Dashboard requires the `ADMIN`, `SUPER_ADMIN`, or `ROOT` role in the database.
- **ROOT (Level 4)**: The highest operational security tier. Has vertical authority over standard Super Admins and can perform emergency overrides.
- **Account Forging**: ROOT and Super Admins can instantly forge fully active accounts (bypassing email verification) via the Forge tab for administrative efficiency.

---

## 5. OWNER / CEO Operation Manual

The OWNER role represents the highest strategic authority on the platform.

### 5.1 CEO Command Hub
- **Location**: Access via `/owner`.
- **Master Authority**: Owners have vertical control over all other roles, including the High Council.
- **Business Analytics**: Real-time visualization of platform growth and community impact.
- **Revenue Management**: Macro-view of gross platform revenue and subscription health.
- **Strategic Oversight**: Monitoring the "Generational Impact" metrics to ensure mission alignment.

### 5.2 Security Governance
- **Role Sync**: Ownership is governed by the `OWNER_EMAILS` whitelist in the environment configuration.
- **Admin Access**: Owners have a dedicated link to the Operations Hub (/admin) for hands-on management.
