# Component Conventions

These rules are enforced for every component in this codebase.

## Always
- Functional components only. No class components.
- Style with NativeWind `className=`. Tokens come from `tailwind.config.js` / `global.css`.
- Compose `cn()` from `@/lib/cn` when merging classes — never string-concat.
- Use `View` / `Text` from `react-native`, NOT `react-native-web` or third-party.
- Re-export refs via `forwardRef` if a component wraps a native primitive that consumers may need to ref.
- Add explicit prop types. Extend the underlying RN prop type (`PressableProps`, `TextInputProps`, …).

## Never
- No inline `StyleSheet.create({...})` unless platform-conditional or perf-critical (document the reason).
- No raw `Pressable` with `<Text>` inside for buttons. Use `@/components/ui/Button`.
- No magic colors. Use Tailwind tokens (`bg-primary`, `text-foreground`, …).
- No prop drilling for theme — read via `useColorScheme` from `@/hooks/useColorScheme`.
- No `any`. If unavoidable, comment why.

## Forms
- Inputs are `Controller`-driven (`react-hook-form`). Validate with zod (`features/<name>/schemas.ts`).
- Surface `fieldState.error?.message` to `Input`'s `error` prop.
