export type Theme = 'light' | 'dark';

export function readSavedTheme(): Theme {
  try {
    return window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem('theme', theme);
  } catch {
    // Theme remains functional in memory when browser storage is blocked.
  }
}
