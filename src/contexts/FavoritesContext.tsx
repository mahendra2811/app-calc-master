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

interface FavoritesState {
  favorites: string[];
}

interface FavoritesDispatch {
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
}

const FavoritesStateContext = createContext<FavoritesState | undefined>(undefined);
const FavoritesDispatchContext = createContext<FavoritesDispatch | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved favorites on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get<string[]>(STORAGE_KEYS.FAVORITES, []);
      setFavorites(saved);
      setIsLoaded(true);
    })();
  }, []);

  // Persist whenever favorites change (skip initial load)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    storage.set(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }, []);

  // Use a Set for O(1) lookups. We derive it from `favorites` via useMemo.
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (slug: string): boolean => favoritesSet.has(slug),
    [favoritesSet],
  );

  const stateValue = useMemo<FavoritesState>(
    () => ({ favorites }),
    [favorites],
  );

  const dispatchValue = useMemo<FavoritesDispatch>(
    () => ({ toggleFavorite, isFavorite }),
    [toggleFavorite, isFavorite],
  );

  if (!isLoaded) return null;

  return (
    <FavoritesStateContext.Provider value={stateValue}>
      <FavoritesDispatchContext.Provider value={dispatchValue}>
        {children}
      </FavoritesDispatchContext.Provider>
    </FavoritesStateContext.Provider>
  );
}

export function useFavorites(): FavoritesState & FavoritesDispatch {
  const state = useContext(FavoritesStateContext);
  const dispatch = useContext(FavoritesDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }

  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
}

export function useFavoritesState(): FavoritesState {
  const state = useContext(FavoritesStateContext);
  if (!state) {
    throw new Error('useFavoritesState must be used within a FavoritesProvider');
  }
  return state;
}

export function useFavoritesDispatch(): FavoritesDispatch {
  const dispatch = useContext(FavoritesDispatchContext);
  if (!dispatch) {
    throw new Error('useFavoritesDispatch must be used within a FavoritesProvider');
  }
  return dispatch;
}
