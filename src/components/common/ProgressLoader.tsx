import { useEffect, useState } from 'react';

interface ProgressLoaderProps {
  progress: number;
}

/**
 * Loading indicator: animated SVG rectangle border on desktop, simple progress bar on mobile.
 */
const ProgressLoader = ({ progress }: ProgressLoaderProps) => {
  const strokeWidth = 3;
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clampedProgress = Math.max(0, Math.min(100, progress));

  if (isMobile) {
    return (
      <div className="progress-loader">
        <div
          className="progress-bar-mobile"
          style={{ opacity: progress === 100 ? 0 : 0.7 }}
        >
          <div className="progress-bar-track" />
          <div
            className="progress-bar-fill"
            style={{ width: `${clampedProgress}%` }}
          />
          <div className="progress-text">{`${clampedProgress.toFixed(1)}%`}</div>
        </div>
      </div>
    );
  }

  // Desktop: animated SVG rectangle border
  const svgWidth = Math.max(0, windowSize.width - 16);
  const svgHeight = Math.max(0, windowSize.height - 16);
  const halfStroke = 1;
  const rectWidth = Math.max(0, svgWidth - strokeWidth);
  const rectHeight = Math.max(0, svgHeight - strokeWidth);
  const perimeter = rectWidth > 0 && rectHeight > 0 ? rectWidth * 2 + rectHeight * 2 : 0;
  const strokeDashoffset = perimeter - (perimeter * clampedProgress) / 100;

  if (svgWidth <= strokeWidth || svgHeight <= strokeWidth) return null;

  return (
    <div className="progress-loader progress-loader--desktop">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: svgWidth > 0 && svgHeight > 0 ? 'block' : 'none' }}
      >
        {/* Background track */}
        <rect
          x={halfStroke}
          y={halfStroke}
          width={rectWidth}
          height={rectHeight}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="rgba(0, 0, 0, 0.2)"
        />
        {/* Progress indicator */}
        <rect
          x={halfStroke}
          y={halfStroke}
          width={rectWidth}
          height={rectHeight}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.7)"
          style={{
            strokeDasharray: perimeter,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
    </div>
  );
};

export default ProgressLoader;
