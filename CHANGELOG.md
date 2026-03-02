# CHANGELOG

All notable changes to this project are documented in this file.

## 2026-03-01 — Cleanup & Dependency Updates

Summary
- Split cleanup into two logical groups so reviewers can inspect changes easily.

1) Dependency pin / updates
- Pinned `eslint` to `^9` to restore compatibility with `eslint-config-next` and related plugins.
- Ran dependency upgrades (minor/patch and selected updates) and regenerated `package-lock.json`.
- Commits: `b9da882` (chore: cleanup) — see https://github.com/NestingNow/keystone-pms/commit/b9da882

2) Linting, TypeScript fixes and code cleanup
- Fixed TypeScript errors in NextAuth callbacks, replaced a broken `next-themes` type import, tightened types in several files, removed unused code (`lib/onedrive.ts`), and applied ESLint autofixes.
- Added temporary debug logs to aid local debugging (can be removed after verification).
- Commits: `310d9ca` (chore: lint fixes) — https://github.com/NestingNow/keystone-pms/commit/310d9ca
- Commits: `1eb66e8` (chore: add debug logs for supabase fetch) — https://github.com/NestingNow/keystone-pms/commit/1eb66e8

Notes
- The dev-only Supabase env banner was briefly added for debugging and has been removed.
- The app builds and the Next dev server runs locally; run `npm run build` and `npm run dev` to verify.

If you'd like separate PRs drafted that reference these commits, I can open them as draft PRs or create branch-scoped diffs. For now this `CHANGELOG.md` documents the work and references the exact commit SHAs.
