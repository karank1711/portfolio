import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'portfolio-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const color = theme === 'dark' ? '#0c101b' : '#f4f1eb';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggle() {
      setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
