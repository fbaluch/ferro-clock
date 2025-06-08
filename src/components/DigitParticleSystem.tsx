import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Color } from 'three';

// --- Helpers to pick a random spot inside a given bar ---
const SEG_LEN = 0.8;    // must mirror <Segment> width
const SEG_THICK = 0.15; // must mirror <Segment> height

function randomPointInBar(segIdx: number, configs: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
}>) {
  const { position, rotation } = configs[segIdx];

  // local coords inside the bar rectangle
  const along  = (Math.random() - 0.5) * SEG_LEN;
  const across = (Math.random() - 0.5) * SEG_THICK;

  // rotate into digit space
  const sin = Math.sin(rotation[2]);
  const cos = Math.cos(rotation[2]);

  const x = position[0] + along * cos - across * sin;
  const y = position[1] + along * sin + across * cos;
  const z = position[2] + (Math.random() - 0.5) * 0.02; // tiny depth noise
  return [x, y, z] as [number, number, number];
}

// Physics constants
const MAX_FORCE = 0.015;  // half the old cap
const DAMPING = 0.88;     // was 0.95 – lower = heavier damping

interface DigitParticleSystemProps {
  color: string;
  particleCount: number;
  particleSize: number;
  particleSpread: number;
  activeSegments: number[];
  segmentConfigs: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  digitPosition: string;
}

const DigitParticleSystem: React.FC<DigitParticleSystemProps> = ({
  color,
  particleCount,
  particleSize,
  particleSpread,
  activeSegments,
  segmentConfigs,
  digitPosition
}) => {
  const particlesRef = useRef<BufferGeometry>(null);
  const velocities = useRef<[number, number, number][]>([]);
  const restPositions = useRef<[number, number, number][]>([]);
  const previousTargets = useRef<number[]>([]);
  const barTargets = useRef<[number, number, number][]>(
    new Array(particleCount).fill([0,0,0])
  );
  
  // Initialize positions and targets
  const initialPositions = useMemo(() => {
    const posArray = new Float32Array(particleCount * 3);
    const initialPositions: [number, number, number][] = [];
    const initialTargets: number[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * particleSpread;
      const y = (Math.random() - 0.5) * particleSpread;
      const z = (Math.random() - 0.5) * particleSpread;
      
      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
      
      initialPositions.push([x, y, z]);
      initialTargets.push(-1); // No initial target
    }
    
    restPositions.current = initialPositions;
    velocities.current = new Array(particleCount)
      .fill(null)
      .map(() => [0, 0, 0] as [number, number, number]);
    previousTargets.current = initialTargets;
    
    return posArray;
  }, [particleCount, particleSpread]);

  useFrame(() => {
    if (!particlesRef.current || !restPositions.current.length) return;
    
    const positions = particlesRef.current.attributes.position.array as Float32Array;
    let needsUpdate = false;

    for (let i = 0; i < particleCount; i++) {
      const index = i * 3;
      
      // Determine target segment for this particle
      const targetSegmentIndex = activeSegments[i % activeSegments.length];
      
      // Pick (or reuse) a random anchor point *inside* that bar
      if (previousTargets.current[i] !== targetSegmentIndex) {
        barTargets.current[i] = randomPointInBar(targetSegmentIndex, segmentConfigs);
      }
      const [targetX, targetY, targetZ] = barTargets.current[i];

      // Check if target has changed
      if (previousTargets.current[i] !== targetSegmentIndex) {
        // Reset velocity with random initial values when target changes
        velocities.current[i] = [
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ];
        previousTargets.current[i] = targetSegmentIndex;
      }

      // Get current particle position
      const px = positions[index];
      const py = positions[index + 1];
      const pz = positions[index + 2];

      // Calculate direction to target
      const dx = targetX - px;
      const dy = targetY - py;
      const dz = targetZ - pz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > 0.005) {
        needsUpdate = true;
        const force = Math.min(0.08 / (distance + 0.02), MAX_FORCE);

        velocities.current[i][0] += force * dx;
        velocities.current[i][1] += force * dy;
        velocities.current[i][2] += force * dz;

        // Apply damping using constant
        velocities.current[i][0] *= DAMPING;
        velocities.current[i][1] *= DAMPING;
        velocities.current[i][2] *= DAMPING;

        positions[index] += velocities.current[i][0];
        positions[index + 1] += velocities.current[i][1];
        positions[index + 2] += velocities.current[i][2];
      }
    }

    if (needsUpdate) {
      particlesRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        color={new Color(color)}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

export default DigitParticleSystem;