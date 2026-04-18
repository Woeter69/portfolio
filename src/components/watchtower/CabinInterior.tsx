import * as THREE from 'three';

/**
 * Firewatch-style cabin interior — all procedural geometry.
 * Positioned relative to cabin floor (y=0 is floor level).
 * Cabin is 4×4 units, so x/z range from -2 to +2.
 * Front wall (door): z = -2, Back wall: z = +2
 */

// ─── INTERIOR PALETTE ───
const I = {
  darkWood: '#6B4226',
  midWood: '#8B6914',
  lightWood: '#C4A265',
  cream: '#EAE2D6',
  plank: '#8B6F4E',
  plankAlt: '#7A5F3E',
  stove: '#2A2A2A',
  stovePipe: '#3A3A3A',
  metal: '#8A8A8A',
  metalDark: '#555555',
  red: '#8B2500',
  redBright: '#CC3333',
  green: '#6B8E5A',
  mapGreen: '#B8C49A',
  mapRim: '#8A8A90',
  white: '#F0EDE8',
  bedSheet: '#E8E0D0',
  pillow: '#D4C8B0',
  rugRed: '#8B3A3A',
  rugDark: '#5C2A2A',
  lamp: '#C89040',
  lampShade: '#E8C878',
  typewriter: '#4A6A5A',
  poster: '#E8D8C0',
  posterAlt: '#D0C8B8',
  fridge: '#D8D0C0',
  dustbin: '#7A7068',
  kettle: '#5A7A6A',
  counter: '#E0D5C5',
  counterTop: '#A8B898',
  burner: '#333333',
};

