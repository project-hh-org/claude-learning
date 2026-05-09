import { usePreferencesStore } from '@/stores/preferences';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const system = useRNColorScheme();
  const theme = usePreferencesStore((s) => s.theme);
  if (theme === 'system') return system === 'dark' ? 'dark' : 'light';
  return theme;
}
