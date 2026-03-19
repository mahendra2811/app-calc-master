import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private static instance: StorageService;
  private cache: Map<string, any> = new Map();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private readonly DEBOUNCE_MS = 500;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (this.cache.has(key)) {
        return this.cache.get(key) as T;
      }

      const raw = await AsyncStorage.getItem(key);
      if (raw === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(raw) as T;
      this.cache.set(key, parsed);
      return parsed;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      this.cache.set(key, value);

      const existing = this.debounceTimers.get(key);
      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(async () => {
        try {
          const serialized = JSON.stringify(value);
          await AsyncStorage.setItem(key, serialized);
        } catch {
          // Silently fail on disk write; cache still holds the value
        } finally {
          this.debounceTimers.delete(key);
        }
      }, this.DEBOUNCE_MS);

      this.debounceTimers.set(key, timer);
    } catch {
      // Silently fail
    }
  }

  async remove(key: string): Promise<void> {
    try {
      this.cache.delete(key);

      const existing = this.debounceTimers.get(key);
      if (existing) {
        clearTimeout(existing);
        this.debounceTimers.delete(key);
      }

      await AsyncStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }

  async clear(): Promise<void> {
    try {
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }
      this.debounceTimers.clear();
      this.cache.clear();

      await AsyncStorage.clear();
    } catch {
      // Silently fail
    }
  }
}

export const storage = StorageService.getInstance();
