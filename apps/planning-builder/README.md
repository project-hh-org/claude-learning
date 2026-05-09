# AI Planning Builder

App+web tool that helps users build a complete 0→100 project plan with Claude.
Each planning step runs an independent Claude API session; the accumulated
selection log feeds the next session's context. As selections accrue, four live
documents (Markdown storyboard / project JSON / Figma JSON / AI prompt) update
in real time, and once planning is solid enough, a wireframe editor takes over.

Forked from `project-hh-org/react-native-template` and trimmed to remove auth,
Supabase, and Sentry.

## Quickstart

```bash
pnpm install
cp .env.example .env       # set CLAUDE_API_KEY
pnpm start
```

Then press `i` (iOS), `a` (Android), or `w` (web).

## Stack

| Concern | Choice |
|---|---|
| Runtime | Expo SDK 52 (New Arch on), RN 0.76, React 18.3 |
| Routing | expo-router v4, typed routes |
| Language | TypeScript strict + `noUncheckedIndexedAccess` |
| Styling | NativeWind v4 |
| State | Zustand (MMKV native / localStorage web) + TanStack Query |
| Forms | react-hook-form + zod |
| Lists / Images | `@shopify/flash-list`, `expo-image` |
| Linting | Biome |
| Tests | Jest + RNTL, Maestro E2E |
| AI | Claude `claude-sonnet-4-20250514` via server-side Expo Router API route |
| i18n | expo-localization + i18n-js (`ko`, `en`) |

## Status

Bootstrap PR — implements steps 1–9 of [`SPEC.md`](./SPEC.md):

- [x] Auth/Supabase/Sentry stripped
- [x] Type definitions
- [x] Storage with web fallback (MMKV → localStorage)
- [x] Zustand planner store with persisted slice
- [x] Step prompt + `/api/step` Claude route
- [x] Start screen (goal input + template + platforms)
- [x] PlanningHeader, SuggestionCard, SkeletonCard, CustomInputCard
- [x] Planning flow screen (auto-fetch first step, toggle, custom input, advance)
- [ ] Wireframe editor & wire-components (steps 10-13, 16-21)
- [ ] DocumentPanel & generators (steps 14-15)
- [ ] Wireframe API route (step 16)
- [ ] Undo system (step 23)

See [`SPEC.md`](./SPEC.md) for the full plan.

## Commands

| Task | Command |
|---|---|
| Start dev | `pnpm start` |
| iOS / Android | `pnpm ios` / `pnpm android` |
| Web | `pnpm web` |
| Typecheck | `pnpm typecheck` |
| Lint / format | `pnpm lint` / `pnpm lint:fix` |
| Unit tests | `pnpm test` |
