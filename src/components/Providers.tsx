'use client';

import { ThemeProvider } from 'next-themes';
import { ThemePresetProvider } from '@/context/ThemePresetContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ThemePresetProvider>
        {children}
      </ThemePresetProvider>
    </ThemeProvider>
  );
}
