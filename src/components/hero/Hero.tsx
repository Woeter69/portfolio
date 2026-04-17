import { useRef, useEffect } from 'react';
import { Text, useProgress } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import CloudContainer from './CloudContainer';
import StarsContainer from './StarsContainer';
import SunsetSky from './SunsetSky';

/**
 * Hero scene: sunset sky, volumetric clouds, animated title text, and warm lighting.
 */
const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const subtitleRef = useRef<THREE.Mesh>(null);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current.position,
          { y: -10 },
          { y: 2, duration: 2.5, ease: 'power3.out', delay: 0.5 }
        );
        gsap.fromTo(
          titleRef.current,
          { fillOpacity: 0 },
          { fillOpacity: 1, duration: 2, delay: 0.8 }
        );
      }
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current.position,
          { y: -12 },
          { y: 0.5, duration: 2.5, ease: 'power3.out', delay: 1 }
        );
        gsap.fromTo(
          subtitleRef.current,
          { fillOpacity: 0 },
          { fillOpacity: 1, duration: 2, delay: 1.2 }
        );
      }
    }
  }, [progress]);

  return (
    <>
      {/* Sky */}
      <SunsetSky />

      {/* Soft ambient lighting for text visibility */}
      <ambientLight intensity={0.6} color="#ffeedd" />

      {/* Title */}
      <Text
        ref={titleRef}
        position={[0, -10, -10]}
        fontSize={1.2}
        color="#ffffff"
        font="./outfit.ttf"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0}
      >
        Hi, I am Woeter.
      </Text>

      {/* Subtitle */}
      <Text
        ref={subtitleRef}
        position={[0, -12, -10]}
        fontSize={0.4}
        color="#ffffff"
        font="./space-grotesk.ttf"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
        fillOpacity={0}
      >
        DEVELOPER • RESEARCHER • CREATIVE
      </Text>

      {/* Stars (night mode only) */}
      <StarsContainer />

      {/* Clouds */}
      <CloudContainer />
    </>
  );
};

export default Hero;
