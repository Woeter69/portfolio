import { useRef } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ScrollWrapperProps {
  children: React.ReactNode;
}

/**
 * Multi-phase scroll-driven camera controller.
 * 
 * Phase 1 (0.0–0.25): Hero view — gentle tilt down + parallax
 * Phase 2 (0.25–0.50): Descend through clouds toward the tower
 * Phase 3 (0.50–0.75): Approach the tower cabin at eye level  
 * Phase 4 (0.75–1.0): Enter through the door into the cabin
 */

// Camera keyframes: [scroll, posX, posY, posZ, lookX, lookY, lookZ]
const KEYFRAMES = [
  { t: 0.00, pos: [0, 5, 5],     look: [0, 2, -10] },      // Hero — looking at text
  { t: 0.15, pos: [0, 3, 3],     look: [0, 0, -15] },      // Tilt down slightly
  { t: 0.30, pos: [0, -5, -5],   look: [0, -15, -25] },    // Through clouds, tower appears
  { t: 0.45, pos: [0, -15, -12], look: [0, -23, -25] },    // Tower fully visible
  { t: 0.60, pos: [0, -20, -18], look: [0, -23, -25] },    // Approaching cabin level
  { t: 0.75, pos: [0, -22.5, -23],look: [0, -23, -27] },   // At the door
  { t: 0.88, pos: [0, -22.8, -25.5], look: [0, -22.8, -28] }, // Entering
  { t: 1.00, pos: [0, -22.5, -27], look: [0, -22.5, -30] },  // Inside cabin
];

function lerpKeyframes(scroll: number) {
  // Find surrounding keyframes
  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (scroll >= KEYFRAMES[i].t && scroll <= KEYFRAMES[i + 1].t) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }

  const range = upper.t - lower.t;
  const localT = range > 0 ? (scroll - lower.t) / range : 0;
  // Smooth easing
  const eased = localT * localT * (3 - 2 * localT); // smoothstep

  const pos = lower.pos.map((v, i) => v + (upper.pos[i] - v) * eased);
  const look = lower.look.map((v, i) => v + (upper.look[i] - v) * eased);

  return { pos, look };
}

const ScrollWrapper = ({ children }: ScrollWrapperProps) => {
  const data = useScroll();
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  // Mouse parallax (only in hero phase)
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true, once: false });
  }

  useFrame((_, delta) => {
    const offset = data.offset;
    const { pos, look } = lerpKeyframes(offset);

    // Mouse parallax fades out as we approach the tower
    const parallaxStrength = Math.max(0, 1 - offset * 3);
    const px = mouseX.current * 0.3 * parallaxStrength;
    const py = mouseY.current * 0.15 * parallaxStrength;

    targetPos.current.set(pos[0] + px, pos[1] + py, pos[2]);
    targetLook.current.set(look[0], look[1], look[2]);

    // Smooth damping
    camera.position.lerp(targetPos.current, delta * 3);
    
    const currentLook = new THREE.Vector3();
    camera.getWorldDirection(currentLook);
    currentLook.add(camera.position);
    currentLook.lerp(targetLook.current, delta * 3);
    camera.lookAt(targetLook.current);
  });

  return <group>{children}</group>;
};

export default ScrollWrapper;
