import React from 'react';
import guardSvg from '../assets/guard-character.svg';
import '../styles/PixelNpc.css';

interface PixelNpcProps {
  xPercent: number;
  name: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  npcSpeech?: string | null;
}

const PixelNpc: React.FC<PixelNpcProps> = ({
  xPercent,
  name,
  onMouseEnter,
  onMouseLeave,
  onClick,
  npcSpeech
}) => {
  return (
    <div
      className="pixel-npc-container"
      style={{ left: `${xPercent * 100}%` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Floating text directly over Guard's head when speaking */}
      {npcSpeech && (
        <div className="floating-npc-text">
          {npcSpeech}
        </div>
      )}

      {/* NPC Name Tag on hover */}
      <div className="npc-hover-indicator">
        {name}
      </div>

      {/* Guard NPC Graphic */}
      <div className="npc-sprite-box">
        <img src={guardSvg} alt={name} className="npc-guard-img" />
      </div>
    </div>
  );
};

export default PixelNpc;
