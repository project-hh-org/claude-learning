import { mmkvJsonStorage } from '@/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Locale = 'ko' | 'en';
type ThemePreference = 'light' | 'dark' | 'system';

type PreferencesState = {
  locale: Locale;
  theme: ThemePreference;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemePreference) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      locale: 'en',
      theme: 'system',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => mmkvJsonStorage),
    },
  ),
);
