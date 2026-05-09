---
name: add-component
description: Use when the user asks to add a reusable UI primitive or layout component. Places it in src/components/ui or src/components/layout, uses NativeWind, and follows the Button/Input/Screen pattern.
---

# Add Component

Add a reusable component under `src/components/`.

## Decide where it goes
- **`src/components/ui/`** — primitives reused everywhere (Button, Input, Card, Badge).
- **`src/components/layout/`** — composition primitives (Screen, Section, Container).
- **Domain-specific** → `src/features/<name>/components/`, NOT here.

## Skeleton

```tsx
import { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

export type CardProps = ViewProps & { className?: string };

export const Card = forwardRef<View, CardProps>(({ className, ...rest }, ref) => {
  return <View ref={ref} className={cn('rounded-lg border border-border bg-card p-4', className)} {...rest} />;
});

Card.displayName = 'Card';
```

## Conventions
- Functional + `forwardRef` if it wraps a native primitive.
- `className` prop merged with `cn(...)` — NEVER override base styles silently.
- Variants → discriminated `variant` prop, mapped via a record (see `Button.tsx`).
- Images → re-export from `expo-image` only.
- Add a unit test in `__tests__/` for any non-trivial logic (variants, disabled, error state).

## Don'ts
- No inline `StyleSheet.create` unless platform-conditional.
- No `react-native` `Image`. Use `expo-image`.
- No `Pressable`-with-text — wrap `Button`.
