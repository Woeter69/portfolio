import { useRef } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural Firewatch-style watchtower built with Three.js primitives.
 * Stylized low-poly aesthetic with warm wood tones.
 * 
 * Structure:
 * - 4 angled support legs with cross braces
 * - Zigzag staircase
 * - Platform/deck at the top
 * - Cabin with large windows
 * - Pyramid roof with overhang
 * - Animated door
 */

// Wood material presets
const WOOD_DARK = '#6B4226';
const WOOD_MID = '#8B5E3C';
const WOOD_LIGHT = '#A67B5B';
const WOOD_PLANK = '#9B7653';
const ROOF_COLOR = '#5C4033';
const GLASS_COLOR = '#87CEEB';
const METAL_COLOR = '#707070';

const WatchtowerModel = () => {
  const doorRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const towerHeight = 12;
  const cabinY = towerHeight;
  const cabinSize = 4;

  // Animate door based on scroll
  useFrame(() => {
    if (!doorRef.current) return;
    const doorProgress = data.range(0.55, 0.15);
    doorRef.current.rotation.y = -doorProgress * Math.PI * 0.5;
  });

  return (
    <group>
      {/* ===== SUPPORT LEGS ===== */}
      <Legs height={towerHeight} spread={3.5} />

      {/* ===== CROSS BRACES ===== */}
      <CrossBraces height={towerHeight} spread={3.5} />

      {/* ===== STAIRCASE ===== */}
      <Staircase height={towerHeight} />

      {/* ===== PLATFORM / DECK ===== */}
      <Platform y={cabinY} size={cabinSize + 1.5} />

      {/* ===== RAILING ===== */}
      <Railing y={cabinY} size={cabinSize + 1.5} />

      {/* ===== CABIN ===== */}
      <Cabin y={cabinY + 0.1} size={cabinSize} doorRef={doorRef} />

      {/* ===== ROOF ===== */}
      <Roof y={cabinY + 3.2} size={cabinSize + 1.2} />
    </group>
  );
};

