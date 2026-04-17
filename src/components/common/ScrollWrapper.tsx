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
 * Phase 1 (0.0–0.15): Hero view
 * Phase 2 (0.15–0.50): Drop STRAIGHT DOWN (only y changes, z stays)
 * Phase 3 (0.50–1.0): Level off at door height, go STRAIGHT AHEAD (only z changes)
 */

// Camera path — z also moves forward during descent for a cinematic feel
const KEYFRAMES = [
  // Phase 1: Hero
  { t: 0.00, pos: [0, 5, 5],     look: [0, 3, -10] },
  { t: 0.10, pos: [0, 4, 4],     look: [0, 1, -10] },

  // Phase 2: Descend through clouds (y drops, z moves slightly)
  { t: 0.25, pos: [0, -5, 2],    look: [0, -15, -10] },
  { t: 0.40, pos: [0, -18, -2],  look: [0, -28, -20] },
  { t: 0.50, pos: [0, -28, -8],  look: [0, -28, -25] },

  // Phase 3: Level off at door height, go straight ahead into cabin
  { t: 0.60, pos: [0, -28, -16], look: [0, -28, -27] },
  { t: 0.72, pos: [0, -28, -22], look: [0, -28, -27] },
  { t: 0.85, pos: [0, -28, -24], look: [0, -28, -30] },
  { t: 1.00, pos: [0, -28, -27], look: [0, -28, -32] },
];

function lerpKeyframes(scroll: number) {
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
  // Smoothstep easing
  const eased = localT * localT * (3 - 2 * localT);

  const pos = lower.pos.map((v, i) => v + (upper.pos[i] - v) * eased);
  const look = lower.look.map((v, i) => v + (upper.look[i] - v) * eased);

  return { pos, look };
}

const ScrollWrapper = ({ children }: ScrollWrapperProps) => {
  const data = useScroll();
  const { camera } = useThree();

  // Smoothed target positions (prevents wobble)
  const smoothPos = useRef(new THREE.Vector3(0, 5, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 3, -10));

  useFrame((_, delta) => {
    const offset = data.offset;
    const { pos, look } = lerpKeyframes(offset);

    // Smoothly damp toward target (prevents snappy wobble)
    smoothPos.current.lerp(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      Math.min(delta * 4, 1)
    );
    smoothLook.current.lerp(
      new THREE.Vector3(look[0], look[1], look[2]),
      Math.min(delta * 4, 1)
    );

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);
  });

  return <group>{children}</group>;
};

export default ScrollWrapper;
