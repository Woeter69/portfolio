import { create } from 'zustand';

interface InteractionStore {
  focusedProp: 'none' | 'typewriter';
  setFocusedProp: (prop: 'none' | 'typewriter') => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  focusedProp: 'none',
  setFocusedProp: (prop) => set({ focusedProp: prop }),
}));
