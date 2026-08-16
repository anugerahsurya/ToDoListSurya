'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreset = 'royal-blue' | 'emerald' | 'burgundy' | 'original';

interface ThemePresetContextType {
  preset: ThemePreset;
  setPreset: (preset: ThemePreset) => void;
}

const ThemePresetContext = createContext<ThemePresetContextType>({
  preset: 'royal-blue',
  setPreset: () => {},
});

const STORAGE_KEY = 'todo_theme_preset';

export function ThemePresetProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPresetState] = useState<ThemePreset>('royal-blue');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreset | null;
    if (saved && (saved === 'royal-blue' || saved === 'emerald' || saved === 'burgundy' || saved === 'original')) {
      setPresetState(saved);
      document.documentElement.setAttribute('data-theme-preset', saved);
    } else {
      document.documentElement.setAttribute('data-theme-preset', 'royal-blue');
    }
  }, []);

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset);
    localStorage.setItem(STORAGE_KEY, newPreset);
    document.documentElement.setAttribute('data-theme-preset', newPreset);
  };

  return (
    <ThemePresetContext.Provider value={{ preset, setPreset }}>
      {children}
    </ThemePresetContext.Provider>
  );
}

export function useThemePreset() {
  return useContext(ThemePresetContext);
}
