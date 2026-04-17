import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeStore } from '../../stores';

/**
 * Golden Hour sky — softer, more cohesive palette with fewer harsh color bands.
 * Sun glow positioned low on the horizon to avoid washing out center text.
 */
const SunsetSky = () => {
  const theme = useThemeStore((state) => state.theme);

  const uniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color('#192038') },
      uMidColor: { value: new THREE.Color('#5c4a6e') },
      uWarmColor: { value: new THREE.Color('#d4896a') },
      uHorizonColor: { value: new THREE.Color('#e8b06a') },
      uSunColor: { value: new THREE.Color('#fff0d0') },
      uSunDir: { value: new THREE.Vector3(0, -0.15, -1).normalize() },
      // Start at correct value to prevent flash
      uNightMix: { value: theme.type === 'night' ? 1.0 : 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const targetNight = theme.type === 'night' ? 1.0 : 0.0;
    uniforms.uNightMix.value += (targetNight - uniforms.uNightMix.value) * delta * 3;
    if (Math.abs(uniforms.uNightMix.value - targetNight) < 0.005) {
      uniforms.uNightMix.value = targetNight;
    }
  });

  const vertexShader = `
    varying vec3 vWorldDir;
    void main() {
      vWorldDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uTopColor;
    uniform vec3 uMidColor;
    uniform vec3 uWarmColor;
    uniform vec3 uHorizonColor;
    uniform vec3 uSunColor;
    uniform vec3 uSunDir;
    uniform float uNightMix;
    varying vec3 vWorldDir;

    void main() {
      vec3 dir = normalize(vWorldDir);
      float h = dir.y * 0.5 + 0.5; // 0 = bottom, 1 = top

      // Simple 3-stop gradient with smooth blending (fewer bands = more cohesive)
      vec3 color;
      color = mix(uHorizonColor, uWarmColor, smoothstep(0.35, 0.48, h));
      color = mix(color, uMidColor, smoothstep(0.46, 0.56, h));
      color = mix(color, uTopColor, smoothstep(0.54, 0.78, h));

      // Soft sun glow — lower on horizon, wide and gentle
      float sunAngle = max(dot(dir, uSunDir), 0.0);
      float sunGlow = pow(sunAngle, 6.0) * 0.35;
      float sunCore = pow(sunAngle, 48.0) * 0.2;
      color += uSunColor * (sunGlow + sunCore);

      // Very subtle horizon haze
      float horizonProximity = 1.0 - abs(dir.y);
      float haze = pow(horizonProximity, 5.0) * 0.05;
      color += vec3(1.0, 0.92, 0.78) * haze;

      // Night mode
      vec3 nightColor = mix(vec3(0.05, 0.04, 0.09), vec3(0.02, 0.02, 0.05), smoothstep(0.4, 0.8, h));
      color = mix(color, nightColor, uNightMix);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default SunsetSky;
