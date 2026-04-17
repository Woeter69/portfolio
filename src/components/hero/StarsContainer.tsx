import { Stars } from '@react-three/drei';
import { useThemeStore } from '../../stores';

/**
 * Star field — only mounts when theme is night AND store has hydrated.
 * Prevents the flash-on-load bug by not rendering at all until
 * localStorage theme is confirmed.
 */
const StarsContainer = () => {
  const theme = useThemeStore((state) => state.theme);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);

  // Don't render anything until hydration is complete
  if (!hasHydrated) return null;

  // Only render stars in night mode — no mount = no flash
  if (theme.type !== 'night') return null;

  return (
    <Stars
      radius={200}
      depth={100}
      count={5000}
      factor={10}
      saturation={10}
      fade
      speed={1}
    />
  );
};

export default StarsContainer;
