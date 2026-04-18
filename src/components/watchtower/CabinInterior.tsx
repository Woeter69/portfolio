import * as THREE from 'three';
import React, { useState, useEffect } from 'react';

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
  plank: '#3d2314', // dark brown wooden boards
  plankAlt: '#351c0e', // slightly different dark brown
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
const FireFinder = ({ y }: { y: number }) => {
  const [mapTex, setMapTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Attempt to load 'map.png' or 'map.jpg', safely handling color encoding
    const loader = new THREE.TextureLoader();

    const applyColorSpace = (t: THREE.Texture) => {
      if ('colorSpace' in t) t.colorSpace = (THREE as any).SRGBColorSpace;
      else if ('encoding' in t) (t as any).encoding = 3001; // THREE.sRGBEncoding fallback
      t.needsUpdate = true;
      return t;
    };

    loader.load('/map.png', (tex) => {
      setMapTex(applyColorSpace(tex));
    }, undefined, () => {
      loader.load('/map.jpg', (tex2) => {
        setMapTex(applyColorSpace(tex2));
      }, undefined, () => {
        // Silently fail if map image isn't available
      });
    });
  }, []);

  return (
    <group position={[0, y, 0]}>
      {/* Detailed Pedestal base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
        <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
        <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
      </mesh>
      {/* Map table top */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.0, 0.08, 1.0]} />
        <meshStandardMaterial color={I.midWood} roughness={0.85} flatShading />
      </mesh>

      {/* Map circle (green topographic base or actual custom map image) */}
      <mesh position={[0, 1.091, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        {mapTex ? (
          <meshBasicMaterial map={mapTex} />
        ) : (
          <meshStandardMaterial color={I.mapGreen} roughness={0.7} />
        )}
      </mesh>

      {/* Map rim / metal casing */}
      <mesh position={[0, 1.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.46, 32]} />
        <meshStandardMaterial color={I.mapRim} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Outer glass cover (Fix: removed incorrect 90-degree rotation) */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
        <meshStandardMaterial color={I.white} transparent opacity={0.15} roughness={0.1} />
      </mesh>

      {/* Compass Pivot Mechanism */}
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.05, 12]} />
        <meshStandardMaterial color={I.metalDark} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Sighting Arm (Alidade) */}
      <group position={[0, 1.18, 0]} rotation={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.85, 0.02, 0.03]} />
          <meshStandardMaterial color={I.metalDark} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Sighting vanes (upright tabs on the ends) */}
        <mesh position={[-0.4, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, 0.04]} />
          <meshStandardMaterial color={I.metal} metalness={0.6} />
        </mesh>
        <mesh position={[0.4, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.08, 0.04]} />
          <meshStandardMaterial color={I.metal} metalness={0.6} />
        </mesh>
      </group>

      {/* Brass Plaque on front */}
      <mesh position={[0, 0.85, -0.31]}>
        <boxGeometry args={[0.25, 0.15, 0.02]} />
        <meshStandardMaterial color="#B08D57" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ─── DESK + CHAIR + TYPEWRITER + LAMP ───
