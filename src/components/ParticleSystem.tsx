import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Color, BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticleSystemProps {
  color: string;
  count: number;
  size: number;
  spread: number;
  active: boolean;
  position: [number, number, number];
  digitId: string; // Changed from number to string
  rotation: [number, number, number]; // Added rotation prop
  width: number; // Added width prop
  height: number; // Added height prop
  depth: number; // Added depth prop
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  color,
  count,
  size,
  spread,
  active,
  position,
  digitId,
  rotation, // Destructure rotation prop
  width, // Destructure width prop
  height, // Destructure height prop
  depth, // Destructure depth prop
}) => {
  const particlesRef = useRef<BufferGeometry>(null);
  const velocities = useMemo(() => {
    if (count <= 0) return [];
    return new Array(count).fill(null).map(() => [0, 0, 0]);
  }, [count]);
  const previousActiveState = useRef(new Map<string, boolean>());
  const [isAnimating, setIsAnimating] = useState(new Map<string, boolean>());

  const particles = useRef<number[]>([]);
  if (particles.current.length === 0) {
    const vertices: number[] = [];
    const length = width;
    const thickness = height;
    const segmentRotation = rotation[2];

    for (let i = 0; i < count; i++) {
      const along = (Math.random() - 0.5) * length;
      const across = (Math.random() - 0.5) * thickness * 0.9;
      const z = (Math.random() - 0.5) * depth * 0.3;
      let x = along;
      let y = across;
      const sinR = Math.sin(segmentRotation);
      const cosR = Math.cos(segmentRotation);
      const rx = x * cosR - y * sinR;
      const ry = x * sinR + y * cosR;
      vertices.push(rx, ry, z);
    }
    particles.current = vertices;
  }

  const restPositions = useRef<[number, number, number][]>([]);
  if (restPositions.current.length === 0) {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      positions.push([
        (Math.random() - 0.5) * spread * 0.8, // Much closer to segment
        (Math.random() - 0.5) * spread * 0.8,
        (Math.random() - 0.5) * spread * 0.1
      ]);
    }
    restPositions.current = positions;
  }

  const maxForce = 0.03; // Cap for maximum force to stabilize motion
  const minDistance = 0.2; // Minimum distance threshold to avoid excessive forces

  useEffect(() => {
    // Initialize the previous state on mount
    if (!previousActiveState.current.has(digitId)) {
      previousActiveState.current.set(digitId, active);
    }
  }, [digitId, active]);

  useEffect(() => {
    if (previousActiveState.current.get(digitId) !== active) {
      previousActiveState.current.set(digitId, active);
      setIsAnimating((prev) => new Map(prev).set(digitId, true));

      // Reset velocities for smooth transition
      for (let i = 0; i < count; i++) {
        velocities[i][0] = (Math.random() - 0.5) * 0.005;
        velocities[i][1] = (Math.random() - 0.5) * 0.005;
        velocities[i][2] = (Math.random() - 0.5) * 0.005;
      }
    }
  }, [active, digitId, count]);

  useFrame(() => {
    if (!particlesRef.current || !isAnimating.get(digitId)) return;

    const positions = particlesRef.current.attributes.position.array as Float32Array;
    let needsUpdate = false;

    // Segment centre in local coords
    const centre = [position[0], position[1], position[2]];

    for (let i = 0; i < count; i++) {
        const index = i * 3;
        const px = positions[index];
        const py = positions[index + 1];
        const pz = positions[index + 2];

        // If active, head towards segment centre; else towards rest position
        const targetX = active ? centre[0] : restPositions.current[i][0];
        const targetY = active ? centre[1] : restPositions.current[i][1];
        const targetZ = active ? centre[2] : restPositions.current[i][2];

        // Calculate distance to target
        const dx = targetX - px;
        const dy = targetY - py;
        const dz = targetZ - pz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > 0.01) { // Convergence threshold
          needsUpdate = true; // Mark that an update is needed

          // Apply forces to move toward target
          const force = Math.min(0.1 / (distance + 0.01), maxForce);
          velocities[i][0] += force * dx;
          velocities[i][1] += force * dy;
          velocities[i][2] += force * dz;

          // Apply damping/friction
          velocities[i][0] *= 0.99;
          velocities[i][1] *= 0.99;
          velocities[i][2] *= 0.99;

          // Update positions
          positions[index] += velocities[i][0];
          positions[index + 1] += velocities[i][1];
          positions[index + 2] += velocities[i][2];
        }
    }

    if (needsUpdate) {
      particlesRef.current.attributes.position.needsUpdate = true;
    } else {
      setIsAnimating((prev) => new Map(prev).set(digitId, false)); // Stop animating for this digit
    }
  });

  return (
    <points position={position}>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(particles.current), 3]}
          count={particles.current.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={new Color(color)}
        transparent
        opacity={active ? 0.8 : 0.1}
        sizeAttenuation
      />
    </points>
  );
};

export default ParticleSystem;
