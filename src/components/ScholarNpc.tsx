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
  speechText?: string | null;
}

const ScholarNpc: React.FC<ScholarNpcProps> = ({
  xPercent,
  name = "Archivist",
  onMouseEnter,
  onMouseLeave,
  onClick,
  onContextMenu,
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

      {/* Sprite graphic */}
      <div className="scholar-sprite-box">
        <img src={scholarImg} alt={name} className="scholar-pixel-img" />
        <div className="lantern-glow" />
      </div>
    </div>
  );
};

export default ScholarNpc;
