#!/usr/bin/env python3
"""
GraceAndGrind AI Memory Snapshot Tool
======================================
Generates a single compact `AI_SNAPSHOT.md` file that an AI assistant can
read at the START of a new conversation to instantly recover full project context.

Usage:
    python scripts/snapshot_ai_memory.py

Output:
    AI_SNAPSHOT.md  (at project root — committed to git, always up-to-date)

Run this before ending any session where meaningful changes were made.
"""

import os
import re
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent.parent
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def read(path: Path, max_lines: int = None) -> str:
    """Read a file, optionally truncating to max_lines."""
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        if max_lines:
            lines = lines[:max_lines]
        return "\n".join(lines)
    except Exception:
        return f"[Could not read {path.name}]"


def git_log(n: int = 10) -> str:
    """Last N git commits as a formatted string."""
    try:
        result = subprocess.run(
            ["git", "log", f"-{n}", "--oneline", "--no-decorate"],
            cwd=ROOT, capture_output=True, text=True
        )
        return result.stdout.strip() or "[No commits yet]"
    except Exception:
        return "[git not available]"


def git_changed_files() -> str:
    """Files changed since last commit."""
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            cwd=ROOT, capture_output=True, text=True
        )
        return result.stdout.strip() or "[Working tree clean]"
    except Exception:
        return "[git not available]"


def last_log_entry(log_path: Path) -> str:
    """Extract the most recent entry from LOG.md."""
    try:
        content = log_path.read_text(encoding="utf-8")
        # Find first ## [...] section
        match = re.search(r"(## \[[\d-]+\].*?)(?=## \[|\Z)", content, re.DOTALL)
        if match:
            return match.group(1).strip()
        return content[:2000]
    except Exception:
        return "[Could not read LOG.md]"


def prisma_models(schema_path: Path) -> str:
    """Extract model names from schema.prisma."""
    try:
        content = schema_path.read_text(encoding="utf-8")
        models = re.findall(r"^model (\w+)", content, re.MULTILINE)
        return ", ".join(models) if models else "[No models found]"
    except Exception:
        return "[Could not read schema.prisma]"


def scan_routes(app_path: Path) -> list[str]:
    """List all page.tsx routes."""
    routes = []
    for p in sorted(app_path.rglob("page.tsx")):
        rel = p.parent.relative_to(app_path)
        route = "/" + str(rel).replace("\\", "/")
        if route == "/.":
            route = "/"
        routes.append(route)
    return routes


def key_files_summary() -> str:
    """Summarise the most important source files with line counts."""
    important = [
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
    ]
    lines = []
    for f in important:
        path = ROOT / f
        if path.exists():
            lc = len(path.read_text(encoding="utf-8", errors="ignore").splitlines())
            lines.append(f"  {f} ({lc} lines)")
        else:
            lines.append(f"  {f} [NOT FOUND]")
    return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# MAIN SNAPSHOT BUILDER
# ──────────────────────────────────────────────────────────────────────────────

def build_snapshot() -> str:
    ai_context = read(ROOT / "AI_CONTEXT.md")
    last_log   = last_log_entry(ROOT / "LOG.md")
    models     = prisma_models(ROOT / "prisma" / "schema.prisma")
    routes     = scan_routes(ROOT / "src" / "app")
    git_commits = git_log(8)
    changed    = git_changed_files()
    key_files  = key_files_summary()

    snapshot = f"""# 🧠 GraceAndGrind AI Memory Snapshot
> Auto-generated: {NOW}
> **Read this at the START of every new conversation to restore full context.**

---

## ⚡ Quick Start for AI

1. This is a **Next.js 16 + Supabase + Prisma + Tailwind** education platform for the Habesha diaspora.
2. Authentication is handled by **Supabase Auth** (NOT NextAuth — legacy references to NextAuth in old docs are stale).
3. Role hierarchy: `OWNER (5) > ROOT (4) > SUPER_ADMIN (3) > ADMIN (2) > TEACHER (1) > CUSTOMER (0)`.
4. All prices are stored in **USD**. Use `formatPrice(usdAmount)` from `useCurrency()` hook for display.
5. Never use `import {{ CurrencyCode }}` — always `import type {{ CurrencyCode }}` (Turbopack strict mode).
6. Admin mutations go in `src/app/admin/actions.ts`. Always gate with role/password checks.
7. Run `npm run build` after significant changes to catch TypeScript errors before commit.

---

## 📋 Full AI Context (AI_CONTEXT.md)

{ai_context}

---

## 📅 Latest Session Log (Most Recent LOG.md Entry)

{last_log}

---

## 🗄️ Database Models (prisma/schema.prisma)

{models}

---

## 🗺️ Route Map (src/app)

{chr(10).join(f"  {r}" for r in routes)}

---

## 📁 Key Files

{key_files}

---

## 🔀 Recent Git History

{git_commits}

---

## 📝 Uncommitted Changes

{changed}

---

## 🚀 Pending Work / Next Steps

See `DOCUMENTATION.md` and `LOG.md` for full history.
Suggested next areas:
- 🔔 Real-time notifications (Supabase Realtime channels on `ContentRequest` table)
- 📧 Admin email digest when approval queue builds up
- 🌍 i18n expansion: Amharic / Tigrinya via the existing `I18nContext`
- 🔑 Audit log export (CSV download for OWNER/ROOT)
- 📊 Teacher revenue share dashboard (split % between platform and teacher)
"""
    return snapshot


if __name__ == "__main__":
    # Set stdout to UTF-8 to avoid Windows cp1252 encoding errors
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    snapshot = build_snapshot()
    out_path = ROOT / "AI_SNAPSHOT.md"
    out_path.write_text(snapshot, encoding="utf-8")
    size_kb = out_path.stat().st_size / 1024
    print(f"[OK] AI_SNAPSHOT.md written ({size_kb:.1f} KB) -- {NOW}")
    print(f"     Path: {out_path}")
    print()
    print("[TIP] Run this script before ending any coding session.")
    print("      Commit AI_SNAPSHOT.md to git so it is always current.")
    print("      At the start of a new conversation, say:")
    print('      "Read AI_SNAPSHOT.md for full project context before we begin."')