const DeskArea = ({ y }: { y: number }) => (
  // Omitted changes, kept same code as original! 
  // For brevity while making the massive edit.
  <group position={[-1.9, y, -1.9]}>
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

    {/* Books and scattered papers on desk */}
    <mesh position={[-0.4, 0.75, 0.2]} rotation={[0, 0.2, 0]}>
      <boxGeometry args={[0.25, 0.05, 0.35]} />
      <meshStandardMaterial color="#5C3A21" roughness={0.9} />
    </mesh>
    <mesh position={[-0.45, 0.80, 0.15]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.22, 0.04, 0.3]} />
      <meshStandardMaterial color="#2B463C" roughness={0.9} />
    </mesh>
    <mesh position={[0.4, 0.746, 0.1]} rotation={[0, 0.5, 0]}>
      <planeGeometry args={[0.25, 0.3]} />
      <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0.35, 0.747, 0.15]} rotation={[0, -0.2, 0]}>
      <planeGeometry args={[0.25, 0.3]} />
      <meshStandardMaterial color="#F5F5DC" side={THREE.DoubleSide} />
    </mesh>

    {/* Coffee Mug */}
    <group position={[0.45, 0.745, -0.15]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
        <meshStandardMaterial color="#D84B20" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.005, 12]} />
        <meshStandardMaterial color="#3B2516" roughness={1.0} /> {/* Coffee inside */}
      </mesh>
      <mesh position={[0.04, 0.06, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.03, 0.008, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#D84B20" roughness={0.6} />
      </mesh>
    </group>

    {/* Typewriter - Massive Detail Upgrade */}
    <group position={[0.05, 0.75, -0.05]}>
      {/* Main body curved styling */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.38, 0.12, 0.32]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      {/* Upper chassis */}
      <mesh position={[0, 0.14, -0.08]}>
        <boxGeometry args={[0.34, 0.08, 0.16]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      {/* Keyboard Slant (Front face) */}
      <mesh position={[0, 0.05, 0.18]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.32, 0.05, 0.14]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      {/* Keyboard Step Rows (Stylized low-poly keys) */}
      {[-0.04, 0.0, 0.04, 0.08].map((z, row) => (
        <mesh key={`keyrow-${row}`} position={[0, 0.07 + (3 - row) * 0.01, 0.12 + z]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.26, 0.015, 0.025]} />
          <meshStandardMaterial color={row === 0 ? "#333" : I.white} roughness={0.6} />
        </mesh>
      ))}

      {/* Paper guide/Platen base */}
      <mesh position={[0, 0.18, -0.08]}>
        <boxGeometry args={[0.42, 0.05, 0.05]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      {/* Roller (Platen) */}
      <mesh position={[0, 0.21, -0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 16]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Platen Knobs */}
      <mesh position={[-0.22, 0.21, -0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.03, 12]} />
        <meshStandardMaterial color={I.metal} />
      </mesh>
      <mesh position={[0.22, 0.21, -0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.03, 12]} />
        <meshStandardMaterial color={I.metal} />
      </mesh>
      {/* Carriage Return Lever */}
      <mesh position={[-0.18, 0.23, -0.08]} rotation={[0.2, 0.2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshStandardMaterial color={I.metal} metalness={0.7} />
      </mesh>
      {/* Curved Paper */}
      <mesh position={[0, 0.28, -0.06]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.22, 16, 1, true, Math.PI, Math.PI / 4]} />
        <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
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
    <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
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
      {/* Back slats */}
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
  // Bed stretched along Z axis to look like a proper bed
  <group position={[-2.0, y, 1.5]}>
    {/* Bed frame */}
    <mesh position={[0, 0.32, 0]}>
      <boxGeometry args={[0.9, 0.08, 1.8]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
    </mesh>
    {/* Frame legs */}
    {[[-0.4, 0, -0.85], [0.4, 0, -0.85], [-0.4, 0, 0.85], [0.4, 0, 0.85]].map(([x, , z], i) => (
      <mesh key={`bl-${i}`} position={[x, 0.15, z]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color={I.darkWood} roughness={0.9} />
      </mesh>
    ))}
    {/* Headboard */}
    <mesh position={[0, 0.55, 0.88]}>
      <boxGeometry args={[0.9, 0.7, 0.04]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} flatShading />
    </mesh>
    {/* Mattress - Standard Height */}
    <mesh position={[0, 0.42, 0]}>
      <boxGeometry args={[0.84, 0.15, 1.74]} />
      <meshStandardMaterial color={I.bedSheet} roughness={0.95} />
    </mesh>
    {/* Pillows */}
    <mesh position={[-0.22, 0.52, 0.65]}>
      <boxGeometry args={[0.38, 0.08, 0.28]} />
      <meshStandardMaterial color={I.pillow} roughness={0.95} />
    </mesh>
    <mesh position={[0.22, 0.52, 0.65]}>
      <boxGeometry args={[0.38, 0.08, 0.28]} />
      <meshStandardMaterial color={I.pillow} roughness={0.95} />
    </mesh>
    {/* Blanket - draped over the lower half */}
    <mesh position={[0, 0.425, -0.3]}>
      <boxGeometry args={[0.86, 0.16, 1.0]} />
      <meshStandardMaterial color={I.rugDark} roughness={0.9} />
    </mesh>
    {/* Red blanket stripe */}
    <mesh position={[0, 0.43, -0.3]}>
      <boxGeometry args={[0.87, 0.17, 0.8]} />
      <meshStandardMaterial color={I.redBright} roughness={0.9} />
    </mesh>

    {/* Bedside Table */}
    <group position={[-0.45, 0, -1.05]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color={I.midWood} roughness={0.9} />
      </mesh>
      {/* Table Legs */}
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
        <mesh key={`nt-${i}`} position={[x, 0.2, z]}>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color={I.darkWood} roughness={0.9} />
        </mesh>
      ))}
      {/* Lantern / Oil Lamp on table */}
      <group position={[0, 0.45, 0]}>
        {/* Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.04, 12]} />
          <meshStandardMaterial color="#B08D57" metalness={0.8} />
        </mesh>
        {/* Glass globe */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.16, 12]} />
          <meshStandardMaterial color="#FFFAEE" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        {/* Top cap */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.04, 12]} />
          <meshStandardMaterial color="#B08D57" metalness={0.8} />
        </mesh>
        {/* Lantern Handle ring */}
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.06, 0.005, 4, 16]} />
          <meshStandardMaterial color={I.metalDark} />
        </mesh>
        {/* Tiny light inside the lantern */}
        <pointLight intensity={0.5} color="#FF9933" distance={2} decay={2} position={[0, 0.12, 0]} />
      </group>
    </group>

    {/* Highly detailed Rug - Braided circular style */}
    <group position={[-0.1, 0.02, -1.0]} rotation={[-Math.PI / 2, 0, 0.1]}>
      {[0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1].map((r, i) => (
        <mesh key={`rug-${i}`} position={[0, 0, i * 0.001]}>
          <circleGeometry args={[r, 32]} />
          <meshStandardMaterial color={i % 2 === 0 ? I.rugDark : I.rugRed} roughness={1.0} />
        </mesh>
      ))}
    </group>
  </group>
);

