# expo-image is required

This project uses `expo-image` for ALL image rendering.

## Why
- Better caching, native blurhash, fade transitions, and content-fit modes.
- Consistent behavior across iOS / Android / web.
- React Native's `Image` does not support our caching and placeholder strategy.

## Rule
- NEVER import `Image` from `react-native`.
- ALWAYS import from `expo-image` directly, or use the wrapper at `@/components/ui/Image`.

```tsx
// ✅
import { Image } from 'expo-image';
// ✅
import { Image } from '@/components/ui/Image';

// ❌
import { Image } from 'react-native';
```

## When generating code
If you find yourself reaching for `react-native` `Image`, stop and switch.
If a third-party component uses `Image` from `react-native` internally, that's
fine — just don't author new code that does.
