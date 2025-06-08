import React from 'react';
import { Mesh } from 'three';

interface SegmentProps {
  position: [number, number, number];
  rotation: [number, number, number];
  active: boolean;
  color: string;
  isDigitActive: boolean;
  digitId: string;
}

const Segment: React.FC<SegmentProps> = ({
  position,
  rotation,
  active,
  color,
  isDigitActive,
  digitId
}) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.8, 0.15, 0.15]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={active ? 0.3 : 0.1}
          depthWrite={false}   // ← NEW: don't write to z-buffer
        />
      </mesh>
    </group>
  );
};

export default Segment;