// ─── WOOD STOVE + CHIMNEY ───
const WoodStove = ({ y }: { y: number }) => (
  // Stove pushed tight against the X=2, Z=2 wall gap beside the counter
  <group position={[2.1, y, 2.1]}>
    {/* Stove base/ash-catcher */}
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[0.55, 0.1, 0.45]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.9} flatShading />
    </mesh>

    {/* Stack of Firewood next to the stove */}
    <group position={[-0.45, 0.1, 0.2]}>
      {/* Logs lying in a pile */}
      {[
        [0, 0, 0], [0.15, 0, 0], [0.07, 0.12, 0],
        [0, 0, 0.1], [0.15, 0, 0.1], [0.07, 0.12, 0.1],
        [-0.05, 0.22, 0.05], [0.12, 0.22, 0.05]
      ].map(([x, yy, z], i) => (
        <mesh key={`log-${i}`} position={[x, yy, z]} rotation={[Math.PI / 2, 0, 0.1 * i]}>
          <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#5C3A21" roughness={1.0} />
        </mesh>
      ))}
    </group>
    {/* Stove body */}
    <mesh position={[0, 0.4, 0]}>
      <boxGeometry args={[0.5, 0.4, 0.4]} />
      <meshStandardMaterial color={I.stove} roughness={0.8} flatShading />
    </mesh>
    {/* Stove legs */}
    {[[-0.2, 0, -0.15], [0.2, 0, -0.15], [-0.2, 0, 0.15], [0.2, 0, 0.15]].map(([x, , z], i) => (
      <mesh key={`sl-${i}`} position={[x, 0.05, z]}>
        <cylinderGeometry args={[0.025, 0.03, 0.1, 6]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
    ))}
    {/* Stove door with glass window showing crackling fire inside */}
    <group position={[-0.26, 0.4, 0]}>
      <mesh>
        <boxGeometry args={[0.02, 0.25, 0.25]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      {/* Glowing fire interior */}
      <mesh position={[0.015, 0, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.2]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF2200" emissiveIntensity={0.8} />
      </mesh>
      {/* Inner fire pointlight */}
      <pointLight position={[0.1, 0, 0]} intensity={1.5} color="#FF6600" distance={2} />
    </group>
    {/* Door grill lines (Texture) */}
    {[-0.05, 0, 0.05].map(z => (
      <mesh key={`grill-${z}`} position={[-0.27, 0.4, z]}>
        <boxGeometry args={[0.01, 0.15, 0.02]} />
        <meshStandardMaterial color={I.stovePipe} roughness={0.6} />
      </mesh>
    ))}
    {/* Door handle */}
    <mesh position={[-0.28, 0.4, -0.08]}>
      <boxGeometry args={[0.015, 0.015, 0.06]} />
      <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
    </mesh>
    {/* Stove top surface */}
    <mesh position={[0, 0.61, 0]}>
      <boxGeometry args={[0.52, 0.02, 0.42]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} metalness={0.3} />
    </mesh>
    {/* Air vents on side */}
    {[0.3, 0.4, 0.5].map(yy => (
      <mesh key={`vent-${yy}`} position={[0, yy, 0.21]}>
        <boxGeometry args={[0.2, 0.02, 0.01]} />
        <meshStandardMaterial color={I.stovePipe} roughness={0.9} />
      </mesh>
    ))}

    {/* Chimney pipe going up through ceiling */}
    <mesh position={[0.1, 1.8, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 2.4, 8]} />
      <meshStandardMaterial color={I.stovePipe} roughness={0.6} />
    </mesh>
    {/* 90-degree elbow (horizontal section) */}
    <mesh position={[0.05, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
      <meshStandardMaterial color={I.stovePipe} roughness={0.6} />
    </mesh>
  </group>
);

// ─── KITCHEN COUNTER + STOVETOP ───
const KitchenCounter = ({ y }: { y: number }) => (
  // Counter along the right wall. The gap between Z=1.2 and Z=2 is for the stove.
  <group position={[2.1, y, -0.2]}>
    {/* Counter body (long, along right wall) */}
    <mesh position={[0, 0.42, 0]}>
      <boxGeometry args={[0.6, 0.84, 2.6]} />
      <meshStandardMaterial color={I.counter} roughness={0.85} flatShading />
    </mesh>
    {/* Countertop */}
    <mesh position={[0, 0.85, 0]}>
      <boxGeometry args={[0.65, 0.04, 2.7]} />
      <meshStandardMaterial color={I.counterTop} roughness={0.7} />
    </mesh>

    {/* Overhead Cabinets (Hang over) */}
    <group position={[0.1, 2.2, 0]}>
      <mesh>
        <boxGeometry args={[0.4, 0.6, 2.6]} />
        <meshStandardMaterial color={I.counter} roughness={0.9} flatShading />
      </mesh>
      {/* Cabinet doors with indent detailing */}
      {[-0.9, -0.3, 0.3, 0.9].map((z, i) => (
        <group key={`oh-cab-${i}`}>
          <mesh position={[-0.21, 0, z]}>
            <boxGeometry args={[0.02, 0.55, 0.55]} />
            <meshStandardMaterial color={I.cream} roughness={0.8} />
          </mesh>
          <mesh position={[-0.22, 0, z]}>
            <boxGeometry args={[0.01, 0.45, 0.45]} />
            <meshStandardMaterial color={I.counter} roughness={0.9} />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.23, -0.2, z + (i % 2 === 0 ? 0.2 : -0.2)]}>
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color={I.metal} metalness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Hanging Hooks & Mugs underneath the counter */}
      {[-0.8, -0.5, -0.2].map(z => (
        <group key={`hook-${z}`} position={[-0.1, -0.32, z]}>
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.05, 4]} />
            <meshStandardMaterial color={I.metalDark} />
          </mesh>
          {/* Hanging Mug */}
          <mesh position={[0, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
            <meshStandardMaterial color="#6B8E5A" roughness={0.4} />
          </mesh>
        </group>
      ))}
      <pointLight position={[-0.1, -0.3, 0]} intensity={0.5} color="#FFEAC0" distance={3} />
    </group>

    {/* Oven built into the counter */}
    <group position={[-0.31, 0.35, -0.65]}>
      <mesh>
        <boxGeometry args={[0.02, 0.45, 0.5]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      {/* Oven window */}
      <mesh position={[-0.012, -0.05, 0]}>
        <planeGeometry args={[0.3, 0.45]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>
      {/* Oven Handle */}
      <mesh position={[-0.02, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>

    {/* Drawer fronts (remaining spaces) */}
    {[-1.0, 0.2, 0.7].map((z, i) => (
      <group key={`drawer-${i}`}>
        <mesh position={[-0.31, 0.65, z]}>
          <boxGeometry args={[0.01, 0.2, 0.4]} />
          <meshStandardMaterial color={I.cream} roughness={0.8} />
        </mesh>
        <mesh position={[-0.33, 0.65, z]}>
          <boxGeometry args={[0.02, 0.02, 0.08]} />
          <meshStandardMaterial color={I.metal} metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    ))}

    {/* Lower cabinet doors */}
    {[-1.0, 0.2, 0.7].map((z, i) => (
      <mesh key={`cab-${i}`} position={[-0.31, 0.25, z]}>
        <boxGeometry args={[0.01, 0.45, 0.4]} />
        <meshStandardMaterial color={I.cream} roughness={0.85} />
      </mesh>
    ))}

    {/* Black built-in electric stovetop base beneath the burners */}
    <mesh position={[0.075, 0.875, -0.65]}>
      <boxGeometry args={[0.35, 0.015, 0.5]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.4} metalness={0.2} />
    </mesh>

    {/* Stovetop burners */}
    {[[0, 0.89, -0.8], [0.15, 0.89, -0.8], [0, 0.89, -0.5], [0.15, 0.89, -0.5]].map(([x, yy, z], i) => (
      <mesh key={`burn-${i}`} position={[x, yy, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshStandardMaterial color={I.redBright} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    ))}

    {/* Prominent Sink Basin */}
    <group position={[0, 0.86, 0.6]}>
      {/* Sink Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.2, 16]} />
        <meshStandardMaterial color={I.metal} side={THREE.DoubleSide} />
      </mesh>
      {/* Sink Basin */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color={I.metalDark} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0.1, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.05, 0.18, 0]} rotation={[0, 0, 1.0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Stack of Ceramic Plates on Counter */}
      <group position={[0.1, 0.04, -0.3]}>
        {[0, 0.015, 0.03, 0.045].map((yy) => (
          <mesh key={`plate-${yy}`} position={[0, yy, 0]}>
            <cylinderGeometry args={[0.12, 0.08, 0.01, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* Wooden Cutting Board with Kitchen Knife */}
      <group position={[0, 0.02, 0.35]}>
        <mesh>
          <boxGeometry args={[0.25, 0.02, 0.35]} />
          <meshStandardMaterial color="#C4A265" roughness={0.9} />
        </mesh>
        {/* Knife blade */}
        <mesh position={[0.05, 0.02, 0]} rotation={[0, 0.3, -Math.PI / 2]}>
          <boxGeometry args={[0.002, 0.12, 0.03]} />
          <meshStandardMaterial color={I.metal} metalness={0.8} />
        </mesh>
        {/* Knife handle */}
        <mesh position={[0, 0.02, 0.08]} rotation={[0, 0.3, -Math.PI / 2]}>
          <boxGeometry args={[0.015, 0.08, 0.02]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </group>

    {/* Water Storing Can (Jerry Can) by the sink */}
    <group position={[-0.1, 1.0, 0.9]}>
      <mesh>
        <boxGeometry args={[0.15, 0.25, 0.25]} />
        <meshStandardMaterial color="#2E5A88" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
    </group>

    {/* Cast Iron Frying Pan on front burner */}
    <group position={[-0.05, 0.89, -0.45]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, 0.03, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>

    {/* Stylish Kettle on back stovetop */}
    <group position={[-0.05, 0.89, -0.8]}>
      {/* Tapered body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.1, 16]} />
        <meshStandardMaterial color={I.kettle} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Kettle Lid */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.02, 16]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      {/* Nice Cone Spout */}
      <mesh position={[0.06, 0.04, 0]} rotation={[0, 0, -1.0]}>
        <cylinderGeometry args={[0.008, 0.015, 0.06, 8]} />
        <meshStandardMaterial color={I.kettle} roughness={0.5} />
      </mesh>
      {/* Clean D-shaped Handle */}
      <mesh position={[-0.05, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.01]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
      <mesh position={[-0.02, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.015, 0.01]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.5} />
      </mesh>
    </group>
  </group>
);

// ─── MINI REFRIGERATOR ("SAFE CASE") ───
const MiniFridge = ({ y }: { y: number }) => (
  // Fridge beside the desk
  <group position={[2.0, y, -2.1]}>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.5, 0.7, 0.45]} />
      <meshStandardMaterial color={I.fridge} roughness={0.8} flatShading />
    </mesh>
    {/* Door line */}
    <mesh position={[0, 0.35, -0.23]}>
      <boxGeometry args={[0.45, 0.65, 0.01]} />
      <meshStandardMaterial color={I.cream} roughness={0.8} />
    </mesh>
    {/* Handle */}
    <mesh position={[-0.15, 0.45, -0.24]}>
      <boxGeometry args={[0.02, 0.15, 0.02]} />
      <meshStandardMaterial color={I.metal} metalness={0.4} roughness={0.5} />
    </mesh>
  </group>
);

// ─── FIRE EXTINGUISHER ───
const FireExtinguisher = ({ y }: { y: number }) => (
  // Moved closer to the stove area/corner
  <group position={[2.2, y, 0.7]}>
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
  // Moved out from in front of the door, tucked near the desk/fridge
  <group position={[-2.2, y, -0.5]}>
    {/* Bin body */}
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
  // Clock placed prominently above the door so the player easily spots it when looking around
  <group position={[0, y + 2.4, -2.45]}>
    {/* Clock body rotated correctly to not intersect hands/walls! */}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.03, 24]} />
      <meshStandardMaterial color={I.metalDark} roughness={0.5} />
    </mesh>
    {/* Clock face */}
    <mesh position={[0, 0, 0.02]}>
      <circleGeometry args={[0.17, 24]} />
      <meshStandardMaterial color={I.white} />
    </mesh>
    {/* Hour hand */}
    <mesh position={[0, 0.04, 0.025]} rotation={[0, 0, -0.8]}>
      <boxGeometry args={[0.015, 0.1, 0.01]} />
      <meshStandardMaterial color={I.stove} />
    </mesh>
    {/* Minute hand */}
    <mesh position={[0, -0.01, 0.03]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.01, 0.14, 0.01]} />
      <meshStandardMaterial color={I.stove} />
    </mesh>
  </group>
);

// ─── POSTERS & CORKBOARD ───
const Posters = ({ y }: { y: number }) => (
  // Mounted on the right window/wall gap
  <group>
    {/* Large Corkboard (pulled further from wall to prevent glitching) */}
    <mesh position={[-2.42, y + 1.8, 1.4]}>
      <boxGeometry args={[0.02, 0.8, 1.2]} />
      <meshStandardMaterial color="#B08D57" roughness={0.9} />
    </mesh>
    {/* Corkboard Wood Frame */}
    <mesh position={[-2.41, y + 1.8, 1.4]}>
      <boxGeometry args={[0.04, 0.84, 1.24]} />
      <meshStandardMaterial color={I.darkWood} roughness={0.9} />
    </mesh>
    {/* Corkboard interior masking to create the framed look */}
    <mesh position={[-2.39, y + 1.8, 1.4]}>
      <boxGeometry args={[0.02, 0.78, 1.18]} />
      <meshStandardMaterial color="#9F784B" roughness={1.0} />
    </mesh>

    {/* Posters pinned to the corkboard */}
    <mesh position={[-2.378, y + 1.9, 1.6]} rotation={[0, Math.PI / 2, -0.05]}>
      <planeGeometry args={[0.3, 0.4]} />
      <meshStandardMaterial color={I.poster} side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
    {/* Red Pushpin */}
    <mesh position={[-2.373, y + 2.08, 1.6]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.006, 0.006, 0.015, 6]} />
      <meshStandardMaterial color={I.redBright} />
    </mesh>

    <mesh position={[-2.378, y + 1.65, 1.2]} rotation={[0, Math.PI / 2, 0.1]}>
      <planeGeometry args={[0.4, 0.25]} />
      <meshStandardMaterial color={I.posterAlt} side={THREE.DoubleSide} roughness={0.9} />
    </mesh>

    <mesh position={[-2.378, y + 1.95, 1.1]} rotation={[0, Math.PI / 2, -0.15]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshStandardMaterial color="#F0E068" side={THREE.DoubleSide} roughness={0.9} /> {/* Post-it */}
    </mesh>

    {/* Calendar on the other wall */}
    <mesh position={[-0.6, y + 1.8, 2.45]}>
      <planeGeometry args={[0.35, 0.45]} />
      <meshStandardMaterial color={I.white} roughness={0.85} side={THREE.DoubleSide} />
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
    <pointLight position={[-1.9, y + 1.2, -1.9]} intensity={0.3} color="#FFC060" distance={3} decay={2} />

    {/* Floor planking */}
    <FloorPlanking y={y} size={size} />

    {/* Furniture pieces */}
    <FireFinder y={y} />
    <DeskArea y={y} />
    <BedArea y={y} />
    <WoodStove y={y} />
    <KitchenCounter y={y} />
    <MiniFridge y={y} />
    <FireExtinguisher y={y} />
    <Dustbin y={y} />
    <WallClock y={y} />
    <Posters y={y} />
  </group>
);

export default CabinInterior;
