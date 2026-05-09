# Release Checklist

## Pre-flight (local)
- [ ] `pnpm typecheck` — no errors
- [ ] `pnpm lint` — clean
- [ ] `pnpm test:ci` — green, coverage acceptable
- [ ] `pnpm e2e:ios` (or android) — `launch.yaml` and `auth.yaml` pass
- [ ] `git status` clean, on `main` (or release branch)
- [ ] CHANGELOG entry drafted

## Version
- [ ] Bump `version` in `app.config.ts`
- [ ] Bump `version` in `package.json` (must match)
- [ ] `runtimeVersion.policy` is `appVersion` (no breaking native changes since last build)

## Secrets / Config
- [ ] EAS secrets set: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`
- [ ] Sentry: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- [ ] iOS: `appleId`, `ascAppId`, `appleTeamId` in `eas.json`
- [ ] Android: `secrets/play-service-account.json` available to EAS

## Build
- [ ] `pnpm build:preview` — internal QA
- [ ] QA sign-off on preview build
- [ ] `pnpm build:prod`

## Submit
- [ ] iOS: `pnpm submit:ios` → TestFlight processing
- [ ] Android: `pnpm submit:android` → internal track
- [ ] Promote to public after smoke test

## Post-release
- [ ] Tag commit: `git tag vX.Y.Z && git push --tags` (triggers release workflow)
- [ ] Verify Sentry release shows up with sourcemaps
- [ ] Monitor crash-free rate for 24h
- [ ] Announce in team channel

## Rollback plan
- EAS Update channels: revert by publishing previous JS bundle to channel.
- Native rollback: re-submit previous build to stores (not instant — prefer JS rollback when possible).
