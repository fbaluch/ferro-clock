import React from 'react';
import Segment from './Segment';
import DigitParticleSystem from './DigitParticleSystem';

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

const SEG_LEN = 0.8;
const VERT_OFFSET = SEG_LEN / 2; // 0.4

const Digit: React.FC<DigitProps> = ({
  value,
  position,
  color,
  scale,
  showSegments,
  particleCount = 400,      // 400-ish gives ~65 filings per bar on "0"
  particleSize = 0.05,
  particleSpread = 0.6,     // start much closer to the digit
  digitPosition
}) => {
  // Define segment configurations
  const segmentConfigs: SegmentConfig[] = [
    { position: [0, 1, 0], rotation: [0, 0, 0] },                // A - Top (horizontal)
    { position: [VERT_OFFSET, 0.5, 0], rotation: [0, 0, Math.PI/2] },  // B - Top Right (vertical)
    { position: [VERT_OFFSET, -0.5, 0], rotation: [0, 0, Math.PI/2] }, // C - Bottom Right (vertical)
    { position: [0, -1, 0], rotation: [0, 0, 0] },               // D - Bottom (horizontal)
    { position: [-VERT_OFFSET, -0.5, 0], rotation: [0, 0, Math.PI/2] }, // E - Bottom Left (vertical)
    { position: [-VERT_OFFSET, 0.5, 0], rotation: [0, 0, Math.PI/2] },  // F - Top Left (vertical)
    { position: [0, 0, 0], rotation: [0, 0, 0] }                 // G - Middle (horizontal)
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

  const activeSegments = segmentMap[value];

  return (
    <group position={position}>
      {segmentConfigs.map((config, index) => (
        <Segment
          key={`${digitPosition}-${index}`}
          position={config.position}
          rotation={config.rotation}
          active={activeSegments.includes(index)}
          color={color}
          isDigitActive={showSegments}
          digitId={`${digitPosition}-${index}`}
        />
      ))}
      
      <DigitParticleSystem
        color={color}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
        activeSegments={activeSegments}
        segmentConfigs={segmentConfigs}
        digitPosition={digitPosition}
      />
    </group>
  );
};

export default Digit;