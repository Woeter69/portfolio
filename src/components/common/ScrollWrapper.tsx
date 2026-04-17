import { useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '../../stores';

interface ScrollWrapperProps {
  children: React.ReactNode | React.ReactNode[];
}

/**
 * Scroll-driven camera animation wrapper.
 * Camera tilts downward and moves on scroll, with subtle mouse parallax.
 */
const ScrollWrapper = ({ children }: ScrollWrapperProps) => {
  const { camera } = useThree();
  const data = useScroll();
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);

  useFrame((state, delta) => {
    if (!data) return;

    const a = data.range(0, 0.3);
    const b = data.range(0.3, 0.5);
    const d = data.range(0.85, 0.18);

    // Camera rotation (look down as you scroll)
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, -0.5 * Math.PI * a, 5, delta);

    // Camera vertical position (descend to lower sections)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -37 * b, 7, delta);

    // Camera depth (push/pull near bottom)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 5 + 10 * d, 7, delta);

    // Track global scroll progress
    setScrollProgress(data.range(0, 1));

    // Subtle mouse parallax on desktop
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        -(state.pointer.x * Math.PI) / 90,
        0.05
      );
    }
  });

  const childArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childArray.map((child, index) => (
        <group key={index}>{child}</group>
      ))}
    </>
  );
};

export default ScrollWrapper;
