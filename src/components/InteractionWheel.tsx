import React, { useState } from 'react';
import '../styles/InteractionWheel.css';

export type VerbType = 'hand' | 'eye' | 'mouth';

export interface InteractiveTarget {
  id: string;
  name: string;
  handVerb: string;
  eyeVerb: string;
  mouthVerb: string;
  onExecuteVerb: (verb: VerbType) => void;
}

interface InteractionWheelProps {
  position: { x: number; y: number };
  target: InteractiveTarget;
  onHoverVerb: (verbText: string | null) => void;
  onSelectVerb: (verb: VerbType) => void;
  onClose: () => void;
}

// Crisp 16x16 Pixel Art SVGs with crispEdges rendering
const PixelHandIcon = () => (
  <svg viewBox="0 0 16 16" className="pixel-verb-icon" shapeRendering="crispEdges">
    {/* Pixel Gauntlet / Hand (16x16 matrix) */}
    <rect x="5" y="1" width="2" height="6" fill="currentColor" />
    <rect x="8" y="0" width="2" height="7" fill="currentColor" />
    <rect x="11" y="2" width="2" height="5" fill="currentColor" />
    <rect x="2" y="5" width="2" height="4" fill="currentColor" />
    <rect x="3" y="7" width="11" height="6" fill="currentColor" />
    <rect x="4" y="13" width="9" height="3" fill="currentColor" />
    {/* Inner shadow pixel details */}
    <rect x="5" y="9" width="1" height="3" fill="#1b1207" />
    <rect x="8" y="9" width="1" height="3" fill="#1b1207" />
    <rect x="11" y="9" width="1" height="3" fill="#1b1207" />
  </svg>
);

const PixelEyeIcon = () => (
  <svg viewBox="0 0 16 16" className="pixel-verb-icon" shapeRendering="crispEdges">
    {/* Pixel Eye / Examine (16x16 matrix) */}
    <rect x="4" y="3" width="8" height="2" fill="currentColor" />
    <rect x="2" y="5" width="2" height="2" fill="currentColor" />
    <rect x="12" y="5" width="2" height="2" fill="currentColor" />
    <rect x="0" y="7" width="2" height="2" fill="currentColor" />
    <rect x="14" y="7" width="2" height="2" fill="currentColor" />
    <rect x="2" y="9" width="2" height="2" fill="currentColor" />
    <rect x="12" y="9" width="2" height="2" fill="currentColor" />
    <rect x="4" y="11" width="8" height="2" fill="currentColor" />
    {/* Pupil & Iris */}
    <rect x="6" y="6" width="4" height="4" fill="#1b1207" />
    <rect x="7" y="7" width="2" height="2" fill="currentColor" />
  </svg>
);

const PixelMouthIcon = () => (
  <svg viewBox="0 0 16 16" className="pixel-verb-icon" shapeRendering="crispEdges">
    {/* Pixel Mouth / Talk (16x16 matrix) */}
    <rect x="4" y="4" width="8" height="2" fill="currentColor" />
    <rect x="2" y="6" width="2" height="2" fill="currentColor" />
    <rect x="12" y="6" width="2" height="2" fill="currentColor" />
    <rect x="0" y="8" width="2" height="2" fill="currentColor" />
    <rect x="14" y="8" width="2" height="2" fill="currentColor" />
    <rect x="2" y="10" width="12" height="2" fill="currentColor" />
    <rect x="4" y="12" width="8" height="2" fill="currentColor" />
    {/* Inner mouth opening & teeth */}
    <rect x="3" y="8" width="10" height="2" fill="#1b1207" />
    <rect x="5" y="8" width="2" height="1" fill="#fff" />
    <rect x="9" y="8" width="2" height="1" fill="#fff" />
  </svg>
);

const InteractionWheel: React.FC<InteractionWheelProps> = ({
  position,
  target,
  onHoverVerb,
  onSelectVerb,
  onClose
}) => {
  const [selectedVerb, setSelectedVerb] = useState<VerbType | null>(null);

  const handleVerbEnter = (verb: VerbType) => {
    setSelectedVerb(verb);
    if (verb === 'hand') onHoverVerb(target.handVerb);
    else if (verb === 'eye') onHoverVerb(target.eyeVerb);
    else if (verb === 'mouth') onHoverVerb(target.mouthVerb);
  };

  const handleVerbLeave = () => {
    setSelectedVerb(null);
    onHoverVerb(null);
  };

  const handleVerbClick = (e: React.MouseEvent, verb: VerbType) => {
    e.stopPropagation();
    onSelectVerb(verb);
    onClose();
  };

  // Clamp wheel position within viewport
  const clampedX = Math.max(80, Math.min(window.innerWidth - 80, position.x));
  const clampedY = Math.max(80, Math.min(window.innerHeight - 80, position.y));

  return (
    <div className="interaction-wheel-overlay" onClick={onClose}>
      <div
        className="curse-verb-wheel"
        style={{ left: `${clampedX}px`, top: `${clampedY}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Central Brass Medallion */}
        <div className="wheel-center-coin">
          <div className="wheel-skull-teeth" />
        </div>

        {/* Top-Left: Pixel Hand (Pick up / Use / Push) */}
        <button
          className={`verb-btn verb-hand ${selectedVerb === 'hand' ? 'active' : ''}`}
          onMouseEnter={() => handleVerbEnter('hand')}
          onMouseLeave={handleVerbLeave}
          onClick={(e) => handleVerbClick(e, 'hand')}
          title={target.handVerb}
        >
          <PixelHandIcon />
          <span className="verb-tooltip-badge">OPERATE</span>
        </button>

        {/* Top-Right: Pixel Eye (Examine / Look at) */}
        <button
          className={`verb-btn verb-eye ${selectedVerb === 'eye' ? 'active' : ''}`}
          onMouseEnter={() => handleVerbEnter('eye')}
          onMouseLeave={handleVerbLeave}
          onClick={(e) => handleVerbClick(e, 'eye')}
          title={target.eyeVerb}
        >
          <PixelEyeIcon />
          <span className="verb-tooltip-badge">EXAMINE</span>
        </button>

        {/* Bottom: Pixel Mouth (Talk to / Taste) */}
        <button
          className={`verb-btn verb-mouth ${selectedVerb === 'mouth' ? 'active' : ''}`}
          onMouseEnter={() => handleVerbEnter('mouth')}
          onMouseLeave={handleVerbLeave}
          onClick={(e) => handleVerbClick(e, 'mouth')}
          title={target.mouthVerb}
        >
          <PixelMouthIcon />
          <span className="verb-tooltip-badge">TALK / TASTE</span>
        </button>
      </div>
    </div>
  );
};

export default InteractionWheel;
