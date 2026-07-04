import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import WatchtowerModel from './WatchtowerModel';
import Landscape from './Landscape';

const ShadowEnabler = () => {
  const { scene } = useThree();
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);
  return null;
};

/**
 * Secret Hotkey Listener [Shift + E]
 * Serializes the entire generated scene graph into a binary .glb file for Blender extraction!
 */
const ModelExporter = () => {
  const { scene } = useThree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + E triggers the mass geometry extraction
      if (e.code === 'KeyE' && e.shiftKey) {
        console.log('Intercepted Shift+E! Packing procedural scene into GLB...');
        const exporter = new GLTFExporter();

        // Parse the entire scene graph, converting all primitives and canvas textures
        exporter.parse(
          scene,
          (gltf) => {
            const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = url;
            link.download = 'Procedural_Watchtower_Export.glb';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Extraction complete! Check your Downloads folder.');
          },
          (err) => {
            console.error('Extraction failed:', err);
          },
          { binary: true } // Pack textures directly into a self-contained .glb binary
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scene]);

  return null;
};

/**
 * Scene wrapper for the watchtower — positions it below the clouds
 * and adds warm golden-hour lighting.
 */
const WatchtowerScene = () => {
  return (
    <group position={[0, -60, -25]} rotation={[0, Math.PI, 0]}>
      <ShadowEnabler />
      <ModelExporter />
      {/* Warm directional light (golden hour angle) */}
      <directionalLight
        position={[-8, 15, -5]}
        intensity={1.8}
        color="#f0a050"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-far={50}
        shadow-bias={-0.0001}
      />
      {/* Fill light from opposite side */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.4}
        color="#8090c0"
      />
      {/* Ambient fill */}
      <ambientLight intensity={0.3} color="#ffeedd" />

      {/* The tower */}
      <WatchtowerModel />

      {/* Firewatch landscape */}
      <Landscape />
    </group>
  );
};

export default WatchtowerScene;

