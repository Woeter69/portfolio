import React, { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface DeskLampProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  palette: Record<string, string>;
}

/**
 * Interactive Toggleable Vintage Desk Lamp
 * Features a pull-chain / rotary switch Web Audio tactile click,
 * dynamic warm golden point lighting, emissive bulb glow, and a floating 3D readout badge.
 */
const DeskLamp: React.FC<DeskLampProps> = ({
  position = [-0.45, 0.77, -0.15],
  rotation = [0, 0.5, 0],
  palette,
}) => {
  const [isOn, setIsOn] = useState<boolean>(true);
  const [hovered, setHovered] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize a crisp mechanical toggle switch sound
  const playToggleSound = () => {
    try {
      const ctx =
        audioCtxRef.current ||
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';

      // Quick pitch snap for a mechanical click
      osc.frequency.setValueAtTime(isOn ? 380 : 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Audio fallback silent if browser blocked
    }
  };

  const handleToggle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playToggleSound();
    setIsOn((prev) => !prev);
  };

  // High-resolution canvas texture for HUD popup badge (prevents text overflow)
  const lampLabelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 144;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 768, 144);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(16, 16, 736, 112, 24);
      ctx.fill();
      ctx.strokeStyle = isOn ? '#FBBF24' : '#64748B';
      ctx.lineWidth = 4;
      ctx.stroke();

      const text = isOn
        ? '💡 DESK LAMP [ON] — CLICK TO TURN OFF'
        : '💡 DESK LAMP [OFF] — CLICK TO TURN ON';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 384, 72);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [isOn]);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleToggle}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Floating Readout Popup Display above Lamp when hovered */}
      {hovered && (
        <mesh position={[0, 0.48, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.58, 0.11]} />
          <meshBasicMaterial map={lampLabelTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Lamp Base */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.06, 8]} />
        <meshStandardMaterial
          color={palette.lamp || '#C4A265'}
          roughness={0.7}
          emissive={hovered ? palette.lamp || '#C4A265' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Articulated Arm */}
      <mesh position={[0.05, 0.18, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 5]} />
        <meshStandardMaterial color={palette.lamp || '#C4A265'} roughness={0.6} />
      </mesh>

      {/* Red Metal Shade */}
      <mesh position={[0.1, 0.32, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.1, 8, 1, true]} />
        <meshStandardMaterial
          color={palette.redBright || '#CC3333'}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing Light Bulb inside Shade */}
      <mesh position={[0.1, 0.28, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial
          color={isOn ? '#FFEAC0' : '#475569'}
          emissive={isOn ? '#FFD1A3' : '#000000'}
          emissiveIntensity={isOn ? 1.5 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* Warm Golden Point Light */}
      <pointLight
        position={[0.1, 0.26, 0]}
        distance={2.5}
        intensity={isOn ? 1.2 : 0}
        color="#FFD1A3"
        decay={2}
      />
    </group>
  );
};

export default DeskLamp;
