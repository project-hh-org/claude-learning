import { Platform } from 'react-native';

type StorageAdapter = {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
};

function createWebStorage(): StorageAdapter {
  return {
    getItem: (name) => {
      try {
        return Promise.resolve(
          typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null,
        );
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (name, value) => {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(name, value);
      } catch {}
      return Promise.resolve();
    },
    removeItem: (name) => {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(name);
      } catch {}
      return Promise.resolve();
    },
  };
}

function createNativeStorage(): StorageAdapter {
  // Lazy require so the web bundle doesn't try to resolve react-native-mmkv.
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const storage = new MMKV({ id: 'planner-storage' });
  return {
    getItem: (name) => Promise.resolve(storage.getString(name) ?? null),
    setItem: (name, value) => {
      storage.set(name, value);
      return Promise.resolve();
    },
    removeItem: (name) => {
      storage.delete(name);
      return Promise.resolve();
    },
  };
}

let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  cached = Platform.OS === 'web' ? createWebStorage() : createNativeStorage();
  return cached;
}

export const mmkvJsonStorage = getStorage();
