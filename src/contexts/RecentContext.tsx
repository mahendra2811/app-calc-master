import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

const MAX_RECENT = 10;

interface RecentState {
  recentCalculators: string[];
}

interface RecentDispatch {
  addRecent: (slug: string) => void;
}

const RecentStateContext = createContext<RecentState | undefined>(undefined);
const RecentDispatchContext = createContext<RecentDispatch | undefined>(undefined);

export function RecentProvider({ children }: { children: React.ReactNode }) {
  const [recentCalculators, setRecentCalculators] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved recents on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get<string[]>(STORAGE_KEYS.RECENT, []);
      setRecentCalculators(saved);
      setIsLoaded(true);
    })();
  }, []);

  // Persist whenever recents change (skip initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    storage.set(STORAGE_KEYS.RECENT, recentCalculators);
  }, [recentCalculators]);

  const addRecent = useCallback((slug: string) => {
    setRecentCalculators((prev) => {
      // Remove if already exists, then prepend
      const filtered = prev.filter((s) => s !== slug);
      const updated = [slug, ...filtered];
      return updated.slice(0, MAX_RECENT);
    });
  }, []);

  const stateValue = useMemo<RecentState>(
    () => ({ recentCalculators }),
    [recentCalculators],
  );

  const dispatchValue = useMemo<RecentDispatch>(
    () => ({ addRecent }),
    [addRecent],
  );

  if (!isLoaded) return null;

  return (
    <RecentStateContext.Provider value={stateValue}>
      <RecentDispatchContext.Provider value={dispatchValue}>
        {children}
      </RecentDispatchContext.Provider>
    </RecentStateContext.Provider>
  );
}

export function useRecent(): RecentState & RecentDispatch {
  const state = useContext(RecentStateContext);
  const dispatch = useContext(RecentDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useRecent must be used within a RecentProvider');
  }

  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
}

export function useRecentState(): RecentState {
  const state = useContext(RecentStateContext);
  if (!state) {
    throw new Error('useRecentState must be used within a RecentProvider');
  }
  return state;
}

export function useRecentDispatch(): RecentDispatch {
  const dispatch = useContext(RecentDispatchContext);
  if (!dispatch) {
    throw new Error('useRecentDispatch must be used within a RecentProvider');
  }
  return dispatch;
}