// ─── FIRE FINDER (center pedestal with compass map) ───
const FireFinder = ({ y }: { y: number }) => (
  <group position={[0, y, 0.2]}>
    {/* Pedestal box */}
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[0.7, 1.0, 0.7]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
    </mesh>
    {/* Map table top */}
    <mesh position={[0, 1.05, 0]}>
      <boxGeometry args={[0.9, 0.06, 0.9]} />
      <meshStandardMaterial color={I.midWood} roughness={0.85} flatShading />
    </mesh>
    {/* Map circle (green topographic map) */}
    <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.38, 24]} />
      <meshStandardMaterial color={I.mapGreen} roughness={0.7} />
    </mesh>
    {/* Map rim */}
    <mesh position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.36, 0.4, 24]} />
      <meshStandardMaterial color={I.mapRim} metalness={0.3} roughness={0.4} />
    </mesh>
    {/* Compass arm */}
    <mesh position={[0, 1.13, 0]} rotation={[0, 0.4, 0]}>
      <boxGeometry args={[0.75, 0.02, 0.015]} />
      <meshStandardMaterial color={I.metalDark} metalness={0.5} roughness={0.3} />
    </mesh>
    {/* Compass pivot */}
    <mesh position={[0, 1.14, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
      <meshStandardMaterial color={I.metalDark} metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Sign/label on front */}
    <mesh position={[0, 0.5, -0.36]}>
      <planeGeometry args={[0.35, 0.3]} />
      <meshStandardMaterial color="#C4A020" roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── DESK + CHAIR + TYPEWRITER + LAMP ───
const DeskArea = ({ y }: { y: number }) => (
  <group position={[-1.2, y, -1.2]}>
    {/* Desk surface */}
    <mesh position={[0, 0.72, 0]}>
      <boxGeometry args={[1.1, 0.05, 0.6]} />
      <meshStandardMaterial color={I.lightWood} roughness={0.85} flatShading />
    </mesh>
    {/* Desk legs */}
    {[[-0.5, 0, -0.25], [0.5, 0, -0.25], [-0.5, 0, 0.25], [0.5, 0, 0.25]].map(([x, , z], i) => (
      <mesh key={`dl-${i}`} position={[x, 0.36, z]}>
        <boxGeometry args={[0.05, 0.72, 0.05]} />
        <meshStandardMaterial color={I.midWood} roughness={0.9} flatShading />
      </mesh>
    ))}
    {/* Desk drawer front */}
    <mesh position={[0, 0.58, -0.28]}>
      <boxGeometry args={[0.8, 0.12, 0.02]} />
      <meshStandardMaterial color={I.midWood} roughness={0.85} />
    </mesh>
    {/* Drawer handle */}
    <mesh position={[0, 0.58, -0.3]}>
      <boxGeometry args={[0.15, 0.02, 0.02]} />
      <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.4} />
    </mesh>

    {/* Typewriter */}
    <group position={[0.15, 0.75, 0]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.3]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} flatShading />
      </mesh>
      {/* Paper guide */}
      <mesh position={[0, 0.15, -0.08]}>
        <boxGeometry args={[0.35, 0.1, 0.02]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      {/* Paper */}
      <mesh position={[0, 0.2, -0.06]}>
        <planeGeometry args={[0.22, 0.15]} />
        <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
      </mesh>
      {/* Roller */}
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.36, 6]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
    </group>

    {/* Desk Lamp */}
    <group position={[-0.35, 0.75, 0.1]}>
      {/* Base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 8]} />
        <meshStandardMaterial color={I.lamp} roughness={0.7} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.05, 0.18, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 5]} />
        <meshStandardMaterial color={I.lamp} roughness={0.6} />
      </mesh>
      {/* Shade */}
      <mesh position={[0.1, 0.32, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.1, 8, 1, true]} />
        <meshStandardMaterial color={I.redBright} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>

    {/* Chair */}
    <group position={[0, 0, 0.55]}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color={I.cream} roughness={0.85} flatShading />
      </mesh>
      {/* Chair legs */}
      {[[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]].map(([x, , z], i) => (
        <mesh key={`cl-${i}`} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 5]} />
          <meshStandardMaterial color={I.cream} roughness={0.8} />
        </mesh>
      ))}
      {/* Back */}
      <mesh position={[0, 0.65, -0.18]}>
        <boxGeometry args={[0.36, 0.5, 0.03]} />
        <meshStandardMaterial color={I.cream} roughness={0.85} flatShading />
      </mesh>
      {/* Back slats (2 horizontal) */}
      {[0.55, 0.75].map((yy, i) => (
        <mesh key={`bs-${i}`} position={[0, yy, -0.16]}>
          <boxGeometry args={[0.3, 0.06, 0.015]} />
          <meshStandardMaterial color={I.cream} roughness={0.8} />
        </mesh>
      ))}
    </group>
  </group>
);

