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
  digitId: number; // Unique identifier for the digit or segment
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
  const previousActiveState = useRef(new Map<number, boolean>());
  const [isAnimating, setIsAnimating] = useState(new Map<number, boolean>());

  const particlesMap = useRef(new Map<number, number[]>());

  const getOrCreateParticles = (digitId: number) => {
    if (!particlesMap.current.has(digitId)) {
      const vertices: number[] = [];
      // Create more scattered initial positions for dramatic movement
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 0.8 + Math.random() * 0.5; // Much larger initial spread
        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.3;
        const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.3;
        const z = (Math.random() - 0.5) * 0.2; // More z-axis variation
        vertices.push(x, y, z);
      }
      particlesMap.current.set(digitId, vertices);
    }
    return particlesMap.current.get(digitId) || [];
  };

  const particles = useMemo(() => getOrCreateParticles(digitId), [digitId]);

  useEffect(() => {
    if (!particles) {
      console.error('Particles array is undefined or empty for digitId:', digitId);
    }
    if (particlesRef.current && particles) {
      particlesRef.current.setAttribute(
        'position',
        new Float32BufferAttribute(particles, 3)
      );
    }
  }, [particles]);

  const restPositions = useRef<[number, number, number][]>([]);
  // Initialize rest positions once with larger scatter
  if (restPositions.current.length === 0) {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
      const radius = 0.8 + Math.random() * 0.7; // Larger rest scatter
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.4;
      const z = (Math.random() - 0.5) * 0.15;
      positions.push([x, y, z]);
    }
    restPositions.current = positions;
  }

  const targetPositions = useRef<[number, number, number][]>([]);

  const maxForce = 0.03; // Cap for maximum force to stabilize motion
  const minDistance = 0.2; // Minimum distance threshold to avoid excessive forces

  useEffect(() => {
    // Initialize the previous state on mount
    if (!previousActiveState.current.has(digitId)) {
      previousActiveState.current.set(digitId, active);
    }
  }, [digitId, active]);

  const animationStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (previousActiveState.current.get(digitId) !== active) {
      previousActiveState.current.set(digitId, active);
      setIsAnimating((prev) => new Map(prev).set(digitId, true));

      // Add dramatic initial velocities for visible movement
      for (let i = 0; i < count; i++) {
        if (active) {
          // Particles rush toward the segment
          velocities[i][0] = (Math.random() - 0.5) * 0.02;
          velocities[i][1] = (Math.random() - 0.5) * 0.02;
          velocities[i][2] = (Math.random() - 0.5) * 0.01;
        } else {
          // Particles scatter away from the segment
          velocities[i][0] = (Math.random() - 0.5) * 0.03;
          velocities[i][1] = (Math.random() - 0.5) * 0.03;
          velocities[i][2] = (Math.random() - 0.5) * 0.015;
        }
      }

      // Record the animation start time
      animationStartTime.current = performance.now();
    }
  }, [active, digitId, count]);

  useEffect(() => {
    if (active) {
      // Calculate target positions for activated segment - but only once per activation
      if (!targetPositions.current.length || previousActiveState.current.get(digitId) !== active) {
        const positions: [number, number, number][] = [];
        for (let i = 0; i < count; i++) {
          const along = (Math.random() - 0.5) * width;
          const across = (Math.random() - 0.5) * height * 0.9;
          const z = (Math.random() - 0.5) * depth * 0.3;
          let x = along;
          let y = across;
          const sinR = Math.sin(rotation[2]);
          const cosR = Math.cos(rotation[2]);
          const rx = x * cosR - y * sinR;
          const ry = x * sinR + y * cosR;
          positions.push([rx, ry, z]);
        }
        targetPositions.current = positions;
      }
    } else {
      // Use stable rest positions
      targetPositions.current = restPositions.current;
    }
  }, [active, digitId]); // Remove other dependencies that cause regeneration

  useFrame(() => {
    if (!targetPositions.current || targetPositions.current.length === 0) {
      console.error('Target positions are undefined or empty for digitId:', digitId);
      return;
    }

    if (!particlesRef.current || !isAnimating.get(digitId)) return; // Early return for performance

    const positions = particlesRef.current.attributes.position.array as Float32Array;
    if (!positions) {
      console.error('Positions array is undefined for digitId:', digitId);
      return;
    }

    let needsUpdate = false; // Track if any particle needs an update

    for (let i = 0; i < count; i++) {
      const index = i * 3;
      const px = positions[index];
      const py = positions[index + 1];
      const pz = positions[index + 2];

      const [targetX, targetY, targetZ] = targetPositions.current[i] || [0, 0, 0];

      const dx = targetX - px;
      const dy = targetY - py;
      const dz = targetZ - pz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > 0.01) { // Larger convergence threshold for longer movement
        needsUpdate = true;

        // Stronger forces for more dramatic movement
        const force = Math.min(0.2 / (distance + 0.01), 0.08); // Increased force
        velocities[i][0] += force * dx;
        velocities[i][1] += force * dy;
        velocities[i][2] += force * dz;

        // Less aggressive damping for longer movement
        velocities[i][0] *= 0.98; // Reduced damping
        velocities[i][1] *= 0.98;
        velocities[i][2] *= 0.98;

        // Update positions
        positions[index] += velocities[i][0];
        positions[index + 1] += velocities[i][1];
        positions[index + 2] += velocities[i][2];
      }
    }

    const settlingTime = 2000; // 2 seconds for settling
    const elapsedTime = animationStartTime.current ? performance.now() - animationStartTime.current : 0;

    // Don't stop animation immediately, allow for settling
    if (!needsUpdate && elapsedTime > settlingTime) {
      // Gradual velocity reduction for settling effect
      let totalVelocity = 0;
      for (let i = 0; i < count; i++) {
        totalVelocity += Math.abs(velocities[i][0]) + Math.abs(velocities[i][1]) + Math.abs(velocities[i][2]);
        // Gradual velocity reduction
        velocities[i][0] *= 0.9;
        velocities[i][1] *= 0.9;
        velocities[i][2] *= 0.9;
      }

      // Stop when total velocity is very low
      if (totalVelocity < 0.001) {
        setIsAnimating((prev) => new Map(prev).set(digitId, false));
        animationStartTime.current = null;
        // Final velocity reset
        for (let i = 0; i < count; i++) {
          velocities[i][0] = 0;
          velocities[i][1] = 0;
          velocities[i][2] = 0;
        }
      }
    } else if (needsUpdate) {
      particlesRef.current.attributes.position.needsUpdate = true;
    }

    // Immediately stop very small movements
    for (let i = 0; i < count; i++) {
      if (Math.abs(velocities[i][0]) < 0.0001) velocities[i][0] = 0;
      if (Math.abs(velocities[i][1]) < 0.0001) velocities[i][1] = 0;
      if (Math.abs(velocities[i][2]) < 0.0001) velocities[i][2] = 0;
    }

    // Reset velocities when particles have settled
    if (!needsUpdate) {
      for (let i = 0; i < count; i++) {
        velocities[i][0] = 0;
        velocities[i][1] = 0;
        velocities[i][2] = 0;
      }
    }

    // Add slight random motion for more organic movement
    if (needsUpdate) {
      for (let i = 0; i < count; i++) {
        const index = i * 3;
        // Add subtle random motion for organic feel
        positions[index] += (Math.random() - 0.5) * 0.002;
        positions[index + 1] += (Math.random() - 0.5) * 0.002;
        positions[index + 2] += (Math.random() - 0.5) * 0.001;
      }
    }
  });

  return (
    <points position={position}>
      <bufferGeometry ref={particlesRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(particles), 3]}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={new Color(color)}
        transparent
        opacity={active ? 1.0 : 0.3} // Increased opacity for better visibility
        sizeAttenuation
      />
    </points>
  );
};

export default ParticleSystem;
