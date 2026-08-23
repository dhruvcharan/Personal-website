import React from 'react';
import scholarImg from '../assets/scholar-npc.png';
import '../styles/ScholarNpc.css';

interface ScholarNpcProps {
  xPercent: number;
  name?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  speechText?: string | null;
}

const ScholarNpc: React.FC<ScholarNpcProps> = ({
  xPercent,
  name = "Archivist",
  onMouseEnter,
  onMouseLeave,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  speechText
}) => {
  return (
    <div
      className="scholar-npc-container"
      style={{ left: `${xPercent * 100}%` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Overhead floating speech line */}
      {speechText && (
        <div className="floating-scholar-speech">
          {speechText}
        </div>
      )}

      {/* Hover name badge */}
      <div className="scholar-hover-tag">
        {name}
      </div>

      {/* Ground Shadow */}
      <div className="scholar-ground-shadow" />

      {/* Pure Pixel Art Sprite graphic */}
      <div className="scholar-sprite-box">
        <img src={scholarImg} alt={name} className="scholar-pixel-img" />
        <div className="lantern-glow" />
      </div>
    </div>
  );
};

export default ScholarNpc;
