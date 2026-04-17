import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Firewatch-inspired landscape with stylized low-poly aesthetics.
 * Warm amber palette, flat-shaded geometry, layered depth.
 */

// ─── FIREWATCH PALETTE ───
const C = {
  ground: '#C4A265',
  groundDark: '#8B7340',
  dirt: '#A67B5B',
  rock: '#7A6B5D',
  rockLight: '#9E8E7E',
  rockDark: '#5C4D3E',
  treeDark: '#2D4A2A',
  treeMid: '#3D6B35',
  treeLight: '#5A8A4F',
  trunk: '#5C4033',
  trunkLight: '#7A5A43',
  grass: '#B8A050',
  grassGreen: '#6B8A3A',
  mtFar: '#C49A78',
  mtMid: '#9A7A62',
  mtNear: '#7A6050',
  water: '#4A7B8A',
  waterDeep: '#3A6070',
  towerDist: '#6B5545',
};

// ─── STYLIZED PINE TREE (multi-layer, randomized, flat shaded) ───
const PineTree = ({ position, scale = 1, color = C.treeMid, variation = 0 }: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  variation?: number;
}) => {
  const layers = 4 + Math.floor(variation * 2);
  const trunkH = (1.2 + variation * 0.5) * scale;
  const lean = (variation - 0.5) * 0.08;

  return (
    <group position={position} rotation={[lean, variation * Math.PI * 2, 0]}>
      {/* Trunk — slightly tapered cylinder */}
      <mesh position={[0, trunkH / 2, 0]}>
        <cylinderGeometry args={[0.06 * scale, 0.14 * scale, trunkH, 5]} />
        <meshStandardMaterial color={variation > 0.5 ? C.trunkLight : C.trunk} roughness={1} flatShading />
      </mesh>
      {/* Foliage — stacked cones with size variation */}
      {Array.from({ length: layers }).map((_, i) => {
        const t = i / layers;
        const y = trunkH + i * (0.9 * scale);
        const r = (2.0 - t * 1.2 + (variation - 0.5) * 0.3) * scale;
        const h = (2.0 - t * 0.4) * scale;
        const shade = i % 2 === 0 ? color :
          (color === C.treeMid ? C.treeLight :
           color === C.treeDark ? C.treeMid : C.treeMid);
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[0, i * 0.5, 0]}>
            <coneGeometry args={[r, h, 6 + Math.floor(variation * 3)]} />
            <meshStandardMaterial color={shade} roughness={0.9} flatShading />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── ROCK (icosahedron with noise displacement) ───
const Rock = ({ position, scale = 1, color = C.rock }: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(scale, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const noise = 1 + (Math.sin(x * 5) * Math.cos(z * 3) * 0.15);
      // Flatten the bottom
      const yScale = y < 0 ? 0.3 : 1;
      pos.setXYZ(i, x * noise, y * yScale * noise, z * noise);
    }
    g.computeVertexNormals();
    return g;
  }, [scale]);

  return (
    <mesh position={position} geometry={geo}
      rotation={[Math.random() * 0.4, Math.random() * Math.PI, 0]}>
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  );
};

// ─── MOUNTAIN (custom geometry ridge shape) ───
const Mountain = ({ position, width, height, depth, color }: {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color: string;
}) => {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(width, height, 8, 3);
    const pos = g.attributes.position;
    // Displace vertices for a natural ridge shape
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // More displacement at higher points for jagged peaks
      const heightFrac = (y + height / 2) / height;
      const noise = Math.sin(x * 2.5 + z * 1.5) * 0.15 * heightFrac * width;
      const zNoise = Math.cos(x * 1.8 + z * 3) * 0.1 * heightFrac * depth;
      // Stretch in z for depth
      pos.setXYZ(i, x + noise, y, z * (depth / width) + zNoise);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height, depth]);

  return (
    <mesh position={position} geometry={geo}>
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  );
};

// ─── LAKE ───
const Lake = ({ position, size }: {
  position: [number, number, number];
  size: [number, number];
}) => {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.4) * 0.04;
    }
  });

  return (
    <group>
      <mesh ref={waterRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0], size[1], 1]}>
        <circleGeometry args={[1, 24]} />
        <meshStandardMaterial color={C.water} transparent opacity={0.65} roughness={0.05} metalness={0.4} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.2, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0] + 0.5, size[1] + 0.5, 1]}>
        <circleGeometry args={[1, 24]} />
        <meshStandardMaterial color={C.waterDeep} roughness={0.9} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0] + 1.5, size[1] + 1.5, 1]}>
        <ringGeometry args={[0.8, 1, 24]} />
        <meshStandardMaterial color={C.groundDark} roughness={0.95} />
      </mesh>
    </group>
  );
};

