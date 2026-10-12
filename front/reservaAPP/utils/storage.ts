import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isBrowser = typeof window !== "undefined" && !!window.localStorage;
const isSSR = typeof window === "undefined";

const memoryStore: Record<string, string | null> = {};

const Storage = {
  setItem: async (key: string, value: string) => {
    if (isSSR) {
      memoryStore[key] = value;
    } else if (Platform.OS === "web" && isBrowser) {
      window.localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  getItem: async (key: string) => {
    if (isSSR) {
      return memoryStore[key] ?? null;
    } else if (Platform.OS === "web" && isBrowser) {
      return window.localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  removeItem: async (key: string) => {
    if (isSSR) {
      delete memoryStore[key];
    } else if (Platform.OS === "web" && isBrowser) {
      window.localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
  getAllKeys: async (): Promise<readonly string[]> => {
    if (isSSR) {
      return Object.keys(memoryStore);
    } else if (Platform.OS === "web" && isBrowser) {
      return Object.keys(window.localStorage);
    } else {
      return await AsyncStorage.getAllKeys();
    }
  },
  multiGet: async (keys: readonly string[]) => {
    if (isSSR) {
      return keys.map((k) => [k, memoryStore[k] ?? null]);
    } else if (Platform.OS === "web" && isBrowser) {
      return keys.map((k) => [k, window.localStorage.getItem(k)]);
    } else {
      return await AsyncStorage.multiGet(keys);
    }
  },
};

export default Storage;
