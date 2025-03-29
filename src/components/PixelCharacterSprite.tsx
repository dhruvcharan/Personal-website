import React, { useState, useEffect } from 'react';
import '../styles/PixelCharacterSprite.css';

interface PixelCharacterSpriteProps {
  action: 'idle' | 'walk-left' | 'walk-right' | 'jump';
}

const PixelCharacterSprite: React.FC<PixelCharacterSpriteProps> = ({ action }) => {
  const [frame, setFrame] = useState(0);
  const frameCount = 4; 
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % frameCount);
    }, 200); 
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`pixel-character ${action}`}>
      <div 
        className="sprite" 
        style={{ 
          backgroundPosition: `-${frame * 192}px 0` 
        }} 
      />
    </div>
  );
};

export default PixelCharacterSprite;