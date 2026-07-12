import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VintageRadioProps {
  y: number;
}

const STATIONS = [
  { id: 0, name: 'OFF', freq: '---', color: '#3E4C38' },
  { id: 1, name: 'LOFI CHILL BEATS', freq: '98.4 FM', color: '#F4A261' },
  { id: 2, name: 'FOREST WATCH AMBIENCE', freq: '104.2 FM', color: '#4ADE80' },
  { id: 3, name: 'RETRO SYNTH CHILL', freq: '107.9 FM', color: '#60A5FA' },
];

/**
 * Interactive Vintage Two-Way / Ham Radio Station
 * Placed on the kitchen counter along the right wall (X = 1.95, Y = y + 0.87, Z = -1.38)
 */
const VintageRadio: React.FC<VintageRadioProps> = ({ y }) => {
  const [station, setStation] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);

  // References for animation
  const dialRef = useRef<THREE.MeshStandardMaterial>(null);
  const notesRef = useRef<THREE.Group>(null);
  const knobRef = useRef<THREE.Mesh>(null);

  // Audio Context & Nodes Reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Helper to create a crisp mechanical click when turning the dial
  const playTactileClick = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Audio fallback silent if browser blocked
    }
  };

  // Web Audio Synthesizer Engine for Radio Stations
  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (station === 0) return;

    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      if (station === 1) {
        // STATION 1: Cozy Lofi Chill Beats (Lush electric piano chords + warm sub bass)
        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 349.23], // G7
        ];
        let step = 0;

        const playLofiChord = () => {
          if (!audioCtxRef.current || station !== 1) return;
          const currentCtx = audioCtxRef.current;
          const now = currentCtx.currentTime;
          const chord = chords[step % chords.length];
          step++;

          chord.forEach((freq, idx) => {
            const osc = currentCtx.createOscillator();
            const gain = currentCtx.createGain();
            const filter = currentCtx.createBiquadFilter();

            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(750, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(currentCtx.destination);

            osc.start(now);
            osc.stop(now + 2.8);
          });
        };

        playLofiChord();
        intervalRef.current = window.setInterval(playLofiChord, 2800);

      } else if (station === 2) {
        // STATION 2: Forest Watch Ambience (Soft wind filter sweep + occasional walkie-talkie chirp)
        let step = 0;
        const playAmbience = () => {
          if (!audioCtxRef.current || station !== 2) return;
          const currentCtx = audioCtxRef.current;
          const now = currentCtx.currentTime;

          // Atmospheric telemetry chirp
          if (step % 3 === 0) {
            const osc = currentCtx.createOscillator();
            const gain = currentCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1046.5, now + 0.08);
            gain.gain.setValueAtTime(0.018, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(currentCtx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
          }
          step++;
        };

        playAmbience();
        intervalRef.current = window.setInterval(playAmbience, 2500);

      } else if (station === 3) {
        // STATION 3: Retro Synth Chill (Arpeggiated synthwave notes)
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        let step = 0;

        const playArp = () => {
          if (!audioCtxRef.current || station !== 3) return;
          const currentCtx = audioCtxRef.current;
          const now = currentCtx.currentTime;
          const note = scale[step % scale.length];
          step = (step + 1 + Math.floor(Math.random() * 2)) % scale.length;

          const osc = currentCtx.createOscillator();
          const gain = currentCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note, now);

          gain.gain.setValueAtTime(0.025, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(gain);
          gain.connect(currentCtx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        };

        playArp();
        intervalRef.current = window.setInterval(playArp, 420);
      }
    } catch {
      // Ignore if AudioContext failed to initialize
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [station]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Handle station change
  const handleNextStation = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playTactileClick();
    setStation((prev) => (prev + 1) % STATIONS.length);
  };

  // Create floating note particles data
  const notesData = useMemo(() => {
    return [
      { offset: 0.0, speed: 0.35, xOffset: -0.04 },
      { offset: 0.25, speed: 0.28, xOffset: 0.03 },
      { offset: 0.55, speed: 0.32, xOffset: -0.02 },
      { offset: 0.8, speed: 0.25, xOffset: 0.04 },
    ];
  }, []);

  // Frame animation for dial pulsing & floating notes
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulse amber dial glow when radio is playing
    if (dialRef.current) {
      if (station !== 0) {
        dialRef.current.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.3;
      } else {
        dialRef.current.emissiveIntensity = 0.1;
      }
    }

    // Rotate tuning knob slightly on active station
    if (knobRef.current) {
      knobRef.current.rotation.y = THREE.MathUtils.lerp(
        knobRef.current.rotation.y,
        station * 0.8,
        0.1
      );
    }

    // Float music notes out of speaker grille when station !== 0
    if (notesRef.current) {
      notesRef.current.visible = station !== 0;
      if (station !== 0) {
        notesRef.current.children.forEach((child, i) => {
          const data = notesData[i];
          const cycle = (time * data.speed + data.offset) % 1;
          child.position.y = 0.15 + cycle * 0.35;
          child.position.x = -0.05 + data.xOffset + Math.sin(time * 2 + i) * 0.02;
          child.position.z = 0.08 + Math.cos(time * 2 + i) * 0.015;
          const scale = Math.sin(cycle * Math.PI) * 0.02;
          child.scale.set(scale, scale, scale);
        });
      }
    }
  });

  // Dynamic Canvas Texture for Station Readout Label above Radio
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 128);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(16, 16, 480, 96, 20);
      ctx.fill();
      ctx.strokeStyle = STATIONS[station].color;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        station === 0 ? '📻 RADIO [OFF]' : `📻 ${STATIONS[station].freq} ${STATIONS[station].name}`,
        256,
        64
      );
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [station]);

  return (
    <group
      position={[1.95, y + 0.87, -1.38]}
      rotation={[0, -1.35, 0]}
      onClick={handleNextStation}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Interactive Hover Highlight Glow */}
      {hovered && (
        <pointLight position={[0, 0.15, 0.15]} intensity={0.6} color={STATIONS[station].color} distance={1.2} />
      )}

      {/* Floating Station Readout Display above radio when hovered or playing */}
      {(hovered || station !== 0) && (
        <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.42, 0.11]} />
          <meshBasicMaterial map={labelTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Metal Radio Chassis */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.26, 0.18, 0.16]} />
        <meshStandardMaterial
          color="#3E4C38"
          roughness={0.6}
          emissive={hovered ? '#4A5D43' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Speaker Grille */}
      <mesh position={[-0.05, 0.09, 0.081]}>
        <planeGeometry args={[0.11, 0.12]} />
        <meshStandardMaterial color="#1A2216" roughness={0.8} />
      </mesh>

      {/* Glowing Amber Frequency Dial */}
      <mesh position={[0.06, 0.12, 0.082]}>
        <planeGeometry args={[0.08, 0.05]} />
        <meshStandardMaterial
          ref={dialRef}
          color={STATIONS[station].color}
          emissive={STATIONS[station].color}
          emissiveIntensity={station !== 0 ? 0.8 : 0.1}
        />
      </mesh>

      {/* Tuning Knob (Rotates on click) */}
      <mesh ref={knobRef} position={[0.04, 0.05, 0.082]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} />
      </mesh>

      {/* Telescopic Antenna extending upward */}
      <mesh position={[0.1, 0.35, -0.05]}>
        <cylinderGeometry args={[0.003, 0.005, 0.45, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Handset microphone */}
      <mesh position={[-0.16, 0.05, 0.04]}>
        <boxGeometry args={[0.04, 0.09, 0.03]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>

      {/* Floating 3D Music Notes drifting out of speaker when playing */}
      <group ref={notesRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`note-${i}`} position={[-0.05, 0.15, 0.08]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color={STATIONS[station].color} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default VintageRadio;
