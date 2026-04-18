import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
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
 * Scene wrapper for the watchtower — positions it below the clouds
 * and adds warm golden-hour lighting.
 */
const WatchtowerScene = () => {
  return (
    <group position={[0, -60, -25]} rotation={[0, Math.PI, 0]}>
      <ShadowEnabler />
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