// ─── DISTANT TOWER ───
const DistantTower = ({ position }: { position: [number, number, number] }) => (
  <group position={position} scale={[0.8, 0.8, 0.8]}>
    {[[-0.5, 0, -0.5], [0.5, 0, -0.5], [0.5, 0, 0.5], [-0.5, 0, 0.5]].map(([x, , z], i) => (
      <mesh key={i} position={[x, 3, z]}>
        <boxGeometry args={[0.12, 6, 0.12]} />
        <meshStandardMaterial color={C.towerDist} roughness={1} flatShading />
      </mesh>
    ))}
    <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0.7]}>
      <boxGeometry args={[0.06, 4, 0.06]} />
      <meshStandardMaterial color={C.towerDist} roughness={1} />
    </mesh>
    <mesh position={[0, 6.3, 0]}>
      <boxGeometry args={[1.6, 1, 1.6]} />
      <meshStandardMaterial color={C.towerDist} roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0, 7.3, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[1.3, 0.8, 4]} />
      <meshStandardMaterial color={C.rockDark} roughness={1} flatShading />
    </mesh>
  </group>
);

// ─── GROUND TERRAIN (displaced plane for natural look) ───
const Terrain = () => {
  const geo = useMemo(() => {
    const size = 200;
    const g = new THREE.PlaneGeometry(size, size, 60, 60);
    const pos = g.attributes.position;
    const half = size / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      // Rolling hills
      const hill = Math.sin(x * 0.08) * Math.cos(y * 0.06) * 1.5
        + Math.sin(x * 0.15 + y * 0.1) * 0.8
        + Math.cos(x * 0.04 - y * 0.05) * 2;
      // Tower hilltop
      const distFromCenter = Math.sqrt(x * x + y * y);
      const hilltop = Math.max(0, 4 - distFromCenter * 0.35);
      // Drop edges down so they disappear into fog
      const edgeDist = Math.max(Math.abs(x), Math.abs(y));
      const edgeFade = Math.max(0, (edgeDist - half * 0.6) / (half * 0.4));
      const edgeDrop = -edgeFade * edgeFade * 15;
      pos.setZ(i, hill + hilltop + edgeDrop);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color={C.ground} roughness={1} flatShading />
    </mesh>
  );
};

// ─── MAIN LANDSCAPE ───
const Landscape = () => {
  const seed = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

  const trees = useMemo(() => {
    const result: { pos: [number, number, number]; scale: number; color: string; v: number }[] = [];
    const clusters = [
      { cx: -15, cz: 5, count: 14, r: 10, color: C.treeMid },
      { cx: 15, cz: 8, count: 12, r: 9, color: C.treeLight },
      { cx: -8, cz: -15, count: 10, r: 7, color: C.treeDark },
      { cx: 10, cz: -12, count: 8, r: 6, color: C.treeMid },
      { cx: 0, cz: 20, count: 16, r: 12, color: C.treeDark },
      { cx: -22, cz: 15, count: 12, r: 9, color: C.treeDark },
      { cx: 22, cz: -5, count: 10, r: 8, color: C.treeLight },
      // Distant tree lines
      { cx: -30, cz: 28, count: 18, r: 14, color: C.treeDark },
      { cx: 28, cz: 30, count: 15, r: 12, color: C.treeDark },
    ];

    clusters.forEach((c, ci) => {
      for (let i = 0; i < c.count; i++) {
        const ang = seed(ci * 100 + i) * Math.PI * 2;
        const dist = seed(ci * 100 + i + 50) * c.r;
        const x = c.cx + Math.cos(ang) * dist;
        const z = c.cz + Math.sin(ang) * dist;
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
        const s = 0.5 + seed(ci * 100 + i + 25) * 0.9;
        result.push({ pos: [x, 0, z], scale: s, color: c.color, v: seed(ci * 100 + i + 75) });
      }
    });
    return result;
  }, []);

  const rocks = useMemo(() => [
    { pos: [5, 0.5, -4] as [number, number, number], s: 1.2, c: C.rockLight },
    { pos: [-6, 0.6, -3] as [number, number, number], s: 1.5, c: C.rock },
    { pos: [8, 0.4, 3] as [number, number, number], s: 0.9, c: C.rockDark },
    { pos: [-4, 0.3, 7] as [number, number, number], s: 0.8, c: C.rock },
    { pos: [12, 0.5, -8] as [number, number, number], s: 1.0, c: C.rockLight },
    { pos: [-10, 0.7, 5] as [number, number, number], s: 1.3, c: C.rockDark },
    { pos: [3, 0.3, 12] as [number, number, number], s: 0.7, c: C.rock },
    { pos: [-7, 0.4, -10] as [number, number, number], s: 1.0, c: C.rockLight },
    { pos: [15, 0.8, 6] as [number, number, number], s: 1.5, c: C.rock },
    { pos: [-14, 0.6, -6] as [number, number, number], s: 1.1, c: C.rockDark },
    { pos: [4, 1.2, -6] as [number, number, number], s: 2.0, c: C.rockLight },
    { pos: [-5, 1.4, -5] as [number, number, number], s: 2.5, c: C.rock },
  ], []);

  return (
    <group>
      {/* Displaced terrain */}
      <Terrain />

      {/* ===== MOUNTAIN RANGES (layered with noise displacement) ===== */}
      {/* Far range — warmest / haziest */}
      {[
        { x: -50, h: 30, w: 22, d: 15 },
        { x: -20, h: 38, w: 18, d: 12 },
        { x: 10, h: 28, w: 20, d: 14 },
        { x: 40, h: 35, w: 22, d: 16 },
        { x: 65, h: 25, w: 18, d: 12 },
      ].map((m, i) => (
        <Mountain key={`mf-${i}`} position={[m.x, m.h / 2, 75]} width={m.w} height={m.h} depth={m.d} color={C.mtFar} />
      ))}

      {/* Mid range */}
      {[
        { x: -40, h: 24, w: 16, d: 10 },
        { x: -10, h: 30, w: 14, d: 9 },
        { x: 20, h: 22, w: 18, d: 11 },
        { x: 50, h: 28, w: 15, d: 10 },
      ].map((m, i) => (
        <Mountain key={`mm-${i}`} position={[m.x, m.h / 2, 55]} width={m.w} height={m.h} depth={m.d} color={C.mtMid} />
      ))}

      {/* Near range */}
      {[
        { x: -35, h: 18, w: 12, d: 8 },
        { x: -5, h: 22, w: 10, d: 7 },
        { x: 25, h: 16, w: 14, d: 9 },
        { x: 50, h: 20, w: 12, d: 8 },
      ].map((m, i) => (
        <Mountain key={`mn-${i}`} position={[m.x, m.h / 2, 40]} width={m.w} height={m.h} depth={m.d} color={C.mtNear} />
      ))}

      {/* Side mountains — surround on ALL sides to hide edges */}
      <Mountain position={[-55, 12, 10]} width={18} height={24} depth={12} color={C.mtFar} />
      <Mountain position={[55, 10, 5]} width={16} height={20} depth={10} color={C.mtFar} />
      <Mountain position={[-60, 10, -15]} width={20} height={20} depth={14} color={C.mtMid} />
      <Mountain position={[60, 8, -10]} width={18} height={16} depth={12} color={C.mtMid} />
      {/* Behind camera — close the ring */}
      <Mountain position={[-30, 12, -40]} width={22} height={24} depth={16} color={C.mtFar} />
      <Mountain position={[0, 15, -50]} width={25} height={30} depth={18} color={C.mtFar} />
      <Mountain position={[30, 10, -40]} width={20} height={20} depth={14} color={C.mtFar} />
      <Mountain position={[-55, 8, -30]} width={18} height={16} depth={12} color={C.mtMid} />
      <Mountain position={[55, 9, -25]} width={16} height={18} depth={10} color={C.mtMid} />

      {/* ===== WATER ===== */}
      <Lake position={[18, 0.05, 15]} size={[7, 4.5]} />
      <Lake position={[-18, 0.05, 12]} size={[3, 2.5]} />

      {/* ===== DISTANT TOWER ===== */}
      <DistantTower position={[32, 0, 42]} />

      {/* ===== TREES ===== */}
      {trees.map((t, i) => (
        <PineTree key={`t-${i}`} position={t.pos} scale={t.scale} color={t.color} variation={t.v} />
      ))}

      {/* ===== ROCKS ===== */}
      {rocks.map((r, i) => (
        <Rock key={`r-${i}`} position={r.pos} scale={r.s} color={r.c} />
      ))}
    </group>
  );
};

export default Landscape;
