# React Native Template — Project Conventions

## Stack

- **Runtime:** Expo SDK 52+ (New Architecture enabled), React Native 0.76, React 18.3
- **Routing:** expo-router v4 (typed routes, tsconfig paths)
- **Language:** TypeScript strict + `noUncheckedIndexedAccess`
- **Styling:** NativeWind v4 + react-native-reusables (Tailwind tokens via `global.css`)
- **State:** Zustand (persist via MMKV) + TanStack Query
- **Forms:** react-hook-form + zod schemas in `features/<name>/schemas.ts`
- **Animation/Gestures:** reanimated 3 + gesture-handler
- **Lists:** `@shopify/flash-list` (no `FlatList` for >10 items)
- **Images:** `expo-image` ONLY (no `react-native` `Image`)
- **Linting:** Biome (no ESLint/Prettier)
- **Tests:** Jest + RNTL (unit), Maestro (E2E)
- **Errors:** Sentry (`@sentry/react-native` with expo plugin)
- **Auth:** Supabase
- **i18n:** expo-localization + i18n-js (`ko`, `en`)
- **Push:** expo-notifications

## Folder Structure

```
src/
  app/              ← expo-router file-based routes
  components/
    ui/             ← reusable primitives (Button, Input, ...)
    layout/         ← Screen, Section, ...
  features/<name>/  ← domain modules: api.ts, hooks.ts, schemas.ts, store.ts, components/
  lib/              ← shared infrastructure: env, supabase, storage, queryClient, ...
  hooks/            ← cross-cutting hooks
  stores/           ← global Zustand stores
  styles/           ← design tokens (spacing, radius, typography)
  locales/          ← i18n JSON dictionaries
assets/             ← icons, splash, PrivacyInfo.xcprivacy
e2e/maestro/        ← Maestro E2E flows
docs/               ← release checklists, runbooks
.claude/            ← skills, rules, settings for Claude Code
```

## Conventions

### Imports
- ALWAYS use the `@/*` alias for `src/*`. Never `../../../`.
- Group: external → `@/lib` → `@/features` → `@/components` → relative.

### Components
- Functional components, no classes.
- Use NativeWind (`className=`). No inline `StyleSheet` unless platform-specific or perf-critical.
- Keep `View` / `Text` from `react-native`. For images, ALWAYS `expo-image`.
- Form inputs go through `Controller` + `react-hook-form`. Validate with zod.
- Buttons use `@/components/ui/Button`. Don't roll your own `Pressable`-with-text.

### State
- Server state → TanStack Query. Local UI state → `useState`. Cross-screen state → Zustand.
- Persist Zustand only when value must survive app restarts (MMKV via `mmkvJsonStorage`).

### Routing
- One screen file per route in `src/app/`. Use route groups `(name)` for layout grouping.
- Never deep-link via raw strings; use typed `Link` / `router.push`.

### Env
- Read env via `@/lib/env`. Never `process.env.X` directly in components.
- Public values must be prefixed `EXPO_PUBLIC_`.

### Performance
- Long lists: `FlashList` with stable `keyExtractor` and `estimatedItemSize`.
- Heavy work off the JS thread: use `useAnimatedStyle` / `runOnJS`.

### i18n
- Never hardcode user-facing strings. Add to `src/locales/{ko,en}.json` and use `t('namespace.key')`.

### Errors
- API client throws — let TanStack Query surface errors.
- Use `Sentry.captureException` only for unexpected paths; don't double-report.

## Commands

| Task | Command |
|---|---|
| Start dev | `pnpm start` |
| iOS / Android | `pnpm ios` / `pnpm android` |
| Typecheck | `pnpm typecheck` |
| Lint / format | `pnpm lint` / `pnpm lint:fix` |
| Unit tests | `pnpm test` |
| E2E (Maestro) | `pnpm e2e:ios` / `pnpm e2e:android` |
| EAS build | `pnpm build:dev` / `pnpm build:preview` / `pnpm build:prod` |
| EAS submit | `pnpm submit:ios` / `pnpm submit:android` |

## Before Shipping
- `pnpm typecheck && pnpm lint && pnpm test`
- Update `app.config.ts` version bump
- Run through `docs/release-checklist.md`
