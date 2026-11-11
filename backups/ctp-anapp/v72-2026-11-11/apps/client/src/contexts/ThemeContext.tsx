import { createContext, useContext, useEffect, useState } from 'react';
import { readSavedTheme, saveTheme, type Theme } from '@/lib/theme-storage';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Match prerendered HTML before reading browser-only preferences.
  const [theme, setTheme] = useState<Theme>('light');
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    setTheme(readSavedTheme());
    setRestored(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (restored) saveTheme(theme);
  }, [theme, restored]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
