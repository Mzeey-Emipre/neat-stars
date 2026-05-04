# Neat Stars

A browser extension that shows the percentage of clean (non-suspicious) GitHub stars on any GitHub repository page.

## Directory Map

```
neat-stars/
├── src/
│   ├── extension/                 # Browser extension (WXT + Vue 3)
│   │   ├── entrypoints/          # WXT entrypoints (background, content, popup)
│   │   ├── components/           # Shared Vue components (auto-imported)
│   │   ├── composables/          # Vue composables (auto-imported)
│   │   ├── utils/                # Utility functions (auto-imported)
│   │   ├── public/               # Static assets (icons)
│   │   ├── assets/               # Processed assets (CSS)
│   │   └── wxt.config.ts         # WXT configuration
│   └── api/                      # Backend API (Cloudflare Workers + D1)
│       ├── src/
│       │   ├── index.ts          # Hono app entry
│       │   ├── routes/           # API route handlers
│       │   ├── services/         # Business logic
│       │   └── db/               # Schema and seed scripts
│       ├── test/                 # API tests (Vitest)
│       └── wrangler.toml        # Cloudflare config
├── docs/                         # Design specs and plans (temporary scaffolding)
├── .github/workflows/            # CI/CD (Blacksmith runners)
├── AGENTS.md                     # This file
└── CLAUDE.md                     # Points to this file
```

## Tech Stack

| Layer | Technology |
|---|---|
| Extension | WXT + Vue 3 (Composition API) + TypeScript |
| API | Cloudflare Workers + Hono + D1 (SQLite) |
| Package manager | Bun (workspaces) |
| CI | GitHub Actions on Blacksmith runners |
| Releases | Release Please + mze-bot |
| Code review | CodeRabbit AI |

## Commands

```bash
# Development
bun run dev:ext              # Start extension in dev mode (Chrome)
bun run dev:api              # Start Worker locally (port 8787)

# Building
bun run build:ext            # Build extension for Chrome
bun run build:api            # Build Worker

# Testing
bun run test                 # Run API tests
bun run typecheck            # Type-check both packages

# Extension browser-specific builds
bun run --cwd src/extension build           # Chrome (default)
bun run --cwd src/extension build:firefox   # Firefox
bun run --cwd src/extension build:edge      # Edge

# Database
bun run --cwd src/api db:migrate:local     # Apply schema locally
bun run --cwd src/api db:migrate:remote    # Apply schema to production D1
```

## Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Language**: TypeScript strict mode everywhere
- **Extension UI**: Vue 3 Composition API with `<script setup>`
- **API routing**: Hono framework with route modules
- **Styles**: Follow GitHub's dark theme colors for badge/popup
- **Comments**: Explain why, not what
- **Testing**: Vitest for API, manual testing for extension content scripts

## Architecture

The extension injects a color-coded "% clean" badge inside the GitHub star button. It calls our Cloudflare Worker API which returns a score. The API is seeded with StarScout research data (CMU/NCSU fake-star detection) and caches results in D1.

Scoring flow: Extension -> Worker -> D1 cache check -> StarScout data lookup -> return score

## Key References

- Design spec: `docs/superpowers/specs/2026-05-04-neat-stars-design.md`
- WXT docs: https://wxt.dev
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- StarScout: https://github.com/hehao98/StarScout

## Current Status

Version: 0.1.0 (in development)
Roadmap: See design spec for version milestones 0.1.0 through 1.0.0
