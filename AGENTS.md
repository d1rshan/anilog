# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bun + Turborepo monorepo.

- `apps/web`: Next.js frontend (`src/app`, `src/features`, `src/components`)
- `apps/server`: Elysia API server (`src/routes`, `src/index.ts`)
- `packages/api`: shared business logic/services
- `packages/auth`: auth setup and shared auth utilities
- `packages/db`: Drizzle schema/config (`src/schema`, `drizzle.config.ts`)
- `packages/config`: shared TypeScript configuration

Keep feature code close to its domain (`apps/web/src/features/<domain>`), and keep shared cross-app logic in `packages/*`.

## Build, Test, and Development Commands

Run from the repository root:

- `bun install`: install workspace dependencies
- `bun run dev`: start all apps with Turbo
- `bun run dev:web`: run only the Next.js app (port `3001`)
- `bun run dev:server`: run only the API server (port `3000`)
- `bun run build`: build all workspaces
- `bun run check-types`: run TypeScript checks across workspaces
- `bun run db:push` / `bun run db:migrate` / `bun run db:studio`: manage Drizzle database schema

## Coding Style & Naming Conventions

- Language: TypeScript (strict mode enabled via `packages/config/tsconfig.base.json`).
- Indentation: 2 spaces; use semantically clear names over abbreviations.
- File naming:
  - React components: `kebab-case.tsx` (for example, `follow-button.tsx`)
  - Utility modules/services: `*.ts` with descriptive domain names.
- Prefer small, composable modules and explicit exports.
- Run `bun run check-types` before opening a PR.

## Testing Guidelines

There is currently no standardized unit/integration test runner configured. The required quality gate is:

1. `bun run check-types`
2. `bun run build`
3. Manual verification of changed flows in `apps/web` and/or `apps/server`

When adding tests, place them near the feature (for example, `src/features/users/__tests__`) and wire them into Turbo scripts.

## Commit & Pull Request Guidelines

Follow the commit style visible in history:

- `feat(web): ...`
- `fix(web): ...`
- `ui(web): ...`
- `refactor(web): ...`
- `ci: ...`

Use imperative, scoped subjects. Keep PRs focused and include:

1. Clear summary of behavior changes
2. Linked issue (if applicable)
3. Screenshots/GIFs for UI changes
4. Notes on env or DB changes (`apps/server/.env`, migrations)

CI runs `check-types` and `build` on push to `main` and on pull requests; ensure both pass locally first.
