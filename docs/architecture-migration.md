# Architecture Migration Plan

## Scope

This document tracks the incremental migration from the current `@anilog/api`-centric structure to the target architecture:

- `packages/contracts` for transport contracts
- `packages/domain` for business logic and domain errors
- `packages/db` for schema and repositories
- `apps/server` as a thin HTTP transport layer
- `apps/web` as a UI-only consumer of contracts

## Baseline Inventory

### Current package ownership

- `packages/api`
  - currently owns services, route-facing schemas, and shared error helpers
- `packages/db`
  - owns Drizzle schema and DB access
- `apps/server`
  - imports services and schemas directly from `@anilog/api`
- `apps/web`
  - imports transport types from `@anilog/api`
  - still imports DB types from `@anilog/db` in several feature files

### Current import hotspots

- Server routes and app bootstrap depend on `@anilog/api`
  - `apps/server/src/index.ts`
  - `apps/server/src/routes/*.route.ts`
- Web depends on `@anilog/api`
  - `apps/web/src/features/*/lib/options.ts`
  - `apps/web/src/features/*/lib/hooks.ts`
- Web currently leaks DB types
  - `apps/web/src/features/library/lib/hooks.ts`
  - `apps/web/src/features/users/components/user-lists-public.tsx`
  - `apps/web/src/features/anime/components/search-results.tsx`
  - `apps/web/src/features/library/components/editable-lists.tsx`
  - `apps/web/src/features/anime/components/add-to-list-dialog.tsx`
  - `apps/web/src/features/anime/components/home-discovery.tsx`
  - `apps/web/src/features/anime/components/anime-card.tsx`
- Frontend helper abstraction layer to unwind later
  - `apps/web/src/lib/query-helpers.ts`
  - `apps/web/src/lib/toast-messages.ts`
  - `apps/web/src/lib/query-provider.tsx`

### Baseline verification

- `bun run check-types`
  - passing before migration work
- `bun run build`
  - baseline started before migration work; re-run after each completed phase

## Locked Rules

### Package boundaries

- `apps/web` must not import from `@anilog/db`
- `packages/domain` must not depend on Elysia schema builders
- `packages/db` must not own API DTOs
- `apps/server` must not own business rules

### Error contract

- Every server error response must use:

```ts
type ErrorResponse = {
  error: {
    code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "VALIDATION"
      | "EXTERNAL"
      | "INTERNAL";
    message: string;
    details?: Record<string, unknown>;
  };
};
```

- Domain/application code throws typed errors
- Web parses one shared error shape
- No bare `{ error: string }` responses

## Execution Order

1. Phase 0: baseline inventory and migration doc
2. Phase 1: structured shared error contract and boundary wiring
3. Phase 2: create `packages/contracts`
4. Phase 3: create `packages/domain`
5. Phase 4: add shared server plugins
6. Phase 5: remove web imports from `@anilog/db`
7. Phase 6: simplify frontend query/mutation layer
8. Phase 7: migrate `library` as the canonical feature
9. Phase 8: migrate `users`, `anime`, `admin`
10. Phase 9: move SQL ownership into repositories
11. Phase 10: performance cleanup
12. Phase 11: delete legacy compatibility layer

## Phase 0 Completion Criteria

- Baseline dependency hotspots identified
- Baseline verification recorded
- Migration plan documented in repo

## Phase 1 Completion Criteria

- Shared structured error shape exists
- Server returns structured error payloads
- Web unwraps structured error payloads
- Existing features keep working without package split
