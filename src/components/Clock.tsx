import React, { useState, useEffect } from 'react';
import Digit from './Digit';
import { ClockPropsDebug as ClockProps } from '../types/clock_debug';

// Adjust spacing constants
const DIGIT_SPACING = 0.8;      // Space between digits in a group
const GROUP_SPACING = 2.0;      // Space between groups (hours:minutes:seconds)
const COLON_OFFSET = 0.3;       // Slight offset for colons

// Add default particle settings
const DEFAULT_PARTICLE_COUNT = 400;
const DEFAULT_PARTICLE_SIZE = 0.08;

const Clock = ({
  color,
  scale,
  showSegments,
  particleCount = DEFAULT_PARTICLE_COUNT,
  particleSize = DEFAULT_PARTICLE_SIZE,
  particleSpread = 0.6
}: ClockProps) => {
  const [time, setTime] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setTime([hours, minutes, seconds]);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* Hours */}
      <Digit
        digitPosition="hours1"
        value={Math.floor(time[0] / 10)}
        position={[-DIGIT_SPACING - GROUP_SPACING, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />
      <Digit
        digitPosition="hours2"
        value={time[0] % 10}
        position={[-GROUP_SPACING, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />

      {/* First colon (between hours and minutes) */}
      <group position={[-GROUP_SPACING/2, 0, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={color} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={color} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* Minutes */}
      <Digit
        digitPosition="minutes1"
        value={Math.floor(time[1] / 10)}
        position={[-DIGIT_SPACING, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />
      <Digit
        digitPosition="minutes2"
        value={time[1] % 10}
        position={[0, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />

      {/* Second colon (between minutes and seconds) */}
      <group position={[GROUP_SPACING/2, 0, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={color} transparent depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={color} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* Seconds */}
      <Digit
        digitPosition="seconds1"
        value={Math.floor(time[2] / 10)}
        position={[GROUP_SPACING, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />
      <Digit
        digitPosition="seconds2"
        value={time[2] % 10}
        position={[GROUP_SPACING + DIGIT_SPACING, 0, 0]}
        color={color}
        scale={scale}
        showSegments={showSegments}
        particleCount={particleCount}
        particleSize={particleSize}
        particleSpread={particleSpread}
      />
    </group>
  );
};

export default Clock;