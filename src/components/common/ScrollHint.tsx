import { useEffect, useState } from 'react';
import { useScrollStore } from '../../stores';

/**
 * Animated scroll-down hint that fades out once the user starts scrolling.
 */
const ScrollHint = () => {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const isExploreMode = useScrollStore((state) => state.isExploreMode);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after a delay (once loading is done)
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Hide if actively exploring (PointerLock is active)
  if (isExploreMode) return null;

  // We show the hint natively at the top (progress < 0.02)
  const shouldShow = visible && scrollProgress < 0.02;

  return (
    <div className={`scroll-hint ${shouldShow ? 'visible' : ''}`}>
      <div className="scroll-hint-inner">
        <span className="scroll-hint-text">
          SCROLL
        </span>
        <div className="scroll-hint-line" />
      </div>
    </div>
  );
};

export default ScrollHint;
