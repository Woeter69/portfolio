import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeStore } from '../../stores';

/**
 * Golden Hour sky — a warm, inviting gradient from soft indigo at the zenith
 * through rose and coral to a golden peach horizon, with a soft sun glow.
 */
const SunsetSky = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const theme = useThemeStore((state) => state.theme);

  const uniforms = useMemo(
    () => ({
      // Golden Hour palette
      uTopColor: { value: new THREE.Color('#1a2744') },       // deep soft blue
      uUpperColor: { value: new THREE.Color('#3d3068') },     // muted purple
      uMidColor: { value: new THREE.Color('#b5586e') },       // dusty rose
      uWarmColor: { value: new THREE.Color('#e89060') },      // peachy coral
      uHorizonColor: { value: new THREE.Color('#ffc878') },   // warm golden
      uSunColor: { value: new THREE.Color('#fff5e0') },       // soft white-gold
      uSunPosition: { value: new THREE.Vector2(0.5, 0.12) },
      uTime: { value: 0 },
      uNightMix: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta * 0.05;

    // Smoothly interpolate night mix
    const targetNight = theme.type === 'night' ? 1.0 : 0.0;
    uniforms.uNightMix.value += (targetNight - uniforms.uNightMix.value) * delta * 3;
    // Snap to target when very close
    if (Math.abs(uniforms.uNightMix.value - targetNight) < 0.005) {
      uniforms.uNightMix.value = targetNight;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uTopColor;
    uniform vec3 uUpperColor;
    uniform vec3 uMidColor;
    uniform vec3 uWarmColor;
    uniform vec3 uHorizonColor;
    uniform vec3 uSunColor;
    uniform vec2 uSunPosition;
    uniform float uTime;
    uniform float uNightMix;
    varying vec2 vUv;

    void main() {
      float y = vUv.y;

      // 5-stop smooth gradient (golden hour)
      vec3 color;
      if (y < 0.12) {
        color = mix(uHorizonColor, uWarmColor, y / 0.12);
      } else if (y < 0.3) {
        color = mix(uWarmColor, uMidColor, (y - 0.12) / 0.18);
      } else if (y < 0.5) {
        color = mix(uMidColor, uUpperColor, (y - 0.3) / 0.2);
      } else {
        color = mix(uUpperColor, uTopColor, (y - 0.5) / 0.5);
      }

      // Soft sun glow near horizon
      float sunDist = distance(vec2(vUv.x, y), uSunPosition);
      float sunGlow = exp(-sunDist * 6.0) * 0.5;
      float sunCore = exp(-sunDist * 25.0) * 0.3;
      color += uSunColor * (sunGlow + sunCore);

      // Warm atmospheric haze at horizon
      float haze = exp(-y * 5.0) * 0.1;
      color += vec3(1.0, 0.9, 0.7) * haze;

      // Night mode: lerp to dark blue-black sky
      vec3 nightTop = vec3(0.02, 0.02, 0.06);
      vec3 nightMid = vec3(0.04, 0.03, 0.08);
      vec3 nightBottom = vec3(0.06, 0.04, 0.1);
      vec3 nightColor;
      if (y < 0.3) {
        nightColor = mix(nightBottom, nightMid, y / 0.3);
      } else {
        nightColor = mix(nightMid, nightTop, (y - 0.3) / 0.7);
      }
      color = mix(color, nightColor, uNightMix);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
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
