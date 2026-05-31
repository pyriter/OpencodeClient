// Thin shim around expo-secure-store with a web fallback.
// expo-secure-store is iOS/Android only; on web we use localStorage so the
// app can run in a browser for development / testing.

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStore = {
  getItemAsync(key: string): Promise<string | null> {
    try {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItemAsync(key: string, value: string): Promise<void> {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* noop */
    }
    return Promise.resolve();
  },
  deleteItemAsync(key: string): Promise<void> {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* noop */
    }
    return Promise.resolve();
  },
};

export const Storage = Platform.OS === 'web' ? webStore : SecureStore;
