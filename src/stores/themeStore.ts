import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Theme {
  type: 'sunset' | 'night';
  color: string;
}

const AvailableThemes: Theme[] = [
  { type: 'sunset', color: '#c27058' },
  { type: 'night', color: '#080810' },
];

interface ThemeStore {
  themes: Theme[];
  theme: Theme;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: [...AvailableThemes],
      theme: AvailableThemes[0],
      hasHydrated: false,
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
      nextTheme: () => {
        const themes = get().themes;
        const activeIndex = themes.findIndex((t) => t.type === get().theme.type);
        const nextIndex = (activeIndex + 1) % themes.length;
        set(() => ({ theme: themes[nextIndex] }));
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
