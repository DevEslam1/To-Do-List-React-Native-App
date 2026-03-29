import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Colors, ThemeColors, ThemeMode } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';

const THEME_STORAGE_KEY = '@theme_preference';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  isReady: boolean;
  setTheme: (nextTheme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const systemTheme: ThemeMode = systemColorScheme === 'light' ? 'light' : 'dark';

  const [theme, setThemeState] = useState<ThemeMode>(systemTheme);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (storedTheme === 'light' || storedTheme === 'dark') {
          setThemeState(storedTheme);
          setHasStoredPreference(true);
        } else {
          setThemeState(systemTheme);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, [systemTheme]);

  useEffect(() => {
    if (!isReady || hasStoredPreference) {
      return;
    }

    setThemeState(systemTheme);
  }, [hasStoredPreference, isReady, systemTheme]);

  const setTheme = async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    setHasStoredPreference(true);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const toggleTheme = async () => {
    await setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: Colors[theme],
        isDark: theme === 'dark',
        isReady,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider.');
  }

  return context;
}
