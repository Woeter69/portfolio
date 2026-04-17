import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Theme {
  type: 'sunset' | 'night';
  color: string;
}

const AvailableThemes: Theme[] = [
  { type: 'sunset', color: '#c27058' },   // warm rose-coral to match golden hour mid-tones
  { type: 'night', color: '#080810' },     // deep dark blue-black
];

interface ThemeStore {
  themes: Theme[];
  theme: Theme;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themes: [...AvailableThemes],
      theme: AvailableThemes[0],
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
    }
  )
);
