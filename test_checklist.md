# Grace & Grind: Comprehensive Test Checklist

This checklist is designed to verify the integrity of the platform across all five user roles. Use this as a roadmap for End-to-End (E2E) testing.

---

## 👤 1. Student / Customer Role
*Goal: Ensure a frictionless, premium learning journey.*

### Authentication & Identity
- [ ] **Registration**: 
  - [ ] Create account via email/password.
  - [ ] Verify "Welcome Aboard" animation.
  - [ ] **OTP Verification**: Receive 6-digit code and verify via `/verify-email`.
  - [ ] **Auto-Login**: Verify automatic login after 5 seconds post-verification.
- [ ] **OAuth**: Successfully sign in using Google/GitHub (Verify OTP is bypassed).
- [ ] **Password Recovery**: Request reset and verify 6-digit OTP code flow (15-min expiry).
- [ ] **Profile Setup**: Upload an avatar, add a bio, and link social media handles.
- [ ] **Mastery Portfolio**: Ensure enrolled programs appear correctly on the profile page.

### Discovery & Enrollment
- [ ] **Program Browsing**: Navigate the program library and filter by category.
- [ ] **Instant Free Enrollment**: Enroll in a free program and verify:
  - Immediate "Success" toast notification.
  - Automatic page refresh.
  - Instant access to sessions without manual reload.
- [ ] **Premium Enrollment**: Enroll in a paid program and verify:
  - Secure redirect to Stripe Checkout.
  - Correct price display in Stripe.
  - Successful return to the platform ("Mastery Confirmed").

### The Mastery Experience
- [ ] **Content Viewer**: Verify video playback and rich-text (TipTap) rendering in sessions.
- [ ] **Progress Tracking**: Click "Mark as Mastered" and verify the progress bar updates.
- [ ] **Community Discussion**: 
  - Post a comment on a session.
  - Verify rate limiting (Try posting more than 5 comments in a minute).

---

## 🎓 2. Teacher Role
*Goal: Verify program creation and moderation workflows.*

### Career Path
- [ ] **Application**: Submit a Teacher Application from the profile page.
- [ ] **Dashboard Access**: Ensure the "Teacher Workspace" is accessible only after Admin approval.

### Program Management
- [ ] **Program Creation**: Create a new program (Ensure initial status is `DRAFT`).
- [ ] **Settings Update**: Change title, price, and upload a thumbnail.
- [ ] **Session Editor**:
  - Add a new session using the TipTap editor.
  - Reorder sessions via drag-and-drop.
  - Attach a video URL and save.

### Security & Lifecycle
- [ ] **Inactivity Timer**: Verify 2-minute inactivity logout (with 60s warning countdown).
- [ ] **Moderation Submission**: Trigger a content request for an edited session.
- [ ] **Grace Period**: After approval, verify the ability to edit for 24 hours without a new request.

---

## 🛡️ 3. Admin Role
*Goal: Ensure platform quality and security oversight.*

### User Moderation
- [ ] **User List**: View and search the global user database.
- [ ] **Role Management**: Upgrade a Customer to Teacher or Admin.
- [ ] **Account Security**:
  - Block a user and verify they can no longer log in.
  - **Purge Modal**: Delete a user (Verify custom Purge Modal and password prompt).

### Content Moderation
- [ ] **Application Review**: Approve or Reject a pending Teacher Application.
- [ ] **Content Queue**:
  - Review a session edit request.
  - Verify "Approve" correctly updates the live session data.
  - Verify "Reject" sends the provided feedback.

### Program Protection
- [ ] **Enrollment Lock**: Identify a program with students and verify the "Delete" button is disabled for standard Admins.
- [ ] **Hardened Deletion**: For an empty program, verify the title-typing confirmation in the Purge Modal.

---

## ⚡ 4. Super Admin Role (High Council)
*Goal: Verify high-privilege overrides and security hardening.*

### Access Control
- [ ] **Double-Lock Check**: Verify access is granted via `.env` whitelist OR `SUPER_ADMIN` role in DB.
- [ ] **Global Paywall Bypass**: Verify access to premium sessions without an enrollment record.

### Advanced Operations
- [ ] **The Forge**: Use the Forge panel for rapid account provisioning.
- [ ] **Emergency Override**: Delete a program with active enrollments using the Super Admin toggle.

---

## 👑 5. OWNER Role (CEO Hub)
*Goal: Verify macro-strategic management and business analytics.*

### Command Hub
- [ ] **Access Control**: Verify only whitelisted emails in `OWNER_EMAILS` can access `/owner`.
- [ ] **Business Analytics**: 
  - [ ] Verify 30-day community growth SVG charts.
  - [ ] Verify gross revenue aggregation metrics.
  - [ ] Verify "Generational Impact" status scorecards.
- [ ] **Strategic Oversight**: Verify vertical control over High Council and Super Admin accounts.

---

## 🌐 6. General / UI & UX
*Goal: Ensure the premium feel and technical SEO.*

- [ ] **Verification Hub**: Test the `/verify-email` screen for premium UX and auto-focus logic.
- [ ] **Responsive Design**: Verify the About page, CEO Hub, and Dashboards on Mobile vs. Desktop.
- [ ] **SEO Integrity**: Inspect page source for correct `<title>` and `meta description` tags.
- [ ] **Toasts & Feedback**: Ensure all themed loading states (Admin Blue vs. Mastery Amber) trigger correctly.

