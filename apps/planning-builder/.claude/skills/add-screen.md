---
name: add-screen
description: Use when the user wants to add a new expo-router screen, route, or page. Creates the route file under src/app/ following project conventions (typed routes, NativeWind, Screen wrapper, i18n).
---

# Add Screen

Add a new expo-router screen following project conventions.

## Steps

1. Confirm the route path with the user. Routes live under `src/app/`.
   - Tab screens: `src/app/(tabs)/<name>.tsx`
   - Auth screens: `src/app/(auth)/<name>.tsx`
   - Modal screens: register in nearest `_layout.tsx` with `presentation: 'modal'`
2. Create the screen file using this skeleton:

```tsx
import { Screen } from '@/components/layout/Screen';
import { Text, View } from 'react-native';
import { t } from '@/lib/i18n';

export default function NameScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-foreground">{t('name.title')}</Text>
      </View>
    </Screen>
  );
}
```

3. Add any new strings to `src/locales/{ko,en}.json` under a namespace.
4. If the screen lives in a new layout group, add a `_layout.tsx` with the appropriate `Stack` / `Tabs`.
5. Update navigation entry points (use typed `Link href` or `router.push`).
6. Run `pnpm typecheck` to verify typed routes resolve.

## Don'ts
- No raw string deep links — use typed routes.
- No hardcoded user-facing strings — always go through `t()`.
- No `StyleSheet` for things that fit NativeWind utilities.