// ─── BED + PILLOW + RUG ───
const BedArea = ({ y }: { y: number }) => (
  <group position={[-1.3, y, 1.2]}>
    {/* Bed frame */}
    <mesh position={[0, 0.22, 0]}>
      <boxGeometry args={[1.0, 0.08, 0.7]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
    </mesh>
    {/* Frame legs */}
    {[[-0.45, 0, -0.3], [0.45, 0, -0.3], [-0.45, 0, 0.3], [0.45, 0, 0.3]].map(([x, , z], i) => (
      <mesh key={`bl-${i}`} position={[x, 0.1, z]}>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
        <meshStandardMaterial color={I.darkWood} roughness={0.9} />
      </mesh>
    ))}
    {/* Headboard */}
    <mesh position={[0, 0.45, 0.32]}>
      <boxGeometry args={[1.0, 0.5, 0.04]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
    </mesh>
    {/* Mattress */}
    <mesh position={[0, 0.3, -0.02]}>
      <boxGeometry args={[0.9, 0.1, 0.6]} />
      <meshStandardMaterial color={I.bedSheet} roughness={0.95} />
    </mesh>
    {/* Pillow */}
    <mesh position={[0, 0.38, 0.2]}>
      <boxGeometry args={[0.5, 0.08, 0.2]} />
      <meshStandardMaterial color={I.pillow} roughness={0.95} />
    </mesh>
    {/* Blanket fold */}
    <mesh position={[0, 0.34, -0.2]}>
      <boxGeometry args={[0.85, 0.06, 0.25]} />
      <meshStandardMaterial color={I.cream} roughness={0.9} />
    </mesh>

    {/* Rug (below bed, extending out) */}
    <mesh position={[0.1, 0.02, -0.5]} rotation={[-Math.PI / 2, 0, 0.1]}>
      <planeGeometry args={[1.2, 0.8]} />
      <meshStandardMaterial color={I.rugRed} roughness={1} side={THREE.DoubleSide} />
    </mesh>
    {/* Rug border */}
    <mesh position={[0.1, 0.025, -0.5]} rotation={[-Math.PI / 2, 0, 0.1]}>
      <ringGeometry args={[0.55, 0.6, 4]} />
      <meshStandardMaterial color={I.rugDark} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── WOOD STOVE + CHIMNEY ───
const WoodStove = ({ y }: { y: number }) => (
  <group position={[0.8, y, 1.2]}>
    {/* Stove body */}
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.4]} />
      <meshStandardMaterial color={I.stove} roughness={0.8} flatShading />
    </mesh>
    {/* Stove legs */}
    {[[-0.2, 0, -0.15], [0.2, 0, -0.15], [-0.2, 0, 0.15], [0.2, 0, 0.15]].map(([x, , z], i) => (
      <mesh key={`sl-${i}`} position={[x, 0.06, z]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 6]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
    ))}
    {/* Stove door */}
    <mesh position={[0, 0.32, -0.21]}>
      <boxGeometry args={[0.25, 0.2, 0.02]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.6} />
    </mesh>
    {/* Door handle */}
    <mesh position={[0.08, 0.32, -0.23]}>
      <boxGeometry args={[0.06, 0.015, 0.015]} />
      <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
    </mesh>
    {/* Stove top surface */}
    <mesh position={[0, 0.61, 0]}>
      <boxGeometry args={[0.52, 0.02, 0.42]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} metalness={0.3} />
    </mesh>

    {/* Chimney pipe going up through ceiling */}
    <mesh position={[0, 1.8, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
      <meshStandardMaterial color={I.stovePipe} roughness={0.6} />
    </mesh>
    {/* 90-degree elbow (horizontal section) */}
    <mesh position={[0, 0.7, 0.05]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
      <meshStandardMaterial color={I.stovePipe} roughness={0.6} />
    </mesh>
  </group>
);

// ─── KITCHEN COUNTER + STOVETOP ───
const KitchenCounter = ({ y }: { y: number }) => (
  <group position={[1.6, y, 0]}>
    {/* Counter body (long, along right wall) */}
    <mesh position={[0, 0.42, 0]}>
      <boxGeometry args={[0.6, 0.84, 2.4]} />
      <meshStandardMaterial color={I.counter} roughness={0.85} flatShading />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 0.85, 0]}>
      <boxGeometry args={[0.65, 0.04, 2.5]} />
      <meshStandardMaterial color={I.counterTop} roughness={0.7} />
    </mesh>

    {/* Drawer fronts */}
    {[-0.8, -0.3, 0.2, 0.7].map((z, i) => (
      <group key={`drawer-${i}`}>
        <mesh position={[-0.31, 0.55, z]}>
          <boxGeometry args={[0.01, 0.2, 0.4]} />
          <meshStandardMaterial color={I.cream} roughness={0.8} />
        </mesh>
        {/* Drawer handle */}
        <mesh position={[-0.33, 0.55, z]}>
          <boxGeometry args={[0.02, 0.02, 0.08]} />
          <meshStandardMaterial color={I.metal} metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    ))}

    {/* Cabinet doors (lower) */}
    {[-0.6, 0, 0.6].map((z, i) => (
      <mesh key={`cab-${i}`} position={[-0.31, 0.22, z]}>
        <boxGeometry args={[0.01, 0.35, 0.5]} />
        <meshStandardMaterial color={I.cream} roughness={0.85} />
      </mesh>
    ))}

    {/* Stovetop burners (top, back section) */}
    {[[0, 0.88, -0.8], [0.15, 0.88, -0.8], [0, 0.88, -0.55], [0.15, 0.88, -0.55]].map(([x, yy, z], i) => (
      <mesh key={`burn-${i}`} position={[x, yy, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshStandardMaterial color={I.burner} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    ))}

    {/* Sink (simple depression) */}
    <mesh position={[0, 0.84, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.08, 0.12, 8]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
    {/* Faucet */}
    <mesh position={[0.02, 0.95, 0.6]}>
      <cylinderGeometry args={[0.01, 0.01, 0.12, 5]} />
      <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
    </mesh>
    <mesh position={[0.02, 1.0, 0.55]} rotation={[0.5, 0, 0]}>
      <cylinderGeometry args={[0.008, 0.008, 0.1, 5]} />
      <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
    </mesh>

    {/* Kettle on stovetop */}
    <group position={[-0.05, 0.88, -0.65]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 8]} />
        <meshStandardMaterial color={I.kettle} roughness={0.6} flatShading />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.06, 0.02, 8]} />
        <meshStandardMaterial color={I.kettle} roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.04, 0.006, 4, 12, Math.PI]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
      {/* Spout */}
      <mesh position={[0.07, 0.1, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.01, 0.015, 0.06, 5]} />
        <meshStandardMaterial color={I.kettle} roughness={0.6} />
      </mesh>
    </group>
  </group>
);

// ─── MINI REFRIGERATOR ───
const MiniFridge = ({ y }: { y: number }) => (
  <group position={[1.5, y, -1.3]}>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.5, 0.7, 0.45]} />
      <meshStandardMaterial color={I.fridge} roughness={0.8} flatShading />
    </mesh>
    {/* Door line */}
    <mesh position={[-0.26, 0.35, 0]}>
      <boxGeometry args={[0.01, 0.6, 0.4]} />
      <meshStandardMaterial color={I.cream} roughness={0.8} />
    </mesh>
    {/* Handle */}
    <mesh position={[-0.27, 0.45, -0.12]}>
      <boxGeometry args={[0.02, 0.15, 0.02]} />
      <meshStandardMaterial color={I.metal} metalness={0.4} roughness={0.5} />
    </mesh>
  </group>
);

