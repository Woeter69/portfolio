import { useEffect, useState } from 'react';
import { useScrollStore } from '../../stores';

/**
 * Animated scroll-down hint that fades out once the user starts scrolling.
 */
const ScrollHint = () => {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after a delay (once loading is done)
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Hide once user has scrolled
  const shouldShow = visible && scrollProgress < 0.02;

  return (
    <div className={`scroll-hint ${shouldShow ? 'visible' : ''}`}>
      <div className="scroll-hint-inner">
        <span className="scroll-hint-text">Scroll</span>
        <div className="scroll-hint-line" />
      </div>
    </div>
  );
};

export default ScrollHint;
