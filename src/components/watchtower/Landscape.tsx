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

// ─── LAKE (organic shape with noise-displaced edges) ───
const makeOrganicCircle = (radius: number, segments: number, seed: number) => {
  const g = new THREE.CircleGeometry(radius, segments);
  const pos = g.attributes.position;
  for (let i = 1; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const angle = Math.atan2(y, x);
    const dist = Math.sqrt(x * x + y * y);
    const noise = 1 + Math.sin(angle * 3 + seed) * 0.12
      + Math.cos(angle * 5 + seed * 2) * 0.08
      + Math.sin(angle * 7 + seed * 0.5) * 0.05;
    pos.setXY(i, x / dist * dist * noise, y / dist * dist * noise);
  }
  g.computeVertexNormals();
  return g;
};

const Lake = ({ position, size, seed = 42 }: {
  position: [number, number, number];
  size: [number, number];
  seed?: number;
}) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const waterGeo = useMemo(() => makeOrganicCircle(1, 32, seed), [seed]);
  const bedGeo = useMemo(() => makeOrganicCircle(1, 32, seed + 5), [seed]);
  const shoreGeo = useMemo(() => {
    const g = new THREE.RingGeometry(0.78, 1, 32);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const angle = Math.atan2(y, x);
      const dist = Math.sqrt(x * x + y * y);
      const noise = 1 + Math.sin(angle * 3 + seed) * 0.1 + Math.cos(angle * 5 + seed) * 0.06;
      pos.setXY(i, x / dist * dist * noise, y / dist * dist * noise);
    }
    return g;
  }, [seed]);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.4) * 0.04;
    }
  });

  return (
    <group>
      <mesh ref={waterRef} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0], size[1], 1]} geometry={waterGeo}>
        <meshStandardMaterial color={C.water} transparent opacity={0.65} roughness={0.05} metalness={0.4} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.2, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0] + 0.5, size[1] + 0.5, 1]} geometry={bedGeo}>
        <meshStandardMaterial color={C.waterDeep} roughness={0.9} />
      </mesh>
      <mesh position={[position[0], position[1] - 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[size[0] + 1.5, size[1] + 1.5, 1]} geometry={shoreGeo}>
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

// ─── MOUNTAIN CLOUD WISPS (multi-blob, animated drift) ───
const cloudData = [
  { pos: [-25, 10, 62], s: 4, speed: 0.12 },
  { pos: [20, 12, 68], s: 3.5, speed: 0.08 },
  { pos: [-10, 8, 48], s: 3, speed: 0.15 },
  { pos: [40, 11, 56], s: 3.5, speed: 0.1 },
  { pos: [-42, 9, 50], s: 3, speed: 0.13 },
  { pos: [10, 7, 44], s: 2.5, speed: 0.11 },
];

const CloudWisp = ({ position, scale, speed }: {
  position: [number, number, number];
  scale: number;
  speed: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + Math.sin(clock.elapsedTime * speed) * 3;
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.7 + 1) * 0.5;
    }
  });

  const mat = <meshStandardMaterial color="#EDE0D4" transparent opacity={0.3} roughness={1} depthWrite={false} />;

  return (
    <group ref={groupRef} position={position}>
      {/* Center blob */}
      <mesh scale={[scale * 1.8, scale * 0.6, scale]}>
        <sphereGeometry args={[1, 8, 6]} />
        {mat}
      </mesh>
      {/* Left puff */}
      <mesh position={[-scale * 1.2, -scale * 0.1, scale * 0.3]} scale={[scale * 1.2, scale * 0.5, scale * 0.8]}>
        <sphereGeometry args={[1, 7, 5]} />
        {mat}
      </mesh>
      {/* Right puff */}
      <mesh position={[scale * 1.4, scale * 0.1, -scale * 0.2]} scale={[scale * 1.3, scale * 0.45, scale * 0.9]}>
        <sphereGeometry args={[1, 7, 5]} />
        {mat}
      </mesh>
      {/* Top wisp */}
      <mesh position={[scale * 0.3, scale * 0.35, 0]} scale={[scale * 0.9, scale * 0.35, scale * 0.7]}>
        <sphereGeometry args={[1, 6, 5]} />
        {mat}
      </mesh>
    </group>
  );
};

