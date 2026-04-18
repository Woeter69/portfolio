import { useRef, useEffect } from 'react';
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

  // Phase 3: Enter cabin, settle into far corner at eye level
  // Door is at Z=-23. Back wall is at Z=-27. Floor is at -44. Ceiling is -41.
  { t: 0.60, pos: [0, -43, -16],       look: [0, -43, -27] }, // Approaching
  { t: 0.72, pos: [0, -43, -22],       look: [0, -43, -27] }, // At the door
  { t: 0.85, pos: [-1.0, -42.6, -24.5],look: [-1.5, -42.6, -27.5] }, // Drifting in, starting to turn back
  // Settled in Far-Left corner (deep inside)
  // X = -2.0 (left wall pushed out for size=5), Y = -41.2 (ceiling level), Z = -26.4 (deep back wall)
  // Looking diagonally towards the door and center
  { t: 1.00, pos: [-2.0, -41.2, -26.4],look: [0.5, -42.4, -22.5] }, 
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
  const { camera, gl } = useThree();

  // Smoothed target positions (prevents wobble for scroll path)
  const smoothPos = useRef(new THREE.Vector3(0, 5, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 3, -10));

  // --- WALL-MOUNTED HINGE STATE ---
  const isHinged = useRef(false);
  const hingeTarget = useRef(new THREE.Vector3());
  // Base look direction for the corner (looking from Z=-26.4 to Z=-22.5) -> Facing +Z and +X
  const baseYaw = Math.atan2(2.0, 3.9); 
  const yaw = useRef(baseYaw);
  const pitch = useRef(-0.3); // Looking slightly downward from ceiling

  useEffect(() => {
    let dragging = false;
    let lastX: number | null = null;
    let lastY: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (!isHinged.current) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      document.body.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
      dragging = false;
      document.body.style.cursor = isHinged.current ? 'grab' : 'auto';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isHinged.current) {
        if (document.body.style.cursor === 'grab' || document.body.style.cursor === 'grabbing') {
          document.body.style.cursor = 'auto';
        }
        lastX = null;
        lastY = null;
        return;
      }
      
      if (document.body.style.cursor === 'auto') {
        document.body.style.cursor = 'grab';
      }
      
      if (!dragging || lastX === null || lastY === null) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      // Hinge rotation (reversed for natural drag feel)
      yaw.current += dx * 0.003;
      pitch.current -= dy * 0.003;
      
      // Clamp hinge limits to allow looking throughout the whole room, 
      // but strictly preventing looking backwards through the corner walls
      yaw.current = THREE.MathUtils.clamp(yaw.current, baseYaw - 1.8, baseYaw + 1.8);
      pitch.current = THREE.MathUtils.clamp(pitch.current, -1.2, 0.6);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      document.body.style.cursor = 'auto';
    };
  }, [gl]);

  useFrame((state, delta) => {
    const offset = data.offset;

    if (offset > 0.999) {
      if (!isHinged.current) {
        isHinged.current = true;
        // Snap to exact corner position at ceiling level (pushed closer to the wider wall)
        smoothPos.current.set(-2.0, -41.2, -26.4);
      }
    } else {
      isHinged.current = false;
    }

    if (isHinged.current) {
      // Fixed wall-mounted position
      camera.position.copy(smoothPos.current);

      // Smoothly look at the hinged target
      const targetLook = new THREE.Vector3(
        smoothPos.current.x + Math.sin(yaw.current) * Math.cos(pitch.current),
        smoothPos.current.y + Math.sin(pitch.current),
        smoothPos.current.z + Math.cos(yaw.current) * Math.cos(pitch.current)
      );
      
      hingeTarget.current.lerp(targetLook, Math.min(delta * 10, 1));
      camera.lookAt(hingeTarget.current);

    } else {
      const { pos, look } = lerpKeyframes(offset);
      
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
    }
  });

  return <group>{children}</group>;
};

export default ScrollWrapper;
