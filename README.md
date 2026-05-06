# Grace & Grind: Parenting Excellence Hub

A high-performance, premium education platform designed for intentional parents. This hub enables mastery through curated parenting programs, professional instructor tools, and an elite learning environment.

## 🚀 Key Features
- **Mastery-Driven Learning**: Content organized into "Programs" and "Sessions" for structured excellence.
- **Teacher Workspace**: Advanced Udemy-style course creator with TipTap integration.
- **Admin Command Center**: Complete moderation queue, user management, and platform oversight.
- **Premium Onboarding**: Immersive registration experience and high-end feedback loops.
- **Stripe Integration**: Secure enrollment flow for both free and premium programs.

## 🛠️ Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Emails**: Resend

## 🔧 Getting Started

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
