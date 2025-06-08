import React from 'react';

interface ControlPanelProps {
  color: string;
  onColorChange: (color: string) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  particleCount: number;
  onParticleCountChange: (count: number) => void;
  particleSize: number;
  onParticleSizeChange: (size: number) => void;
  particleSpread: number;
  onParticleSpreadChange: (spread: number) => void;
  activatedSegmentOpacity: number;
  setActivatedSegmentOpacity: (opacity: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  color,
  onColorChange,
  scale,
  onScaleChange,
  particleCount,
  onParticleCountChange,
  particleSize,
  onParticleSizeChange,
  particleSpread,
  onParticleSpreadChange,
  activatedSegmentOpacity,
  setActivatedSegmentOpacity
}) => {
  return (
    <div style={{
      width: '200px',
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderLeft: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: '#fff'
    }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={{ 
            width: '100%', 
            height: '40px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Size</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={scale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          style={{ 
            width: '100%',
            cursor: 'pointer'
          }}
        />
        <div style={{ 
          textAlign: 'center', 
          marginTop: '5px',
          fontSize: '12px',
          color: '#aaa'
        }}>
          {scale.toFixed(1)}x
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Particle Count</label>
        <input
          type="range"
          min="0"
          max="800" // Increased from 200 to 800
          value={particleCount}
          onChange={(e) => onParticleCountChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#aaa' }}>
          {particleCount}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Particle Size</label>
        <input
          type="range"
          min="0.1"
          max="1.0"  // Keeping max at 1.0
          step="0.1"
          value={particleSize}
          onChange={(e) => onParticleSizeChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#aaa' }}>
          {particleSize}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Particle Spread</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          value={particleSpread}
          onChange={(e) => onParticleSpreadChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Activated Segment Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={activatedSegmentOpacity}
          onChange={(e) => setActivatedSegmentOpacity(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '12px', color: '#aaa' }}>
          {Math.round(activatedSegmentOpacity * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;