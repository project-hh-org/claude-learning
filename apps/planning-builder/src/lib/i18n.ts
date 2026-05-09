import en from '@/locales/en.json';
import ko from '@/locales/ko.json';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

export const i18n = new I18n({ en, ko });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale === 'ko' ? 'ko' : 'en';

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

export function setLocale(locale: 'ko' | 'en') {
  i18n.locale = locale;
}
