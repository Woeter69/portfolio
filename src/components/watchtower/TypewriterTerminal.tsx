import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { useInteractionStore } from '../../stores';

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  palette: Record<string, string>;
}

const TypewriterTerminal = ({ position = [0, 0, 0], rotation = [0, 0, 0], palette: I }: Props) => {
  const { setFocusedProp, focusedProp } = useInteractionStore();
  const [hovered, setHovered] = useState(false);
  
  // Real-time terminal history buffer & active line input
  const [history, setHistory] = useState<string[]>([
    "LITWIZ OS v1.0.4",
    "System initialization complete.",
    "Guest credentials verified.",
    "",
    "Type 'help' to review commands.",
    ""
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  
  // High-performance Set for snappy mechanical key depression
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  // Cinematic Page Rip State
  const [flyingPage, setFlyingPage] = useState<{ text: string; shiftY: number } | null>(null);
  
  const flyingGroupRef = useRef<THREE.Group>(null);
  const flyingMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const flyingTextRef = useRef<any>(null);

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(timer);
  }, []);

  useFrame((_, delta) => {
    if (flyingPage && flyingGroupRef.current && flyingMatRef.current && flyingTextRef.current) {
      // Ejection physics: Shoot UP, BACK, and SPIN backward
      flyingGroupRef.current.position.y += delta * 1.5;
      flyingGroupRef.current.position.z -= delta * 1.0;
      flyingGroupRef.current.rotation.x -= delta * 2.5;
      
      // Fade out
      flyingMatRef.current.opacity -= delta * 1.0;
      
      if (flyingTextRef.current.material) {
        flyingTextRef.current.material.opacity = flyingMatRef.current.opacity;
        flyingTextRef.current.material.transparent = true;
      }

      // GC when fully faded
      if (flyingMatRef.current.opacity <= 0) {
        setFlyingPage(null);
      }
    }
  });

  const isActive = focusedProp === 'typewriter';

  useEffect(() => {
    document.body.style.cursor = hovered && !isActive ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered, isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleOutsideClick = () => {
      setFocusedProp('none');
    };

    // Delay listener attachment so initial focus click doesn't close it immediately
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isActive, setFocusedProp]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocusedProp('none');
        return;
      }
      
      // Prevent browser shortcuts (like spacebar scrolling) while typing
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code) || e.key.length === 1) {
        e.preventDefault();
      }

      const keyId = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      
      // Snap key down
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(keyId); 
        return next;
      });

      // Snap key up 100ms later (rapid mechanical stroke)
      setTimeout(() => {
        setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(keyId);
          return next;
        });
      }, 100);

      if (e.key === 'Backspace') {
        setCurrentInput(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
      } else if (e.key === 'Enter') {
        const cmd = currentInput.trim().toLowerCase();
        const newHistory = [...history, "> " + currentInput];

        if (cmd === 'help') {
          newHistory.push(
            "AVAILABLE COMMANDS:",
            "  about    - Bio & Background",
            "  skills   - Technical Arsenal",
            "  projects - Featured Work",
            "  contact  - Get in Touch",
            "  clear    - Clear paper buffer",
            "  exit     - Leave terminal",
            ""
          );
        } else if (cmd === 'about') {
          newHistory.push(
            "Woeter: Full-Stack & 3D Developer.",
            "Crafting immersive web experiences",
            "with React, Three.js, & TypeScript.",
            ""
          );
        } else if (cmd === 'skills') {
          newHistory.push(
            "Core: TypeScript, JavaScript, HTML/CSS",
            "Web: React 19, Next.js, Vite, Tailwind",
            "3D: Three.js, R3F, GSAP, Blender",
            ""
          );
        } else if (cmd === 'projects') {
          newHistory.push(
            "1. Proteus - Materials science pipeline",
            "2. Gifted India - AI Grader platform",
            "3. Firewatch Portfolio - 3D interactive site",
            ""
          );
        } else if (cmd === 'contact') {
          newHistory.push(
            "GitHub: github.com/Woeter69",
            "Email: contact@woeter.dev",
            ""
          );
        } else if (cmd === 'clear') {
          setHistory(["LITWIZ OS v1.0.4 - Cleared", ""]);
          setCurrentInput("");
          return;
        } else if (cmd === 'exit' || cmd === 'quit') {
          setFocusedProp('none');
          return;
        } else if (cmd !== '') {
          newHistory.push(`Command '${cmd}' not recognized.`, "Type 'help' for commands.", "");
        } else {
          newHistory.push("");
        }

        // Physical Line Limit Trigger!
        if (newHistory.length >= 20) {
          const shiftSnip = Math.max(0, newHistory.length - 11) * 0.015;
          setFlyingPage({ text: newHistory.join('\n'), shiftY: shiftSnip });
          setHistory(["> " + cmd, ""]);
        } else {
          setHistory(newHistory);
        }
        setCurrentInput("");
      } else if (e.key.length === 1) {
        setCurrentInput(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, setFocusedProp, history, currentInput]);

  const terminalText = history.join('\n') + '\n> ' + currentInput + (showCursor ? '_' : '');
  const lineCount = history.length + 1;
  const paperShiftY = Math.max(0, lineCount - 11) * 0.015;

  // Dynamic Canvas Texture for Typewriter Readout Label above Typewriter
  const typewriterLabelTexture = useMemo(() => {
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
      ctx.strokeStyle = isActive ? '#4ADE80' : '#F4A261';
      ctx.lineWidth = 4;
      ctx.stroke();

      const text = isActive
        ? '⌨️ TERMINAL ACTIVE — PRESS ESC TO EXIT'
        : '⌨️ TYPEWRITER TERMINAL — CLICK TO TYPE COMMANDS';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 384, 72);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [isActive]);

  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => { 
        e.stopPropagation(); 
        if (!isActive) setFocusedProp('typewriter'); 
      }}
    >
      {/* Floating Readout Popup Display above Typewriter */}
      {(hovered || isActive) && (
        <mesh position={[0, 0.48, -0.05]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.62, 0.11]} />
          <meshBasicMaterial map={typewriterLabelTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Main body curved styling */}
      <mesh position={[0, 0.06, -0.05]}>
        <boxGeometry args={[0.38, 0.12, 0.22]} />
        {/* Adds emissive bloom on hover to indicate interactability */}
        <meshStandardMaterial 
          color={I.typewriter} 
          roughness={0.8} 
          emissive={hovered && !isActive ? I.typewriter : '#000'}
          emissiveIntensity={hovered && !isActive ? 0.3 : 0}
        />
      </mesh>
      {/* Upper chassis */}
      <mesh position={[0, 0.14, -0.08]}>
        <boxGeometry args={[0.34, 0.08, 0.16]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      {/* Keyboard Slant (Front face) */}
      <mesh position={[0, 0.05, 0.17]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.34, 0.05, 0.22]} />
        <meshStandardMaterial color={I.typewriter} roughness={0.8} />
      </mesh>
      
      {/* High-Fidelity Keyboard Typography */}
      {[
        { zStart: -0.06, string: "1234567890", xOffset: -0.108 },
        { zStart: -0.02, string: "QWERTYUIOP", xOffset: -0.108 },
        { zStart: 0.02, string: "ASDFGHJKL", xOffset: -0.096 },
        { zStart: 0.06, string: "ZXCVBNM", xOffset: -0.072 },
      ].map((row, rIdx) => {
        const keys = row.string.split("");
        const spacing = 0.024;
        return (
          <group key={`keyrow-${rIdx}`} position={[0, 0.07 + (3 - rIdx) * 0.01, 0.18 + row.zStart]} rotation={[0.4, 0, 0]}>
            {keys.map((char, i) => {
              // Mathematical snap downward by 0.012 & tilt if stroke is active
              const isPressed = activeKeys.has(char);
              const keyDepressionY = isPressed ? -0.012 : 0;
              const keyTiltX = isPressed ? 0.25 : 0;
              
              return (
                <group key={char} position={[row.xOffset + i * spacing, keyDepressionY, 0]} rotation={[keyTiltX, 0, 0]}>
                  {/* Ivory Key Shell */}
                  <mesh>
                    <cylinderGeometry args={[0.009, 0.008, 0.01, 16]} />
                    <meshStandardMaterial color={I.white} roughness={0.6} />
                  </mesh>
                  {/* Black Interior Depression */}
                  <mesh position={[0, 0.005, 0]}>
                    <cylinderGeometry args={[0.007, 0.007, 0.002, 16]} />
                    <meshStandardMaterial color="#222" roughness={0.8} />
                  </mesh>
                  {/* Independent Typography */}
                  <Text
                    position={[0, 0.0065, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.009}
                    color={I.white}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {char}
                  </Text>
                </group>
              );
            })}
          </group>
        );
      })}
      
      {/* Spacebar */}
      <group 
        position={[0, 0.07 + (activeKeys.has('SPACE') ? -0.012 : 0), 0.28]} 
        rotation={[0.4 + (activeKeys.has('SPACE') ? 0.2 : 0), 0, 0]}
      >
        <mesh>
          <boxGeometry args={[0.12, 0.01, 0.02]} />
          <meshStandardMaterial color={I.white} roughness={0.6} />
        </mesh>
      </group>

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

      {/* Dedicated Warm Point Light illuminating the keys and paper for ultra clarity */}
      {isActive && (
        <pointLight position={[0, 0.35, 0.1]} distance={1.5} intensity={1.5} color="#fff8ed" />
      )}

      {/* Mechanical Typebar Striker that springs up to strike the paper when typing */}
      {activeKeys.size > 0 && (
        <group position={[0, 0.18, -0.05]} rotation={[-0.2, 0, 0]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.14, 8]} />
            <meshStandardMaterial color={I.metal} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[0.01, 0.02, 0.01]} />
            <meshStandardMaterial color={I.metalDark} metalness={0.9} />
          </mesh>
        </group>
      )}
      
      {/* Crisp flat paper jutting up and backwards dynamically out of the platen roller */}
      <group position={[0, 0.32, -0.14]} rotation={[-0.3, 0, 0]}>
        {/* Procedurally extrude the paper upwards into the air while locking the bottom edge mechanically to the roller! */}
        <mesh position={[0, paperShiftY * 0.5, 0]}>
          <planeGeometry args={[0.22, 0.3 + paperShiftY]} />
          <meshStandardMaterial color={I.white} side={THREE.DoubleSide} />
        </mesh>
        
        <Text
          position={[0, 0.13 + paperShiftY, 0.001]} // Track physical extrusion upward
          font="./outfit.ttf"
          fontSize={0.013}
          color="#0a0a0a"
          outlineWidth={0.0003}
          outlineColor="#000000"
          letterSpacing={0.02}
          maxWidth={0.19}
          lineHeight={1.4}
          textAlign="left"
          anchorX="center"
          anchorY="top"
        >
          {terminalText}
        </Text>
      </group>
      
      {/* 
        Cinematic Ejection Clone Geometry
        Perfectly matches the layout of the paper buffer above, but isolates physics to independent state
      */}
      {flyingPage && (
        <group 
          ref={flyingGroupRef} 
          position={[0, 0.32, -0.14]} 
          rotation={[-0.3, 0, 0]}
        >
          <mesh position={[0, flyingPage.shiftY * 0.5, 0]}>
            <planeGeometry args={[0.22, 0.3 + flyingPage.shiftY]} />
            <meshStandardMaterial 
              ref={flyingMatRef}
              color={I.white} 
              side={THREE.DoubleSide} 
              transparent={true}
              opacity={1}
            />
          </mesh>
          <Text
            ref={flyingTextRef}
            position={[0, 0.13 + flyingPage.shiftY, 0.001]}
            font="./outfit.ttf"
            fontSize={0.013}
            color="#0a0a0a"
            outlineWidth={0.0003}
            outlineColor="#000000"
            letterSpacing={0.02}
            maxWidth={0.19}
            lineHeight={1.4}
            textAlign="left"
            anchorX="center"
            anchorY="top"
          >
            {flyingPage.text}
          </Text>
        </group>
      )}
      
      {isActive && (
        <Html position={[0, 0.4, 0]} center>
          <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap' }}>
            [ ESC to Exit Terminal ]
          </div>
        </Html>
      )}
    </group>
  );
};

export default TypewriterTerminal;
