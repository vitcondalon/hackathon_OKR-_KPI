import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'okr_theme';
const THEMES = {
  light: 'light',
  dark: 'dark'
};

const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === 'undefined') return THEMES.light;
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === THEMES.light || saved === THEMES.dark) {
    return saved;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? THEMES.dark : THEMES.light;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.dark,
      setTheme,
      toggleTheme() {
        setTheme((prev) => (prev === THEMES.dark ? THEMES.light : THEMES.dark));
      }
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
