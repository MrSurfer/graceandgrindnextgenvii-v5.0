# Grace & Grind: Parenting Excellence Hub

A high-performance, premium education platform designed for intentional parents within the Habesha diaspora. This hub enables mastery through curated parenting programs, professional instructor tools, and an elite learning environment.

**TECHNICAL STANDARD:** On Windows systems, always execute PowerShell commands using the `-ExecutionPolicy Bypass` flag to ensure consistent execution without permission blocks.

## 🌟 Vision
To be the most trusted and comprehensive learning and resource platform for the Habesha diaspora; a digital home where every Ethiopian and Eritrean family, regardless of where they live in the world, can access the tools, knowledge, and community they need to thrive across generations.

## 🎯 Mission
Grace & Grind NextGen exists to equip Habesha parents with practical, faith-informed parenting tools; empower the next generation with life skills and a strong sense of identity; connect newcomers to the resources they need to navigate life in the West; and build a sustainable platform that serves as a lasting community institution.

## 💎 Our Core Values
- **Community First**: We build for people before we build for profit. Every decision starts with asking: does this genuinely serve our community?
- **Cultural Integrity**: We honor Ethiopian and Eritrean culture, language, and faith. We meet our community where they are.
- **Practical Wisdom**: We combine faith-grounded values with real-world, actionable knowledge. Inspiration without tools is incomplete.
- **Generational Thinking**: We measure success in the impact on families, children, and communities over years and decades.
- **Quality Without Compromise**: We prioritize exceptional quality over quantity. Our community deserves the best.
- **Radical Accessibility**: Critical community resources (newcomer guides, immigration help) will always be free. Knowledge should not have a paywall.

## 🚀 Key Features
- **Mastery-Driven Learning**: Content organized into "Programs" and "Sessions" for structured excellence.
- **Instant Mastery Onboarding**: High-performance enrollment for free programs with immediate feedback.
- **Teacher Workspace**: Advanced Udemy-style course creator with TipTap integration.
- **Admin Command Center**: Complete moderation queue, user management, and platform oversight.
- **Premium Onboarding**: Immersive registration experience and high-end feedback loops.
- **Stripe Integration**: Secure enrollment flow for premium programs.

## 🛠️ Technical Stack
- **Framework**: Next.js 16 (App Router / Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Emails**: Resend

## 🔧 Getting Started

> [!IMPORTANT]
> **PowerShell Usage**: On Windows, always execute PowerShell commands using the `-ExecutionPolicy Bypass` flag to avoid system permission errors (e.g., `powershell -ExecutionPolicy Bypass -Command "..."`).

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file based on `.env.example` with your database, auth, and payment keys.

3. **Database Migration**:
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📖 Project Documentation
Detailed history and context are available in:
- `LOG.md`: Major milestones and architectural changes.
- `AI_CONTEXT.md`: Deep-dive for AI assistants on logic flows and schema maps.
- `brain/`: Implementation plans and walkthroughs for specific feature phases.
