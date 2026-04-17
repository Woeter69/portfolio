import React, { useRef, useMemo } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural Firewatch-style watchtower.
 * Uses a proper beam helper to connect points in 3D space.
 */

// Colors — light whitish wood palette (except roof)
const WOOD_DARK = '#D4C5B0';   // warm off-white (frames, posts)
const WOOD_MID = '#E0D5C5';    // lighter cream (braces, rails)
const WOOD_LIGHT = '#EAE2D6';  // near-white (walls, sills)
const WOOD_PLANK = '#DDD3C3';  // deck planks
const ROOF_COLOR = '#6B5545';  // dark brown roof (contrast)
const ROOF_TRIM = '#E8DFD2';   // white-ish roof trim
const GLASS_COLOR = '#87CEEB';
const METAL_COLOR = '#C0B8A8'; // light metal

/**
 * Creates a beam (box) between two 3D points.
 */
const Beam = ({ from, to, thickness = 0.15, color = WOOD_DARK }: {
  from: [number, number, number];
  to: [number, number, number];
  thickness?: number;
  color?: string;
}) => {
  const { position, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const len = dir.length();
    dir.normalize();

    // Build rotation from direction
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion();

    if (Math.abs(dir.dot(up)) > 0.999) {
      // Nearly vertical — no fancy rotation needed
      quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
    } else {
      const axis = new THREE.Vector3().crossVectors(up, dir).normalize();
      const angle = Math.acos(THREE.MathUtils.clamp(up.dot(dir), -1, 1));
      quat.setFromAxisAngle(axis, angle);
    }

    return {
      position: [mid.x, mid.y, mid.z] as [number, number, number],
      rotation: new THREE.Euler().setFromQuaternion(quat),
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[thickness, length, thickness]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
};

const WatchtowerModel = () => {
  const doorRef = useRef<THREE.Group>(null);
  const data = useScroll();

  const towerHeight = 16;
  const cabinY = towerHeight;
  const cabinSize = 4;

  // Bottom spread (legs splay outward at bottom)
  const botSpread = 3.5;
  // Top spread (legs come together at platform)
  const topSpread = 2.2;

  // Leg corners: [x, z] at bottom and top
  const legCorners = [
    { bot: [-botSpread, -botSpread], top: [-topSpread, -topSpread] }, // front-left
    { bot: [botSpread, -botSpread],  top: [topSpread, -topSpread] },  // front-right
    { bot: [botSpread, botSpread],   top: [topSpread, botSpread] },   // back-right
    { bot: [-botSpread, botSpread],  top: [-topSpread, botSpread] },  // back-left
  ];

  // Animate door based on scroll
  useFrame(() => {
    if (!doorRef.current) return;
    const doorProgress = data.range(0.55, 0.15);
    doorRef.current.rotation.y = -doorProgress * Math.PI * 0.5;
  });

  return (
    <group>
      {/* ===== 4 MAIN LEGS ===== */}
      {legCorners.map((corner, i) => (
        <Beam
          key={`leg-${i}`}
          from={[corner.bot[0], 0, corner.bot[1]]}
          to={[corner.top[0], towerHeight, corner.top[1]]}
          thickness={0.2}
          color={WOOD_DARK}
        />
      ))}

      {/* ===== HORIZONTAL BRACES (4 levels) ===== */}
      {[0.25, 0.5, 0.75, 1.0].map((t, level) => {
        const y = t * towerHeight;
        const s = botSpread + (topSpread - botSpread) * t;
        const corners: [number, number, number][] = [
          [-s, y, -s], [s, y, -s], [s, y, s], [-s, y, s],
        ];
        return (
          <group key={`braces-${level}`}>
            {/* Connect each corner to the next */}
            {corners.map((c, i) => {
              const next = corners[(i + 1) % 4];
              return (
                <Beam
                  key={`h-${level}-${i}`}
                  from={c}
                  to={next}
                  thickness={0.1}
                  color={WOOD_MID}
                />
              );
            })}
          </group>
        );
      })}

      {/* ===== X-BRACES on each face ===== */}
      {[0, 0.5].map((tStart, bi) => {
        const tEnd = tStart + 0.5;
        const yBot = tStart * towerHeight;
        const yTop = tEnd * towerHeight;
        const sBot = botSpread + (topSpread - botSpread) * tStart;
        const sTop = botSpread + (topSpread - botSpread) * tEnd;

        // Front and back X-braces
        return (
          <group key={`xbrace-${bi}`}>
            {/* Front face */}
            <Beam from={[-sBot, yBot, -sBot]} to={[sTop, yTop, -sTop]} thickness={0.08} color={WOOD_MID} />
            <Beam from={[sBot, yBot, -sBot]} to={[-sTop, yTop, -sTop]} thickness={0.08} color={WOOD_MID} />
            {/* Back face */}
            <Beam from={[-sBot, yBot, sBot]} to={[sTop, yTop, sTop]} thickness={0.08} color={WOOD_MID} />
            <Beam from={[sBot, yBot, sBot]} to={[-sTop, yTop, sTop]} thickness={0.08} color={WOOD_MID} />
            {/* Left face */}
            <Beam from={[-sBot, yBot, -sBot]} to={[-sTop, yTop, sTop]} thickness={0.08} color={WOOD_MID} />
            <Beam from={[-sBot, yBot, sBot]} to={[-sTop, yTop, -sTop]} thickness={0.08} color={WOOD_MID} />
            {/* Right face */}
            <Beam from={[sBot, yBot, -sBot]} to={[sTop, yTop, sTop]} thickness={0.08} color={WOOD_MID} />
            <Beam from={[sBot, yBot, sBot]} to={[sTop, yTop, -sTop]} thickness={0.08} color={WOOD_MID} />
          </group>
        );
      })}

      {/* ===== STAIRCASE + PLATFORM WITH HATCH ===== */}
      {(() => {
        const elements: React.JSX.Element[] = [];
        const stairW = 0.9;
        const pad = 0.5;
        const platformSize = cabinSize + 2;
        const ph = platformSize / 2; // 3.0

        // Hatch on the LEFT side of the platform (walkway between cabin and railing)
        const hatchW = 1.3;
        const hatchD = 1.3;
        // Left edge of platform is at x = -ph = -3
        // Cabin wall is at x = -cabinSize/2 = -2
        // So walkway is x: -3 to -2, center at -2.5
        const hatchX = -(ph - hatchW / 2 - 0.15); // x ≈ -2.2
        const hatchZ = 0; // centered on z

        // ─── 8 FLIGHTS, each along one face, NO shortcuts ───
        // Order: front→right→back→left, repeating
        // So flight 3 = left side (wrap 1), flight 7 = left side (wrap 2)
        // Last flight (7) goes along the left side: back-left → front-left
        const totalFlights = 8;

        // All 9 corners (start of each flight + end of last)
        // Every corner is ON THE FACE of the tower at that height
        const corners: [number, number, number][] = [];
        for (let i = 0; i <= totalFlights; i++) {
          const t = i / totalFlights;
          const y = t * towerHeight;
          const s = botSpread + (topSpread - botSpread) * t + pad;
          const face = i % 4;
          // 0: front-left, 1: front-right, 2: back-right, 3: back-left
          switch (face) {
            case 0: corners.push([-s, y, -s]); break; // front-left
            case 1: corners.push([s, y, -s]); break;  // front-right
            case 2: corners.push([s, y, s]); break;   // back-right
            case 3: corners.push([-s, y, s]); break;  // back-left
            default: corners.push([0, y, 0]);
          }
        }

        // Override the LAST corner to be the hatch position
        corners[totalFlights] = [hatchX, towerHeight, hatchZ];

        // Uniform step spacing: total height / total steps across all flights
        const stepRise = 0.4; // consistent vertical gap between steps
        const rH = 0.8; // railing height

        // ─── STARTING STAIRS (ground to first corner) ───
        {
          const [fx, fy, fz] = corners[0];
          const startSteps = Math.ceil(fy / stepRise) || 3;
          const groundX = fx; // same x, just lower
          const groundZ = fz - 2; // a bit in front
          const sdx = fx - groundX;
          const sdz = fz - groundZ;
          const sAngle = Math.atan2(sdx, sdz);
          const sLen = Math.sqrt(sdx * sdx + sdz * sdz);
          const snx = (sdz / (sLen || 1)) * (stairW / 2);
          const snz = (-sdx / (sLen || 1)) * (stairW / 2);

          // Stringers
          elements.push(
            <Beam key="startL" from={[groundX - snx, 0, groundZ - snz]} to={[fx - snx, fy, fz - snz]} thickness={0.07} color={WOOD_DARK} />,
            <Beam key="startR" from={[groundX + snx, 0, groundZ + snz]} to={[fx + snx, fy, fz + snz]} thickness={0.07} color={WOOD_DARK} />
          );
          // Steps
          for (let s = 0; s <= startSteps; s++) {
            const t = s / startSteps;
            elements.push(
              <mesh key={`start-stp-${s}`} position={[groundX + sdx * t, t * fy, groundZ + sdz * t]} rotation={[0, sAngle, 0]}>
                <boxGeometry args={[stairW, 0.06, 0.2]} />
                <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
              </mesh>
            );
          }
          // Both handrails
          elements.push(
            <Beam key="startHR" from={[groundX + snx, rH, groundZ + snz]} to={[fx + snx, fy + rH, fz + snz]} thickness={0.05} color={WOOD_DARK} />,
            <Beam key="startHL" from={[groundX - snx, rH, groundZ - snz]} to={[fx - snx, fy + rH, fz - snz]} thickness={0.05} color={WOOD_DARK} />
          );
        }

        // ─── BUILD EACH FLIGHT ───
        for (let f = 0; f < totalFlights; f++) {
          const [sx, sy, sz] = corners[f];
          const [ex, ey, ez] = corners[f + 1];

          const dx = ex - sx;
          const dz = ez - sz;
          const len = Math.sqrt(dx * dx + dz * dz);
          if (len < 0.01) continue;
          const nx = (dz / len) * (stairW / 2);
          const nz = (-dx / len) * (stairW / 2);

          // Stringers (both sides)
          elements.push(
            <Beam key={`stL-${f}`} from={[sx - nx, sy, sz - nz]} to={[ex - nx, ey, ez - nz]} thickness={0.07} color={WOOD_DARK} />,
            <Beam key={`stR-${f}`} from={[sx + nx, sy, sz + nz]} to={[ex + nx, ey, ez + nz]} thickness={0.07} color={WOOD_DARK} />
          );

          // Steps — uniform vertical spacing
          const flightH = ey - sy;
          const numSteps = Math.max(Math.round(flightH / stepRise), 3);
          const angle = Math.atan2(dx, dz);
          for (let s = 0; s <= numSteps; s++) {
            const t = s / numSteps;
            elements.push(
              <mesh key={`stp-${f}-${s}`} position={[sx + dx * t, sy + flightH * t, sz + dz * t]} rotation={[0, angle, 0]}>
                <boxGeometry args={[stairW, 0.06, 0.2]} />
                <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
              </mesh>
            );
          }

          // Handrails — BOTH sides (inner + outer)
          elements.push(
            <Beam key={`hrO-${f}`} from={[sx + nx, sy + rH, sz + nz]} to={[ex + nx, ey + rH, ez + nz]} thickness={0.05} color={WOOD_DARK} />,
            <Beam key={`hrI-${f}`} from={[sx - nx, sy + rH, sz - nz]} to={[ex - nx, ey + rH, ez - nz]} thickness={0.05} color={WOOD_DARK} />
          );

          // Railing posts — both sides
          for (let p = 0; p <= numSteps; p += 2) {
            const t = p / numSteps;
            const py = sy + flightH * t;
            // Outer post
            elements.push(
              <Beam key={`rpO-${f}-${p}`} from={[sx + dx * t + nx, py, sz + dz * t + nz]} to={[sx + dx * t + nx, py + rH, sz + dz * t + nz]} thickness={0.04} color={WOOD_DARK} />
            );
            // Inner post
            elements.push(
              <Beam key={`rpI-${f}-${p}`} from={[sx + dx * t - nx, py, sz + dz * t - nz]} to={[sx + dx * t - nx, py + rH, sz + dz * t - nz]} thickness={0.04} color={WOOD_DARK} />
            );
          }

          // Corner landing (skip last — platform is the landing)
          if (f < totalFlights - 1) {
            elements.push(
              <mesh key={`land-${f}`} position={[ex, ey, ez]}>
                <boxGeometry args={[stairW + 0.3, 0.1, stairW + 0.3]} />
                <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
              </mesh>
            );
          }
        }

        // ─── CONNECT RAILS AT CORNERS ───
        // Bridge the handrails between consecutive flights at each landing
        for (let f = 0; f < totalFlights - 1; f++) {
          const [cx, cy, cz] = corners[f + 1]; // corner point

          // Perpendiculars for flight f (ending)
          const [sx1, , sz1] = corners[f];
          const dx1 = cx - sx1, dz1 = cz - sz1;
          const len1 = Math.sqrt(dx1 * dx1 + dz1 * dz1) || 1;
          const nx1 = (dz1 / len1) * (stairW / 2);
          const nz1 = (-dx1 / len1) * (stairW / 2);

          // Perpendiculars for flight f+1 (starting)
          const [ex2, , ez2] = corners[f + 2];
          const dx2 = ex2 - cx, dz2 = ez2 - cz;
          const len2 = Math.sqrt(dx2 * dx2 + dz2 * dz2) || 1;
          const nx2 = (dz2 / len2) * (stairW / 2);
          const nz2 = (-dx2 / len2) * (stairW / 2);

          // Connect outer rails
          elements.push(
            <Beam key={`crO-${f}`} from={[cx + nx1, cy + rH, cz + nz1]} to={[cx + nx2, cy + rH, cz + nz2]} thickness={0.05} color={WOOD_DARK} />
          );
          // Connect inner rails
          elements.push(
            <Beam key={`crI-${f}`} from={[cx - nx1, cy + rH, cz - nz1]} to={[cx - nx2, cy + rH, cz - nz2]} thickness={0.05} color={WOOD_DARK} />
          );

          // Corner posts (outer + inner)
          elements.push(
            <Beam key={`cpO-${f}`} from={[cx + nx1, cy, cz + nz1]} to={[cx + nx1, cy + rH, cz + nz1]} thickness={0.05} color={WOOD_DARK} />,
            <Beam key={`cpI-${f}`} from={[cx - nx1, cy, cz - nz1]} to={[cx - nx1, cy + rH, cz - nz1]} thickness={0.05} color={WOOD_DARK} />
          );
        }

        // ─── PLATFORM with hatch on left side ───
        const deckH = 0.15;
        const hx1 = hatchX - hatchW / 2;
        const hx2 = hatchX + hatchW / 2;
        const hz1 = hatchZ - hatchD / 2;
        const hz2 = hatchZ + hatchD / 2;

        // Strip 1: everything right of hatch (full depth)
        elements.push(
          <mesh key="dk-r" position={[(hx2 + ph) / 2, cabinY, 0]}>
            <boxGeometry args={[ph - hx2, deckH, platformSize]} />
            <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
          </mesh>
        );

        // Strip 2: left of hatch (full depth)
        const leftW = hx1 - (-ph);
        if (leftW > 0.05) {
          elements.push(
            <mesh key="dk-ll" position={[(-ph + hx1) / 2, cabinY, 0]}>
              <boxGeometry args={[leftW, deckH, platformSize]} />
              <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
            </mesh>
          );
        }

        // Strip 3: above hatch (hatch width strip from hz2 to back)
        elements.push(
          <mesh key="dk-b" position={[hatchX, cabinY, (hz2 + ph) / 2]}>
            <boxGeometry args={[hatchW, deckH, ph - hz2]} />
            <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
          </mesh>
        );

        // Strip 4: below hatch (hatch width strip from front to hz1)
        elements.push(
          <mesh key="dk-f" position={[hatchX, cabinY, (-ph + hz1) / 2]}>
            <boxGeometry args={[hatchW, deckH, hz1 + ph]} />
            <meshStandardMaterial color={WOOD_PLANK} roughness={0.9} />
          </mesh>
        );

        // Hatch trim
        elements.push(
          <Beam key="ht1" from={[hx1, cabinY, hz1]} to={[hx2, cabinY, hz1]} thickness={0.08} color={WOOD_DARK} />,
          <Beam key="ht2" from={[hx1, cabinY, hz2]} to={[hx2, cabinY, hz2]} thickness={0.08} color={WOOD_DARK} />,
          <Beam key="ht3" from={[hx1, cabinY, hz1]} to={[hx1, cabinY, hz2]} thickness={0.08} color={WOOD_DARK} />,
          <Beam key="ht4" from={[hx2, cabinY, hz1]} to={[hx2, cabinY, hz2]} thickness={0.08} color={WOOD_DARK} />
        );

        return <group>{elements}</group>;
      })()}

      {/* ===== RAILING ===== */}
      {(() => {
        const rs = (cabinSize + 2) / 2; // railing half-size
        const ry = cabinY;
        const rh = 1;
        const corners: [number, number, number][] = [
          [-rs, ry, -rs], [rs, ry, -rs], [rs, ry, rs], [-rs, ry, rs],
        ];
        const topCorners: [number, number, number][] = corners.map(
          ([x, y, z]) => [x, y + rh, z]
        );

        return (
          <group>
            {/* Vertical posts */}
            {corners.map((c, i) => (
              <Beam key={`rpost-${i}`} from={c} to={topCorners[i]} thickness={0.1} color={WOOD_DARK} />
            ))}
            {/* Top rails */}
            {topCorners.map((c, i) => {
              const next = topCorners[(i + 1) % 4];
              return <Beam key={`rtop-${i}`} from={c} to={next} thickness={0.08} color={WOOD_MID} />;
            })}
            {/* Mid rails */}
            {corners.map((c, i) => {
              const next = corners[(i + 1) % 4];
              const midFrom: [number, number, number] = [c[0], c[1] + rh * 0.5, c[2]];
              const midTo: [number, number, number] = [next[0], next[1] + rh * 0.5, next[2]];
              return <Beam key={`rmid-${i}`} from={midFrom} to={midTo} thickness={0.06} color={WOOD_MID} />;
            })}
          </group>
        );
      })()}

      {/* ===== CABIN ===== */}
      <Cabin y={cabinY + 0.15} size={cabinSize} doorRef={doorRef} />

      {/* ===== ROOF ===== */}
      <group position={[0, cabinY + 3.2, 0]}>
        <mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[(cabinSize + 1.2) / 2 * 1.5, 2, 4]} />
          <meshStandardMaterial color={ROOF_COLOR} roughness={0.9} />
        </mesh>
        {/* White roof edge trim (base) */}
        <mesh>
          <boxGeometry args={[cabinSize + 1.5, 0.1, cabinSize + 1.5]} />
          <meshStandardMaterial color={ROOF_TRIM} roughness={0.85} />
        </mesh>
        {/* Roof ridge edges — beams from corners to peak */}
        {(() => {
          const roofHalf = (cabinSize + 1.5) / 2;
          const peak: [number, number, number] = [0, 2, 0];
          const roofCorners: [number, number, number][] = [
            [-roofHalf, 0, -roofHalf],
            [roofHalf, 0, -roofHalf],
            [roofHalf, 0, roofHalf],
            [-roofHalf, 0, roofHalf],
          ];
          return roofCorners.map((corner, i) => (
            <Beam
              key={`ridge-${i}`}
              from={corner}
              to={peak}
              thickness={0.08}
              color={ROOF_TRIM}
            />
          ));
        })()}
      </group>
    </group>
  );
};

// ─── CABIN ───
// Fire lookout style: mostly glass walls with frame dividers
// Front: 2 panes left of door + 2 right of door
// Left/Right/Back: 6 panes each
const Cabin = ({ y, size, doorRef }: {
  y: number;
  size: number;
  doorRef: React.RefObject<THREE.Group | null>;
}) => {
  const wallHeight = 3;
  const half = size / 2;
  const frameThickness = 0.06;
  const wallThickness = 0.08;

  // Sill height (bottom solid part below windows)
  const sillHeight = 0.6;
  // Header height (solid part above windows)
  const headerHeight = 0.4;
  // Window area
  const windowBottom = y + sillHeight;
  const windowTop = y + wallHeight - headerHeight;
  const windowHeight = windowTop - windowBottom;
  const windowMidY = (windowBottom + windowTop) / 2;

  /**
   * Glass wall with N panes separated by vertical frame dividers.
   * No horizontal crossbar — clean glass panels.
   */
  const GlassWall = ({ panes, wallPos, axis, wallLength }: {
    panes: number;
    wallPos: [number, number, number];
    axis: 'x' | 'z';
    wallLength: number;
  }) => {
    const paneWidth = wallLength / panes;
    const isX = axis === 'x';
    // Planes face z by default — rotate 90° around y for z-axis walls
    const planeRotation: [number, number, number] = isX ? [0, 0, 0] : [0, Math.PI / 2, 0];

    return (
      <group>
        {/* Bottom sill */}
        <mesh position={[wallPos[0], y + sillHeight / 2, wallPos[2]]}>
          <boxGeometry args={[
            isX ? wallLength : wallThickness,
            sillHeight,
            isX ? wallThickness : wallLength
          ]} />
          <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
        </mesh>

        {/* Top header */}
        <mesh position={[wallPos[0], y + wallHeight - headerHeight / 2, wallPos[2]]}>
          <boxGeometry args={[
            isX ? wallLength : wallThickness,
            headerHeight,
            isX ? wallThickness : wallLength
          ]} />
          <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
        </mesh>

        {/* Glass panes */}
        {Array.from({ length: panes }).map((_, i) => {
          const offset = -wallLength / 2 + paneWidth / 2 + i * paneWidth;
          const px = isX ? wallPos[0] + offset : wallPos[0];
          const pz = isX ? wallPos[2] : wallPos[2] + offset;

          return (
            <mesh key={`glass-${i}`} position={[px, windowMidY, pz]} rotation={planeRotation}>
              <planeGeometry args={[paneWidth - frameThickness, windowHeight]} />
              <meshStandardMaterial
                color={GLASS_COLOR}
                transparent
                opacity={0.25}
                roughness={0.05}
                metalness={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

        {/* Vertical frame dividers only */}
        {Array.from({ length: panes + 1 }).map((_, i) => {
          const offset = -wallLength / 2 + i * paneWidth;
          const fx = isX ? wallPos[0] + offset : wallPos[0];
          const fz = isX ? wallPos[2] : wallPos[2] + offset;

          return (
            <mesh key={`vframe-${i}`} position={[fx, windowMidY, fz]}>
              <boxGeometry args={[
                isX ? frameThickness : wallThickness + 0.02,
                windowHeight,
                isX ? wallThickness + 0.02 : frameThickness
              ]} />
              <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
            </mesh>
          );
        })}
      </group>
    );
  };

  // Door dimensions
  const doorWidth = 1;
  const doorHeight = 2.2;
  const doorAreaWidth = doorWidth + 0.2; // door + small frame

  // Width of window section on each side of the door
  const frontSideWidth = (size - doorAreaWidth) / 2;

  return (
    <group>
      {/* === LEFT WALL — 6 panes === */}
      <GlassWall panes={6} wallPos={[-half, 0, 0]} axis="z" wallLength={size} />

      {/* === RIGHT WALL — 6 panes === */}
      <GlassWall panes={6} wallPos={[half, 0, 0]} axis="z" wallLength={size} />

      {/* === BACK WALL — 6 panes === */}
      <GlassWall panes={6} wallPos={[0, 0, half]} axis="x" wallLength={size} />

      {/* === FRONT WALL — 2 panes left of door + 2 panes right of door === */}
      {/* Left section */}
      <GlassWall
        panes={2}
        wallPos={[-(doorAreaWidth / 2 + frontSideWidth / 2), 0, -half]}
        axis="x"
        wallLength={frontSideWidth}
      />
      {/* Right section */}
      <GlassWall
        panes={2}
        wallPos={[(doorAreaWidth / 2 + frontSideWidth / 2), 0, -half]}
        axis="x"
        wallLength={frontSideWidth}
      />

      {/* Door frame — solid wood around the door */}
      {/* Left jamb */}
      <mesh position={[-doorAreaWidth / 2, y + wallHeight / 2, -half]}>
        <boxGeometry args={[frameThickness, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[doorAreaWidth / 2, y + wallHeight / 2, -half]}>
        <boxGeometry args={[frameThickness, wallHeight, wallThickness]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>
      {/* Header above door */}
      <mesh position={[0, y + doorHeight + 0.15, -half]}>
        <boxGeometry args={[doorAreaWidth, wallHeight - doorHeight - 0.1, wallThickness]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>

      {/* === DOOR (animated) === */}
      <group ref={doorRef} position={[-doorWidth / 2, y, -half]}>
        <mesh position={[doorWidth / 2, doorHeight / 2, 0]}>
          <boxGeometry args={[doorWidth, doorHeight, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
        {/* Handle */}
        <mesh position={[doorWidth * 0.85, doorHeight / 2, -0.06]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Planking detail */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <mesh key={i} position={[doorWidth * t, doorHeight / 2, -0.045]}>
            <boxGeometry args={[0.02, doorHeight - 0.1, 0.01]} />
            <meshStandardMaterial color={WOOD_MID} roughness={1} />
          </mesh>
        ))}
      </group>

      {/* === CORNER POSTS === */}
      {[
        [-half, -half], [half, -half], [half, half], [-half, half]
      ].map(([x, z], i) => (
        <mesh key={`cpost-${i}`} position={[x, y + wallHeight / 2, z]}>
          <boxGeometry args={[0.15, wallHeight, 0.15]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
        </mesh>
      ))}

      {/* === FLOOR === */}
      <mesh position={[0, y + 0.01, 0]}>
        <boxGeometry args={[size - 0.1, 0.05, size - 0.1]} />
        <meshStandardMaterial color={WOOD_PLANK} roughness={0.95} />
      </mesh>
    </group>
  );
};

export default WatchtowerModel;
