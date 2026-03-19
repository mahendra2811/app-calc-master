import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { RecentProvider } from '@/contexts/RecentContext';
import { HistoryProvider } from '@/contexts/HistoryContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <RecentProvider>
            <HistoryProvider>
              {children}
            </HistoryProvider>
          </RecentProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
