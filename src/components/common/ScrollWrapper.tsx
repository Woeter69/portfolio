import { useRef, useEffect, useState } from 'react';
import { useScroll, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import PlayerController from './PlayerController';
import { useScrollStore } from '../../stores';

const ExplorePrompt3D = () => {
  const textRef = useRef<any>(null);

  useEffect(() => {
    // Elegant fade and slide up animation matching the Hero text
    gsap.fromTo(
      textRef.current.position,
      { y: -41.9 },
      { y: -41.8, duration: 1.5, ease: 'power3.out' }
    );
    gsap.fromTo(
      textRef.current,
      { fillOpacity: 0 },
      { fillOpacity: 0.9, duration: 1.5 }
    );
  }, []);

  return (
    <Text
      ref={textRef}
      position={[0, -41.8, -26.0]} // Shifted up organically +0.3 units above eye-line (-42.1)
      fontSize={0.15}
      color="#EAE2D6"
      font="./outfit.ttf"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.1}
      fillOpacity={0}
      textAlign="center"
      lineHeight={1.4}
    >
      Click anywhere{'\n'}to explore
    </Text>
  );
};

interface ScrollWrapperProps {
  children: React.ReactNode;
}

/**
 * Multi-phase scroll-driven camera controller.
 * 
 * Phase 1 (0.0–0.15): Hero view
 * Phase 2 (0.15–0.50): Drop STRAIGHT DOWN (only y changes, z stays)
 * Phase 3 (0.50–1.0): Enter cabin, settle into back-top corner view with wall hinge
 */

// Camera path — z also moves forward during descent for a cinematic feel
const KEYFRAMES = [
  // Phase 1: Hero
  { t: 0.00, pos: [0, 5, 5],     look: [0, 3, -10] },
  { t: 0.10, pos: [0, 4, 4],     look: [0, 1, -10] },

  // Phase 2: Descend through clouds (y drops, z moves slightly)
  { t: 0.25, pos: [0, -10, 2],   look: [0, -25, -10] },
  { t: 0.40, pos: [0, -30, -2],  look: [0, -43, -20] },
  { t: 0.50, pos: [0, -43, -8],  look: [0, -43, -25] },

  // Phase 3: Enter cabin and stop in the center of the room at eye level!
  // Door is at Z=-23. Back wall is at Z=-27. Eye level is ~ -42.6.
  { t: 0.60, pos: [0, -43, -16],       look: [0, -43, -27] }, // Approaching
  { t: 0.72, pos: [0, -43, -22],       look: [0, -43, -27] }, // At the door
  { t: 0.85, pos: [0, -42.1, -23.5],   look: [0, -42.1, -27.0] }, // Drifting in and rising to player eye-level (-42.1)
  // Settle loosely in the center, looking clearly toward the desk/bed
  { t: 1.00, pos: [0, -42.1, -24.0],   look: [0, -42.1, -27.0] }, 
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
  const isExploreMode = useScrollStore((state) => state.isExploreMode);
  const setShowExplorePrompt = useScrollStore((state) => state.setShowExplorePrompt);
  const showExplorePrompt = useScrollStore((state) => state.showExplorePrompt);
  
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);

  const hasScrolledRef = useRef(false);

  // Force react re-renders out of the Drei scroll proxy safely
  const [showController, setShowController] = useState(false);

  // Smoothed target positions (prevents wobble for scroll path)
  const smoothPos = useRef(new THREE.Vector3(0, 5, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 3, -10));

  useFrame((state, delta) => {
    if (isExploreMode) return; // Yield camera control completely to PlayerController

    const offset = data.offset;
    const { pos, look } = lerpKeyframes(offset);
    
    // Only dispatch a literal React setState threshold crossing if the boolean flips (extremely crucial for 60fps)
    if (offset >= 0.90 && !showController) setShowController(true);
    else if (offset < 0.90 && showController) setShowController(false);

    // Blast the prompt state out natively to the global 2D UI to trigger the ScrollHint
    if (offset >= 0.999) setShowExplorePrompt(true);
    else setShowExplorePrompt(false);

    // Turn off the global 'SCROLL' hint dynamically explicitly throttling React State
    if (offset >= 0.02 && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      setScrollProgress(1); // Set any value >= 0.02 to violently hide it globally
    } else if (offset < 0.02 && hasScrolledRef.current) {
      hasScrolledRef.current = false;
      setScrollProgress(0);
    }
    
    // Mouse parallax (desktop only) — subtle camera offset following pointer
      const isMobile = window.innerWidth <= 768;
      let mx = 0, my = 0;
      if (!isMobile) {
        mx = state.pointer.x * 1.2;  // horizontal drift
        my = state.pointer.y * 0.6;  // vertical drift
      }

      // Smoothly damp toward target (prevents snappy wobble)
      smoothPos.current.lerp(
        new THREE.Vector3(pos[0] + mx, pos[1] + my * 0.3, pos[2]),
        Math.min(delta * 4, 1)
      );
      smoothLook.current.lerp(
        new THREE.Vector3(look[0] + mx * 0.5, look[1] + my * 0.2, look[2]),
        Math.min(delta * 4, 1)
      );

      camera.position.copy(smoothPos.current);
      camera.lookAt(smoothLook.current);
  });

  return (
    <>
      <group>
        {children}
      </group>



      {/* Native 3D Explore Prompt (Matches Hero Banner) */}
      {!isExploreMode && showExplorePrompt && (
        <ExplorePrompt3D />
      )}

      {/* First Person Controls permanently available inside the cabin */}
      {showController && (
        <PlayerController showButton={false} />
      )}
    </>
  );
};

export default ScrollWrapper;
