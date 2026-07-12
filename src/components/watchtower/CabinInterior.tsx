import * as THREE from 'three';
import { useState, useEffect, useRef, useMemo } from 'react';
import TypewriterTerminal from './TypewriterTerminal';

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
  <group position={[-1.9, y, -2.15]}>
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
    {/* Books and scattered papers on desk */}
    <mesh position={[-0.4, 0.795, 0.2]} rotation={[0, 0.2, 0]}>
      <boxGeometry args={[0.25, 0.05, 0.35]} />
      <meshStandardMaterial color="#5C3A21" roughness={0.9} />
    </mesh>
    <mesh position={[-0.45, 0.84, 0.15]} rotation={[0, -0.1, 0]}>
      <boxGeometry args={[0.22, 0.04, 0.3]} />
      <meshStandardMaterial color="#2B463C" roughness={0.9} />
    </mesh>
    {/* Shifted papers securely toward desk center to eliminate diagonal 'cardboard' edge-bleed over the desk rim */}
    <mesh position={[0.25, 0.771, 0.05]} rotation={[-Math.PI / 2, 0, 0.5]}>
      <planeGeometry args={[0.25, 0.3]} />
      <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0.2, 0.772, 0.1]} rotation={[-Math.PI / 2, 0, -0.2]}>
      <planeGeometry args={[0.25, 0.3]} />
      <meshStandardMaterial color="#F5F5DC" side={THREE.DoubleSide} />
    </mesh>

    {/* Coffee Mug */}
    <group position={[0.45, 0.77, -0.15]}>
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

    {/* Typewriter - Massive Interactive Detail Upgrade */}
    <TypewriterTerminal position={[0.05, 0.77, -0.05]} palette={I} />

    {/* Desk Lamp - Formally snapped inward onto the table plane to prevent external wall-clipping */}
    <group position={[-0.45, 0.77, -0.15]} rotation={[0, 0.5, 0]}>
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
      {/* Light Bulb / Glow */}
      <pointLight position={[0.1, 0.26, 0]} distance={1.5} intensity={0.8} color="#FFD1A3" decay={2} />
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

    {/* Bedside Table - Shifted inward to prevent lantern wall-clipping */}
    <group position={[-0.3, 0, -1.05]}>
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

    {/* Stack of Firewood next to the stove - Pulled forward and left to clear both the stove chassis and the exterior wall */}
    <group position={[-0.55, 0.1, -0.05]}>
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
    <group position={[-0.31, 0.35, -0.45]}>
      <mesh>
        <boxGeometry args={[0.02, 0.45, 0.5]} />
        <meshStandardMaterial color={I.metalDark} roughness={0.6} />
      </mesh>
      {/* Oven window flush against door face */}
      <mesh position={[-0.012, -0.03, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.34, 0.26]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>
      {/* Oven Handle */}
      <mesh position={[-0.028, 0.14, 0]}>
        <boxGeometry args={[0.018, 0.018, 0.38]} />
        <meshStandardMaterial color={I.metal} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Handle mounts */}
      <mesh position={[-0.018, 0.14, -0.16]}>
        <boxGeometry args={[0.018, 0.018, 0.02]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} />
      </mesh>
      <mesh position={[-0.018, 0.14, 0.16]}>
        <boxGeometry args={[0.018, 0.018, 0.02]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} />
      </mesh>
    </group>

    {/* Drawer fronts (remaining spaces around oven) */}
    {[-1.00, 0.10, 0.85].map((z, i) => (
      <group key={`drawer-${i}`}>
        <mesh position={[-0.31, 0.65, z]}>
          <boxGeometry args={[0.01, 0.2, i === 2 ? 0.55 : 0.45]} />
          <meshStandardMaterial color={I.cream} roughness={0.8} />
        </mesh>
        <mesh position={[-0.33, 0.65, z]}>
          <boxGeometry args={[0.02, 0.02, 0.08]} />
          <meshStandardMaterial color={I.metal} metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    ))}

    {/* Lower cabinet doors */}
    {[-1.00, 0.10, 0.85].map((z, i) => (
      <mesh key={`cab-${i}`} position={[-0.31, 0.25, z]}>
        <boxGeometry args={[0.01, 0.45, i === 2 ? 0.55 : 0.45]} />
        <meshStandardMaterial color={I.cream} roughness={0.85} />
      </mesh>
    ))}

    {/* Black built-in electric stovetop base beneath the burners */}
    <mesh position={[0.075, 0.875, -0.45]}>
      <boxGeometry args={[0.35, 0.015, 0.5]} />
      <meshStandardMaterial color="#1A1A1A" roughness={0.4} metalness={0.2} />
    </mesh>

    {/* Stovetop burners */}
    {[[0, 0.89, -0.6], [0.15, 0.89, -0.6], [0, 0.89, -0.3], [0.15, 0.89, -0.3]].map(([x, yy, z], i) => (
      <mesh key={`burn-${i}`} position={[x, yy, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.06, 12]} />
        <meshStandardMaterial color={I.redBright} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    ))}

    {/* Prominent Sink Basin - Safely dialed to 1.8x width and anchored strictly to the left to preserve the cutting board */}
    <group position={[0, 0.86, 0.45]} scale={[1, 1, 1.8]}>
      {/* Sink Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 16]} />
        <meshStandardMaterial color={I.metal} side={THREE.DoubleSide} />
      </mesh>
      {/* Sink Basin */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color={I.metalDark} />
      </mesh>
      {/* Faucet - Inverse scaled on Z to prevent it from visually stretching with the massive basin */}
      <mesh position={[0.16, 0.1, 0]} scale={[1, 1, 1/1.8]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.09, 0.18, 0]} rotation={[0, 0, 1.0]} scale={[1, 1, 1/1.8]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
        <meshStandardMaterial color={I.metal} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>

    {/* Stack of Ceramic Plates on Counter - Softly nudged just away from the sink per request */}
    <group position={[0.1, 0.88, -0.05]}>
      {[0, 0.015, 0.03, 0.045].map((yy) => (
        <mesh key={`plate-${yy}`} position={[0, yy, 0]}>
          <cylinderGeometry args={[0.12, 0.08, 0.01, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
      ))}
    </group>

    {/* Wooden Cutting Board with Kitchen Knife - Reset completely unaltered to original coordinate */}
    <group position={[0, 0.88, 0.95]}>
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

    {/* Water Storing Can (Jerry Can) - Dropped to floor level explicitly to clear the cupboards */}
    <group position={[0.4, 0.125, 0.9]}>
      <mesh>
        <boxGeometry args={[0.15, 0.25, 0.25]} />
        <meshStandardMaterial color="#2E5A88" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <meshStandardMaterial color="#F0F0F0" />
      </mesh>
    </group>

    {/* Cast Iron Frying Pan on front burner - Physically centered over electric plate */}
    <group position={[0, 0.89, -0.5]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#111" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, 0.03, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>

    {/* Stylish Kettle on back stovetop - Physically centered perfectly over electric plate */}
    <group position={[0, 0.89, -0.8]}>
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

// ─── PROCEDURAL RED THREAD FOR DETECTIVE BOARD ───
const RedThread = ({ p1, p2, sag = 0.03, color = "#dc2626", thickness = 0.0025 }: { p1: [number, number, number]; p2: [number, number, number]; sag?: number; color?: string; thickness?: number }) => {
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y -= sag;
    mid.z += 0.015; // Pull out slightly along local +Z toward viewer so thread hangs cleanly in front of papers
    return new THREE.CatmullRomCurve3([start, mid, end]);
  }, [p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], sag]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, thickness, 6, false]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
};

// ─── DETECTIVE CONSPIRACY BOARD (FLUSH AGAINST BACK WALL AT Z=2.45, DIRECTLY FACING FRONT DOOR WITH 3D EVIDENCE CARDS) ───
const DetectiveBoard = ({ y }: { y: number }) => {
  // Back wall inner surface is at Z = 2.46. Board center at Z = 2.45 with rotation [0, 0, 0] faces directly into the room (-Z toward door).
  // Local pin coordinates relative to corkboard center [0, 0, 0]
  const pA: [number, number, number] = [-0.46, 0.26, -0.035]; // Top-Left Polaroid Pin
  const pB: [number, number, number] = [0, 0.28, -0.035];     // Top-Center Blueprint Pin
  const pC: [number, number, number] = [0.46, 0.24, -0.035];  // Top-Right Secret Report Pin
  const pD: [number, number, number] = [-0.46, 0.0, -0.035];  // Mid-Left Topo Map Pin
  const pE: [number, number, number] = [0, 0.0, -0.035];      // Center Hub Article Pin
  const pF: [number, number, number] = [0.46, -0.05, -0.035]; // Mid-Right Sticky Note Pin
  const pG: [number, number, number] = [-0.44, -0.26, -0.035];// Bottom-Left Lab Card Pin
  const pH: [number, number, number] = [0.44, -0.27, -0.035]; // Bottom-Right Pink Note Pin

  return (
    <group position={[0, y + 1.8, 2.45]} rotation={[0, 0, 0]}>
      {/* Dedicated spotlight illuminating the Detective Board evidence */}
      <pointLight position={[0, 0.3, -0.8]} intensity={1.2} color="#FFF5E4" distance={3} decay={2} />

      {/* Large Corkboard Backing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.36, 0.88, 0.02]} />
        <meshStandardMaterial color="#B08D57" roughness={0.8} />
      </mesh>
      {/* Corkboard Wood Frame */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[1.40, 0.92, 0.04]} />
        <meshStandardMaterial color={I.darkWood} roughness={0.9} />
      </mesh>
      {/* Corkboard front surface */}
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[1.32, 0.84, 0.01]} />
        <meshStandardMaterial color="#9F784B" roughness={0.9} />
      </mesh>

      {/* ─── VISIBLE 3D SOLID EVIDENCE PICTURES & DOCUMENTS (LOCAL Z = -0.022 ON FRONT OF CORK) ─── */}
      {/* Node A: Polaroid Suspect Photo */}
      <group>
        <mesh position={[-0.46, 0.21, -0.022]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.22, 0.28, 0.005]} />
          <meshStandardMaterial color={I.white} roughness={0.6} />
        </mesh>
        <mesh position={[-0.46, 0.24, -0.026]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.18, 0.18, 0.004]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={pA} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color={I.redBright} roughness={0.3} />
        </mesh>
      </group>

      {/* Node B: Project Proteus Schematic Blueprint */}
      <group>
        <mesh position={[0, 0.24, -0.022]} rotation={[0, 0, 0.04]}>
          <boxGeometry args={[0.34, 0.24, 0.005]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, -0.026]} rotation={[0, 0, 0.04]}>
          <boxGeometry args={[0.28, 0.18, 0.004]} />
          <meshStandardMaterial color="#93c5fd" wireframe />
        </mesh>
        <mesh position={pB} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} />
        </mesh>
      </group>

      {/* Node C: Confidential Top Secret Folder */}
      <group>
        <mesh position={[0.46, 0.18, -0.022]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.24, 0.30, 0.005]} />
          <meshStandardMaterial color="#fef08a" roughness={0.7} />
        </mesh>
        <mesh position={[0.46, 0.28, -0.026]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.20, 0.04, 0.004]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={pC} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color={I.redBright} roughness={0.3} />
        </mesh>
      </group>

      {/* Node D: Sector 4 Topographic Target Map */}
      <group>
        <mesh position={[-0.46, -0.05, -0.022]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.28, 0.22, 0.005]} />
          <meshStandardMaterial color="#a3e635" roughness={0.7} />
        </mesh>
        <mesh position={[-0.46, -0.05, -0.026]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.08, 0.08, 0.004]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={pD} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} />
        </mesh>
      </group>

      {/* Node E: Central Hub Newspaper Headline Article */}
      <group>
        <mesh position={[0, -0.03, -0.022]} rotation={[0, 0, -0.02]}>
          <boxGeometry args={[0.32, 0.28, 0.005]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.07, -0.026]} rotation={[0, 0, -0.02]}>
          <boxGeometry args={[0.26, 0.04, 0.004]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={pE} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color={I.redBright} roughness={0.3} />
        </mesh>
      </group>

      {/* Node F: Yellow Sticky Note */}
      <group>
        <mesh position={[0.46, -0.11, -0.022]} rotation={[0, 0, -0.14]}>
          <boxGeometry args={[0.18, 0.18, 0.005]} />
          <meshStandardMaterial color="#facc15" roughness={0.7} />
        </mesh>
        <mesh position={pF} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.3} />
        </mesh>
      </group>

      {/* Node G: Forensic Fingerprint Lab Card */}
      <group>
        <mesh position={[-0.44, -0.28, -0.022]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.24, 0.16, 0.005]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
        <mesh position={[-0.44, -0.28, -0.026]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.10, 0.10, 0.004]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={pG} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color={I.redBright} roughness={0.3} />
        </mesh>
      </group>

      {/* Node H: Pink Evidence Note */}
      <group>
        <mesh position={[0.44, -0.29, -0.022]} rotation={[0, 0, 0.10]}>
          <boxGeometry args={[0.22, 0.18, 0.005]} />
          <meshStandardMaterial color="#f472b6" roughness={0.7} />
        </mesh>
        <mesh position={pH} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.025, 8]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} />
        </mesh>
      </group>

      {/* ─── 3D CATMULL-ROM RED THREAD CONNECTIONS ACROSS THE EVIDENCE BOARD ─── */}
      <RedThread p1={pA} p2={pE} sag={0.04} color="#dc2626" thickness={0.003} />
      <RedThread p1={pB} p2={pE} sag={0.02} color="#ff1111" thickness={0.0025} />
      <RedThread p1={pC} p2={pE} sag={0.04} color="#dc2626" thickness={0.003} />
      <RedThread p1={pD} p2={pE} sag={0.03} color="#ff1111" />
      <RedThread p1={pF} p2={pE} sag={0.03} color="#dc2626" />
      <RedThread p1={pG} p2={pE} sag={0.04} color="#ff1111" thickness={0.0025} />
      <RedThread p1={pH} p2={pE} sag={0.03} color="#dc2626" />
      <RedThread p1={pA} p2={pD} sag={0.015} color="#eab308" thickness={0.002} />
      <RedThread p1={pB} p2={pC} sag={0.02} color="#ff1111" />
      <RedThread p1={pG} p2={pH} sag={0.02} color="#eab308" thickness={0.002} />
      <RedThread p1={pA} p2={pH} sag={0.08} color="#b91c1c" thickness={0.002} />
      <RedThread p1={pC} p2={pG} sag={0.08} color="#b91c1c" thickness={0.002} />
    </group>
  );
};

