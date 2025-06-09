import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Clock from './components/Clock';
import ControlPanel from './components/ControlPanel';
import { ClockPropsDebug as ClockProps } from './types/clock_debug';

function App() {
  const [color, setColor] = useState('#ff5500');
  const [scale, setScale] = useState(1);
  const [particleCount, setParticleCount] = useState(400);   // Updated to match default
  const [particleSize, setParticleSize] = useState(0.08);    // Updated to match default
  const [particleSpread, setParticleSpread] = useState(0.6); // Updated to match default
  const [activatedSegmentOpacity, setActivatedSegmentOpacity] = useState(0.15);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      background: '#000',
      overflow: 'hidden'
    }}>
      <div style={{ 
        flex: 1,
        position: 'relative'
      }}>
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 50 }}
          style={{ background: '#000' }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Clock
            color={color}
            scale={scale}
            showSegments={true}
            particleCount={particleCount}
            particleSize={particleSize}
            particleSpread={particleSpread}
          />
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </div>
      <ControlPanel
        color={color}
        onColorChange={setColor}
        scale={scale}
        onScaleChange={setScale}
        particleCount={particleCount}
        onParticleCountChange={setParticleCount}
        particleSize={particleSize}
        onParticleSizeChange={setParticleSize}
        particleSpread={particleSpread}
        onParticleSpreadChange={setParticleSpread}
        activatedSegmentOpacity={activatedSegmentOpacity}
        setActivatedSegmentOpacity={setActivatedSegmentOpacity}
      />
    </div>
  );
}

export default App;
