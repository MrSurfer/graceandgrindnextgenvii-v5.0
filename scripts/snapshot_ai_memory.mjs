#!/usr/bin/env node
/**
 * GraceAndGrind AI Memory Snapshot Tool (Node.js version)
 * =========================================================
 * Generates AI_SNAPSHOT.md — a single compact file that an AI assistant
 * can read at the START of a new conversation to instantly recover full
 * project context.
 *
 * Usage:
 *   npm run snapshot          (via package.json script)
 *   node scripts/snapshot_ai_memory.mjs
 *
 * Output: AI_SNAPSHOT.md at project root
 *
 * Run this before ending any session where meaningful changes were made.
 * Commit AI_SNAPSHOT.md to git so it is always current.
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { execSync } from "child_process";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NOW = new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function read(filePath, maxLines = null) {
  try {
    const content = readFileSync(filePath, "utf-8");
    if (!maxLines) return content;
    return content.split("\n").slice(0, maxLines).join("\n");
  } catch {
    return `[Could not read ${filePath}]`;
  }
}

function gitLog(n = 8) {
  try {
    return execSync(`git log -${n} --oneline --no-decorate`, { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch {
    return "[git not available]";
  }
}

function gitStatus() {
  try {
    const out = execSync("git status --short", { cwd: ROOT, encoding: "utf-8" }).trim();
    return out || "[Working tree clean]";
  } catch {
    return "[git not available]";
  }
}

function lastLogEntry(logPath) {
  try {
    const content = readFileSync(logPath, "utf-8");
    const match = content.match(/(## \[\d{4}-\d{2}-\d{2}\][\s\S]*?)(?=## \[|\s*$)/);
    return match ? match[1].trim() : content.substring(0, 2000);
  } catch {
    return "[Could not read LOG.md]";
  }
}

function prismaModels(schemaPath) {
  try {
    const content = readFileSync(schemaPath, "utf-8");
    const models = [...content.matchAll(/^model (\w+)/gm)].map(m => m[1]);
    return models.length ? models.join(", ") : "[No models found]";
  } catch {
    return "[Could not read schema.prisma]";
  }
}

function scanRoutes(appPath) {
  const routes = [];
  function walk(dir) {
    try {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
          let route = "/" + relative(appPath, dir).replace(/\\/g, "/");
          if (route === "/.") route = "/";
          routes.push(route);
        }
      }
    } catch {}
  }
  walk(appPath);
  return routes.sort();
}

function keyFilesSummary() {
  const important = [
    "src/app/admin/AdminClient.tsx",
    "src/app/admin/actions.ts",
    "src/app/admin/page.tsx",
    "src/lib/CurrencyContext.tsx",
    "src/lib/currency.ts",
    "src/lib/permissions.ts",
    "src/components/Navbar.tsx",
    "src/components/Providers.tsx",
    "src/app/layout.tsx",
    "src/app/dashboard/teacher/TeacherClient.tsx",
    "src/app/dashboard/teacher/AnalyticsTab.tsx",
    "prisma/schema.prisma",
    "scripts/snapshot_ai_memory.mjs",
  ];
  return important.map(f => {
    const full = join(ROOT, f);
    if (existsSync(full)) {
      const lines = readFileSync(full, "utf-8").split("\n").length;
      return `  ${f} (${lines} lines)`;
    }
    return `  ${f} [NOT FOUND]`;
  }).join("\n");
}

// ─────────────────────────────────────────────────────────────
// BUILD SNAPSHOT
// ─────────────────────────────────────────────────────────────

function buildSnapshot() {
  const aiContext   = read(join(ROOT, "AI_CONTEXT.md"));
  const lastLog     = lastLogEntry(join(ROOT, "LOG.md"));
  const models      = prismaModels(join(ROOT, "prisma", "schema.prisma"));
  const routes      = scanRoutes(join(ROOT, "src", "app"));
  const gitCommits  = gitLog(8);
  const changed     = gitStatus();
  const keyFiles    = keyFilesSummary();

  return `# GraceAndGrind AI Memory Snapshot
> Auto-generated: ${NOW}
> **Read this at the START of every new conversation to restore full context.**

---

## Quick Start for AI

1. This is a **Next.js 16 + Supabase + Prisma + Tailwind** education platform for the Habesha diaspora.
2. Authentication is handled by **Supabase Auth** (NOT NextAuth — legacy references to NextAuth in old docs are stale).
3. Role hierarchy: \`OWNER (5) > ROOT (4) > SUPER_ADMIN (3) > ADMIN (2) > TEACHER (1) > CUSTOMER (0)\`.
4. All prices stored in **USD**. Use \`formatPrice(usdAmount)\` from \`useCurrency()\` hook for display.
5. Never use \`import { CurrencyCode }\` — always \`import type { CurrencyCode }\` (Turbopack strict mode).
6. Admin mutations go in \`src/app/admin/actions.ts\`. Always gate with role/password checks.
7. Run \`npm run build\` after significant changes to catch TypeScript errors before commit.
8. Run \`npm run snapshot\` before ending any session to preserve AI memory.

---

## Full AI Context (AI_CONTEXT.md)

${aiContext}

---

## Latest Session Log (Most Recent LOG.md Entry)

${lastLog}

---

## Database Models (prisma/schema.prisma)

${models}

---

## Route Map (src/app)

${routes.map(r => `  ${r}`).join("\n")}

---

## Key Files with Line Counts

${keyFiles}

---

## Recent Git History (last 8 commits)

${gitCommits}

---

## Uncommitted Changes

${changed}

---

## Pending Work / Next Steps

Suggested next areas (in priority order):
- Real-time notifications (Supabase Realtime channels on ContentRequest / Notification tables)
- Admin email digest when approval queue builds up (Resend)
- i18n expansion: Amharic / Tigrinya via the existing I18nContext
- Audit log CSV export (download button for OWNER/ROOT)
- Teacher revenue share dashboard (platform % vs teacher %)
- Bonus UI Polish: micro-animations, parallax scrolling, subtle sound effects
`;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

const snapshot = buildSnapshot();
const outPath = join(ROOT, "AI_SNAPSHOT.md");
writeFileSync(outPath, snapshot, "utf-8");
const sizeKb = (statSync(outPath).size / 1024).toFixed(1);

console.log(`[OK] AI_SNAPSHOT.md written (${sizeKb} KB) -- ${NOW}`);
console.log(`     Path: ${outPath}`);
console.log("");
console.log("[TIP] Commit AI_SNAPSHOT.md to git so it is always current.");
console.log('      Start new conversations with: "Read AI_SNAPSHOT.md for full context."');
