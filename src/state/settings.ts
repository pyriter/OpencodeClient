import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// SecureStore keys (alphanumeric + . - _)
const URL_KEY = 'opencode_server_url';
const PASS_KEY = 'opencode_server_password';
const MODEL_PROVIDER_KEY = 'opencode_last_provider';
const MODEL_ID_KEY = 'opencode_last_model';

type SettingsState = {
  serverUrl: string | null;
  password: string | null;
  lastModel: { providerID: string; modelID: string } | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setConnection: (serverUrl: string, password: string | null) => Promise<void>;
  setLastModel: (m: { providerID: string; modelID: string } | null) => Promise<void>;
  clear: () => Promise<void>;
};

export const useSettings = create<SettingsState>((set) => ({
  serverUrl: null,
  password: null,
  lastModel: null,
  hydrated: false,

  hydrate: async () => {
    const [serverUrl, password, provider, model] = await Promise.all([
      SecureStore.getItemAsync(URL_KEY),
      SecureStore.getItemAsync(PASS_KEY),
      SecureStore.getItemAsync(MODEL_PROVIDER_KEY),
      SecureStore.getItemAsync(MODEL_ID_KEY),
    ]);
    set({
      serverUrl: serverUrl ?? null,
      password: password ?? null,
      lastModel: provider && model ? { providerID: provider, modelID: model } : null,
      hydrated: true,
    });
  },

  setConnection: async (serverUrl, password) => {
    await SecureStore.setItemAsync(URL_KEY, serverUrl);
    if (password) await SecureStore.setItemAsync(PASS_KEY, password);
    else await SecureStore.deleteItemAsync(PASS_KEY);
    set({ serverUrl, password: password ?? null });
  },

  setLastModel: async (m) => {
    if (m) {
      await SecureStore.setItemAsync(MODEL_PROVIDER_KEY, m.providerID);
      await SecureStore.setItemAsync(MODEL_ID_KEY, m.modelID);
    } else {
      await SecureStore.deleteItemAsync(MODEL_PROVIDER_KEY);
      await SecureStore.deleteItemAsync(MODEL_ID_KEY);
    }
    set({ lastModel: m });
  },

  clear: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(URL_KEY),
      SecureStore.deleteItemAsync(PASS_KEY),
      SecureStore.deleteItemAsync(MODEL_PROVIDER_KEY),
      SecureStore.deleteItemAsync(MODEL_ID_KEY),
    ]);
    set({ serverUrl: null, password: null, lastModel: null });
  },
}));
