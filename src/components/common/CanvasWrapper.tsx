import { useRef, useEffect, useState } from 'react';
import { AdaptiveDpr, Preload, ScrollControls, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { useThemeStore } from '../../stores';
import ProgressLoader from './ProgressLoader';
import ScrollHint from './ScrollHint';
import ThemeSwitcher from './ThemeSwitcher';

interface CanvasWrapperProps {
  children: React.ReactNode;
}

/**
 * Full-viewport Canvas container with loading animation, theme-reactive background,
 * and scroll controls.
 */
const CanvasWrapper = ({ children }: CanvasWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundColor = useThemeStore((state) => state.theme.color);

  useEffect(() => {
    gsap.to(containerRef.current, {
      backgroundColor: backgroundColor,
      duration: 1,
    });
    gsap.to(canvasRef.current, {
      backgroundColor: backgroundColor,
      duration: 1,
    });
  }, [backgroundColor]);

  return (
    <div className="canvas-wrapper">
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100dvh',
          position: 'relative',
          background: backgroundColor,
        }}
      >
        <Canvas
          className="base-canvas noise-overlay"
          shadows
          ref={canvasRef}
          dpr={[1, 2]}
        >
          <ScrollControls pages={4} damping={0.4} maxSpeed={1} distance={1} style={{ zIndex: 1 }}>
            {children}
          </ScrollControls>
          <Preload all />
          <AdaptiveDpr pixelated />
          <CanvasOpacityController />
        </Canvas>
        <ProgressLoaderBridge />
      </div>
      <ThemeSwitcher />
      <ScrollHint />
    </div>
  );
};

/**
 * Handles fading in the canvas once loading completes.
 */
const CanvasOpacityController = () => {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      gsap.to('.base-canvas', { opacity: 1, duration: 3, delay: 0.5 });
    }
  }, [progress]);

  return null;
};

/**
 * Bridge component to pass useProgress data to the HTML ProgressLoader.
 */
const ProgressLoaderBridge = () => {
  const { progress } = useProgress();
  return <ProgressLoader progress={progress} />;
};

export default CanvasWrapper;