// ─── LEGS ───
const Legs = ({ height, spread }: { height: number; spread: number }) => {
  const legPositions: [number, number][] = [
    [-1, -1], [1, -1], [1, 1], [-1, 1]
  ];
  return (
    <group>
      {legPositions.map(([x, z], i) => {
        const topX = x * (spread * 0.45);
        const topZ = z * (spread * 0.45);
        const bottomX = x * spread;
        const bottomZ = z * spread;
        const dx = topX - bottomX;
        const dz = topZ - bottomZ;
        const len = Math.sqrt(dx * dx + height * height + dz * dz);
        const angle = Math.atan2(Math.sqrt(dx * dx + dz * dz), height);
        const rotY = Math.atan2(dx, dz);
        return (
          <mesh
            key={i}
            position={[(topX + bottomX) / 2, height / 2, (topZ + bottomZ) / 2]}
            rotation={[angle, rotY, 0]}
          >
            <boxGeometry args={[0.2, len, 0.2]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── CROSS BRACES ───
const CrossBraces = ({ height, spread }: { height: number; spread: number }) => {
  const levels = 4;
  const braces: JSX.Element[] = [];

  for (let level = 0; level < levels; level++) {
    const y = (level + 0.5) * (height / levels);
    const t = y / height;
    const s = spread * (1 - t * 0.55);

    // Horizontal braces on each side
    const sides: [number, number, number, number, number][] = [
      [-s, y, -s, s, 0],   // front
      [-s, y, s, s, 0],    // back
      [-s, y, -s, 0, s * 2], // left
      [s, y, -s, 0, s * 2],  // right
    ];

    sides.forEach(([x, yy, z, dx, dz], i) => {
      braces.push(
        <mesh key={`brace-${level}-${i}`} position={[x + dx / 2, yy, z + dz / 2]}>
          <boxGeometry args={[dx !== 0 ? s * 2 : 0.1, 0.1, dz !== 0 ? s * 2 : 0.1]} />
          <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
        </mesh>
      );
    });
  }

  return <group>{braces}</group>;
};

// ─── STAIRCASE ───
const Staircase = ({ height }: { height: number }) => {
  const steps: JSX.Element[] = [];
  const numSteps = 20;
  const stepHeight = height / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const y = i * stepHeight;
    const t = y / height;
    const offset = 3.5 * (1 - t * 0.55);
    const side = i % 8 < 4 ? 1 : -1;
    const progress = (i % 4) / 4;

    steps.push(
      <mesh
        key={`step-${i}`}
        position={[side * offset + side * 0.3, y + 0.05, -offset + progress * offset * 2]}
      >
        <boxGeometry args={[0.8, 0.08, 0.25]} />
        <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
      </mesh>
    );
  }

  // Stair rails
  const rails: JSX.Element[] = [];
  for (let i = 0; i < height; i += 0.5) {
    const t = i / height;
    const offset = 3.5 * (1 - t * 0.55);
    rails.push(
      <mesh key={`rail-${i}`} position={[offset + 0.7, i, 0]}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color={METAL_COLOR} roughness={0.6} metalness={0.3} />
      </mesh>
    );
  }

  return <group>{steps}{rails}</group>;
};

// ─── PLATFORM ───
const Platform = ({ y, size }: { y: number; size: number }) => {
  return (
    <group position={[0, y, 0]}>
      {/* Main deck */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size, 0.15, size]} />
        <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
      </mesh>
      {/* Deck planking detail */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-size / 2 + 0.3 + i * (size / 8), 0.08, 0]}>
          <boxGeometry args={[0.02, 0.01, size]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

// ─── RAILING ───
const Railing = ({ y, size }: { y: number; size: number }) => {
  const railHeight = 1;
  const half = size / 2;
  const posts: JSX.Element[] = [];
  const rails: JSX.Element[] = [];

  // Corner posts
  const corners: [number, number][] = [
    [-half, -half], [half, -half], [half, half], [-half, half]
  ];

  corners.forEach(([x, z], i) => {
    posts.push(
      <mesh key={`post-${i}`} position={[x, y + railHeight / 2, z]}>
        <boxGeometry args={[0.12, railHeight, 0.12]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
    );
  });

  // Top rails (skip front-left section for stairs access)
  const railSegments: [number, number, number, number, number, number][] = [
    [-half, y + railHeight, -half, size, 0.08, 0.08],  // front
    [-half, y + railHeight, half, size, 0.08, 0.08],   // back
    [-half, y + railHeight, -half, 0.08, 0.08, size],  // left
    [half, y + railHeight, -half, 0.08, 0.08, size],   // right
  ];

  railSegments.forEach(([x, ry, z, sx, sy, sz], i) => {
    rails.push(
      <mesh key={`rail-${i}`} position={[x + sx / 2, ry, z + sz / 2]}>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial color={WOOD_MID} roughness={0.85} />
      </mesh>
    );
  });

  return <group>{posts}{rails}</group>;
};

// ─── CABIN ───
const Cabin = ({ y, size, doorRef }: { y: number; size: number; doorRef: React.RefObject<THREE.Group | null> }) => {
  const wallHeight = 3;
  const half = size / 2;
  const wallThickness = 0.12;
  const windowHeight = 1.6;
  const windowY = y + 1.2;

  return (
    <group>
      {/* ── Back Wall ── */}
      <mesh position={[0, y + wallHeight / 2, half]}>
        <boxGeometry args={[size, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>

      {/* ── Left Wall (lower + upper with window gap) ── */}
      {/* Lower */}
      <mesh position={[-half, y + 0.4, 0]}>
        <boxGeometry args={[wallThickness, 0.8, size]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      {/* Upper */}
      <mesh position={[-half, y + wallHeight - 0.3, 0]}>
        <boxGeometry args={[wallThickness, 0.6, size]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      {/* Window glass */}
      <mesh position={[-half - 0.01, windowY, 0]}>
        <planeGeometry args={[size, windowHeight]} />
        <meshStandardMaterial
          color={GLASS_COLOR}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Window frames */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`lwf-${i}`} position={[-half, windowY, -size / 2 + (i + 0.5) * (size / 4)]}>
          <boxGeometry args={[wallThickness + 0.02, windowHeight, 0.06]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
        </mesh>
      ))}

      {/* ── Right Wall (same as left) ── */}
      <mesh position={[half, y + 0.4, 0]}>
        <boxGeometry args={[wallThickness, 0.8, size]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      <mesh position={[half, y + wallHeight - 0.3, 0]}>
        <boxGeometry args={[wallThickness, 0.6, size]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      <mesh position={[half + 0.01, windowY, 0]}>
        <planeGeometry args={[size, windowHeight]} />
        <meshStandardMaterial
          color={GLASS_COLOR}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`rwf-${i}`} position={[half, windowY, -size / 2 + (i + 0.5) * (size / 4)]}>
          <boxGeometry args={[wallThickness + 0.02, windowHeight, 0.06]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
        </mesh>
      ))}

      {/* ── Front Wall (with door hole) ── */}
      {/* Left of door */}
      <mesh position={[-half / 2 - 0.3, y + wallHeight / 2, -half]}>
        <boxGeometry args={[size / 2 - 0.7, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      {/* Right of door */}
      <mesh position={[half / 2 + 0.3, y + wallHeight / 2, -half]}>
        <boxGeometry args={[size / 2 - 0.7, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>
      {/* Above door */}
      <mesh position={[0, y + 2.6, -half]}>
        <boxGeometry args={[1.2, 0.8, wallThickness]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>

      {/* ── Door (animated) ── */}
      <group ref={doorRef} position={[-0.5, y, -half]}>
        <mesh position={[0.5, 1.1, 0]}>
          <boxGeometry args={[1, 2.2, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
        {/* Door handle */}
        <mesh position={[0.85, 1.1, -0.06]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Door planking detail */}
        {[0.3, 0.5, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 1.1, -0.045]}>
            <boxGeometry args={[0.02, 2.1, 0.01]} />
            <meshStandardMaterial color={WOOD_MID} roughness={1} />
          </mesh>
        ))}
      </group>

      {/* ── Floor ── */}
      <mesh position={[0, y + 0.01, 0]}>
        <boxGeometry args={[size - 0.2, 0.05, size - 0.2]} />
        <meshStandardMaterial color={WOOD_PLANK} roughness={0.95} />
      </mesh>
    </group>
  );
};

// ─── ROOF ───
const Roof = ({ y, size }: { y: number; size: number }) => {
  const half = size / 2;
  const roofHeight = 2;

  return (
    <group position={[0, y, 0]}>
      {/* Pyramid roof using a cone */}
      <mesh position={[0, roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[half * 1.5, roofHeight, 4]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={0.9} />
      </mesh>
      {/* Roof edge trim */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size + 0.3, 0.1, size + 0.3]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </mesh>
    </group>
  );
};

export default WatchtowerModel;
