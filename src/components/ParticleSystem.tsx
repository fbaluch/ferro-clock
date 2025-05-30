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
      // Create stable scattered positions around the segment
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.2;
        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.1;
        const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.1;
        const z = (Math.random() - 0.5) * 0.05;
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
  // Initialize rest positions once
  if (restPositions.current.length === 0) {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.1;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.1;
      const z = (Math.random() - 0.5) * 0.05;
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

      // Reset velocities for smooth transition - but much smaller
      for (let i = 0; i < count; i++) {
        velocities[i][0] = (Math.random() - 0.5) * 0.001; // Much smaller initial velocity
        velocities[i][1] = (Math.random() - 0.5) * 0.001;
        velocities[i][2] = (Math.random() - 0.5) * 0.001;
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

      if (distance > 0.005) { // Updated convergence threshold
        needsUpdate = true; // Mark that an update is needed

        // Apply forces to move toward target
        const force = Math.min(0.1 / (distance + 0.01), maxForce);
        velocities[i][0] += force * dx;
        velocities[i][1] += force * dy;
        velocities[i][2] += force * dz;

        // Apply damping/friction
        velocities[i][0] *= 0.995;
        velocities[i][1] *= 0.995;
        velocities[i][2] *= 0.995;

        // Update positions
        positions[index] += velocities[i][0];
        positions[index + 1] += velocities[i][1];
        positions[index + 2] += velocities[i][2];
      }
    }

    const elapsedTime = animationStartTime.current ? performance.now() - animationStartTime.current : 0;

    const velocityThreshold = 0.001; // Define a velocity threshold

    if (!needsUpdate && elapsedTime > 500) { // Updated elapsed time check to 500ms
      let allVelocitiesBelowThreshold = true;

      // Check if all velocities are below the threshold
      for (let i = 0; i < count; i++) {
        const [vx, vy, vz] = velocities[i];
        if (Math.abs(vx) > velocityThreshold || Math.abs(vy) > velocityThreshold || Math.abs(vz) > velocityThreshold) {
          allVelocitiesBelowThreshold = false;
          break;
        }
      }

      if (allVelocitiesBelowThreshold) {
        setIsAnimating((prev) => new Map(prev).set(digitId, false)); // Stop animating for this digit
        animationStartTime.current = null; // Reset animation start time

        // Reset all velocities to zero to prevent residual movement
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

    // More aggressive stopping condition
    if (!needsUpdate || elapsedTime > 1000) {
      setIsAnimating((prev) => new Map(prev).set(digitId, false));
      animationStartTime.current = null;
      // Force all velocities to zero
      for (let i = 0; i < count; i++) {
        velocities[i][0] = 0;
        velocities[i][1] = 0;
        velocities[i][2] = 0;
      }
    } else if (needsUpdate) {
      particlesRef.current.attributes.position.needsUpdate = true;
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
        opacity={active ? 0.8 : 0.1}
        sizeAttenuation
      />
    </points>
  );
};

export default ParticleSystem;
