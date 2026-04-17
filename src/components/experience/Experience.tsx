import { useRef } from 'react';
import { Text, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Experience section placeholder — rendered inside the 3D scroll canvas.
 * Appears as the user scrolls past the hero.
 */
const Experience = () => {
  const groupRef = useRef<THREE.Group>(null);
  const titleRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const isMobile = window.innerWidth <= 768;

  const fontProps = {
    font: './outfit.ttf',
    fontSize: 0.4,
    color: 'white' as const,
  };

  useFrame((_, delta) => {
    const d = data.range(0.8, 0.2);
    const e = data.range(0.7, 0.2);

    if (groupRef.current) {
      groupRef.current.position.y = d > 0 ? -1 : -30;
      groupRef.current.visible = d > 0;
    }

    if (titleRef.current) {
      titleRef.current.children.forEach((text, i) => {
        const y = Math.max(Math.min((1 - d) * (10 - i), 10), 0.5);
        text.position.y = THREE.MathUtils.damp(text.position.y, y, 7, delta);
        (text as any).fillOpacity = e;
      });
    }
  });

  const title = 'EXPERIENCE';
  const chars = title.split('');

  return (
    <group position={[0, -41.5, 12]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Animated title letters */}
        <group ref={titleRef} position={[isMobile ? -1.8 : -3.6, 2, -2]}>
          {chars.map((char, i) => {
            const diff = isMobile ? 0.4 : 0.8;
            return (
              <Text key={i} {...fontProps} position={[i * diff, 2, 1]}>
                {char}
              </Text>
            );
          })}
        </group>

        {/* Content tiles placeholder */}
        <group position={[0, -1, 0]} ref={groupRef}>
          {/* Work tile */}
          <group position={[isMobile ? -1 : -2, 0, isMobile ? 0.4 : 0]}>
            <mesh>
              <planeGeometry args={[3, 2]} />
              <meshBasicMaterial color="#2a1a3a" transparent opacity={0.6} />
            </mesh>
            <Text
              {...fontProps}
              fontSize={0.2}
              position={[0, 0.6, 0.01]}
              anchorX="center"
            >
              WORK & EDUCATION
            </Text>
            <Text
              {...fontProps}
              fontSize={0.12}
              position={[0, 0.1, 0.01]}
              anchorX="center"
              color="rgba(255,255,255,0.6)"
            >
              Coming soon...
            </Text>
          </group>

          {/* Projects tile */}
          <group position={[isMobile ? 1 : 2, 0, 0]}>
            <mesh>
              <planeGeometry args={[3, 2]} />
              <meshBasicMaterial color="#1a2a3a" transparent opacity={0.6} />
            </mesh>
            <Text
              {...fontProps}
              fontSize={0.2}
              position={[0, 0.6, 0.01]}
              anchorX="center"
            >
              SIDE PROJECTS
            </Text>
            <Text
              {...fontProps}
              fontSize={0.12}
              position={[0, 0.1, 0.01]}
              anchorX="center"
              color="rgba(255,255,255,0.6)"
            >
              Coming soon...
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
};

export default Experience;
