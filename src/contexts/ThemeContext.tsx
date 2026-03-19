import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

type ThemeOption = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeOption;
  resolvedTheme: ResolvedTheme;
}

interface ThemeDispatch {
  setTheme: (theme: ThemeOption) => void;
}

const ThemeStateContext = createContext<ThemeState | undefined>(undefined);
const ThemeDispatchContext = createContext<ThemeDispatch | undefined>(undefined);

function resolveTheme(theme: ThemeOption): ResolvedTheme {
  if (theme === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeInternal] = useState<ThemeOption>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const { setColorScheme } = useColorScheme();

  const resolved = resolveTheme(theme);

  // Load saved theme on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get<ThemeOption>(STORAGE_KEYS.THEME, 'system');
      setThemeInternal(saved);
      setIsLoaded(true);
    })();
  }, []);

  // Sync NativeWind color scheme whenever resolved theme changes
  useEffect(() => {
    if (!isLoaded) return;
    setColorScheme(resolved);
  }, [resolved, isLoaded, setColorScheme]);

  // Listen for system appearance changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;

    const subscription = Appearance.addChangeListener(() => {
      // Force a re-render so resolvedTheme recalculates
      setThemeInternal((prev) => (prev === 'system' ? 'system' : prev));
    });

    return () => subscription.remove();
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeOption) => {
      setThemeInternal(next);
      storage.set(STORAGE_KEYS.THEME, next);
    },
    [],
  );

  const stateValue = useMemo<ThemeState>(
    () => ({ theme, resolvedTheme: resolved }),
    [theme, resolved],
  );

  const dispatchValue = useMemo<ThemeDispatch>(
    () => ({ setTheme }),
    [setTheme],
  );

  if (!isLoaded) return null;

  return (
    <ThemeStateContext.Provider value={stateValue}>
      <ThemeDispatchContext.Provider value={dispatchValue}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeStateContext.Provider>
  );
}

export function useTheme(): ThemeState & ThemeDispatch {
  const state = useContext(ThemeStateContext);
  const dispatch = useContext(ThemeDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
}

export function useThemeState(): ThemeState {
  const state = useContext(ThemeStateContext);
  if (!state) {
    throw new Error('useThemeState must be used within a ThemeProvider');
  }
  return state;
}

export function useThemeDispatch(): ThemeDispatch {
  const dispatch = useContext(ThemeDispatchContext);
  if (!dispatch) {
    throw new Error('useThemeDispatch must be used within a ThemeProvider');
  }
  return dispatch;
}
