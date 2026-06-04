import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import type { HistoryEntry } from '@/types/calculator';

const MAX_GLOBAL_ENTRIES = 200;
const MAX_CALC_ENTRIES = 50;

interface HistoryState {
  globalHistory: HistoryEntry[];
  getCalculatorHistory: (calcId: string) => HistoryEntry[];
}

interface HistoryDispatch {
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'isFavorite'>) => void;
  clearHistory: (calcId?: string) => void;
  deleteHistoryEntry: (entryId: string) => void;
  toggleHistoryFavorite: (entryId: string) => void;
}

const HistoryStateContext = createContext<HistoryState | undefined>(undefined);
const HistoryDispatchContext = createContext<HistoryDispatch | undefined>(undefined);

/**
 * Remove oldest non-favorited entries until the list is within the limit.
 * Favorites are preserved even if that means the array exceeds the limit.
 */
function trimEntries(entries: HistoryEntry[], limit: number): HistoryEntry[] {
  if (entries.length <= limit) return entries;

  const favorites = entries.filter((e) => e.isFavorite);
  const nonFavorites = entries.filter((e) => !e.isFavorite);

  // Keep only the most recent non-favorited entries that fit
  const allowedNonFavorites = Math.max(0, limit - favorites.length);
  return [...favorites, ...nonFavorites.slice(0, allowedNonFavorites)];
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [globalHistory, setGlobalHistory] = useState<HistoryEntry[]>([]);
  // Per-calc history stored in a map keyed by calcId
  const [calcHistoryMap, setCalcHistoryMap] = useState<Record<string, HistoryEntry[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Track which calc IDs we have loaded so we don't reload from storage
  const loadedCalcIds = useRef<Set<string>>(new Set());

  // Load global history on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get<HistoryEntry[]>(STORAGE_KEYS.GLOBAL_HISTORY, []);
      setGlobalHistory(saved);
      setIsLoaded(true);
    })();
  }, []);

  // Persist global history whenever it changes (skip initial load)
  const isFirstGlobalRender = useRef(true);
  useEffect(() => {
    if (isFirstGlobalRender.current) {
      isFirstGlobalRender.current = false;
      return;
    }
    storage.set(STORAGE_KEYS.GLOBAL_HISTORY, globalHistory);
  }, [globalHistory]);

  // Helper to persist a specific calc's history
  const persistCalcHistory = useCallback((calcId: string, entries: HistoryEntry[]) => {
    storage.set(STORAGE_KEYS.CALC_HISTORY(calcId), entries);
  }, []);

  // Load per-calc history on demand
  const loadCalcHistory = useCallback(async (calcId: string): Promise<HistoryEntry[]> => {
    if (loadedCalcIds.current.has(calcId)) {
      return []; // Already loaded; caller should use state
    }
    const saved = await storage.get<HistoryEntry[]>(STORAGE_KEYS.CALC_HISTORY(calcId), []);
    loadedCalcIds.current.add(calcId);
    setCalcHistoryMap((prev) => ({ ...prev, [calcId]: saved }));
    return saved;
  }, []);

  const getCalculatorHistory = useCallback(
    (calcId: string): HistoryEntry[] => {
      // If not loaded yet, trigger an async load (the component will re-render)
      if (!loadedCalcIds.current.has(calcId)) {
        loadCalcHistory(calcId);
        return [];
      }
      return calcHistoryMap[calcId] ?? [];
    },
    [calcHistoryMap, loadCalcHistory],
  );

  const addHistory = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'isFavorite'>) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: uuidv4(),
        timestamp: Date.now(),
        isFavorite: false,
      };

      // Update global history
      setGlobalHistory((prev) => {
        const updated = [newEntry, ...prev];
        return trimEntries(updated, MAX_GLOBAL_ENTRIES);
      });

      // Update per-calc history
      setCalcHistoryMap((prev) => {
        const calcEntries = prev[entry.calcId] ?? [];
        const updated = [newEntry, ...calcEntries];
        const trimmed = trimEntries(updated, MAX_CALC_ENTRIES);
        persistCalcHistory(entry.calcId, trimmed);
        return { ...prev, [entry.calcId]: trimmed };
      });

      // Mark this calcId as loaded since we now have its data in state
      loadedCalcIds.current.add(entry.calcId);
    },
    [persistCalcHistory],
  );

  const clearHistory = useCallback(
    (calcId?: string) => {
      if (calcId) {
        // Clear only one calculator's history
        setCalcHistoryMap((prev) => {
          const updated = { ...prev };
          delete updated[calcId];
          persistCalcHistory(calcId, []);
          return updated;
        });

        // Remove that calc's entries from global history
        setGlobalHistory((prev) => prev.filter((e) => e.calcId !== calcId));
      } else {
        // Clear all history
        setGlobalHistory([]);
        setCalcHistoryMap((prev) => {
          // Clear each calc's storage
          for (const id of Object.keys(prev)) {
            persistCalcHistory(id, []);
          }
          return {};
        });
      }
    },
    [persistCalcHistory],
  );

  const deleteHistoryEntry = useCallback(
    (entryId: string) => {
      setGlobalHistory((prev) => prev.filter((e) => e.id !== entryId));

      setCalcHistoryMap((prev) => {
        const updated = { ...prev };
        for (const calcId of Object.keys(updated)) {
          const filtered = updated[calcId].filter((e) => e.id !== entryId);
          if (filtered.length !== updated[calcId].length) {
            updated[calcId] = filtered;
            persistCalcHistory(calcId, filtered);
            break; // Entry IDs are unique, so stop after first match
          }
        }
        return updated;
      });
    },
    [persistCalcHistory],
  );

  const toggleHistoryFavorite = useCallback(
    (entryId: string) => {
      setGlobalHistory((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, isFavorite: !e.isFavorite } : e,
        ),
      );

      setCalcHistoryMap((prev) => {
        const updated = { ...prev };
        for (const calcId of Object.keys(updated)) {
          const index = updated[calcId].findIndex((e) => e.id === entryId);
          if (index !== -1) {
            updated[calcId] = updated[calcId].map((e) =>
              e.id === entryId ? { ...e, isFavorite: !e.isFavorite } : e,
            );
            persistCalcHistory(calcId, updated[calcId]);
            break;
          }
        }
        return updated;
      });
    },
    [persistCalcHistory],
  );

  const stateValue = useMemo<HistoryState>(
    () => ({ globalHistory, getCalculatorHistory }),
    [globalHistory, getCalculatorHistory],
  );

  const dispatchValue = useMemo<HistoryDispatch>(
    () => ({ addHistory, clearHistory, deleteHistoryEntry, toggleHistoryFavorite }),
    [addHistory, clearHistory, deleteHistoryEntry, toggleHistoryFavorite],
  );

  if (!isLoaded) return null;

  return (
    <HistoryStateContext.Provider value={stateValue}>
      <HistoryDispatchContext.Provider value={dispatchValue}>
        {children}
      </HistoryDispatchContext.Provider>
    </HistoryStateContext.Provider>
  );
}

export function useHistory(): HistoryState & HistoryDispatch {
  const state = useContext(HistoryStateContext);
  const dispatch = useContext(HistoryDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }

  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
}

export function useHistoryState(): HistoryState {
  const state = useContext(HistoryStateContext);
  if (!state) {
    throw new Error('useHistoryState must be used within a HistoryProvider');
  }
  return state;
}

export function useHistoryDispatch(): HistoryDispatch {
  const dispatch = useContext(HistoryDispatchContext);
  if (!dispatch) {
    throw new Error('useHistoryDispatch must be used within a HistoryProvider');
  }
  return dispatch;
}
