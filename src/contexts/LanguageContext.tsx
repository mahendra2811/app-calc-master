import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getLocales } from 'expo-localization';
import i18n from '@/i18n';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

type Language = 'en' | 'hi';

interface LanguageState {
  language: Language;
  t: (key: string, params?: Record<string, unknown>) => string;
}

interface LanguageDispatch {
  setLanguage: (lang: Language) => void;
}

const LanguageStateContext = createContext<LanguageState | undefined>(undefined);
const LanguageDispatchContext = createContext<LanguageDispatch | undefined>(undefined);

function getDeviceLanguage(): Language {
  const deviceLang = getLocales()?.[0]?.languageCode ?? 'en';
  return deviceLang === 'hi' ? 'hi' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageInternal] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.get<Language | null>(STORAGE_KEYS.LANGUAGE, null);
      const lang = saved ?? getDeviceLanguage();
      setLanguageInternal(lang);
      i18n.locale = lang;
      setIsLoaded(true);
    })();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageInternal(lang);
    i18n.locale = lang;
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string => {
      return i18n.t(key, params);
    },
    // language in the dep array so t updates when locale changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );

  const stateValue = useMemo<LanguageState>(
    () => ({ language, t }),
    [language, t],
  );

  const dispatchValue = useMemo<LanguageDispatch>(
    () => ({ setLanguage }),
    [setLanguage],
  );

  if (!isLoaded) return null;

  return (
    <LanguageStateContext.Provider value={stateValue}>
      <LanguageDispatchContext.Provider value={dispatchValue}>
        {children}
      </LanguageDispatchContext.Provider>
    </LanguageStateContext.Provider>
  );
}

export function useLanguage(): LanguageState & LanguageDispatch {
  const state = useContext(LanguageStateContext);
  const dispatch = useContext(LanguageDispatchContext);

  if (!state || !dispatch) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch]);
}

export function useLanguageState(): LanguageState {
  const state = useContext(LanguageStateContext);
  if (!state) {
    throw new Error('useLanguageState must be used within a LanguageProvider');
  }
  return state;
}

export function useLanguageDispatch(): LanguageDispatch {
  const dispatch = useContext(LanguageDispatchContext);
  if (!dispatch) {
    throw new Error('useLanguageDispatch must be used within a LanguageProvider');
  }
  return dispatch;
}
