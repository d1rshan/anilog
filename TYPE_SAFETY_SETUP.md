# Type Safety Setup (Current Architecture)

## Overview

This repo now uses a schema-first, inference-first type flow:

1. API request/response contracts are defined in `apps/server/src/schemas/*` using Elysia TypeBox.
2. Route handlers in `apps/server/src/routes/*` reference those schemas for `params`, `query`, `body`, and `response`.
3. `packages/api` contains DB/business services only (no exported API contract layer).
4. Frontend requests use Eden (`@elysiajs/eden`) so request/response types are inferred from the server app type.

The goal is full-stack type safety without duplicated shared contract files.

## What Was Removed

- Removed `apps/server/src/routes/schemas.ts`.
- Removed `packages/api/src/contracts/*`.
- Removed `@anilog/api` type imports from frontend request/component layers.

## Current Schema Source of Truth

Server schema modules:

- `apps/server/src/schemas/common.ts`
- `apps/server/src/schemas/anime.ts`
- `apps/server/src/schemas/library.ts`
- `apps/server/src/schemas/users.ts`
- `apps/server/src/schemas/admin.ts`
- `apps/server/src/schemas/index.ts`

These are the canonical API-level shapes.

## Where Explicit Types Still Exist (and Why)

We intentionally kept a small set of local explicit types where inference alone is not ideal.

### 1) `packages/api/src/services/anime.service.ts`

Local types:

- `HeroCurationUpdateInput`
- `UpsertAnimeInput`
- `AniListMedia`
- `AniListPageResponse`
- cache value helper types

Why:

- These are internal service concerns, not shared cross-layer contracts.
- They protect integration boundaries (AniList payload parsing, cache shapes, mutation inputs).
- They improve correctness without reintroducing redundant contract exports.

### 2) `packages/api/src/services/library.service.ts`

Local types:

- `LogAnimeInput`
- `ValidationInput`

Why:

- `logAnime` and rule validation need a stable internal input shape.
- Keeping this local avoids contract duplication while preserving strict validation semantics.

### 3) `packages/api/src/services/user.service.ts`

Local type usage:

- Inline typed shape for `updateUserProfile` input.

Why:

- Makes profile update input explicit at the service boundary.
- Stays local to the service and does not leak as shared API contract surface.

### 4) Frontend request modules (Eden-inferred aliases)

Files:

- `apps/web/src/features/anime/lib/requests.ts`
- `apps/web/src/features/users/lib/requests.ts`
- `apps/web/src/features/lists/lib/requests.ts`
- `apps/web/src/features/admin/lib/requests.ts`

Type style:

- `Parameters<typeof api...>`
- `Awaited<ReturnType<typeof ...>>`

Why:

- These aliases are inferred from Eden route types, not manually duplicated contracts.
- They keep hooks/components/cache updates readable where raw inferred generic types are noisy.

## Guideline Going Forward

1. API-level shapes belong in `apps/server/src/schemas/*`.
2. Do not recreate shared contract files in `packages/*`.
3. Service-local explicit types are fine when they model internal invariants.
4. Frontend should prefer Eden inference; allow small local inferred aliases for readability.
5. If a type is duplicated across layers, move to server schema or infer from existing function signatures.
