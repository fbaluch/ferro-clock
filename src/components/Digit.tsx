import React from 'react';
import Segment from './Segment';

interface DigitProps {
  value: number;
  position: [number, number, number];
  color: string;
  scale: number;
  showSegments: boolean;
  particleCount?: number;
  particleSize?: number;
  particleSpread?: number;
  digitPosition: string; // New prop to uniquely identify the digit
}

interface SegmentConfig {
  position: [number, number, number];
  rotation: [number, number, number];
}

const Digit: React.FC<DigitProps> = ({
  value,
  position,
  color,
  scale,
  showSegments,
  particleCount,
  particleSize,
  particleSpread,
  digitPosition
}) => {
  // Define segment configurations
  const segmentConfigs: SegmentConfig[] = [
    { position: [0, 1, 0], rotation: [0, 0, 0] },           // A - Top
    { position: [0.325, 0.5, 0], rotation: [0, 0, Math.PI / 2] },  // B - Top Right
    { position: [0.325, -0.5, 0], rotation: [0, 0, Math.PI / 2] }, // C - Bottom Right
    { position: [0, -1, 0], rotation: [0, 0, 0] },          // D - Bottom
    { position: [-0.325, -0.5, 0], rotation: [0, 0, Math.PI / 2] }, // E - Bottom Left
    { position: [-0.325, 0.5, 0], rotation: [0, 0, Math.PI / 2] },  // F - Top Left
    { position: [0, 0, 0], rotation: [0, 0, 0] }            // G - Middle
  ];

  // Define which segments are active for each number (0-9)
  const segmentMap: number[][] = [
    [0, 1, 2, 3, 4, 5],     // 0
    [1, 2],                 // 1
    [0, 1, 3, 4, 6],       // 2
    [0, 1, 2, 3, 6],       // 3
    [1, 2, 5, 6],          // 4
    [0, 2, 3, 5, 6],       // 5
    [0, 2, 3, 4, 5, 6],    // 6
    [0, 1, 2],             // 7
    [0, 1, 2, 3, 4, 5, 6], // 8
    [0, 1, 2, 3, 5, 6]     // 9
  ];

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {segmentConfigs.map((config, index) => (
        <Segment
          key={`${digitPosition}-${index}`}
          position={config.position}
          rotation={config.rotation}
          active={segmentMap[value].includes(index)}
          isDigitActive={segmentMap[value].includes(index)}
          color={color}
          particleCount={particleCount}
          particleSize={particleSize}
          particleSpread={particleSpread}
          digitId={`${digitPosition}-${index}` as unknown as number} // Cast to match expected type
          particleColor={color} // Pass independent particle color
        />
      ))}
    </group>
  );
};

export default Digit;