// ─── VINTAGE TWO-WAY / HAM RADIO STATION ───
const VintageRadio = ({ y }: { y: number }) => (
  // Placed on the kitchen counter along the right wall (X = 1.95, Y = y + 0.87, Z = -0.8) overlooking the room
  <group position={[1.95, y + 0.87, -0.8]} rotation={[0, -1.35, 0]}>
    {/* Metal Radio Chassis */}
    <mesh position={[0, 0.09, 0]}>
      <boxGeometry args={[0.26, 0.18, 0.16]} />
      <meshStandardMaterial color="#3E4C38" roughness={0.6} />
    </mesh>
    {/* Speaker Grille */}
    <mesh position={[-0.05, 0.09, 0.081]}>
      <planeGeometry args={[0.11, 0.12]} />
      <meshStandardMaterial color="#1A2216" roughness={0.8} />
    </mesh>
    {/* Glowing Amber Frequency Dial */}
    <mesh position={[0.06, 0.12, 0.082]}>
      <planeGeometry args={[0.08, 0.05]} />
      <meshStandardMaterial color="#F4A261" emissive="#F4A261" emissiveIntensity={0.6} />
    </mesh>
    {/* Tuning Knobs */}
    <mesh position={[0.04, 0.05, 0.082]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
      <meshStandardMaterial color={I.metalDark} metalness={0.7} />
    </mesh>
    {/* Telescopic Antenna extending upward */}
    <mesh position={[0.1, 0.35, -0.05]}>
      <cylinderGeometry args={[0.003, 0.005, 0.45, 8]} />
      <meshStandardMaterial color={I.metal} metalness={0.8} roughness={0.2} />
    </mesh>
    {/* Handset microphone */}
    <mesh position={[-0.16, 0.05, 0.04]}>
      <boxGeometry args={[0.04, 0.09, 0.03]} />
      <meshStandardMaterial color="#222222" roughness={0.5} />
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
// --- PROCEDURAL HIGH-FIDELITY TEXTURE ENGINE ---
let _woodBump: THREE.CanvasTexture | null = null;
let _fabricBump: THREE.CanvasTexture | null = null;
let _metalNoise: THREE.CanvasTexture | null = null;

const ensureTextures = () => {
  if (_woodBump) return;

  // 1. Procedural Wood Grain Engine
  const c1 = document.createElement('canvas');
  c1.width = 512; c1.height = 512;
  const ctx1 = c1.getContext('2d')!;
  ctx1.fillStyle = '#808080'; ctx1.fillRect(0, 0, 512, 512); // Neutral base
  for (let i = 0; i < 1500; i++) {
    ctx1.globalAlpha = Math.random() * 0.15;
    ctx1.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    const x = Math.random() * 512;
    ctx1.fillRect(x, 0, Math.random() * 3 + 1, 512); // Extruded directional grain
    if (Math.random() > 0.98) {
      ctx1.beginPath(); // Heavy knots
      ctx1.ellipse(x, Math.random() * 512, Math.random() * 20 + 5, Math.random() * 40 + 10, 0, 0, Math.PI * 2);
      ctx1.fill();
    }
  }
  _woodBump = new THREE.CanvasTexture(c1);
  _woodBump.wrapS = THREE.RepeatWrapping; _woodBump.wrapT = THREE.RepeatWrapping;

  // 2. Procedural High-Frequency Fabric Weave
  const c2 = document.createElement('canvas');
  c2.width = 256; c2.height = 256;
  const ctx2 = c2.getContext('2d')!;
  ctx2.fillStyle = '#808080'; ctx2.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30000; i++) {
    ctx2.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx2.globalAlpha = Math.random() * 0.1;
    ctx2.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); // Tiny isolated bump points
  }
  _fabricBump = new THREE.CanvasTexture(c2);
  _fabricBump.wrapS = THREE.RepeatWrapping; _fabricBump.wrapT = THREE.RepeatWrapping;
  _fabricBump.repeat.set(8, 8); // Tiled extremely dense

  // 3. Procedural Scratched Metal Smudges
  const c3 = document.createElement('canvas');
  c3.width = 256; c3.height = 256;
  const ctx3 = c3.getContext('2d')!;
  ctx3.fillStyle = '#808080'; ctx3.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1000; i++) {
    ctx3.globalAlpha = Math.random() * 0.15;
    ctx3.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx3.beginPath();
    ctx3.arc(Math.random() * 256, Math.random() * 256, Math.random() * 15 + 2, 0, Math.PI * 2);
    ctx3.fill();
  }
  _metalNoise = new THREE.CanvasTexture(c3);
  _metalNoise.wrapS = THREE.RepeatWrapping; _metalNoise.wrapT = THREE.RepeatWrapping;
};