// ─── FIRE EXTINGUISHER ───
const FireExtinguisher = ({ y }: { y: number }) => (
  <group position={[1.2, y, -0.8]}>
    {/* Body */}
    <mesh position={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
      <meshStandardMaterial color={I.redBright} roughness={0.7} flatShading />
    </mesh>
    {/* Top valve */}
    <mesh position={[0, 0.38, 0]}>
      <cylinderGeometry args={[0.02, 0.04, 0.05, 6]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} />
    </mesh>
    {/* Handle */}
    <mesh position={[0.04, 0.38, 0]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.06, 0.015, 0.015]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} />
    </mesh>
  </group>
);

// ─── DUSTBIN ───
const Dustbin = ({ y }: { y: number }) => (
  <group position={[0.5, y, -1.5]}>
    {/* Bin body (slightly tapered) */}
    <mesh position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.12, 0.1, 0.3, 6]} />
      <meshStandardMaterial color={I.dustbin} roughness={0.9} flatShading />
    </mesh>
    {/* Bin rim */}
    <mesh position={[0, 0.305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.1, 0.125, 6]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── WALL CLOCK ───
const WallClock = ({ y }: { y: number }) => (
  <group position={[-1.95, y + 2.2, 0.5]}>
    {/* Clock body */}
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.03, 16]} />
      <meshStandardMaterial color={I.cream} roughness={0.7} />
    </mesh>
    {/* Clock face */}
    <mesh position={[-0.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <circleGeometry args={[0.13, 16]} />
      <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
    </mesh>
    {/* Hour hand */}
    <mesh position={[-0.025, 0.03, 0]} rotation={[0, -Math.PI / 2, 0.4]}>
      <planeGeometry args={[0.01, 0.07]} />
      <meshStandardMaterial color={I.stove} side={THREE.DoubleSide} />
    </mesh>
    {/* Minute hand */}
    <mesh position={[-0.025, -0.01, 0.02]} rotation={[0, -Math.PI / 2, -0.8]}>
      <planeGeometry args={[0.008, 0.1]} />
      <meshStandardMaterial color={I.stove} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── POSTERS ON WINDOWS/WALLS ───
const Posters = ({ y }: { y: number }) => (
  <group>
    {/* Poster 1 — on back wall glass (left) */}
    <mesh position={[-0.6, y + 1.8, 1.93]}>
      <planeGeometry args={[0.35, 0.45]} />
      <meshStandardMaterial color={I.poster} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
    {/* Poster 2 — on back wall glass (right of poster 1) */}
    <mesh position={[-0.15, y + 1.85, 1.93]}>
      <planeGeometry args={[0.28, 0.35]} />
      <meshStandardMaterial color={I.posterAlt} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
    {/* Calendar — on left wall */}
    <mesh position={[-1.93, y + 1.9, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.25, 0.3]} />
      <meshStandardMaterial color={I.white} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
    {/* Small note — near door */}
    <mesh position={[0.8, y + 1.7, -1.93]}>
      <planeGeometry args={[0.15, 0.15]} />
      <meshStandardMaterial color="#F0E068" roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

// ─── FLOOR PLANKING ───
const FloorPlanking = ({ y, size }: { y: number; size: number }) => {
  const plankCount = 12;
  const plankWidth = size / plankCount;
  return (
    <group>
      {Array.from({ length: plankCount }).map((_, i) => {
        const z = -size / 2 + plankWidth / 2 + i * plankWidth;
        const isAlt = i % 2 === 0;
        return (
          <mesh key={`plank-${i}`} position={[0, y + 0.01, z]}>
            <boxGeometry args={[size - 0.1, 0.04, plankWidth - 0.01]} />
            <meshStandardMaterial
              color={isAlt ? I.plank : I.plankAlt}
              roughness={0.95}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── MAIN INTERIOR COMPONENT ───
interface CabinInteriorProps {
  y: number;     // floor y-position (cabinY)
  size: number;  // cabin size (4)
}

const CabinInterior = ({ y, size }: CabinInteriorProps) => (
  <group>
    {/* Warm interior lighting */}
    <pointLight position={[0, y + 2.5, 0]} intensity={0.8} color="#FFD090" distance={6} decay={2} />
    <pointLight position={[-1.2, y + 1.2, -1.2]} intensity={0.3} color="#FFC060" distance={3} decay={2} />

    {/* Floor planking (replaces flat floor) */}
    <FloorPlanking y={y} size={size} />

    {/* Fire Finder — center of room */}
    <FireFinder y={y} />

    {/* Desk area — front-left corner near door */}
    <DeskArea y={y} />

    {/* Bed — back-left corner */}
    <BedArea y={y} />

    {/* Wood stove — back-right area */}
    <WoodStove y={y} />

    {/* Kitchen counter — along right wall */}
    <KitchenCounter y={y} />

    {/* Mini fridge — front-right, near kitchen */}
    <MiniFridge y={y} />

    {/* Fire extinguisher — near stove */}
    <FireExtinguisher y={y} />

    {/* Dustbin — near front wall */}
    <Dustbin y={y} />

    {/* Wall clock — left wall */}
    <WallClock y={y} />

    {/* Posters */}
    <Posters y={y} />
  </group>
);

export default CabinInterior;
