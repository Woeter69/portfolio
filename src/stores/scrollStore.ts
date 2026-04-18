import { create } from 'zustand';

interface ScrollStore {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  isExploreMode: boolean;
  setExploreMode: (mode: boolean) => void;
  showExplorePrompt: boolean;
  setShowExplorePrompt: (show: boolean) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (progress: number) => set({ scrollProgress: progress }),
  isExploreMode: false,
  setExploreMode: (mode: boolean) => set({ isExploreMode: mode }),
  showExplorePrompt: false,
  setShowExplorePrompt: (show: boolean) => set({ showExplorePrompt: show }),
}));