interface CabinInteriorProps {
  y: number;
  size: number;
}

const CabinInterior = ({ y, size }: CabinInteriorProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    ensureTextures();

    // Autonomously traverse the 120+ objects in the room and procedurally upgrade their shaders based on hex-mapping
    groupRef.current.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat || !mat.color) return;

        const hex = ('#' + mat.color.getHexString()).toUpperCase();
        const match = (paletteHex: string) => hex === paletteHex.toUpperCase();

        // High-Fidelity Wood Grain Overlay
        if ([I.darkWood, I.midWood, I.lightWood, I.cream, I.plank, I.plankAlt, I.counter].some(match)) {
           mat.bumpMap = _woodBump;
           mat.bumpScale = 0.05; 
           mat.needsUpdate = true;
        }
        // Extruded Physical Metal Shader Overhaul
        else if ([I.metal, I.metalDark, I.stove, I.stovePipe, I.mapRim, I.burner].some(match)) {
           mesh.material = new THREE.MeshPhysicalMaterial({
             color: mat.color,
             metalness: Math.max(mat.metalness || 0, 0.7),
             roughness: mat.roughness,
             bumpMap: _metalNoise,
             bumpScale: 0.02,
             clearcoat: 0.4,
             clearcoatRoughness: 0.3
           });
        }
        // Dense Cotton/Wool Woven Overlay
        else if ([I.red, I.redBright, I.green, I.mapGreen, I.bedSheet, I.pillow, I.rugRed, I.rugDark].some(match)) {
           mat.bumpMap = _fabricBump;
           mat.bumpScale = 0.08;
           mat.roughness = 1.0;
           mat.needsUpdate = true;
        }
      }
    });
  }, []);

  return (
    <group ref={groupRef}>
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
      <DetectiveBoard y={y} />
      <VintageRadio y={y} />
    </group>
  );
};
export default CabinInterior;
