import { useRef, useState } from 'react';
import { Text, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FooterLinkData {
  name: string;
  url: string;
  hoverText: string;
}

const FOOTER_LINKS: FooterLinkData[] = [
  { name: 'GitHub', url: 'https://github.com/Woeter69', hoverText: 'Open Source' },
  { name: 'LinkedIn', url: '#', hoverText: 'Connect' },
  { name: 'Email', url: 'mailto:hello@example.com', hoverText: 'Say hi!' },
];

const FooterLink = ({ link }: { link: FooterLinkData }) => {
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const fontProps = {
    font: './space-grotesk.ttf',
    fontSize: 0.2,
    color: 'white' as const,
  };

  return (
    <Text
      ref={textRef}
      {...fontProps}
      letterSpacing={hovered ? 0.3 : 0}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={() => window.open(link.url, '_blank')}
    >
      {link.name.toUpperCase()}
    </Text>
  );
};

/**
 * Footer section with social links inside the 3D canvas.
 */
const Footer = () => {
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();
  const isMobile = window.innerWidth <= 768;

  useFrame(() => {
    const d = data.range(0.8, 0.2);
    if (groupRef.current) {
      groupRef.current.visible = d > 0;
    }
  });

  return (
    <group position={[0, -44, 18]} rotation={[-Math.PI / 2, 0, 0]} ref={groupRef}>
      <group position={[isMobile ? -1.5 : -2, 0, 0]}>
        {FOOTER_LINKS.map((link, i) => (
          <group key={i} position={[i * (isMobile ? 1.5 : 2), 0, 0]}>
            <FooterLink link={link} />
          </group>
        ))}
      </group>
    </group>
  );
};

export default Footer;
