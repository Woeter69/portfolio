import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThemeStore } from '../../stores';

/**
 * Star field that fades in/out based on theme.
 * Only visible in night mode - uses opacity animation for smooth transitions.
 */
const StarsContainer = () => {
  const theme = useThemeStore((state) => state.theme);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Track target opacity
  const targetOpacity = theme.type === 'night' ? 1 : 0;

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smoothly animate opacity
      const currentOpacity = groupRef.current.children.length > 0
        ? (groupRef.current.children[0] as any).material?.opacity ?? 0
        : 0;
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, delta * 2);

      groupRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = newOpacity;
        }
      });

      // Hide completely when fully transparent
      groupRef.current.visible = newOpacity > 0.01;
    }
  });

  return (
    <group ref={groupRef} visible={theme.type === 'night'}>
      <Stars
        radius={200}
        depth={100}
        count={5000}
        factor={10}
        saturation={10}
        fade
        speed={1}
      />
    </group>
  );
};

export default StarsContainer;
