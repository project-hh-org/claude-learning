---
name: release-checklist
description: Use when the user asks to ship, release, or cut a build. Walks through the pre-release verification, version bump, EAS build, and submission steps.
---

# Release Checklist

Walk the user through the release process. Confirm each step before proceeding.

## 1. Pre-flight
- `pnpm typecheck && pnpm lint && pnpm test` must all pass.
- `pnpm e2e:ios` (or android) on critical flow (`e2e/maestro/launch.yaml`, `auth.yaml`).
- `git status` clean. On `main` (or release branch).

## 2. Version bump
- Update `version` in `app.config.ts`.
- Update `version` in `package.json` to match.
- Verify `runtimeVersion` policy in `app.config.ts` is `appVersion`.

## 3. Sentry sourcemaps
- Confirm `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` are set in EAS secrets.
- The `@sentry/react-native/expo` plugin uploads sourcemaps automatically during EAS Build.

## 4. Build
- Preview: `pnpm build:preview` → distribute via internal channel.
- Production: `pnpm build:prod` (auto-increments build number).

## 5. Submit
- iOS: `pnpm submit:ios` (requires `appleId`, `ascAppId`, `appleTeamId` in `eas.json`).
- Android: `pnpm submit:android` (requires `play-service-account.json` in `secrets/`).

## 6. Post-release
- Tag the commit: `git tag vX.Y.Z && git push --tags`.
- Verify Sentry release shows up in dashboard.
- Monitor crash-free rate for 24h.

See `docs/release-checklist.md` for the canonical written checklist.