const MountainClouds = () => (
  <group>
    {cloudData.map((c, i) => (
      <CloudWisp
        key={`mcw-${i}`}
        position={c.pos as [number, number, number]}
        scale={c.s}
        speed={c.speed}
      />
    ))}
  </group>
);

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

    // Lake positions for exclusion zones
    const lakes = [
      { x: 20, z: 25, r: 8 },
      { x: -15, z: 20, r: 5 },
    ];

    clusters.forEach((c, ci) => {
      for (let i = 0; i < c.count; i++) {
        const ang = seed(ci * 100 + i) * Math.PI * 2;
        const dist = seed(ci * 100 + i + 50) * c.r;
        const x = c.cx + Math.cos(ang) * dist;
        const z = c.cz + Math.sin(ang) * dist;
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
        // Skip trees in lake zones
        if (lakes.some(l => Math.sqrt((x - l.x) ** 2 + (z - l.z) ** 2) < l.r)) continue;
        // Skip trees that would clip into mountain zones
        if (z > 35 || Math.abs(x) > 45) continue;
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

      {/* ===== MOUNTAIN RANGES (reduced heights to stay below cloud floor) ===== */}
      {/* Far range — warmest / haziest */}
      {[
        { x: -50, h: 18, w: 22, d: 15 },
        { x: -20, h: 22, w: 18, d: 12 },
        { x: 10, h: 16, w: 20, d: 14 },
        { x: 40, h: 20, w: 22, d: 16 },
        { x: 65, h: 15, w: 18, d: 12 },
      ].map((m, i) => (
        <Mountain key={`mf-${i}`} position={[m.x, m.h / 2, 75]} width={m.w} height={m.h} depth={m.d} color={C.mtFar} />
      ))}

      {/* Mid range */}
      {[
        { x: -40, h: 14, w: 16, d: 10 },
        { x: -10, h: 18, w: 14, d: 9 },
        { x: 20, h: 13, w: 18, d: 11 },
        { x: 50, h: 16, w: 15, d: 10 },
      ].map((m, i) => (
        <Mountain key={`mm-${i}`} position={[m.x, m.h / 2, 55]} width={m.w} height={m.h} depth={m.d} color={C.mtMid} />
      ))}

      {/* Near range */}
      {[
        { x: -35, h: 10, w: 12, d: 8 },
        { x: -5, h: 14, w: 10, d: 7 },
        { x: 25, h: 10, w: 14, d: 9 },
        { x: 50, h: 12, w: 12, d: 8 },
      ].map((m, i) => (
        <Mountain key={`mn-${i}`} position={[m.x, m.h / 2, 40]} width={m.w} height={m.h} depth={m.d} color={C.mtNear} />
      ))}

      {/* Side mountains — surround on ALL sides to hide edges */}
      <Mountain position={[-55, 8, 10]} width={18} height={16} depth={12} color={C.mtFar} />
      <Mountain position={[55, 7, 5]} width={16} height={14} depth={10} color={C.mtFar} />
      <Mountain position={[-60, 7, -15]} width={20} height={14} depth={14} color={C.mtMid} />
      <Mountain position={[60, 6, -10]} width={18} height={12} depth={12} color={C.mtMid} />
      {/* Behind camera — close the ring */}
      <Mountain position={[-30, 8, -40]} width={22} height={16} depth={16} color={C.mtFar} />
      <Mountain position={[0, 10, -50]} width={25} height={20} depth={18} color={C.mtFar} />
      <Mountain position={[30, 7, -40]} width={20} height={14} depth={14} color={C.mtFar} />
      <Mountain position={[-55, 6, -30]} width={18} height={12} depth={12} color={C.mtMid} />
      <Mountain position={[55, 6, -25]} width={16} height={12} depth={10} color={C.mtMid} />

      {/* ===== WATER ===== */}
      {/* Main lake — nestled near mountains */}
      <Lake position={[20, 0.15, 25]} size={[7, 5]} seed={42} />
      {/* Small pond — left side near hills */}
      <Lake position={[-15, 0.15, 20]} size={[3.5, 2.5]} seed={77} />

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

      {/* ===== MOUNTAIN CLOUD WISPS (animated multi-blob) ===== */}
      <MountainClouds />
    </group>
  );
};

export default Landscape;
