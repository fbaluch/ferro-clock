import React, { useMemo } from 'react';
import { Color, Shape, ExtrudeGeometry, MeshStandardMaterial } from 'three';
import ParticleSystem from './ParticleSystem';

interface SegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  active: boolean;
  isDigitActive: boolean;
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  particleCount?: number;
  particleSize?: number;
  particleSpread?: number;
  digitId: number; // Added digitId prop
  particleColor?: string; // New prop to specify particle color independently
  opacity?: number; // New prop to control segment opacity
}

const Segment: React.FC<SegmentProps> = ({
  position,
  rotation = [0, 0, 0],
  active,
  isDigitActive,
  color = '#ff0000',
  width = 0.8,
  height = 0.15,
  depth = 0.1,
  particleCount = 50,
  particleSize = 0.02,
  particleSpread = 0.2,
  digitId, // Destructure digitId
  particleColor = '#ffffff', // Default particle color
  opacity = 0.15, // Default opacity set to 15%
}) => {
  // Active and inactive colors with proper intensity
  const activeColor = new Color('#000000'); // Black for active segments
  const inactiveColor = new Color('#222222'); // Dark grey for inactive segments

  // Create custom geometry with triangular ends
  const geometry = useMemo(() => {
    const shape = new Shape();
    const halfHeight = height / 2;
    const halfWidth = width / 2;
    const triangleSize = height * 0.3; // Size of triangular ends

    // Start at bottom left
    shape.moveTo(-halfWidth + triangleSize, -halfHeight);
    // Line to bottom right
    shape.lineTo(halfWidth - triangleSize, -halfHeight);
    // Triangle at bottom right
    shape.lineTo(halfWidth, 0);
    shape.lineTo(halfWidth - triangleSize, halfHeight);
    // Line to top left
    shape.lineTo(-halfWidth + triangleSize, halfHeight);
    // Triangle at top left
    shape.lineTo(-halfWidth, 0);
    shape.lineTo(-halfWidth + triangleSize, -halfHeight);

    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: false
    };

    return new ExtrudeGeometry(shape, extrudeSettings);
  }, [width, height, depth]);

  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: active ? activeColor : inactiveColor,
      emissive: active ? activeColor : inactiveColor,
      emissiveIntensity: active ? 0.8 : 0.1, // Increased contrast
      roughness: 0.3, // More reflective
      metalness: 0.4, // More metallic look
      transparent: true, // Enable transparency
      opacity: active ? opacity : 1.0 // Use the provided opacity for active segments
    });
  }, [active, activeColor, inactiveColor, opacity]);

  return (
    <group>
      <ParticleSystem
        color={particleColor} // Use independent particle color
        count={particleCount}
        size={particleSize}
        spread={particleSpread}
        active={active}
        position={position}
        digitId={digitId} // Pass unique digitId to ParticleSystem
        rotation={rotation} // Pass rotation to ParticleSystem
        width={width} // Pass width to ParticleSystem
        height={height} // Pass height to ParticleSystem
        depth={depth} // Pass depth to ParticleSystem
      />
      <mesh
        position={position}
        rotation={rotation}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default Segment;