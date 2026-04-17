import WatchtowerModel from './WatchtowerModel';

/**
 * Scene wrapper for the watchtower — positions it below the clouds
 * and adds warm golden-hour lighting.
 */
const WatchtowerScene = () => {
  return (
    <group position={[0, -45, -25]} rotation={[0, Math.PI, 0]}>
      {/* Warm directional light (golden hour angle) */}
      <directionalLight
        position={[-8, 15, -5]}
        intensity={1.8}
        color="#f0a050"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
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
    </group>
  );
};

export default WatchtowerScene;
