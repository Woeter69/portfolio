import { Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Volumetric cloud system tinted with sunset warmth.
 * Multiple cloud instances at different positions/sizes for parallax depth.
 */
const CloudContainer = () => {
  return (
    <Clouds
      material={THREE.MeshBasicMaterial}
      position={[0, -2, 0]}
      frustumCulled={false}
    >
      {/* Main large cloud cluster - center */}
      <Cloud
        seed={1}
        segments={1}
        concentrate="inside"
        bounds={[10, 10, 10]}
        growth={3}
        position={[-1, 0, 0]}
        smallestVolume={2}
        scale={1.9}
        volume={2}
        speed={0.15}
        fade={5}
        color="#FFE4C4"
      />

      {/* Secondary cluster - right */}
      <Cloud
        seed={3}
        segments={1}
        concentrate="outside"
        bounds={[10, 10, 10]}
        growth={2}
        position={[2, 0, 2]}
        smallestVolume={2}
        scale={1}
        volume={2}
        fade={3}
        speed={0.08}
        color="#FFDAB9"
      />

      {/* Large atmospheric cloud - lower left */}
      <Cloud
        seed={4}
        segments={1}
        concentrate="outside"
        bounds={[10, 20, 15]}
        growth={4}
        position={[-10, -10, 4]}
        smallestVolume={2}
        scale={2}
        speed={0.15}
        volume={3}
        color="#FFD7A8"
      />

      {/* Wispy cloud - right midground */}
      <Cloud
        seed={5}
        segments={1}
        concentrate="outside"
        bounds={[5, 5, 5]}
        growth={2}
        position={[6, -3, 8]}
        smallestVolume={2}
        scale={2}
        volume={2}
        fade={0.1}
        speed={0.08}
        color="#FFC8A0"
      />

      {/* Deep background cloud - far */}
      <Cloud
        seed={6}
        segments={1}
        concentrate="outside"
        bounds={[5, 5, 5]}
        growth={2}
        position={[0, -20, 20]}
        smallestVolume={2}
        scale={4}
        volume={3}
        fade={0.1}
        speed={0.05}
        color="#FFD0B0"
      />

      {/* Side cloud - far right */}
      <Cloud
        seed={7}
        segments={1}
        concentrate="outside"
        bounds={[5, 5, 5]}
        growth={2}
        position={[10, -15, -5]}
        smallestVolume={2}
        scale={3}
        volume={3}
        fade={0.1}
        speed={0.06}
        color="#FFE0C0"
      />
    </Clouds>
  );
};

export default CloudContainer;
