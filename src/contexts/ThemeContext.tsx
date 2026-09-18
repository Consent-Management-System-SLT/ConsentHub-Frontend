import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** what the person chose */
  theme: Theme;
  /** what is actually on screen once "system" is resolved */
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const STORAGE_KEY = 'consenthub.theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const read = (): Theme => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
};

/**
 * Light/dark for the dashboards.
 *
 * The class goes on <html>, not on a wrapper, so the page background and any
 * portalled dialog follow it too. The sign-in, sign-up and reset screens opt
 * out with `useLockedLightTheme`: they are a fixed navy brand panel and have no
 * dark variant to switch to.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(read);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    // `locked-light` is set by the auth screens and always wins
    if (root.classList.contains('locked-light')) {
      root.classList.remove('dark');
      return;
    }
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }, [resolved]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* the choice just does not persist */
    }
  }, []);

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

/**
 * Forces light for as long as the calling screen is mounted.
 * Used by sign-in, sign-up and password reset, which are brand panels.
 */
export const useLockedLightTheme = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('locked-light');
    root.classList.remove('dark');
    const previous = root.style.colorScheme;
    root.style.colorScheme = 'light';
    return () => {
      root.classList.remove('locked-light');
      root.style.colorScheme = previous;
    };
  }, []);
};
