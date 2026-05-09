import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (k: string) => store.get(k),
      set: (k: string, v: string) => store.set(k, v),
      delete: (k: string) => store.delete(k),
      contains: (k: string) => store.has(k),
      clearAll: () => store.clear(),
    })),
  };
});

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en' }],
}));
