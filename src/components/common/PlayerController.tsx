import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../../stores';

interface PlayerControllerProps {
  onUnlock?: () => void;
  startPos: [number, number, number];
  lookAtPos: [number, number, number];
  showButton?: boolean;
}

export default function PlayerController({ onUnlock, startPos, lookAtPos, showButton = true }: PlayerControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const setIsExploreMode = useScrollStore((state) => state.setExploreMode);
  const isExploreMode = useScrollStore((state) => state.isExploreMode);
  const [opacity, setOpacity] = useState(0);
  
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    // Reveal button smoothly when showButton triggers
    if (showButton) {
      requestAnimationFrame(() => setOpacity(1));
    } else {
      setOpacity(0);
    }
  }, [showButton]);

  useEffect(() => {
    // Prevent default browser scroll while moving inside room
    // Note: We don't force camera position here anymore, we let the ScrollWrapper seamlessly hand it over
    // and ONLY apply Player movement delta going forward.
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      console.log('PLAYER CONTROLLER: Key pressed:', e.code);
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.w = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.a = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.s = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.w = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.a = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.s = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = false;
    };

    const onWheel = (e: WheelEvent) => {
      // If user scrolls up (mouse wheel delta < 0), exit explore mode by unlocking!
      if (e.deltaY < 0 && controlsRef.current?.isLocked) {
        controlsRef.current.unlock();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    // Add passive listener so we don't block actual scrolling later
    document.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('wheel', onWheel);
      document.body.style.overflow = 'auto'; 
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) {
      return;
    }

    const effectiveDelta = Math.min(delta, 0.1); 

    const accel = 60.0; // Snappy acceleration
    const deccel = 20.0; // High friction

    // Apply friction
    velocity.current.x -= velocity.current.x * deccel * effectiveDelta;
    velocity.current.z -= velocity.current.z * deccel * effectiveDelta;

    // Determine direction intent
    direction.current.z = Number(keys.current.w) - Number(keys.current.s);
    direction.current.x = Number(keys.current.d) - Number(keys.current.a);
    direction.current.normalize(); // Ensure diagonal isn't faster

    // Apply acceleration
    if (keys.current.w || keys.current.s) velocity.current.z -= direction.current.z * accel * effectiveDelta;
    if (keys.current.a || keys.current.d) velocity.current.x -= direction.current.x * accel * effectiveDelta;

    // Move camera
    controlsRef.current.moveRight(-velocity.current.x * effectiveDelta);
    controlsRef.current.moveForward(-velocity.current.z * effectiveDelta);

    // ─── AABB Mathematical Bounds System ───
    const cp = camera.position;
    cp.y = -42.1; // Strict Eye Level Enforcement (Made taller per request)

    // Outer Room Bounds: Local [-2.5, 2.5] on both axes, transformed to World [-2.5, 2.5] / [-27.5, -22.5]
    if (cp.x < -2.3) cp.x = -2.3;
    if (cp.x > 2.3) cp.x = 2.3;
    if (cp.z > -22.8) cp.z = -22.8;
    if (cp.z < -27.2) cp.z = -27.2;

    const playerRadius = 0.3;

    /**
     * Resolves collision with an AABB box by pushing the player out along the shortest path.
     * @param cx Box Center X (World)
     * @param cz Box Center Z (World)
     * @param wx Box Width
     * @param wz Box Depth
     */
    const handleBox = (cx: number, cz: number, wx: number, wz: number) => {
      const minX = cx - wx / 2 - playerRadius;
      const maxX = cx + wx / 2 + playerRadius;
      const minZ = cz - wz / 2 - playerRadius;
      const maxZ = cz + wz / 2 + playerRadius;
      
      if (cp.x > minX && cp.x < maxX && cp.z > minZ && cp.z < maxZ) {
        const dl = cp.x - minX;
        const dr = maxX - cp.x;
        const dt = cp.z - minZ;
        const db = maxZ - cp.z;
        const minHit = Math.min(dl, dr, dt, db);
        if (minHit === dl) cp.x = minX;
        else if (minHit === dr) cp.x = maxX;
        else if (minHit === dt) cp.z = minZ;
        else if (minHit === db) cp.z = maxZ;
      }
    };

    // 1. Map Table Base: Local [0, 0] => World [0, -25], size roughly [1.2, 1.2] (pedestal is 0.8, table is 1.0)
    handleBox(0, -25, 1.1, 1.1); 
    
    // 2. Desk: Local [-1.9, -1.9] => World [-1.9, -26.9], size [1.3, 0.8]
    handleBox(-1.9, -26.9, 1.3, 0.8);
    
    // 3. Bed: Local [-2.0, 1.5] => World [-2.0, -23.5], size [1.0, 1.9]
    handleBox(-2.0, -23.5, 1.0, 1.9);

    // 4. Stove: Local [2.1, 2.1] => World [2.1, -22.9], size [0.8, 0.8]
    handleBox(2.1, -22.9, 0.8, 0.8);
    
    // 5. Kitchen Counter: Local [2.0, -0.6] => World [2.0, -25.6], size [1.0, 3.2]
    handleBox(2.0, -25.6, 1.0, 3.2);
  });

  return (
    <group>
      <PointerLockControls 
        ref={controlsRef} 
        pointerSpeed={1.5}
        onLock={() => setIsExploreMode(true)}
        onUnlock={() => {
          setIsExploreMode(false);
          if (onUnlock) onUnlock();
        }} 
      />

      {!isExploreMode && showButton && (
        <Html center position={[-1.0, -42.4, -24.5]}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              controlsRef.current?.lock();
            }}
            style={{
              position: 'absolute',
              top: '-50vh',
              left: '-50vw',
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: opacity,
              transform: `translateY(${opacity === 1 ? '0px' : '10px'})`,
              transition: 'all 1s ease-out'
            }}
          >
            <span 
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#EAE2D6',
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: '1px',
                textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap'
              }}
            >
              Click anywhere to explore
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
